<template>
  <v-container>
    <div style="margin-top: 36px;">

      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </div>
      <v-data-table 
        :headers="headers" 
        :items="tableData" 
        :search="search"
        @click:row="navigateToInstitution"
        class="elevation-1"
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
      headers: [
          { title: 'Institution name', key: 'institution name'},
          { title: 'State', key: 'State' },
          { title: 'Admittance', key: '%admit' },
        ],
    };
  },
  methods: {
    fetchData() {
      const file = '/Institutions.xlsx'; // Update the file name if necessary

      fetch(file)
        .then((res) => res.arrayBuffer())
        .then((data) => {
          const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          this.tableData = XLSX.utils.sheet_to_json(worksheet);
        })
        .catch((error) => console.error('Error fetching or parsing data:', error));
    },
    navigateToInstitution(event, item) {
      const institution = JSON.parse(JSON.stringify(item));

      this.$router.push({ 
        name: 'institutionDetail', 
        params: { 
          name: institution.item.raw['institution name'],
          institutionDetail: "a" 
        } 
      })
    }
  },
  mounted() {
    this.fetchData();
  },
};
</script>