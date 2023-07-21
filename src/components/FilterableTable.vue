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
import { ref, onMounted } from 'vue';
import * as XLSX from 'xlsx'; // Use the asterisk to import all functions

export default {
  setup() {
    const columns = ['University', 'Location', 'Ranking', 'Tuition', 'Website'];
    const data = ref([]);
    const filteredData = ref([]);
    const filterColumn = ref('');
    const filterValue = ref('');

    const fetchData = async () => {
      try {
        // Update the file path to point to the correct location of the Excel file
        const response = await fetch('/sample_data.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });

        if (workbook.SheetNames.length === 0) {
          console.error('No sheets found in the Excel file.');
          return;
        }

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data.value = XLSX.utils.sheet_to_json(worksheet);
        filteredData.value = data.value;
      } catch (error) {
        console.error('Error fetching or parsing data:', error);
      }
    };

    const applyFilter = () => {
      if (!filterColumn.value || !filterValue.value) {
        filteredData.value = data.value;
      } else {
        filteredData.value = data.value.filter(row =>
          row[columns.indexOf(filterColumn.value)]?.toString().toLowerCase().includes(filterValue.value.toLowerCase())
        );
      }
    };

    const resetFilter = () => {
      filterColumn.value = '';
      filterValue.value = '';
      filteredData.value = data.value;
    };

    onMounted(() => {
      fetchData();
    });

    return {
      columns,
      data,
      filteredData,
      filterColumn,
      filterValue,
      applyFilter,
      resetFilter,
    };
  },
};
</script>



<style>
/* Add your desired CSS styles here */
</style>
