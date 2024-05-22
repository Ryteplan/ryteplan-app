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
    saveSearchInput: '',
    searchParameters: {
      q: '*',
      query_by: 'name',
      sort_by : 'name:asc',
      per_page: 3,
      page: 1
    },
    selectedRows: [],
  }),
  actions: {
    saveThenClearSearchInput() {
      this.saveSearchInput = this.searchInput;
      this.searchInput = '';
    },
    loadSavedSearchInput() {
      if (this.saveSearchInput !== '') {
        if (this.saveSearchInput == this.searchInput) {
          this.searchInput = this.saveSearchInput;
        } else {
          this.saveSearchInput = '';
        }
      }
    },
  },
});