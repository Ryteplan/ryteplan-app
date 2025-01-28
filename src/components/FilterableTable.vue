<template>
  <v-container class="browse-institution-table-container pt-4">
    <v-container class="pa-0">
      <v-row v-if="tableStore.loading === false && isTableHeightCalculated">
        <!-- Left Side Filters - Only show on large screens -->
        <v-col
          v-show="showFilters && $vuetify.display.lgAndUp"
          cols="12"
          sm="3"
          class="filters-sidebar pt-0"          
        >
          <FilterContent 
            :sport-filter-ref="$refs.sportFilter"
            @clear-filters="clearFilters"
          />
        </v-col>

        <!-- Right Side Table -->
        <v-col
          class="pt-0"
          :cols="12"
          :sm="($vuetify.display.lgAndUp && showFilters) ? 9 : 12"
        >
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center w-100" style="gap: 40px">
              <div class="d-flex align-center justify-space-between mt-3 w-100">
                <div class="d-flex align-center" style="gap: 8px">
                  <v-btn
                    size="x-small"
                    elevation="1"
                    @click="toggleFilters"
                    :title="showFilters ? 'Hide Filters' : 'Show Filters'"
                  >
                    {{ $vuetify.display.lgAndUp ? (showFilters ? 'Hide Filters' : 'Show Filters') : 'Filters' }}
                  </v-btn>
                  <v-btn
                    v-if="userStore.isLoggedIn && userStore.adminMode"
                    size="x-small"
                    elevation="1"
                    @click="showColumnsDialog = true"
                    title="Edit Columns"
                  >
                    Edit Columns
                  </v-btn>
                </div>
                <div class="d-flex align-center">
                  <v-switch 
                    v-if="userStore.isLoggedIn && userStore.adminMode" 
                    label="Show hidden results" 
                    color="primary" 
                    hide-details
                    class="inherit-height align-end mr-6" 
                    v-model="tableStore.hideHidden" 
                    @change="tableStore.saveHideHiddenState"
                  />
                  <div class="text-subtitle-2 mr-4 align-center">
                    Results: 
                    <span v-if="!tableStore.applyFiltersLoading">{{ tableStore.resultsFound }}</span>
                    <v-progress-circular class="ml-2" style="top: -2px;" v-else :size="20" color="primary" indeterminate></v-progress-circular>
                  </div>
                  <p class="text-subtitle-2">Page(s) loaded: {{ searchFilterSortStore.searchParameters.page }}</p>
                </div>
              </div>
            </div>
          </div>

          <v-data-table 
            v-show="isTableHeightCalculated"
            id="dataTable" 
            ref="dataTable" 
            class="institutionDataTable" 
            item-key="Institution name"
            selectable-key="Institution name" 
            :height="tableHeight"
            fixed-header 
            return-object
            :headers="tableStore.tableHeaders.filter(header => header.show !== false)"
            :items="tableStore.tableData" 
            :items-per-page="-1"
            @click:row="navigateToInstitution" 
            item-value="institution name" 
            v-model="tableStore.selectedRows"
            density="comfortable"
          >
            <template v-slot:headers="{ columns, isSorted, getSortIcon }">
              <tr>
                <template v-for="(column, index) in columns" :key="column.key">
                  <th 
                    v-if="column.show !== false" 
                    :class="thClasses(index)" 
                    :style="thStyle(column.width)"
                    @click="tableStore.customSort(column)"
                  >
                    <div class="v-data-table-header__content">
                      <span>{{ column.title }}</span>
                      <template v-if="isSorted(column)">
                        <v-icon :icon="getSortIcon(column)"></v-icon>
                      </template>
                    </div>
                  </th>
                </template>
              </tr>
            </template>
            <template #bottom></template>
          </v-data-table>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-progress-circular
          style="margin-top: 150px;"
          class="mx-auto"
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-row>
    </v-container>
    <SaveToListDialog v-model="showSaveToListDialog" :selectedRows="tableStore.selectedRows" />
    <ShareDialog v-model="showShareDialog" :selectedRows="tableStore.selectedRows" />

    <!-- Add new dialog for filters -->
    <v-dialog
      v-model="showFiltersDialog"
      width="100%"
      max-width="600px"
      max-height="90vh"
      scrollable
      class="mx-4"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Filters</span>
          <v-btn icon="mdi-close" variant="text" @click="showFiltersDialog = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <FilterContent 
            :sport-filter-ref="$refs.sportFilter"
            @clear-filters="clearFilters"
            source="dialog"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="primary" @click="showFiltersDialog = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add new dialog for column configuration -->
    <v-dialog
      v-model="showColumnsDialog"
      width="100%"
      max-width="600px"
      scrollable
      height="80vh"
      class="ma-4"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Edit Columns</span>
          <v-btn icon="mdi-close" variant="text" @click="showColumnsDialog = false"></v-btn>
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="header in tableStore.filteredHeadersDataForColumnsEditor()"
              :key="header.key"
            >
              <v-list-item-title>
                <v-checkbox
                  v-model="header.show"
                  :label="header.title"
                  hide-details
                  density="comfortable"
                  @change="onHeaderChange()"
                ></v-checkbox>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="primary" @click="showColumnsDialog = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useUserStore } from '../stores/userStore';
