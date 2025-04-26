import { defineStore } from 'pinia';
import client from '../typesenseClient';
import { useSearchFilterSortStore } from './searchFilterSortStore';
import { useRoute } from 'vue-router';

export const useTableStore = defineStore('table', {
  state: () => ({
      loading: true,
      applyFiltersLoading: false, 
      tableData: [],
      tableDataManual: [],
      hideHidden: true,
      freshSearch: true,
      searchFromRoute: '',
      selectedRows: [],
      tableHeaders: [],
      lastVisible: {},
      resultsFound: 0,
  }),
  persist: false,
  actions: {
    async loadMoreItems() {
      this.loadingMore = true;
      this.tableData.pop();
      try {
        const searchFilterSort = useSearchFilterSortStore()
        searchFilterSort.searchParameters.page++;
        searchFilterSort.searchParameters.q = searchFilterSort.activeSearchTerms;
        if (searchFilterSort.searchParameters.q == '') {
          searchFilterSort.searchParameters.q = "*";
        }

        searchFilterSort.searchParameters.filter_by = searchFilterSort.filterByString;

        if (searchFilterSort.customSortString !== '') {
          searchFilterSort.searchParameters.sort_by = searchFilterSort.customSortString;
        } else {
          searchFilterSort.searchParameters.sort_by = 'name:asc';
        }

        console.log(searchFilterSort.searchParameters);

        const result = await client.collections('institutions_integratedv5').documents().search(searchFilterSort.searchParameters);
        this.tableData = this.tableData.concat(result.hits.map(hit => hit.document));
        if (this.tableData.length < this.resultsFound) {
          this.tableData.push({name: "Load more"});
        }

        // save this.tableData to local storage
        localStorage.setItem("tableData", JSON.stringify(this.tableData));

      } catch (error) {
        console.error('Error fetching data from Typesense:', error);
      } finally {
        this.loadingMore = false;
      }      
    },
    async fetchTableData() {
      this.loading = true;
      
      const searchFilterSortStore = useSearchFilterSortStore();
      
      if (this.freshSearch) {
        searchFilterSortStore.searchParameters.page = 1;
      }
      
      const route = useRoute();
      if (route) {
        this.searchFromRoute = route.query.search;
      }

      // check for local storage value
      if (
        localStorage.getItem("tableData") && 
        !this.freshSearch && 
        searchFilterSortStore.searchParameters.q !== '' &&
        searchFilterSortStore.searchParameters.q !== '*'
      ) {
        this.tableData = JSON.parse(localStorage.getItem("tableData"));
        this.loading = false;
        return;
      } else {              
        try {
          const searchFilterSort = useSearchFilterSortStore()
          searchFilterSort.searchParameters.q = searchFilterSort.activeSearchTerms;

          if (this.searchFromRoute) {
            searchFilterSortStore.searchParameters.q = this.searchFromRoute;
            searchFilterSortStore.searchParameters.page = 1;
          }  

          if (searchFilterSort.searchParameters.q == '') {
            searchFilterSort.searchParameters.q = "*";
          }

          searchFilterSort.searchParameters.filter_by = searchFilterSort.filterByString;

          if (searchFilterSort.customSortString !== '') {
            searchFilterSort.searchParameters.sort_by = searchFilterSort.customSortString;
          } else {
            searchFilterSort.searchParameters.sort_by = 'name:asc';
          }
          
          const result = await client.collections('institutions_integratedv5').documents().search(searchFilterSort.searchParameters);
          this.resultsFound = result.found;
          this.tableData = result.hits.map(hit => hit.document);
          if (this.tableData.length < this.resultsFound) {
            this.tableData.push({name: "Load more"});
          }
  
          // save this.tableData to local storage
          localStorage.setItem("tableData", JSON.stringify(this.tableData));
  
        } catch (error) {
          console.error('Error fetching data from Typesense:', error);
        }
      }

      this.freshSearch = false;

      this.loading = false;
    },
    async applyNewSearch(type) {      
      try {
        if (type === 'filtersChanged') {
          this.applyFiltersLoading = true;
        } 

        const searchFilterSort = useSearchFilterSortStore()
        searchFilterSort.searchParameters.page = 1;
        searchFilterSort.searchParameters.filter_by = searchFilterSort.filterByString;

        if (searchFilterSort.customSortString !== '') {
          searchFilterSort.searchParameters.sort_by = searchFilterSort.customSortString;
        } else {
          searchFilterSort.searchParameters.sort_by = 'name:asc';
        }
        const result = await client.collections('institutions_integratedv5').documents().search(searchFilterSort.searchParameters);
        this.resultsFound = result.found;
        this.tableData = result.hits.map(hit => hit.document);
        if (this.tableData.length < this.resultsFound) {
          this.tableData.push({name: "Load more"});
        }

        // save this.tableData to local storage
        localStorage.setItem("tableData", JSON.stringify(this.tableData));
        if (type === 'filtersChanged') {
          setTimeout(() => {
            this.applyFiltersLoading = false;            
          }, 900);
        }

      } catch (error) {
        console.error('Error fetching data from Typesense:', error);
      }
    },
    columnValueList(val) {
      return [...new Set(this.tableData.map(d => d[val]))].sort();
    },
    updateSelected(selectedRows) {
      this.selectedRows = selectedRows;
    },
    async loadTableHeaders() {
      // clear tableHeaders from local storage
      localStorage.removeItem("tableHeaders");
      if (localStorage.getItem("tableHeaders")) {
        this.tableHeaders = JSON.parse(localStorage.getItem("tableHeaders"));
      }
      else {
        this.tableHeaders = [
          { title: 'id', key: 'id', minWidth: "300px", show: false, align: "d-none", hideFromColumnsEditor: true },
          { title: 'Hidden', key: 'hidden', minWidth: "100px", show: false, hideFromColumnsEditor: false },
          { title: 'Institution name', key: 'name', minWidth: "250px",  fixed: true, sortable: false, hideFromColumnsEditor: true  },
          { title: 'City', key: 'city', minWidth: "120px", show: false },
          { title: 'State', key: 'stateCleaned', minWidth: "130px", show: true, sortable: false },
          { title: 'Sector', key: 'mainInstControlDesc', minWidth: "140px", show: true, sortable: false },
          { title: 'Calendar', key: 'mainCalendar', minWidth: "80px", show: true, sortable: false },          
          { title: 'Zipcode', key: 'zipcode', minWidth: "130px", show: false },
          { title: 'Country', key: 'countryCode', minWidth: "130px", show: false, sortable: false },
          { title: 'Full time faculty', key: 'ftN', minWidth: "130px", show: false, sortable: false, align: "end" },
          { title: 'Part time faculty', key: 'ptN', minWidth: "130px", show: false, sortable: false, align: "end" },
          { title: 'Student to faculty ratio', key: 'ugRatio', minWidth: "130px", show: false, sortable: false, align: "end" },
          { title: 'Male Faculty', key: 'totMenN', minWidth: "130px", show: false, sortable: false, align: "end" },
          { title: 'Female Faculty', key: 'totWmnN', minWidth: "130px", show: false, sortable: false, align: "end" },
          { title: 'Offer Co-op', key: 'coop', minWidth: "130px", show: false, sortable: false },
          { title: 'ROTC Army', key: 'rotcArmy', minWidth: "130px", show: false, sortable: false },
          { title: 'ROTC Navy', key: 'rotcNavy', minWidth: "130px", show: false, sortable: false },
          { title: 'ROTC Air Force', key: 'rotcAf', minWidth: "130px", show: false, sortable: false },
          { title: 'Offer 3+2 Business', key: 'deg32Bus', minWidth: "130px", show: false, sortable: false },
          { title: 'Offer 3+2 Engineering', key: 'deg32Eng', minWidth: "130px", show: false, sortable: false },
          { title: 'Names of institutions other than this one where 3-2 offered', key: 'deg32EngT', minWidth: "130px", show: false, sortable: false },
          { title: 'Main Type of Degree Offered', key: 'mainFunctionType', minWidth: "260px", show: false, sortable: false },
          { title: 'Religious Affiliation', key: 'denomDesc', minWidth: "140px", show: false, sortable: false },
          { title: 'Undergraduates', key: 'enTotUgN', minWidth: "80px", show: true, sortable: false, align: "end" },
          { title: 'Full Time UG Males', key: 'enUgFtMenN', minWidth: "140px", align: "end", show: false, sortable: false },
          { title: 'Full Time UG Females', key: 'enUgFtWmnN', minWidth: "140px", align: "end", show: false, sortable: false },
          { title: '4-Year Graduation Rate', key: 'grs4YrN', minWidth: "140px", align: "end", show: false, sortable: false },
          { title: 'Campus Acreage', key: 'cmpsSizeN', minWidth: "140px", show: false, sortable: false },
          { title: 'Campus Setting', key: 'cmpsSetting', minWidth: "140px", show: true, sortable: false },          
          { title: 'Total Graduates', key: 'enTotGradN', minWidth: "140px", show: false, sortable: false },
          { title: 'Admission Difficulty', key: 'adDiffAll', minWidth: "140px", show: false, sortable: false },
          { title: 'Testing Policy', key: 'testingPolicy', minWidth: "260px", show: false, sortable: false },
          // {
          //   title: 'Admission Testing Policy',
          //   key: 'admissionTestingPolicy',
          //   minWidth: "140px",
          //   show: false,
          //   sortable: false,
          //   children: [
          //     { title: 'Rya\'s Note', key: 'testingPolicy', minWidth: "240px", sortable: false },
          //     { title: 'Required', key: 'admsReq', minWidth: "140px", sortable: false },
          //     { title: 'Considered', key: 'admsConsider', minWidth: "140px", sortable: false },
          //     { title: 'Not used', key: 'admsNotUsed', minWidth: "140px", sortable: false }
          //   ]
          // },          
          { title: 'Waitlist Rank', key: 'waitlistRank', minWidth: "140px", show: false, sortable: false },
          { title: 'SAT Verbal 50th', key: 'sat1Verb50thP', minWidth: "140px", show: false, sortable: false },
          { title: 'SAT Math 50th', key: 'sat1Math50thP', minWidth: "140px", show: false, sortable: false },
          { title: 'SAT Combined 50th', key: 'sat1Combined50th', minWidth: "140px", show: false, sortable: false },
          { title: 'ACT 50th', key: 'actComp50thP', minWidth: "140px", show: false, sortable: false },
          { title: 'Admit Rate', key: 'admitRate', minWidth: "140px", show: false, sortable: false },
          { title: 'Average GPA', key: 'frshGpa', minWidth: "160px", show: false, sortable: false },          
          { title: 'Undergraduate Applications Received', key: 'apRecd1stN', minWidth: "140px", show: false, sortable: false },          
          { title: 'Undergraduates Admitted', key: 'apAdmt1stN', minWidth: "140px", show: false, sortable: false },          
          { title: 'Total Cost (Resident)', key: 'totResD2024', minWidth: "200px", show: false },          
          { title: 'Tuition Non-Resident', key: 'tuitNresFtD2024', minWidth: "200px", show: false },          
          { title: 'Tuition In-State', key: 'tuitStateFtD2024', minWidth: "200px", show: false },          
          { title: 'Tuition: International', key: 'tuitIntlFtD2024', minWidth: "140px", show: false, sortable: false },
          { title: 'Early Decision Applicants', key: 'apRecdEdecN', minWidth: "240px", show: false },          
          { title: 'Early Decision Admits', key: 'apAdmtEdecN', minWidth: "240px", show: false },          
          { title: 'Early Action Applicants', key: 'apRecdEactN', minWidth: "240px", show: false },          
          { title: 'Early Action Admits', key: 'apAdmtEactN', minWidth: "200px", show: false },          
          { title: 'Early Action is Restrictive', key: 'apEactRestrict', minWidth: "250px", show: false },
          { title: 'Enrolled #Submitted SAT', key: 'submitSat1P', minWidth: "240px", show: false },          
          { title: 'Enrolled #Submitted ACT', key: 'submitActP', minWidth: "240px", show: false },          
          { title: 'Application Deadline', key: 'regDecDead', minWidth: "140px", show: false, sortable: false },
          { title: 'Early Decision 1 Deadline', key: 'earlyDecision1Dead', minWidth: "140px", show: false, sortable: false },
          { title: 'Early Decision 2 Deadline', key: 'earlyDecision2Dead', minWidth: "140px", show: false, sortable: false },
          { title: 'Early Action Deadline', key: 'earlyActionDeadline', minWidth: "140px", show: false, sortable: false },
          { title: 'Class sections 100+', key: 'classSec7', minWidth: "140px", show: false, sortable: false },          
          { title: 'Priority Application Deadline', key: 'fallFreshPrio', minWidth: "140px", show: false, sortable: false },
          // { title: 'Admission Video', key: 'adVideo', minWidth: "140px", show: false, sortable: false },
          { title: 'Admission Factors',
            key: 'admissionFactors',
            show: false,
            children: [
              { title: 'Activities', key: 'activ', minWidth: "140px", show: true, sortable: false },          
              { title: 'Legacy', key: 'alum', minWidth: "140px", show: true, sortable: false },          
              { title: 'Demonstrated Interest', key: 'apint', minWidth: "140px", show: true, sortable: false },          
              { title: 'Interview', key: 'iview', minWidth: "140px", show: true, sortable: false },          
              { title: 'Character', key: 'char', minWidth: "140px", show: true, sortable: false },          
              { title: 'Essay', key: 'essay', minWidth: "140px", show: true, sortable: false },          
              { title: 'First Generation', key: 'first', minWidth: "140px", show: true, sortable: false },          
              { title: 'Geographic Residence', key: 'geog', minWidth: "140px", show: true, sortable: false },          
              { title: 'Rank', key: 'rank', minWidth: "140px", show: true, sortable: false },
              { title: 'Recommendations', key: 'recom', minWidth: "140px", show: true, sortable: false },
              { title: 'Religion', key: 'relig', minWidth: "140px", show: true, sortable: false },
              { title: 'Rigor', key: 'rigor', minWidth: "140px", show: true, sortable: false },
              { title: 'State', key: 'state', minWidth: "140px", show: true, sortable: false },
              { title: 'Talent', key: 'talnt', minWidth: "140px", show: true, sortable: false },
              { title: 'Test Scores', key: 'tstsc', minWidth: "140px", show: true, sortable: false },
              { title: 'Volunteerism', key: 'volun', minWidth: "140px", show: true, sortable: false },
              { title: 'Employment', key: 'work', minWidth: "140px", show: true, sortable: false },
            ]
          },
          { title: '% admit in top 10% of senior class', key: 'frshHsRank10P', minWidth: "140px", show: false, sortable: false, align: "end" },
          { title: '% admit in top 25% of senior class', key: 'frshHsRank25P', minWidth: "140px", show: false, sortable: false, align: "end" },
        ];  
      }
    },
    filteredHeadersData(){
      return this.tableHeaders.filter(header => header.title !== "id")
    },
    filteredHeadersDataForColumnsEditor(){
      return this.tableHeaders.filter(header => 
        header.title !== "id" && 
        header.title !== "Hidden" && 
        !header.hideFromColumnsEditor
      );
    },
    updateHeaders() {
      const filteredArray = this.tableHeaders.map(x => {
        // Get existing alignment, excluding d-none if present
        const currentAlign = (x.align || '').replace('d-none', '').trim();
        
        return {
          ...x,
          align: x.show === false 
            ? `${currentAlign} d-none`.trim()  // Add d-none while preserving existing alignment
            : currentAlign                      // Keep existing alignment
        };
      });
      this.tableHeaders = filteredArray;
      let tableHeaders = JSON.stringify(filteredArray);
      localStorage.setItem("tableHeaders", tableHeaders);
    },
    performSearch() {
      
      this.freshSearch = true;
      const searchFilterSort = useSearchFilterSortStore();
      
      searchFilterSort.searchParameters.page = 1;
      if (searchFilterSort.searchInput !== '') {
        searchFilterSort.saveThenClearSearchInput();
        searchFilterSort.searchParameters.q = searchFilterSort.activeSearchTerms;
        // this.fetchTableData();
      } else {
        searchFilterSort.searchParameters.q = "*";
        // this.fetchTableData();
      }
    },
    getHideHidden() {
      if (localStorage.getItem("hideHidden") !== null) {
        this.hideHidden = localStorage.getItem("hideHidden") === 'true';
      } else {
          this.hideHidden = false;
      }
      return this.hideHidden;
    },
    saveHideHiddenState() {
      const searchFilterSort = useSearchFilterSortStore();
      searchFilterSort.hideHidden = this.hideHidden;
      localStorage.setItem("hideHidden", this.hideHidden);
      this.freshSearch = true;
      this.fetchTableData();
    },
    customSort(column){
      const searchFilterSort = useSearchFilterSortStore();

      if (column.key == searchFilterSort.customSortColumn) {
        searchFilterSort.customSortDirection = searchFilterSort.customSortDirection === 'asc' ? 'desc' : 'asc';
      }
      searchFilterSort.customSortColumn = column.key;
      searchFilterSort.customSortString = column.key + ":" + searchFilterSort.customSortDirection + ", " + "name:" + searchFilterSort.nameSortDirection;
      this.applyNewSearch();
    },
    saveHeaderState() {
      // Save header visibility state to localStorage
      const headerState = this.tableHeaders.reduce((acc, header) => {
        acc[header.key] = header.show;
        return acc;
      }, {});
      localStorage.setItem('tableHeaderState', JSON.stringify(headerState));
      this.freshSearch = true;
      this.fetchTableData(); // Reload the table data
    },
    loadHeaderState() {
      // Load header visibility state from localStorage
      const savedState = localStorage.getItem('tableHeaderState');
      if (savedState) {
        const headerState = JSON.parse(savedState);
        this.tableHeaders.forEach(header => {
          if (Object.prototype.hasOwnProperty.call(headerState, header.key)) {
            header.show = headerState[header.key];
          }
        });
      }
    },
  },
  getters: {
    getTestingPolicy: () => {
      return (institution) => {

        const showRequired = institution.showRequiredTestingPolicy !== false;
        const showConsidered = institution.showConsideredTestingPolicy !== false;
        const showNotUsed = institution.showNotUsedTestingPolicy !== false;

        const policies = [];
        if (institution.admsReq && showRequired) policies.push('Required');
        if (institution.admsConsider && showConsidered) policies.push('Considered');
        if (institution.admsNotUsed && showNotUsed) policies.push('Not used');

        // If we have policies to display, join them, otherwise show em dash
        return policies.length > 0 ? policies.join(', ') : '—';
      }
    }
  }
});