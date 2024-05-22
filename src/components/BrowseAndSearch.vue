<template>
  <v-container class="browse-institution-table-container px-8 pt-4">
    <h1 class="text-center">Browse and Search</h1>
    {{  searchResults }}
  </v-container>
</template>
 
<script>
import client from '../typesenseClient';

export default {
  name: "BrowseAndSearch",
  async created() {
    try {
      const searchParameters = {
        q: '*',
        query_by: 'name',
        per_page: 100
      };

      const result = await client.collections('Institutions').documents().search(searchParameters);
      console.log('result:', result);
      this.searchResults = result.hits.map(hit => hit.document);
    } catch (error) {
      console.error('Error fetching data from Typesense:', error);
    }
  },
  components: {
  },
  setup() {
  },
  mounted() {
  },
  beforeUnmount() {
  },
  data() {
    return {
      searchQuery: '',
      searchResults: [],
    }
  },
  methods: {
  },
};
</script>

<style>


</style>