import { useTableStore } from '../stores/tableStore';
import { useSearchFilterSortStore } from '../stores/searchFilterSortStore';
import { defaultFilters } from '../data/defaultFilters';
import SaveToListDialog from './SaveToListDialog'
import ShareDialog from './ShareDialog'
import { debounce } from 'lodash';
import FilterContent from './FilterContent.vue'

export default {
  setup() {

    let userStore = useUserStore();
    userStore.getAdminMode();

    let tableStore = useTableStore();

    tableStore.fetchTableData();

    if (tableStore.tableHeaders.length == 0) {
      tableStore.loadTableHeaders();
      tableStore.loadHeaderState();
    }

    tableStore.updateHeaders();
    tableStore.getHideHidden();

    let searchFilterSortStore = useSearchFilterSortStore();

    return {
      searchFilterSortStore,
      tableStore,
      userStore
    };
  },
  mounted() {
    this.$watch('tableStore.loading', (loadingState) => {
      if (loadingState === false) {
        setTimeout(() => {
          this.calculateTableHeight();
          // Wait for table to be visible before scrolling
          setTimeout(() => {
            const dataTable = document.querySelector("#dataTable .v-table__wrapper");
            if (dataTable) {
              dataTable.addEventListener("scroll", this.onScroll, true);
              this.scrollToLastKnownPosition();
              this.highlightLastClickedRow();
            }
          }, 100); // Short delay after height calculation
        }, 1000);
      }
    }, { immediate: true });

    window.addEventListener('resize', this.calculateTableHeight);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll, true)
    window.removeEventListener('resize', this.calculateTableHeight);
  },
  data() {
    return {
      filterDialog: false,
      showShareDialog: false,
      showSaveToListDialog: false,
      selectedDropDown: [
        {
          title: 'Save to list',
          icon: 'mdi-list-box-outline',
          action: this.saveToListClicked
        },
        {
          title: 'Compare',
          icon: 'mdi-ab-testing',
          action: this.compareClicked
        },
        // { 
        //   title: 'Share',
        //   icon: 'mdi-account-plus',
        //   action: this.shareClicked
        // }
      ],
      isTableHeightCalculated: false,
      tableHeight: 'auto',
      showFilters: true,
      showFiltersDialog: false,
      showColumnsDialog: false
    }
  },
  methods: {
    onScroll(e) {
      localStorage.setItem("tableViewScrollPositionY", e.target.scrollTop);
      localStorage.setItem("tableViewScrollPositionX", e.target.scrollLeft);
    },
    scrollToLastKnownPosition() {
      if (
        localStorage.getItem("tableViewScrollPositionY") > 0 ||
        localStorage.getItem("tableViewScrollPositionX") > 0
      ) {
        document.querySelector('#dataTable .v-table__wrapper').scrollTop = localStorage.getItem("tableViewScrollPositionY");
        document.querySelector('#dataTable .v-table__wrapper').scrollLeft = localStorage.getItem("tableViewScrollPositionX");
      }
    },
    highlightLastClickedRow() {
      const lastClickRowKey = localStorage.getItem("lastClickedRow");

      document.querySelectorAll("td").forEach(function (element) {
        if (element.textContent === lastClickRowKey) {
          let closest = element.closest("tr")
          closest.classList.add('highlight-last-clicked');
        }
      });

      localStorage.removeItem("lastClickedRow");

    },
    navigateToInstitution(event, item) {
      const institution = JSON.parse(JSON.stringify(item));
      const targetRowKey = institution.item.name;

      if (targetRowKey == "Load more") {
        this.tableStore.loadMoreItems();
      } else {
        localStorage.setItem("lastClickedRow", targetRowKey);

        const slug = JSON.parse(JSON.stringify(item.item.uri));

        let route = this.$router.resolve({
          name: 'institutionPage',
          params: {
            slug: slug,
          }
        });

        // Always open in new tab
        window.open(route.href, '_blank');
      }
    },
    onUpdateMenu(open) {
      if (open) {
        setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
      }
    },
    shareClicked() {
      this.shareDialog = true;
    },
    saveToListClicked() {
      this.showSaveToListDialog = true;
    },
    compareClicked() {
      alert("Compare Clicked");
    },
    thClasses(index) {
      if (index === 0) {
        return 'v-data-table__td v-data-table-column--last-fixed v-data-table-column--align- v-data-table__th v-data-table__th';
      } else {
        return 'v-data-table__td v-data-table-column--align- v-data-table__th v-data-table__th'
      }
    },
    thStyle(width) {
      return `width: ${width}; left: 0px; min-width: ${width}; position: sticky; z-index: 4;`;
    },
    calculateTableHeight() {
      const wrapper = this.$el.querySelector('.table-content-wrapper');
      const filters = this.$el.querySelector('.d-flex.align-center-md');
      
      if (!wrapper || !filters) {
        // Set default height and mark as calculated even if elements aren't found
        this.tableHeight = 'calc(100vh - 232px)';
        this.isTableHeightCalculated = true;
        return;
      }

      const containerHeight = wrapper.clientHeight;
      const filtersHeight = filters.clientHeight;
      const spacing = 16;
      this.tableHeight = `${containerHeight - filtersHeight - spacing}px`;
      this.isTableHeightCalculated = true;
    },
    clearFilters() {
      if (this.$refs.sportFilter) {
        this.$refs.sportFilter.internalSearch = '';
        this.$refs.sportFilter.search = '';
      }
      
      this.searchFilterSortStore.filters = JSON.parse(JSON.stringify(defaultFilters));
    },
    toggleFilters() {
      if (this.$vuetify.display.lgAndUp) {
        this.showFilters = !this.showFilters;
      } else {
        this.showFiltersDialog = true;
      }
    },
    onHeaderChange() {
      this.tableStore.saveHeaderState();
      this.tableStore.updateHeaders();
      
      // Force table refresh by temporarily clearing and resetting the data
      const tempData = [...this.tableStore.tableData];
      this.tableStore.tableData = [];
      this.$nextTick(() => {
        this.tableStore.tableData = tempData;
      });
    }
  },
  computed: {
    searchQueryFromRoute() {
      return this.$route.query.search;
    },
    hasActiveFilters() {
      const currentFilters = this.searchFilterSortStore.filters;
      return Object.keys(defaultFilters).some(key => {
        if (Array.isArray(defaultFilters[key])) {
          return JSON.stringify(currentFilters[key]) !== JSON.stringify(defaultFilters[key]);
        }
        return currentFilters[key] !== defaultFilters[key];
      });
    }
  },
  created() {
    this.$nextTick(() => {
      if (this.searchFilterSortStore?.filters) {
        this.originalFilters = JSON.stringify(this.searchFilterSortStore.filters);
        this.$watch(
          () => this.searchFilterSortStore.filters,
          debounce((newFilters) => {
            this.tableStore.applyNewSearch('filtersChanged');
            this.newFilters = JSON.stringify(newFilters);
          }, 500), // 500ms debounce to prevent too many rapid updates
          { deep: true } // Watch nested properties
        );
      }
    });
  },
  components: {
    SaveToListDialog,
    ShareDialog,
    FilterContent
  }
};
</script>

