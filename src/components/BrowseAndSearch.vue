<template>
  <v-container class="browse-institution-table-container pt-4">
    <h1 class="text-center">Browse and Search</h1>
    <ag-grid-vue 
      :rowData="rowData" 
      :rowModelType="rowModelType"
      :columnDefs="colDefs" 
      style="height: 500px" 
      class="ag-theme-quartz"
    >
    </ag-grid-vue>
  </v-container>
</template>
 
<script>

import { ref } from 'vue';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { AgGridVue } from "ag-grid-vue3"; // Vue Data Grid Component


export default {
  name: "BrowseAndSearch",
  components: {
    AgGridVue
  },
  setup() {
    // Row Data: The data to be displayed.


    const rowData = ref([
      { make: "Tesla", model: "Model Y", price: 64950, electric: true },
      { make: "Ford", model: "F-Series", price: 33850, electric: false },
      { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ]);

    // Column Definitions: Defines the columns to be displayed.
    const colDefs = ref([
      { field: "make" },
      { field: "model" },
      { field: "price" },
      { field: "electric" }
    ]);

    return {
      rowData,
      colDefs,
    };
  },
  mounted() {
  },
  beforeUnmount() {
  },
  data() {
    return {
    }
  },
  methods: {
  }
};
</script>

<style>


</style>