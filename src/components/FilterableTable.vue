<template>
  <v-container class="browse-institution-table-container pt-4">
    <v-container class="pa-0">
      <v-row v-if="tableStore.loading === false && isTableHeightCalculated">
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
        <v-col
          class="pt-0"
          :cols="12"
          :sm="($vuetify.display.lgAndUp && showFilters) ? 9 : 12"
        >
          <div class="d-flex align-center justify-space-between mb-4">
            <div
              class="d-flex align-center w-100"
              style="gap: 40px"
            >
              <div class="d-flex align-center justify-space-between mt-3 w-100">
                <div
                  class="d-flex align-center"
                  style="gap: 8px"
                >
                  <v-btn
                    size="x-small"
                    elevation="1"
                    :title="showFilters ? 'Hide Filters' : 'Show Filters'"
                    @click="toggleFilters"
                  >
                    {{ $vuetify.display.lgAndUp ? (showFilters ? 'Hide Filters' : 'Show Filters') : 'Filters' }}
                  </v-btn>
                  <v-btn
                    v-if="userStore.adminMode"
                    size="x-small"
                    elevation="1"
                    title="Edit Columns"
                    @click="showColumnsDialog = true"
                  >
                    Edit Columns
                  </v-btn>
                  <v-btn
                    size="x-small"
                    elevation="1"
                    :title="isTableView ? 'Switch to Card View' : 'Switch to Table View'"
                    @click="toggleView"
                    v-show="$vuetify.display.mdAndUp"
                  >
                    {{ isTableView ? 'Card View' : 'Table View' }}
                  </v-btn>
                  <v-menu location="bottom end">
                    <template #activator="{ props }">
                      <v-btn
                        v-if="selectedInstitutions.length > 0"
                        size="x-small"
                        v-bind="props"
                        :disabled="selectedInstitutions.length === 0"
                      >
                        {{ selectedInstitutions.length }} selected 
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item
                        :disabled="selectedInstitutions.length === 0"
                        @click="saveToListClicked()"
                      >
                        <div class="d-flex align-center">
                          <v-icon
                            class="mr-2"
                            color="primary"
                          >
                            mdi-list-box-outline
                          </v-icon>
                          <v-list-item-title>Add to list</v-list-item-title>
                        </div>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <div class="d-flex align-center">
                  <v-switch 
                    v-if="userStore.isLoggedIn && userStore.adminMode" 
                    v-model="tableStore.hideHidden" 
                    label="Show hidden results" 
                    color="primary"
                    hide-details 
                    class="inherit-height align-end mr-6" 
                    @change="tableStore.saveHideHiddenState"
                  />
                  <div class="text-subtitle-2 mr-4 align-center">
                    Results: 
                    <span v-if="!tableStore.applyFiltersLoading">{{ tableStore.resultsFound }}</span>
                    <v-progress-circular
                      v-else
                      class="ml-2"
                      style="top: -2px;"
                      :size="20"
                      color="primary"
                      indeterminate
                    />
                  </div>
                  <p class="text-subtitle-2">
                    Page(s) loaded: {{ searchFilterSortStore.searchParameters.page }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <v-data-table 
            v-show="isTableView && isTableHeightCalculated"
            id="dataTable" 
            ref="dataTable" 
            class="institutionDataTable" 
            item-key="Institution name"
            selectable-key="Institution name" 
            v-model="selectedInstitutions"
            :height="tableHeight" 
            fixed-header
            return-object
            :headers="filteredHeaders" 
            :items="tableStore.tableData"
            :items-per-page="-1"
            item-value="institution name"
            :show-select="!!userStore.isLoggedIn" 
            density="comfortable"
            @click:row="(event, item) => navigateToInstitution(event, item, false)"            
            @click:header="(column) => tableStore.customSort(column)"
          >
            <template #bottom />
            
            <!-- Format cell values -->
            <template
              v-for="header in filteredHeaders"
              :key="header.key"
              #[`item.${header.key}`]="{ item }"
            >
              {{ formatCellValue(item[header.key], header.key) }}
            </template>
          </v-data-table>

          <!-- Card View -->
          <v-container 
            v-show="!isTableView && isTableHeightCalculated" 
            class="pa-0 card-container"
            :style="{ height: tableHeight, overflowY: 'auto' }"
            @scroll="onScroll"
          >
            <InstitutionCard
              v-for="item in tableStore.tableData"
              :key="item.name"
              :item="item"
              :show-select="!!userStore.isLoggedIn"
              @click="({ event, item }) => navigateToInstitution(event, { item })"
              @update:selected="(selected) => updateCardSelection(item, selected)"
            />
          </v-container>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-progress-circular
          style="margin-top: 150px;"
          class="mx-auto"
          color="primary"
          indeterminate
          size="64"
        />
      </v-row>
    </v-container>
    <SaveToListDialog 
      v-model="showSaveToListDialog" 
      :selected-rows="selectedInstitutions"
    />
    <ShareDialog
      v-model="showShareDialog"
      :selected-rows="tableStore.selectedRows"
    />

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
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showFiltersDialog = false"
          />
        </v-card-title>
        <v-card-text>
          <FilterContent 
            :sport-filter-ref="$refs.sportFilter"
            source="dialog"
            @clear-filters="clearFilters"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="primary"
            @click="showFiltersDialog = false"
          >
            Done
          </v-btn>
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
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showColumnsDialog = false"
          />
        </v-card-title>
        <v-card-text>
          <v-list>
            <!-- Section header for visible columns -->
            <v-list-subheader class="font-weight-bold text-primary">
              Visible Columns
            </v-list-subheader>
            
            <!-- Visible columns -->
            <v-list-item
              v-for="(header) in visibleColumns"
              :key="header.key"
            >
              <v-list-item-title class="d-flex align-center">
                <v-checkbox
                  :model-value="header.show"
                  :label="header.title"
                  hide-details
                  density="comfortable"
                  @click="toggleColumn(header)"
                />
                <v-spacer />
                <div class="d-flex">
                  <v-btn
                    density="comfortable"
                    icon="mdi-arrow-up"
                    size="small"
                    variant="text"
                    :disabled="isFirstVisibleHeader(header.key)"
                    @click="moveColumnUp(header.key)"
                  />
                  <v-btn
                    density="comfortable"
                    icon="mdi-arrow-down"
                    size="small"
                    variant="text"
                    :disabled="isLastVisibleHeader(header.key)"
                    @click="moveColumnDown(header.key)"
                  />
                </div>
              </v-list-item-title>
            </v-list-item>
            
            <!-- Section header for hidden columns -->
            <v-list-subheader
              v-if="hiddenColumns.length > 0"
              class="font-weight-bold text-grey mt-4"
            >
              Hidden Columns
            </v-list-subheader>
            
            <!-- Hidden columns -->
            <v-list-item
              v-for="(header) in hiddenColumns"
              :key="header.key"
            >
              <v-list-item-title class="d-flex align-center">
                <v-checkbox
                  :model-value="header.show"
                  :label="header.title"
                  hide-details
                  density="comfortable"
                  @click="toggleColumn(header)"
                />
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn 
            color="error" 
            variant="text" 
            class="mr-auto"
            @click="resetColumnsToDefault"
          >
            Reset to Default
          </v-btn>
          <v-btn
            color="primary"
            @click="showColumnsDialog = false"
          >
            Done
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { useUserStore } from '@/stores/userStore';
import { useTableStore } from '@/stores/tableStore';
import { useSearchFilterSortStore } from '@/stores/searchFilterSortStore';
import { defaultFilters } from '@/data/defaultFilters';
import SaveToListDialog from './SaveToListDialog'
import ShareDialog from './ShareDialog'
import { debounce } from 'lodash';
import FilterContent from './FilterContent.vue'
import InstitutionCard from './InstitutionCard.vue'

export default {
  setup() {
    let userStore = useUserStore();
    userStore.getAdminMode();

    let tableStore = useTableStore();

    tableStore.fetchTableData();

    if (tableStore.tableHeaders.length == 0) {
      tableStore.loadTableHeaders();
      tableStore.loadHeaderState('filterableTable');
    }
    
    // Set the active headers for this view
    tableStore.setActiveHeaders('filterableTable');
    tableStore.updateHeaders('filterableTable');

    tableStore.getHideHidden();

    let searchFilterSortStore = useSearchFilterSortStore();

    return {
      searchFilterSortStore,
      tableStore,
      userStore,
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
      selectedInstitutions: [],
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
      showColumnsDialog: false,
      isTableView: true,
      previousViewWasTable: true
    }
  },
  methods: {
    onScroll(e) {
      const target = e.target;
      localStorage.setItem("tableViewScrollPositionY", target.scrollTop);
      localStorage.setItem("tableViewScrollPositionX", target.scrollLeft);
      
      // Check if scrolled to bottom, not currently loading, and there are more results to load
      const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 1;
      const hasMoreResults = this.tableStore.tableData.length < this.tableStore.resultsFound;
      
      if (isAtBottom && !this.tableStore.loadingMore && hasMoreResults) {
        this.tableStore.loadMoreItems();
      }
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
      // Handle case where item might be undefined
      if (!item || !item.item) return;

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

        // Open in new tab for right click or if holding Ctrl/Cmd key
        if (event.ctrlKey || event.metaKey) {
          window.open(route.href, '_blank');
        } else {
          // Navigate in current tab for normal left click
          window.open(route.href, '_blank');
          // this.$router.push(route);
        }
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
      if (this.selectedInstitutions.length > 30) {
        alert("You can only select up to 30 institutions to a list at a time.");
        return;
      } else {
        this.showSaveToListDialog = true;
      }
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
    toggleColumn(header) {
      // Create a deep copy of the header to avoid reference issues
      const headerCopy = JSON.parse(JSON.stringify(header));
      headerCopy.show = !headerCopy.show;
      
      // Get all headers
      const headers = this.tableStore.getHeadersForView('filterableTable');
      
      // Find and update the matching header
      const index = headers.findIndex(h => h.key === headerCopy.key);
      if (index !== -1) {
        headers[index] = headerCopy;
      }
      
      // Update the store with the modified headers
      this.tableStore.viewHeaders['filterableTable'] = headers;
      
      // Update headers visibility in the store
      this.tableStore.updateHeaders('filterableTable');
      
      // Save header state to localStorage for this view
      this.tableStore.saveHeaderState('filterableTable');
      
      // Set the active headers to ensure the view is using the updated headers
      this.tableStore.setActiveHeaders('filterableTable');
      
      // Force refresh with a simpler approach
      this.refreshTable();
    },
    moveColumnUp(key) {
      if (this.tableStore.moveColumnUp(key, 'filterableTable')) {
        this.refreshTable();
      }
    },
    moveColumnDown(key) {
      if (this.tableStore.moveColumnDown(key, 'filterableTable')) {
        this.refreshTable(); 
      }
    },
    refreshTable() {
      // Force table refresh by temporarily clearing and resetting the data
      const tempData = [...this.tableStore.tableData];
      
      // Clear table data
      this.tableStore.tableData = [];
      
      // Give browser a moment to process the change
      setTimeout(() => {
        // Restore the data
        this.tableStore.tableData = tempData;
        
        // Force component update
        this.$forceUpdate();
      }, 0);
    },
    isFirstVisibleHeader(key) {
      return !this.tableStore.canMoveColumnUp(key, 'filterableTable');
    },
    isLastVisibleHeader(key) {
      return !this.tableStore.canMoveColumnDown(key, 'filterableTable');
    },
    resetColumnsToDefault() {
      if (confirm("This will reset all column settings to their default values. Continue?")) {
        // Default columns that should be visible
        const defaultVisibleColumns = [
          "name", 
          "stateCleaned", 
          "mainInstControlDesc", 
          "mainCalendar", 
          "enTotUgN", 
          "cmpsSetting"
        ];
        
        // Get fresh headers
        const headers = this.tableStore.getHeadersForView('filterableTable');
        
        // Update visibility based on defaults
        headers.forEach(header => {
          if (defaultVisibleColumns.includes(header.key)) {
            header.show = true;
          } else if (header.key !== "id" && header.key !== "hidden" && !header.hideFromColumnsEditor) {
            header.show = false;
          }
        });
        
        // Save changes and update store
        this.tableStore.viewHeaders['filterableTable'] = JSON.parse(JSON.stringify(headers));
        this.tableStore.saveHeaderState('filterableTable');
        this.tableStore.updateHeaders('filterableTable');
        this.tableStore.setActiveHeaders('filterableTable');
        
        // Force table refresh
        const tempData = [...this.tableStore.tableData];
        this.tableStore.tableData = [];
        
        // Use nextTick to ensure store updates are processed
        this.$nextTick(() => {
          this.tableStore.tableData = tempData;
          // Force a component update to refresh the dialog
          this.$forceUpdate();
        });
      }
    },
    formatCellValue(value, fieldKey) {
      if (value === -1 || value === '-1' || value === '0' || value === 0 || value === null || value === undefined || value === '-') {
        return '—';
      } else if (typeof value === 'string' && value.trim() === '') {
        return '—';
      } else {
        // Format numbers with commas unless noCommas is set
        if (typeof value === 'number') {
          const header = this.filteredHeaders.find(h => h.key === fieldKey);
          if (header?.noCommas) {
            return value.toString();
          }
          return value.toLocaleString();
        }
        return value;
      }
    },
    toggleView() {
      this.isTableView = !this.isTableView;
      // Save view preference to localStorage
      localStorage.setItem('preferredView', this.isTableView ? 'table' : 'card');
    },
    updateCardSelection(item, selected) {
      if (selected) {
        this.selectedInstitutions.push(item);
      } else {
        const index = this.selectedInstitutions.findIndex(i => i.name === item.name);
        if (index !== -1) {
          this.selectedInstitutions.splice(index, 1);
        }
      }
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
    },
    filteredHeaders() {
      return this.tableStore.getFilteredHeadersForDisplay('filterableTable');
    },
    reorderableHeaders() {
      return this.tableStore.getReorderableHeaders('filterableTable');
    },
    visibleColumns() {
      return this.reorderableHeaders.filter(header => header.show === true);
    },
    hiddenColumns() {
      return this.reorderableHeaders.filter(header => header.show === false);
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
          }, 500),
          { deep: true }
        );
      }
    });
  },
  watch: {
    '$vuetify.display.name': {
      immediate: true,
      handler(displayName) {
        const isSmallScreen = ['xs', 'sm'].includes(displayName);
        if (isSmallScreen) {
          this.previousViewWasTable = this.isTableView;
          this.isTableView = false;
        } else {
          this.isTableView = this.previousViewWasTable;
        }
      }
    }
  },
  components: {
    SaveToListDialog,
    ShareDialog,
    FilterContent,
    InstitutionCard
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
  z-index: 1;
  left: 0;
  width: 48px;
}

.v-table--fixed-header>.v-table__wrapper>table:first-of-type>thead>tr:first-of-type>th:first-of-type {
  z-index: 10;
}

table > thead > tr:nth-child(1) > th.v-data-table__td.v-data-table-column--fixed.v-data-table-column--last-fixed.v-data-table-column--align-.v-data-table__th--fixed.v-data-table__th {
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

.v-data-table-header__content {
  text-wrap: nowrap;
}

// Add styles for card view transitions
.v-container {
  transition: opacity 0.3s ease;
}

.v-container:not(.v-container--is-scrolling) {
  opacity: 1;
}

.v-container.v-container--is-scrolling {
  opacity: 0.8;
}

.card-container {
  position: relative;
}

// Update existing scroll styles to work with both views
.v-data-table__wrapper,
.card-container {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}
</style>