<template>
  <v-container class="browse-institution-table-container pt-4">
    <div
      v-if="tableStore.loading === true"
      class="d-flex align-center justify-center"
      style="height: 59vh"
    >
      <v-progress-circular
        :size="50"
        color="primary"
        indeterminate
      ></v-progress-circular>
    </div>
    <div
      v-if="tableStore.loading === false"
    >
      <div class="d-none">
        <div
          class="mt-6"
          v-for="header in tableStore.tableHeaders"
          :key="header.title"
        >
          <v-select 
            flat 
            hide-details 
            small 
            multiple 
            clearable 
            auto
            v-if="searchFilterSortStore.filters.hasOwnProperty(header.title)"            
            :label="header.title"
            :items="tableStore.columnValueList(header.key)" 
            v-model="searchFilterSortStore.filters[header.key]"
            @update:menu="onUpdateMenu"
          >
          </v-select>
        </div>

        <div style="display: flex; justify-content: end; align-items: center;">
          <v-row class="align-end" >
            <!-- <v-col cols="12" md="3">
              <v-text-field
                v-model="tableStore.searchInput"
                label="Search By Name"
                append-inner-icon="mdi-magnify"
                density="compact"
                variant="solo"
                single-line
                hide-details
                clearable
                v-on:keyup.enter="tableStore.performSearch"
              ></v-text-field>
            </v-col> -->
            <v-col class="d-none">
              <v-btn
                @click="tableStore.performSearch"
              >
                Search
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-dialog
                v-model="columnSettingsDialog"
                width="700px"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    class="ml-5"
                    v-bind="props"
                    append-icon="mdi-table"
                  >
                    Columns
                  </v-btn>
                </template>
                <v-card>
                  <div class="pa-8">
                    <h2>Columns</h2>
                    <p class="mt-2">Use the controls below to select which columns will appear on the table.</p>
                    <div
                      v-for="header in tableStore.tableHeaders"
                      :key="header.title"
                      class="mb-4"
                    >
                      <v-switch 
                        v-if="header.title !== 'Institution name' && header.hideFromUser !== true"
                        v-show="header.title !== 'id'"
                        :label="header.title"
                        v-model="header.show"
                        @change="tableStore.updateHeaders"
                        color="primary"
                      >
                      </v-switch>
                    </div>
                  </div>
                  <v-card-actions>
                    <v-btn color="primary" block @click="columnSettingsDialog = false">Close</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-col 
              v-if="tableStore.selectedRows.length"
              cols="6" 
              class="d-flex justify-end align-center"
            >
              <div class="d-flex align-center">
                <v-btn>
                  Focus
                </v-btn>
                <v-menu
                >
                  <template v-slot:activator="{ props }">
                    <v-btn
                      class="ml-3"
                      v-bind="props"
                      @click="onUpdateMenu"
                    >
                      {{ tableStore.selectedRows.length }} Selected
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item
                      v-for="(item, index) in selectedDropDown"
                      @click="item.action"
                      :key="index"
                    >
                      <div class="d-flex justify-end align-center">
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                        <v-icon class="ml-3" :icon="item.icon"></v-icon>
                      </div>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </v-col>
          </v-row>
        </div>
      </div>
      <div class="d-flex mt-4 align-center justify-space-between pr-4" style="gap: 40px">
        <v-dialog
          v-model="filterDialog"
          width="700px"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              append-icon="mdi-filter-variant"
            >
              Filter
            </v-btn>
          </template>
          <v-card>
            <div class="pa-8">
              <h2>Narrow down your search</h2>
              <div class="mt-4">
                <span>Location</span>
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
                >
                </v-select>
                <v-select 
                  :disabled="!searchFilterSortStore.filters.Country.includes('United States') && searchFilterSortStore.filters.Country.length !== 0"
                  class="mt-4"
                  flat 
                  hide-details 
                  small 
                  multiple 
                  clearable 
                  auto
                  label="State(s)"
                  :items="searchFilterSortStore.StatesList" 
                  v-model="searchFilterSortStore.filters.State"
                  @update:menu="onUpdateMenu"
                >
                </v-select>
                <span class="d-block mt-8">Public or Private</span>
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
                >
                </v-select>
                <div class="mt-8">
                  <span>Undergraduates</span>
                  <div class="d-flex mt-4" style="gap: 40px;">
                    <v-text-field
                      v-model="searchFilterSortStore.filters.UndergraduatesMin"
                      label="Minimum"
                      type="number"
                      clearable
                    />
                    <v-text-field
                      v-model="searchFilterSortStore.filters.UndergraduatesMax"
                      label="Maximum"
                      type="number"
                      clearable
                    />
                  </div>
                </div>
                <span class="d-block mt-8">Other stuff</span>
                <v-select 
                  class="mt-4"
                  flat 
                  hide-details 
                  small 
                  multiple 
                  clearable 
                  auto
                  label="Difficulty"
                  :items="searchFilterSortStore.admissionDifficultyList" 
                  v-model="searchFilterSortStore.filters.admissionDifficulty"
                  @update:menu="onUpdateMenu"
                >
                </v-select>
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
                >
                </v-select>
              </div>
            </div>
            <v-card-actions>
              <v-btn 
                color="primary" 
                block 
                @click="
                    tableStore.applyNewSearch();
                    filterDialog = false;
                  "
                >
                Apply filters
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <div class="d-flex" style="gap: 40px">
          <v-switch 
            v-if="userStore.isLoggedIn && userStore.adminMode"
            label="Show hidden"
            color="primary"
            hide-details
            class="inherit-height align-end"
            v-model="tableStore.hideHidden"
            @change="tableStore.saveHideHiddenState"
          >
          </v-switch>
          <p>results found: {{ tableStore.resultsFound }}</p>
          <p>page(s) loaded: {{ searchFilterSortStore.searchParameters.page }}</p>
        </div>
      </div>
      <v-data-table
        id="dataTable"
        ref="dataTable"
        class="mt-4 institutionDataTable"
        item-key="Institution name"
        selectable-key="Institution name"
        height="59vh"
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
                  <span>
                    {{ column.title }}
                  </span>
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
    </div>
    <SaveToListDialog 
      v-model="showSaveToListDialog" 
      :selectedRows="tableStore.selectedRows"
    />
    <ShareDialog 
      v-model="showShareDialog" 
      :selectedRows="tableStore.selectedRows"
    />
  </v-container>
