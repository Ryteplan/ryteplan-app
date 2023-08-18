<template>
  <v-container>
    <h1 style="margin-top: 24px;">Institution Search</h1>
    <div style="margin-top: 36px;">
      <v-text-field
        v-model="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </div>
    <v-data-table
      v-if="!loading"
      :headers="headers" 
      :items="tableData" 
      :search="search"
      @click:row="navigateToInstitution"
      class="elevation-1"
      multi-sort
      :sort-by="[{ key: 'State', order: 'asc' }]"
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
          { title: 'Institution name', key: 'institution name' },
          { title: 'State', key: 'State' },
          { title: 'Locale', key: ' Urban-centric locale'},
          { title: 'Admittance', key: '%admit' },
          { title: 'Religious affiliation', key: 'Religious affiliation' },
        ],
    };
  },
  methods: {
    fetchData() {
      const file = '/Institutions.xlsx'; 

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