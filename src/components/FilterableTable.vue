<template>
  <v-container class="browse-institution-table-container pt-4">
    <div v-if="tableStore.loading === true || !isTableHeightCalculated" class="d-flex align-center justify-center" style="height: calc(100vh - 164px)">
      <v-progress-circular :size="50" color="primary" indeterminate></v-progress-circular>
    </div>
    <v-container v-if="tableStore.loading === false && isTableHeightCalculated" class="pa-0">
      <v-row class="">
        <!-- Left Side Filters -->
        <v-col cols="3" class="filters-sidebar d-flex flex-column pt-0">
          <p class="text-subtitle-2" style="height: 48px; display: flex; align-items: center;">Filters</p>
          <div class="filters-content flex-grow-1">
            <h4>Location</h4>
            <v-select 
              class="mt-4" 
              flat 
              hide-details 
              small 
              multiple 
              clearable 
              auto 
              label="Country"
              :items="searchFilterSortStore.CountryList" 
              v-model="searchFilterSortStore.filters.Country"
              @update:menu="onUpdateMenu"
            />
            <v-autocomplete
              :disabled="!searchFilterSortStore.filters.Country.includes('United States') && searchFilterSortStore.filters.Country.length !== 0"
              class="mt-4" 
              flat 
              hide-details 
              small 
              multiple 
              clearable 
              chips 
              auto 
              label="State(s)"
              :items="searchFilterSortStore.StatesList" 
              v-model="searchFilterSortStore.filters.State"
              @update:menu="onUpdateMenu" 
            />
            <v-select 
              class="mt-4" 
              flat 
              hide-details 
              small 
              multiple 
              clearable 
              auto 
              label="Campus Setting"
              :items="searchFilterSortStore.campusSettingList" 
              v-model="searchFilterSortStore.filters.campusSetting"
              @update:menu="onUpdateMenu"
            />

            <h4 class="mt-6">Athletics</h4>
            <v-autocomplete 
              class="text-capitalize mt-4" 
              flat 
              hide-details 
              small 
              clearable 
              auto 
              label="Sport"
              :items="searchFilterSortStore.sportList" 
              v-model="searchFilterSortStore.filters.sportName"
              :item-title="str => str.replace(/\b\w/g, l => l.toUpperCase())"
              :menu-props="{ contentClass: 'text-capitalize' }"
              @update:menu="onUpdateMenu" 
            />
            <v-select
              class="mt-4"
              flat 
              hide-details 
              small 
              clearable 
              auto 
              label="Division"
              :items="divisions"
              item-title="title"
              item-value="value"
              v-model="searchFilterSortStore.filters.division"
              @update:menu="onUpdateMenu"
            />
            <v-select
              class="mt-4"
              flat 
              hide-details 
              small 
              clearable 
              auto 
              label="Gender"
              :items="[
                { title: 'Men', value: 'men' },
                { title: 'Women', value: 'women' }
              ]"
              item-title="title"
              item-value="value"
              v-model="searchFilterSortStore.filters.gender"
              @update:menu="onUpdateMenu"
            />

            <h4 class="mt-6">Public or Private</h4>
            <v-select 
              class="mt-4" 
              flat 
              hide-details 
              small 
              multiple 
              clearable 
              auto 
              label="Type"
              :items="searchFilterSortStore.TypeList" 
              v-model="searchFilterSortStore.filters.Type"
              @update:menu="onUpdateMenu"
            />

            <h4 class="mt-6">Undergraduates</h4>
            <div class="d-flex mt-4" style="gap: 16px;">
              <v-text-field 
                v-model="searchFilterSortStore.filters.UndergraduatesMin" 
                label="Minimum"
                type="number" 
                clearable 
                hide-details
              />
              <v-text-field 
                v-model="searchFilterSortStore.filters.UndergraduatesMax" 
                label="Maximum"
                type="number" 
                clearable 
                hide-details
              />
            </div>

            <h4 class="mt-6">Admit Range</h4>
            <v-range-slider 
              v-model="searchFilterSortStore.filters.admitRateRange" 
              :max="100" 
              :min="0" 
              :step="1"
              class="align-center mt-4" 
              hide-details
            >
              <template v-slot:prepend>
                <v-text-field
                  v-model="searchFilterSortStore.filters.admitRateRange[0]"
                  density="compact"
                  type="number"
                  variant="outlined"
                  hide-details
                  single-line
                  style="width: 60px"
                  class="mr-2"
                ></v-text-field>
              </template>
              <template v-slot:append>
                <v-text-field
                  v-model="searchFilterSortStore.filters.admitRateRange[1]"
                  density="compact"
                  type="number"
                  variant="outlined"
                  hide-details
                  single-line
                  style="width: 60px"
                  class="ml-2"
                ></v-text-field>
              </template>
            </v-range-slider>

            <h4 class="mt-6">Academics</h4>
            <v-autocomplete 
              class="mt-4" 
              flat 
              hide-details 
              small 
              multiple 
              clearable 
              chips 
              auto 
              label="Majors"
              :items="searchFilterSortStore.cipCodes" 
              item-value="cipCode" 
              item-title="major"
              v-model="searchFilterSortStore.filters.cipCode" 
              @update:menu="onUpdateMenu"
            />

            <h4 class="mt-6">Religion</h4>
            <v-autocomplete 
              class="mt-4" 
              flat 
              hide-details 
              small 
              multiple 
              clearable 
              chips 
              auto 
              label="Denomination"
              :items="searchFilterSortStore.denomsList" 
              v-model="searchFilterSortStore.filters.denom"
              @update:menu="onUpdateMenu"
            />
            <v-autocomplete 
              class="mt-4" 
              flat 
              hide-details 
              small 
              multiple 
              clearable 
              chips 
              auto 
              label="Affiliation"
              :items="searchFilterSortStore.affilList" 
              v-model="searchFilterSortStore.filters.denom"
              @update:menu="onUpdateMenu" 
            />
            <h4 class="mt-6">Specialized Community</h4>
            <v-checkbox label="Tribal" v-model="searchFilterSortStore.filters.tribal" hide-details class="mt-2" />
            <v-checkbox label="HBCU" v-model="searchFilterSortStore.filters.hbcu" hide-details />
          </div>
          <div class="filters-actions d-none">
            <v-btn 
              color="primary" 
              block 
              @click="tableStore.applyNewSearch()"
            >
              Apply Filters
            </v-btn>
            <v-btn 
              color="secondary" 
              block 
              class="mt-2" 
              @click="searchFilterSortStore.clearFilters"
            >
              Clear All
            </v-btn>
          </div>
        </v-col>

        <!-- Right Side Table -->
        <v-col cols="9">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center" style="gap: 40px">
              <v-switch 
                v-if="userStore.isLoggedIn && userStore.adminMode" 
                label="Show hidden" 
                color="primary" 
                hide-details
                class="inherit-height align-end" 
                v-model="tableStore.hideHidden" 
                @change="tableStore.saveHideHiddenState"
              />
              <div class="d-flex flex-column flex-md-row">
                <p class="text-subtitle-2 mr-md-4">Results found: {{ tableStore.resultsFound }}</p>
                <p class="text-subtitle-2">Page(s) loaded: {{ searchFilterSortStore.searchParameters.page }}</p>
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
            :headers="tableStore.filteredHeadersData()" 
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
    </v-container>
    <SaveToListDialog v-model="showSaveToListDialog" :selectedRows="tableStore.selectedRows" />
    <ShareDialog v-model="showShareDialog" :selectedRows="tableStore.selectedRows" />
  </v-container>