</template>
 
<script>
import { useUserStore } from '../stores/userStore';
import { useTableStore } from '../stores/tableStore';
import { useSearchFilterSortStore } from '../stores/searchFilterSortStore';
// import { useAppVersionStore } from '../stores/appVersionStore';
import SaveToListDialog from './SaveToListDialog'
import ShareDialog from './ShareDialog'

export default {
  setup() {
    // let appVersionStore = useAppVersionStore();

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
          const dataTable = document.querySelector("#dataTable .v-table__wrapper");
          dataTable.addEventListener("scroll", this.onScroll, true);
          this.scrollToLastKnownPosition();
          this.highlightLastClickedRow();
        }, 1000);
      }
    }, { immediate: true });
    document.title ="Browse Institutions | Ryteplan College Search"
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll, true)
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

    }
  },
  methods: {
    handleRightClick(event, item) {
      // do something with event and/or item
      console.log(event, item)
    },
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
    highlightLastClickedRow(){      
      const lastClickRowKey = localStorage.getItem("lastClickedRow");

      document.querySelectorAll("td").forEach(function(element){
        if(element.textContent === lastClickRowKey){
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

        if (event.ctrlKey || event.metaKey) {
          window.open(route.href, '_blank');
        } else {  
          window.open(route.href, '_self');
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
    }
  },
  computed: {
    searchQueryFromRoute() {
      return this.$route.query.search;
    }
  },
  created() {
  },
  components: {
    SaveToListDialog,
    ShareDialog
  }
};
</script>

<style>

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

.v-table--fixed-header > .v-table__wrapper > table > thead  {
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

tr td:nth-child(2) {
  background: #d1d1d1;
  font-weight: 400;
}

tr td {
  line-height: 1.3em;
  color: #232323;
}

.v-theme--light .highlight-last-clicked td {
  animation: highlightLastClicked 3s normal forwards ease-out;
}

@keyframes highlightLastClicked {
  from { background: rgb(255, 247, 196); }
  to { background-color: white; }
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