<template>
  <v-container class="browse-institution-table-container pt-8 px-8">
    <div>
      <div style="display: flex; justify-content: center; align-items: center;">
        <v-row class="">
          <v-col cols="3">
            <v-text-field
              v-model="tableStore.search"
              label="Search Institutions"
              append-inner-icon="mdi-magnify"
              density="compact"
              variant="solo"
              single-line
              hide-details
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="5">
            <v-dialog
              v-model="filterDialog"
              width="700px"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  class="fill-height"
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
                    v-for="header in tableStore.headers"
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
                  class="ml-5 fill-height"
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
                  <p class="mt-2">Note: I am not yet sure if we will be able to search or filter upon the data in the column if it is not appearing in the table!</p>
                  <h3 class="mt-5 mb-3">Columns</h3>
                  <div
                    v-for="header in tableStore.headers"
                    :key="header.title"
                  >
                    <v-switch 
                      v-if="header.title !== 'Institution name'"
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
          <v-col cols="4" class="d-flex justify-end align-center">
            <div v-if="tableStore.selectedRows.length" class="d-flex align-center">
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
      class="elevation-1 mt-4"
      item-key="Institution name"
      selectable-key="Institution name"
      height="59vh"
      fixed-header
      filterable
      multi-sort
      dense
      show-select
      return-object
      :headers="tableStore.headers"
      :items="tableStore.filteredTableData()" 
      :search="tableStore.search"
      :items-per-page="50"
      :page="tableStore.page"
      @click:row="navigateToInstitution"
      @update:page="tableStore.updatePage"
      item-value="institution name"
      v-model="tableStore.selectedRows"
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
    <!-- <div v-if="tableStore.selectedRows.length">
      <v-text-field
        label="Email"
        single-line
        hide-details
      ></v-text-field>
      <v-btn style="margin-top: 24px;">Send to Student</v-btn>
      <h2 style="margin-top: 200px;">Comparison Nutrition facts</h2>
      <div class="nutrition-facts-container">
        <div class="institution-nutrition-column"  :key="item" v-for="item in tableStore.selectedRows">
          <pre style="margin-top: 36px; white-space: pre-wrap;">{{ item }}</pre>
        </div>
      </div>
    </div> -->
    <v-dialog
      v-model="shareDialog"
      width="700px"
    >
      <v-card>
        <div class="pa-8">
          <h2>Share</h2>
          <p>Share these results with a friend!</p>
        </div>
        <v-card-actions>
          <v-btn color="primary" block @click="shareDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
 
<script>
import { useTableStore } from '../stores/tableStore';

export default {
  setup() {
    let tableStore = useTableStore();
    
    if (tableStore.tableData.length == 0 ) {
      tableStore.fetchTableData();
    }
  
    return {
      tableStore,      
    };
  },
  mounted() {
    const dataTable = document.querySelector("#dataTable .v-table__wrapper");
    dataTable.addEventListener("scroll", this.onScroll, true);
    this.scrollToLastKnownPosition();
    this.highlightLastClickedRow();
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll, true)
  },
  data() {
    return {
      filterDialog: false,
      columnSettingsDialog: false,
      shareDialog: false,
      testValue: true,
      selectedDropDown: [
        { 
          title: 'Save to list',
          icon: 'mdi-list-box-outline',
          action: this.shareClicked
        },
        { 
          title: 'Compare', 
          icon: 'mdi-ab-testing',
          action: this.compareClicked
        },
        { 
          title: 'Share',
          icon: 'mdi-account-plus',
          action: this.shareClicked
        }
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

      localStorage.setItem("institutionDetail", JSON.stringify(institution.item.raw));
      
      this.$router.push({ 
        name: 'institutionDetail', 
        params: { 
          name: institution.item.raw['institution name'],
        } 
      })
    },
    onUpdateMenu(open) {
      if (open) {
        setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
      }
    },
    shareClicked() {
      this.shareDialog = true;
    },
    compareClicked() {
      alert("Compare Clicked");
    },
  }
};
</script>

<style>

.browse-institution-table-container {
  max-width: 1328px;
}

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