</template>

<script>
import { useUserStore } from '../stores/userStore';
import { useTableStore } from '../stores/tableStore';
import { useSearchFilterSortStore } from '../stores/searchFilterSortStore';
import SaveToListDialog from './SaveToListDialog'
import ShareDialog from './ShareDialog'
import { debounce } from 'lodash';

export default {
  setup() {

    let userStore = useUserStore();
    userStore.getAdminMode();

    let tableStore = useTableStore();

    tableStore.fetchTableData();

    if (tableStore.tableHeaders.length == 0) {
      tableStore.loadTableHeaders();
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
      columnSettingsDialog: false,
      showShareDialog: false,
      showSaveToListDialog: false,
      testValue: true,
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
      divisions: [
        { value: '1', title: 'NCAA Division 1' },
        { value: '2', title: 'NCAA Division 2' },
        { value: '3', title: 'NCAA Division 3' },
        { value: 'A', title: 'NCAA Division 1-A' },
        { value: 'B', title: 'NCAA Division 1-AA' },
        // { value: 'C', title: 'Club' },
        // { value: 'X', title: 'Intramural' }
      ],
      isTableHeightCalculated: false,
      tableHeight: 'auto'
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
    }
  },
  computed: {
    searchQueryFromRoute() {
      return this.$route.query.search;
    }
  },
  created() {
    this.$nextTick(() => {
      if (this.searchFilterSortStore?.filters) {
        this.originalFilters = JSON.stringify(this.searchFilterSortStore.filters);

        // Watch the entire filters object
        this.$watch(
          () => this.searchFilterSortStore.filters,
          debounce((newFilters) => {
            // Automatically apply filters when they change
            this.tableStore.applyNewSearch();
            this.originalFilters = JSON.stringify(newFilters);
          }, 500), // 500ms debounce to prevent too many rapid updates
          { deep: true } // Watch nested properties
        );
      }
    });
  },
  components: {
    SaveToListDialog,
    ShareDialog
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
  
  .filters-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 16px;
    margin-bottom: 16px;
  }

  .filters-actions {
    position: sticky;
    bottom: 0;
    background: white;
    padding-top: 16px;
    padding: 16px 16px 0;
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

tr td:nth-child(2) {}

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
</style>