<template>
  <v-container>
    <h1 style="margin-top: 16px;">CampusMatch</h1>
    <div style="margin-top: 24px;">
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
          <v-col cols="3">
            <v-btn
              class="fill-height"
            >
              Filters
            </v-btn>
          </v-col>
          <v-col cols="6" class="d-flex justify-end align-center">
            <div v-if="tableStore.selectedRows.length" class="d-flex align-center">
              <v-menu :location="location">
                <template v-slot:activator="{ props }">
                  <v-btn
                    class="ml-3"
                    v-bind="props"
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
                    <div class="d-flex justify-space-between align-center">
                      <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
                      <v-icon class="ml-3" :icon="item.icon"></v-icon>
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-col>
        </v-row>
      </div>
      <div
        class="d-none"
        v-for="header in headers"
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
      :headers="headers" 
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
          <v-col cols="3" class="d-flex align-center">
            <v-btn
              class="ml-5"
            >
              Column Settings
            </v-btn>
          </v-col>
          <v-col cols="9" class="d-flex align-center justify-end">
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
      headers: [
        { title: 'Institution name', key: 'institution name', width: "300px", fixed: true },
        { title: 'State', key: 'State ', width: "130px" },
        { title: 'Sector', key: 'Sector', width: "300px" },
        { title: 'Admittance', key: '%admit', width: "80px" },
        { title: 'Calendar', key: 'Calendar', width: "180px" },
        { title: 'HBCU', key: 'HBCU', width: "60px" },          
        { title: 'Tribal', key: 'Tribal', width: "60px" },          
        { title: 'Urban-centric locale', key: 'Urban-centric locale', width: "210px" },          
        { title: '%reg DSPS', key: '%reg DSPS', width: "200px" },          
        { title: 'COA in-state students', key: 'COA in-state students', width: "250px" },          
        { title: 'COA out-of-state', key: 'COA out-of-state', width: "200px" },          
        { title: 'Size range', key: 'Size range', width: "200px" },          
        { title: 'Undergraduate enrollment', key: 'Undergraduate enrollment', width: "280px" },          
        { title: 'Graduate enrollment', key: 'Graduate enrollment', width: "280px" },          
      ],      
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
      selectedDropDown: [
        { 
          title: 'Share',
          icon: 'mdi-share',
          action: this.shareClicked
        },
        { 
          title: 'Compare', 
          icon: 'mdi-compare-vertical',
          action: this.compareClicked
        }
      ],

    }
  },
  watch: {
    selected(newValue) {
      this.tableStore.updateSelected(newValue);
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
        // WORKAROUND: fixes dialog menu popup position
        setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
      }
    },
    shareClicked() {
      alert("Share Clicked");
    },
    compareClicked() {
      alert("Compare Clicked");
    }
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
  margin-right: 12px;
  padding: 0 24px;
  }

.v-data-table-header__content {
  color: #000000;
  font-weight: 500;
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
  font-weight: 300;
}

.v-theme--light .highlight-last-clicked td {
  background: rgb(249, 246, 226);
  animation: highlightLastClicked 4s normal forwards ease-out;
}

@keyframes highlightLastClicked {
  from { background: rgb(249, 246, 226); }
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

</style>