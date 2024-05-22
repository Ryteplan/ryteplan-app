<template>
  <v-container class="browse-institution-table-container px-8 pt-4">
    <h1 class="text-center">Browse and Search</h1>
    <v-row class="mt-4">
      <v-col v-for="result in searchResults" :key="result.id" cols="12">
        <v-card>
          <v-card-title>{{ result.name }}</v-card-title>
          <v-card-text>
            {{ result.city }}, {{ result.stateCleaned }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-btn 
      class="mt-4"
      @click="loadMore"
      color="primary"
    >
      Load more
    </v-btn>    
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
        per_page: 2
      };

      const result = await client.collections('Institutions').documents().search(searchParameters);
      this.searchResults = result.hits.map(hit => hit.document);
      console.log('Search results:', this.searchResults);
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
      pageToFetch: 1,
    }
  },
  methods: {
    async loadMore() {
      this.pageToFetch++;
      const searchParameters = {
        q: 'ohio',
        query_by: 'name',
        per_page: 2,
        page: this.pageToFetch
      };
      const result = await client.collections('Institutions').documents().search(searchParameters);
      this.searchResults = [...this.searchResults, ...result.hits.map(hit => hit.document)];
    },      
  },
};
</script>

<style>


</style>