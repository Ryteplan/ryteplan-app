<template>
  <BrowseAndSearch></BrowseAndSearch>
  <FilterableTable class="d-none"></FilterableTable>
</template>
 
<script>
import BrowseAndSearch from './BrowseAndSearch.vue'
import FilterableTable from './FilterableTable.vue'

export default {
  name: "HomeView",
  components: {
    FilterableTable,
    BrowseAndSearch
  },
  setup() {
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