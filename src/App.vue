<template>
  <div class="container">
    <h1>Excel to Filterable Database</h1>
    <!-- Use the FilterableTable component -->
    <FilterableTable />
  </div>
</template>

<script>
// Import the FilterableTable component
import FilterableTable from './components/FilterableTable.vue';

export default {
  components: {
    // Register the FilterableTable component
    FilterableTable,
  },
};
</script>

<style>
/* Add your desired CSS styles here */
</style>
