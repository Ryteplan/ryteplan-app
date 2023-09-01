<template>
  <v-container>
    <h1 style="font-size: 20px; margin-top: 16px;">Institution Search</h1>
    <div style="margin-top: 24px;">
      <v-text-field
        v-model="tableStore.search"
        label="Keyword Search"
        single-line
        hide-details
      ></v-text-field>
      <!-- <div
        v-for="header in headers"
        :key="header.title"
      >
        <div v-if="filters.hasOwnProperty(header.title)">
          {{ header.title }}
          {{ tableData }}
          <v-select 
            flat 
            hide-details 
            small 
            multiple 
            clearable 
            :items="tableData.columnValueList(header.value)" 
            v-model="filters[header.value]"
          >
          </v-select>          
        </div>
      </div> -->
    </div>
    <v-data-table
      id="dataTable"
      class="elevation-1"
      item-key="institution name"
      selectable-key="institution name"
      height="65vh"
      fixed-header
      filterable
      multi-sort
      dense
      :headers="headers" 
      :items="tableStore.tableData" 
      :search="tableStore.search"
      :items-per-page="50"
      :page="tableStore.page"
      @click:row="navigateToInstitution"
      @update:page="tableStore.updatePage"
    >
    </v-data-table>
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
      filters: {
        State: [],
        Sector: [],
        Admittance: [],
      },
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
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.onScroll, true)
  },
  data() {
    return {
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
    navigateToInstitution(event, item) {
      const institution = JSON.parse(JSON.stringify(item));

      localStorage.setItem("institutionDetail", JSON.stringify(institution.item.raw));
      
      this.$router.push({ 
        name: 'institutionDetail', 
        params: { 
          name: institution.item.raw['institution name'],
        } 
      })
    }
  },
};
</script>

<style>
.v-data-table-footer {
  margin-top: 0px;
  padding: 8px;
  border-top: 1px solid #ccc;
}

.v-data-table-header__content {
  color: #303030;
  font-weight: 700;
}

.v-data-table__tr:hover td {
  background: #efefef !important;
}
</style>