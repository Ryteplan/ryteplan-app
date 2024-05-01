<template>
  <v-container class="browse-institution-table-container px-8 pt-4">
    <h1 class="text-center">Browse and Search</h1>
    <ais-instant-search :search-client="searchClient" index-name="Institutions">
      <ais-search-box />
      <ais-hits>
        <template v-slot:item="{ item }">
          <h2>{{ item.name }}</h2>
        </template>
      </ais-hits>
    </ais-instant-search>
  </v-container>
</template>
 
<script>
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "ft3WP2RCmRa2c7bsleaE8CeDzOCOyXI3", // Be sure to use an API key that only allows search operations
    nodes: [
      {
        host: "b84zp19gdc3xnmvsp-1.a1.typesense.net",
        port: "443",
        protocol: "https",
      },
    ],
    cacheSearchResultsForSeconds: 2 * 60, // Cache search results from server. Defaults to 2 minutes. Set to 0 to disable caching.
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  query_by is required.
  additionalSearchParameters: {
    query_by: "name,",
  },
});
const searchClient = typesenseInstantsearchAdapter.searchClient;


export default {
  name: "BrowseAndSearch",
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
      searchClient,
    }
  },
  methods: {
  }
};
</script>

<style>


</style>