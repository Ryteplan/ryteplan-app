<template>
  <v-container>
    <h1 style="margin-top: 24px;">Institution Search</h1>
    <div style="margin-top: 36px;">
      <v-text-field
        v-model="search"
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
      item-key="institution name"
      selectable-key="institution name"
      height="100vh"
      fixed-header
      filterable
      multi-sort
      dense
      @click:row="navigateToInstitution"
      :headers="headers" 
      :items="tableStore.tableData" 
      :search="search"
      :items-per-page="-1"
    >
    </v-data-table>
  </v-container>
</template>

<script>
import { useTableStore } from '../stores/tableStore';

export default {
  setup() {
    let tableStore = useTableStore(); // Access the Pinia store instance
    
    if (tableStore.tableData.length == 0 ) {
      tableStore.fetchTableData(); // Call the action
    }
  
    return {
      tableStore,
      loading: true,
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
      search: '',
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
        console.log("scroll to a position");
        console.log(localStorage.getItem("tableViewScrollPositionY"));
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
.v-data-table-header__content {
  color: #303030;
  font-weight: 700;
}

.v-data-table__tr:hover td {
  background: #efefef !important;
}
</style>