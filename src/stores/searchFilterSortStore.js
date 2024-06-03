import { defineStore } from 'pinia';
import { states } from '../data/states';

export const useSearchFilterSortStore = defineStore('searchFilterSort', {
  state: () => ({
    hideHidden: false,
    StatesList: states,
    CountryList: ["United States", "International"],
    TypeList: ["Private", "Public"],
    admissionDifficultyList: ["—", "Noncompetitive", "Minimal", "Moderate", "Most", "Very"],
    filters: {
      State: [],
      Country: [],
      Type: [],
      UndergraduatesMin: 0,
      UndergraduatesMax: 0,
      admissionDifficulty: []
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

      let stateFilter = '';
      if (state.filters.State.length > 0) {
        stateFilter = "&& stateCleaned:[" + state.filters.State.join(',') + "]"; 
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

      let UndergraduatesFilter = '';
      if (state.filters.UndergraduatesMin.length > 0 || state.filters.UndergraduatesMax.length > 0) {

        UndergraduatesFilter = "&& enTotUgN:";

        if (state.filters.UndergraduatesMin > 0 && state.filters.UndergraduatesMax > 0) {
          UndergraduatesFilter = UndergraduatesFilter + "[" + state.filters.UndergraduatesMin + ".." + state.filters.UndergraduatesMax + "]";          
        } else if(state.filters.UndergraduatesMin > 0 && state.filters.UndergraduatesMax == 0) {
          UndergraduatesFilter = UndergraduatesFilter + ">" + state.filters.UndergraduatesMin;          

        } else if(state.filters.UndergraduatesMin == 0 && state.filters.UndergraduatesMax > 0) {
          UndergraduatesFilter = UndergraduatesFilter + "<" + state.filters.UndergraduatesMax;          
        }
      }

      let admissionDifficultyFilter = '';
      if (state.filters.admissionDifficulty.length > 0) {
        admissionDifficultyFilter = "&& adDiffAll:[" + state.filters.admissionDifficulty.join(',') + "]"; 
      }

      let filterByString = hiddenFilter + countryFilter + stateFilter + TypeFilter + UndergraduatesFilter + admissionDifficultyFilter;

      return filterByString;
    },

  }
});