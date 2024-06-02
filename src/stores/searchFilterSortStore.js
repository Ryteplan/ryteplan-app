import { defineStore } from 'pinia';
import { states } from '../data/states';

export const useSearchFilterSortStore = defineStore('searchFilterSort', {
  state: () => ({
    hideHidden: false,
    StatesList: states,
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
      query_by: 'name, stateCleaned, city',
      filter_by: 'getsReplacedByFetchTableData',
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
  getters: {
    filterByString: (state) => {

      let hiddenFilter = '';
      if (state.hideHidden) {
        hiddenFilter = 'hidden:false';
      }

      let stateFilter = '';
      if (state.filters.State.length > 0) {
        stateFilter = "&& stateCleaned:[" + state.filters.State.join(',') + "]"; 
      }

      let filterByString = hiddenFilter + stateFilter;

      return filterByString;
    },

  }
});