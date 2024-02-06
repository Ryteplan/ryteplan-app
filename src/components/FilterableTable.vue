<template>
  <v-container class="browse-institution-table-container pt-8">
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
      <div>
        <div style="display: flex; justify-content: center; align-items: center;">
          <v-row class="align-end">
            <v-col cols="12" md="3">
              <v-text-field
                v-model="tableStore.searchInput"
                label="Search By Name"
                append-inner-icon="mdi-magnify"
                density="compact"
                variant="solo"
                single-line
                hide-details
                clearable
                v-on:keyup.enter="tableStore.performSeach"
              ></v-text-field>
            </v-col>
            <v-col class="d-none">
              <v-btn
                @click="tableStore.performSeach"
              >
                Search
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-dialog
                v-model="filterDialog"
                width="700px"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    append-icon="mdi-filter-variant"
                  >
                    Filters
                  </v-btn>
                </template>
                <v-card>
                  <div class="pa-8">
                    <h2>Filters</h2>
                    <p>Use the filters below to narrow your search.</p>
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
                        v-if="tableStore.filters.hasOwnProperty(header.title)"            
                        :label="header.title"
                        :items="tableStore.columnValueList(header.key)" 
                        v-model="tableStore.filters[header.key]"
                        @update:menu="onUpdateMenu"
                      >
                      </v-select>
                    </div>
                  </div>
                  <v-card-actions>
                    <v-btn color="primary" block @click="filterDialog = false">Close</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
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
                    Table Settings
                  </v-btn>
                </template>
                <v-card>
                  <div class="pa-8">
                    <h2>Table settings</h2>
                    <p class="mt-2">Use the controls below to select which columns will appear on the table.</p>
                    <h3 class="mt-5 mb-3">Columns</h3>
                    <div
                      v-for="header in tableStore.tableHeaders"
                      :key="header.title"
                      class="mb-4"
                    >
                      <v-switch 
                        v-if="header.title !== 'Institution name'"
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
      <v-data-table
        id="dataTable"
        class="elevation-1 mt-4 institutionDataTable"
        item-key="Institution name"
        selectable-key="Institution name"
        height="59vh"
        fixed-header
        filterable
        multi-sort
        density="compact"
        show-select
        return-object
        :headers="tableStore.filteredHeadersData()"
        :items="tableStore.filteredTableData()" 
        :search="tableStore.executeSearchTerms"
        :items-per-page="50"
        :page="tableStore.page"
        @click:row="navigateToInstitution"
        @update:page="tableStore.updatePage"
        item-value="institution name"
        v-model="tableStore.selectedRows"
        v-model:sort-by="tableStore.sortBy"
      >
        <template v-slot:bottom="{ pagination, options, updateOptions }">
          <v-row class="data-table-footer-container">
            <v-col class="d-flex align-center justify-center">
              <v-data-table-footer
                :pagination="pagination" 
                :options="options"
                @update:options="updateOptions"
              />
            </v-col>
          </v-row>
        </template>
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
import { useTableStore } from '../stores/tableStore';
import SaveToListDialog from './SaveToListDialog'
import ShareDialog from './ShareDialog'

export default {
  setup() {
    let tableStore = useTableStore();
    if (tableStore.tableData.length == 0) {
      tableStore.fetchTableData();
    }
    if (tableStore.tableHeaders.length == 0) {
      tableStore.loadTableHeaders();
    }

    return {
      tableStore,      
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

    },
    navigateToInstitution(event, item) {        
      const institution = JSON.parse(JSON.stringify(item));
      const targetRowKey = institution.item.key;
      
      localStorage.setItem("lastClickedRow", targetRowKey);
      const slug = JSON.parse(JSON.stringify(item.item.uri));
      
      let route = this.$router.resolve({ 
        name: 'institutionPage', 
        params: { 
          slug: slug,
        } 
      });

      window.open(route.href, '_blank');
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
  },
  computed: {
    searchQuery() {
      return this.$route.query.search;
    }
  },
  created() {
    if (this.$route.query.search) {
      this.tableStore.searchInput = this.$route.query.search;
      this.tableStore.performSeach();
    }
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
  color: #232323;
}

.v-theme--light .highlight-last-clicked td {
  background: rgb(159, 154, 121);
  animation: highlightLastClicked 2s normal forwards ease-out;
}

@keyframes highlightLastClicked {
  from { background: rgb(255, 225, 32); }
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

</style>