import { defineStore } from 'pinia';
import { states } from '../data/states';
import { cipCodes } from '../data/cipCodes';
import { denomsList } from '../data/denominations';
import { affilList } from '../data/affiliations';
import { sportList } from '../data/sportList';

export const useSearchFilterSortStore = defineStore('searchFilterSort', {
  state: () => ({
    cipCodes: cipCodes,
    hideHidden: false,
    selectedRows: [],
    StatesList: states,
    denomsList: denomsList,
    affilList: affilList,
    sportList: sportList,
    CountryList: ["United States", "International"],
    TypeList: ["Private", "Public"],
    admissionDifficultyList: ["—", "Noncompetitive", "Minimal", "Moderate", "Most", "Very"],
    campusSettingList: ["Rural", "Small", "Suburb", "Urban"],
    filters: {
      State: [],
      Country: [],
      Type: [],
      denom: [],
      affil: [],
      UndergraduatesMin: 0,
      UndergraduatesMax: 0,
      admissionDifficulty: [],
      campusSetting: [],
      cipCode: [],
      admitRateRange: [0, 100],
      admitRateMin: 0,
      admitRateMax: 1,
      sportName:[],
      tribal: false,
    },
    activeSearchTerms: '',
    searchInput: '',
    saveSearchInput: '',
    searchParameters: {
      q: '*',
      query_by: 'name, stateCleaned, city',
      filter_by: 'getsReplacedByFetchTableData',
      sort_by : 'name:desc',
      per_page: 50,
      page: 1
    },
    nameSortDirection: 'asc',
    customSortColumn: '',
    customSortDirection: 'asc',
    customSortString: '',
  }),
  // persist: true,
  actions: {
    saveThenClearSearchInput() {
      this.saveSearchInput = this.searchInput;
      this.searchInput = '';
    },
    loadSavedSearchInput() {
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
      } else {
        hiddenFilter = 'hidden:true ';
      }

      let tribalFilter = '';
      if (state.filters.tribal) {
        tribalFilter = '&& tribal:true ';
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

      let admitRateFilter = '';
      if (state.filters.admitRateRange[0] > 0 || state.filters.admitRateRange[1] < 100) {
        state.filters.admitRateMin = state.filters.admitRateRange[0]/100;
        state.filters.admitRateMax = state.filters.admitRateRange[1]/100;
        admitRateFilter = " && admitRate:";

        if (state.filters.admitRateRange[0] > 0 && state.filters.admitRateRange[1] < 100) {
          admitRateFilter = admitRateFilter + "[" + state.filters.admitRateMin + ".." + state.filters.admitRateMax + "]";          
        } else if(state.filters.admitRateRange[0] > 0 && state.filters.admitRateRange[1] == 100) {
          admitRateFilter = admitRateFilter + ">" + state.filters.admitRateMin;          
        } else if(state.filters.admitRateRange[0] == 0 && state.filters.admitRateRange[1] < 100) {
          admitRateFilter = admitRateFilter + "<" +state.filters.admitRateMax;          
        }
      }

      let admissionDifficultyFilter = '';
      if (state.filters.admissionDifficulty.length > 0) {
        admissionDifficultyFilter = "&& adDiffAll:[" + state.filters.admissionDifficulty.join(',') + "]"; 
      }

      let campusSettingFilter = '';
      if (state.filters.campusSetting.length > 0) {
        campusSettingFilter = "&& cmpsSetting:[" + state.filters.campusSetting.join(',') + "]"; 
      }

      let cipCodeFilter = '';
      if (state.filters.cipCode.length > 0) {
        cipCodeFilter = "&& cipCode:[" + state.filters.cipCode.join(',') + "]"; 
      }

      let denomFilter = '';
      if (state.filters.denom.length > 0) {
        denomFilter = "&& denomDesc:[" + state.filters.denom.join(',') + "]"; 
      }

      let sportFilter = '';

      // if (state.filters.sportName.length > 0) {
      //   sportFilter = "&& sports." + state.filters.sportName.join(',') + ":[NCAA 2]"; 
      // }

      // sportFilter = "&& sports.Swimming:[NCAA 1]";

      let filterByString = 
        hiddenFilter + 
        countryFilter + 
        stateFilter + 
        TypeFilter + 
        UndergraduatesFilter + 
        admitRateFilter + 
        admissionDifficultyFilter + 
        campusSettingFilter + 
        cipCodeFilter + 
        denomFilter +
        sportFilter +
        tribalFilter
      ;

      return filterByString;
    },

  }
});