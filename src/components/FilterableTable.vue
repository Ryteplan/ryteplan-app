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
    </div>
    <v-data-table
      v-if="!loading"
      :headers="headers" 
      fixed-header
      :items="tableData" 
      :search="search"
      height="100%"
      @click:row="navigateToInstitution"
      class="elevation-1"
      multi-sort
      :items-per-page="30"
      :sort-by="[{ key: 'institution name', order: 'asc' }]"
    >
    </v-data-table>
  </v-container>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      search: '',
      tableData: [],
      loading: true,
      headers: [
          { title: 'Institution name', key: 'institution name', width: "300px", fixed: true },
          { title: 'State', key: 'State ', width: "100px" },
          { title: 'Sector', key: 'Sector', width: "300px" },
          { title: 'Admittance', key: '%admit', width: "80px" },
          { title: 'Calendar', key: 'Calendar', width: "150px" },
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
  methods: {
    fetchData() {
      const file = '/21-22 updated IPEDS.xlsx'; 

      fetch(file)
        .then((res) => res.arrayBuffer())
        .then((data) => {
          const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          localStorage.setItem("institutionTable", JSON.stringify(XLSX.utils.sheet_to_json(worksheet)));
          this.tableData = JSON.parse(localStorage.getItem("institutionTable"));
          this.loading = false;
        })
        .catch((error) => console.error('Error fetching or parsing data:', error));
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
  beforeMount(){
    if (!localStorage.getItem("institutionTable")) {
      this.fetchData();
    } else {
      this.tableData = JSON.parse(localStorage.getItem("institutionTable"));
      this.loading = false;
    }
  },
  mounted() {
    if (!this.loading) {
      this.tableData = JSON.parse(localStorage.getItem("institutionTable"));
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