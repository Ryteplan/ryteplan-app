<template>
  <div>
    <div>
      Filter by:
      <select v-model="filterColumn">
        <option value="">-- Select Column --</option>
        <option v-for="col in columns" :key="col">{{ col }}</option>
      </select>
      <input type="text" v-model="filterValue" placeholder="Enter filter value" />
      <button @click="resetFilter">Reset</button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in filteredData" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            <!-- Check if the cell corresponds to the name column -->
            <!-- If yes, create a link to the individual university page with the university's ID as the route parameter -->
            <router-link v-if="cellIndex === columns.indexOf('University')" :to="{ name: 'university', params: { id: rowIndex } }">
              {{ cell }}
            </router-link>
            <!-- If not the name column, display the cell value -->
            <template v-else>
              {{ cell }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import * as XLSX from "xlsx/xlsx";

export default {
  data() {
    return {
      columns: ['University', 'Location', 'Ranking', 'Tuition', 'Website'], // Add 'Website' to the columns
      data: [],
      filteredData: [],
      filterColumn: '',
      filterValue: '',
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const response = await fetch('/Schools.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      this.data = XLSX.utils.sheet_to_json(worksheet);
      this.filteredData = this.data;
    },
    applyFilter() {
      if (!this.filterColumn || !this.filterValue) {
        this.filteredData = this.data;
      } else {
        this.filteredData = this.data.filter(row => row[this.columns.indexOf(this.filterColumn)]?.toString().toLowerCase().includes(this.filterValue.toLowerCase()));
      }
    },
    resetFilter() {
      this.filterColumn = '';
      this.filterValue = '';
      this.filteredData = this.data;
    },
  },
};
</script>

<style>
/* Add your desired CSS styles here */
</style>
