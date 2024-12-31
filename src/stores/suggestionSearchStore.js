import { defineStore } from 'pinia';
import client from '../typesenseClient';

export const useSuggestionSearchStore = defineStore('suggestionSearchStore', {
  state: () => ({
    searchRequests: {
      searches: [
        {
          collection: 'product_queries',
          q: '',
          query_by: 'q'
        },
        {
          collection: 'institutions_integratedv5',
          q: '',
          query_by: 'name, aliases',
          filter_by: 'hidden:=false'
        }
      ]
    },
  }),
  // persist: true,
  actions: {
    async performMultiSearch(searchInput) {
      if (searchInput) {
        const searchRequests = { ...this.searchRequests };
        searchRequests.searches.forEach(search => {
          search.q = searchInput;
        });
        return await client.multiSearch.perform(searchRequests, {})
      }
      return null;
    },
  },
});