<style lang="scss">
.browse-institution-table-container {
  height: calc(100vh - 180px); // Adjust based on your header height
  max-width: 100%;
  overflow: hidden;
}

.filters-sidebar {
  height: 100vh; // Set explicit height
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 180px;
  overflow-y: auto;
  
  .filters-content {
    padding-right: 16px;
    margin-bottom: 16px;

    h4 {
      &:first-of-type {
        margin-top: 0px;
      }
      margin-top: 32px;
      font-size: 15px;
      font-weight: 500;
    }
  }
}

#dataTable {
  border-radius: 8px;
  overflow: hidden;

  th:hover {
    cursor: pointer;
    background: #d8d8d8;
  }
}

.data-table-footer-container {
  border-top: 1px solid #ccc;
  background: #f2f2f2;
  margin: 0;
  padding: 12px 0;

  .v-col {
    padding: 0;
  }
}

.v-data-table-footer {
  margin-top: 0px;
  background: #fbfbfb;
  border-radius: 8px;
  padding: 0 24px;

  &:hover {
    background: #fff;
  }
}

.v-data-table-header__content {
  color: #292f2c;
  font-weight: 500;
  font-size: 15px;
}

.v-table.v-table--fixed-header>.v-table__wrapper>table>thead>tr>th {
  background: #eaeaea;
}

.v-data-table__tr:hover td {
  background: #efefef !important;
}

tr.v-data-table__selected {
  background: #f5f5f5;
}

tr th:first-of-type,
tr td:first-of-type {
  position: sticky !important;
  z-index: 5;
  left: 0;
  width: 48px;
}

.v-table--fixed-header>.v-table__wrapper>table>thead {
  z-index: 10;
}

tr th:first-of-type {
  z-index: 6 !important;
}

tr th:nth-child(2),
tr td:nth-child(2) {
  left: 56px !important;
  padding-bottom: 8px !important;
  padding-top: 8px !important;
}

tr td {
  line-height: 1.3em;
  color: #232323;
}

.v-theme--light .highlight-last-clicked td {
  animation: highlightLastClicked 3s normal forwards ease-out;
}

@keyframes highlightLastClicked {
  from {
    background: rgb(255, 247, 196);
  }

  to {
    background-color: white;
  }
}

.nutrition-facts-container {
  display: flex;
}

.institution-nutrition-column {
  width: 500px;
  border-right: 1px solid grey;
  margin-right: 48px;
}

.v-navigation-drawer__scrim {
  top: 0;
  left: 0;
}

.v-table>.v-table__wrapper>table>tbody>tr>td {
  padding-top: 8px;
  padding-bottom: 8px;
}

.v-input__control {
  height: auto;
}

.v-col {
  transition: all 0.3s ease-in-out;
}

.v-slider.v-input--horizontal {
  margin-inline: 0;
}

// Add responsive styles
.filters-dialog {
  .v-card-text {
    padding: 16px;
  }
}
</style>