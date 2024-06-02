import { defineStore } from 'pinia';
import { states } from '../data/states';

export const useSearchFilterSortStore = defineStore('searchFilterSort', {
  state: () => ({
    hideHidden: false,
    StatesList: states,
    CountryList: ["United States", "International"],
    TypeList: ["Private", "Public"],
    filters: {
      State: [],
      Calendar: [],
      Country: [],
      Type: [],
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
  // persist: true,
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

      if (!state.hideHidden) {
        hiddenFilter = 'hidden:false ';
      }

      let countryFilter = '';
      if (state.filters.Country.length > 0) {
        countryFilter = "&& countryCode:[";

        if (state.filters.Country.includes("United States")) {
          countryFilter = countryFilter+"USA,"          
        }

        if (state.filters.Country.includes("International")) {
          countryFilter = countryFilter+"ARE,BGR,CAN,GRC,IRL,LBN"          
        }
        countryFilter = countryFilter + "]";
      }

      let TypeFilter = '';
      if (state.filters.Type.length > 0) {
        TypeFilter = "&& mainInstControlDesc:[";

        if (state.filters.Type.includes("Private")) {
          TypeFilter = TypeFilter+"Private,"          
        }

        if (state.filters.Type.includes("Public")) {
          TypeFilter = TypeFilter+"Public"          
        }
        TypeFilter = TypeFilter + "]";
      }


      let stateFilter = '';
      if (state.filters.State.length > 0) {
        stateFilter = "&& stateCleaned:[" + state.filters.State.join(',') + "]"; 
      }

      let filterByString = hiddenFilter + countryFilter + stateFilter + TypeFilter;

      return filterByString;
    },

  }
});