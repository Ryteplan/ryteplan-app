import { defineStore } from 'pinia';

export const useSearchFilterSortStore = defineStore('searchFilterSort', {
  state: () => ({
    hideHidden: true,
    filters: {
      State: [],
      Calendar: [],
      Country: [],
      "Main Type of Degree Offered": [],
      "Type of Institution": [],
      "Admission Difficulty": [],
      "Campus Setting": [],
    },
    searchInput: '',
    activeSearchTerms: '',
    searchParameters: {
      q: '*',
      query_by: 'name',
      sort_by : 'name:asc',
      per_page: 50,
      page: 1
    },
    selectedRows: [],
  }),
  actions: {
    saveThenClearSearchInput() {
      this.activeSearchTerms = this.searchInput;
      this.searchInput = '';
    },
    loadSavedSearchInput() {
      if (this.activeSearchTerms !== '') {
        if (this.activeSearchTerms == this.searchInput) {
          this.searchInput = this.activeSearchTerms;
        } else {
          this.activeSearchTerms = '';
        }
      }
    },
  },
});