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
    activeSearchTerms: '',
    searchInput: '',
    saveSearchInput: '',
    searchParameters: {
      q: '*',
      query_by: 'name',
      filter_by: 'hidden:false',
      sort_by : 'name:asc',
      per_page: 50,
      page: 1
    },
    selectedRows: [],
  }),
  persist: true,
  actions: {
    resetPage() {
    },
    saveThenClearSearchInput() {
      this.saveSearchInput = this.searchInput;
      this.searchInput = '';
    },
    loadSavedSearchInput() {
      console.log("loadSavedSearchInput", this.saveSearchInput);
      if (this.saveSearchInput !== '') {
          this.searchInput = this.saveSearchInput;
      }
    },
  },
});