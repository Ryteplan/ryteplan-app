<template>
  <v-container>
    <h2>table of schools</h2>
    <v-data-table 
      :headers="headers" 
      :items="tableData" 
      @click:row="handleRowClick"
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
      tableData: [],
      headers: [
          { title: 'University', key: 'University'},
          { title: 'Location', key: 'Location' },
          { title: 'Ranking', key: 'Ranking' },
          { title: 'Average Tuition', key: 'Average Tuition' },
          { title: 'Has Hospital', key: 'Has Hospital' },
          { title: 'Website', key: 'Website' },
        ],
    };
  },
  methods: {
    fetchData() {
      const file = 'data.xlsx'; // Update the file name if necessary

      fetch(file)
        .then((res) => res.arrayBuffer())
        .then((data) => {
          const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          this.tableData = XLSX.utils.sheet_to_json(worksheet);
        })
        .catch((error) => console.error('Error fetching or parsing data:', error));
    },
    handleRowClick(item) {
      console.log(item.name);
    }
  },
  mounted() {
    this.fetchData();
  },
};
</script>