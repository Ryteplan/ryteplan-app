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
      viewHeaders: {
        default: [],
        filterableTable: [],
        singularList: []
      },
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
    processHeadersForView(headers, view) {
      return headers.map(header => {
        // Make a clean copy of the header
        const headerCopy = JSON.parse(JSON.stringify(header));
        
        // Apply view-specific visibility rules
        if (view === 'filterableTable' && headerCopy.showOnFilterableTable === false) {
          headerCopy.show = false;
        } else if (view === 'singularList' && headerCopy.showOnSingularList === false) {
          headerCopy.show = false;
        } else if (view === 'singularList' && headerCopy.showOnSingularList === true) {
          headerCopy.show = true;
        }
        
        // Process children if present
        if (headerCopy.children && headerCopy.children.length > 0) {
          headerCopy.children = this.processHeadersForView(headerCopy.children, view);
        }
        
        return headerCopy;
      });
    },
    async loadTableHeaders() {
      const defaultHeaders = [
        {
          title: "id",
          key: "id",
          minWidth: "300px",
          show: false,
          align: "d-none",
          hideFromColumnsEditor: true,
        },
        {
          title: "Hidden",
          key: "hidden",
          minWidth: "100px",
          show: false,
          hideFromColumnsEditor: false,
        },
        {
          title: "Institution name",
          key: "name",
          minWidth: "250px",
          fixed: true,
          sortable: false,
          hideFromColumnsEditor: true,
        },
        { title: "City", key: "city", minWidth: "120px", show: false },
        {
          title: "State",
          key: "stateCleaned",
          minWidth: "130px",
          show: true,
          sortable: false,
        },
        {
          title: "Sector",
          key: "mainInstControlDesc",
          minWidth: "140px",
          show: true,
          sortable: false,
        },
        {
          title: "Calendar",
          key: "mainCalendar",
          minWidth: "80px",
          show: true,
          sortable: false,
        },
        { title: "Zipcode", key: "zipcode", minWidth: "130px", show: false },
        {
          title: "Country",
          key: "countryCode",
          minWidth: "130px",
          show: false,
          sortable: false,
        },
        {
          title: "Full time faculty",
          key: "ftN",
          minWidth: "130px",
          show: false,
          sortable: false,
          align: "end"
        },
        {
          title: "Part time faculty",
          key: "ptN",
          minWidth: "130px",
          show: false,
          sortable: false,
          align: "end"
        },
        {
          title: "Student to faculty ratio",
          key: "ugRatio",
          minWidth: "130px",
          show: false,
          sortable: false,
          align: "end"
        },
        {
          title: "Male Faculty",
          key: "totMenN",
          minWidth: "130px",
          show: false,
          sortable: false,
          align: "end"
        },
        {
          title: "Female Faculty",
          key: "totWmnN",
          minWidth: "130px",
          show: false,
          sortable: false,
          align: "end"
        },
        {
          title: "Offer Co-op",
          key: "coop",
          minWidth: "130px",
          show: false,
          sortable: false,
        },
        {
          title: "ROTC Army",
          key: "rotcArmy",
          minWidth: "130px",
          show: false,
          sortable: false,
        },
        {
          title: "ROTC Navy",
          key: "rotcNavy",
          minWidth: "130px",
          show: false,
          sortable: false,
        },
        {
          title: "ROTC Air Force",
          key: "rotcAf",
          minWidth: "130px",
          show: false,
          sortable: false,
        },
        {
          title: "Offer 3+2 Business",
          key: "deg32Bus",
          minWidth: "130px",
          show: false,
          sortable: false,
        },
        {
          title: "Offer 3+2 Engineering",
          key: "deg32Eng",
          minWidth: "130px",
          show: false,
          sortable: false,
        },
        {
          title: "Names of institutions other than this one where 3-2 offered",
          key: "deg32EngT",
          minWidth: "130px",
          show: false,
          sortable: false,
        },
        {
          title: "Main Type of Degree Offered",
          key: "mainFunctionType",
          minWidth: "260px",
          show: false,
          sortable: false,
        },
        {
          title: "Religious Affiliation",
          key: "denomDesc",
          minWidth: "140px",
          show: false,
          sortable: false,
        },
        {
          title: "Undergraduates",
          key: "enTotUgN",
          minWidth: "80px",
          show: true,
          sortable: false,
          align: "end"
        },
        {
          title: "Full Time UG Males",
          key: "enUgFtMenN",
          minWidth: "140px",
          align: "end",
          show: false,
          sortable: false,
        },
        {
          title: "Full Time UG Females",
          key: "enUgFtWmnN",
          minWidth: "140px",
          align: "end",
          show: false,
          sortable: false,
        },
        {
          title: "4-Year Graduation Rate",
          key: "fourYearGradRate",
          minWidth: "140px",
          align: "end",
          show: false,
          sortable: false,
        },
        {
          title: "Campus Acreage",
          key: "cmpsSizeN",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end"
        },
        {
          title: "Campus Setting",
          key: "cmpsSetting",
          minWidth: "140px",
          show: true,
          sortable: false,
        },
        {
          title: "Total Graduates",
          key: "enTotGradN",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end"
        },
        {
          title: "Admission Difficulty",
          key: "adDiffAll",
          minWidth: "140px",
          show: false,
          sortable: false,
        },
        {
          title: "Testing Policy",
          key: "testingPolicy",
          minWidth: "260px",
          show: false,
          sortable: false,
        },
        {
          title: "Waitlist Rank",
          key: "waitlistRank",
          minWidth: "140px",
          show: false,
          sortable: false,
        },
        {
          title: "SAT Verbal 50th",
          key: "sat1Verb50thP",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end",

        },
        {
          title: "SAT Math 50th",
          key: "sat1Math50thP",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end",

        },
        {
          title: "SAT Combined 50th",
          key: "sat1Combined50th",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end",

        },
        {
          title: "ACT 50th",
          key: "actComp50thP",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end",

        },
        {
          title: "Admit Rate",
          key: "admitRate",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end",

        },
        {
          title: "Average GPA",
          key: "frshGpa",
          minWidth: "160px",
          show: false,
          sortable: false,
          align: "end",
        },
        {
          title: "Undergraduate Applications Received",
          key: "apRecd1stN",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end",

        },
        {
          title: "Undergraduates Admitted",
          key: "apAdmt1stN",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end",

        },
        {
          title: "Total Cost (Resident)",
          key: "totResD2025",
          minWidth: "200px",
          show: false,
          align: "end"
        },
        {
          title: "Total Cost of Attendance",
          key: "compFeeD2025",
          minWidth: "140px",
          show: false,
          align: "end"
        },
        {
          title: "Tuition Non-Resident",
          key: "tuitNresFtD2025",
          minWidth: "200px",
          show: false,
          align: "end"
        },
        {
          title: "Tuition In-State",
          key: "tuitStateFtD2025",
          minWidth: "200px",
          show: false,
          align: "end"
        },          
        {
          title: "Tuition: International",
          key: "tuitIntlFtD2025",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end"
        },
        {
          title: "Annual fees",
          key: "feesFtD2025",
          minWidth: "140px",
          show: false,
          align: "end"
        },
        {
          title: "Annual room and board, on campus",
          key: "rmBdD2025",
          minWidth: "200px",
          show: false,
          align: "end"
        },
        {
          title: "Early Decision Applicants",
          key: "apRecdEdecN",
          minWidth: "240px",
          show: false,
        },
        {
          title: "Early Decision Admits",
          key: "apAdmtEdecN",
          minWidth: "240px",
          show: false,
        },
        {
          title: "Early Action Applicants",
          key: "apRecdEactN",
          minWidth: "240px",
          show: false,
        },
        {
          title: "Early Action Admits",
          key: "apAdmtEactN",
          minWidth: "200px",
          show: false,
        },
        {
          title: "Early Action is Restrictive",
          key: "apEactRestrict",
          minWidth: "250px",
          show: false,
        },
        {
          title: "Enrolled #Submitted SAT",
          key: "submitSat1P",
          minWidth: "240px",
          show: false,
          align: "end"
        },
        {
          title: "Enrolled #Submitted ACT",
          key: "submitActP",
          minWidth: "240px",
          show: false,
          align: "end"
        },
        {
          title: "Application Deadline",
          key: "regDecDead",
          minWidth: "140px",
          show: false,
          sortable: false,
        },
        {
          title: "Early Decision 1 Deadline",
          key: "earlyDecision1Dead",
          minWidth: "140px",
          show: false,
          sortable: false,
        },
        {
          title: "Early Decision 2 Deadline",
          key: "earlyDecision2Dead",
          minWidth: "140px",
          show: false,
          sortable: false,
        },
        {
          title: "Early Action Deadline",
          key: "earlyActionDeadline",
          minWidth: "140px",
          show: false,
          sortable: false,
        },
        {
          title: "Class sections 100+",
          key: "classSec7",
          minWidth: "140px",
          show: false,
          sortable: false,
        },
        {
          title: "Priority Application Deadline",
          key: "fallFreshPrio",
          minWidth: "140px",
          show: false,
          sortable: false,
        },
        {
          title: "Admission Factors",
          key: "admissionFactors",
          show: false,
          children: [
            {
              title: "Activities",
              key: "activ",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Legacy",
              key: "alum",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Demonstrated Interest",
              key: "apint",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Interview",
              key: "iview",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Character",
              key: "char",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Essay",
              key: "essay",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "First Generation",
              key: "first",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Geographic Residence",
              key: "geog",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Rank",
              key: "rank",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Recommendations",
              key: "recom",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Religion",
              key: "relig",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Rigor",
              key: "rigor",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "State",
              key: "state",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Talent",
              key: "talnt",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Test Scores",
              key: "tstsc",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Volunteerism",
              key: "volun",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
            {
              title: "Employment",
              key: "work",
              minWidth: "140px",
              show: true,
              sortable: false,
            },
          ],
        },
        {
          title: "% admit in top 10% of senior class",
          key: "frshHsRank10P",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end"
        },
        {
          title: "% admit in top 25% of senior class",
          key: "frshHsRank25P",
          minWidth: "140px",
          show: false,
          sortable: false,
          align: "end"
        },
      ];
      
      // Initialize headers with default values
      this.tableHeaders = JSON.parse(JSON.stringify(defaultHeaders));
      
      // Load specific view headers from localStorage if they exist
      const views = ['default', 'filterableTable', 'singularList'];
      
      // Initialize view headers first to avoid undefined errors
      views.forEach(view => {
        const processedHeaders = this.processHeadersForView(defaultHeaders, view);
        this.viewHeaders[view] = processedHeaders;
      });
      
      // Load each view's saved headers if they exist
      views.forEach(view => {
        const savedHeaders = localStorage.getItem(`tableHeaders_${view}`);
        if (savedHeaders) {
          this.viewHeaders[view] = JSON.parse(savedHeaders);
        }
        
        this.loadHeaderState(view);
      });
    },
    getHeadersForView(view = 'default') {
      if (!this.viewHeaders[view] || this.viewHeaders[view].length === 0) {
        this.viewHeaders[view] = JSON.parse(JSON.stringify(this.tableHeaders));
      }
      return this.viewHeaders[view];
    },
    setActiveHeaders(view = 'default') {
      this.tableHeaders = this.getHeadersForView(view);
    },
    filteredHeadersData(){
      return this.tableHeaders.filter(header => header.title !== "id")
    },
    filteredHeadersDataForColumnsEditor(view = 'default'){
      return this.tableHeaders.filter(header => {
        // Skip system headers and those marked to hide from editor
        if (header.title === "id" || 
            header.title === "Hidden" || 
            header.hideFromColumnsEditor) {
          return false;
        }
        
        // Check view-specific visibility flags
        if (view === 'filterableTable' && header.showOnFilterableTable === false) {
          return false;
        }
        
        if (view === 'singularList' && header.showOnSingularList === false) {
          return false;
        }
        
        return true;
      });
    },
    updateHeaders(view = 'default') {
      const headers = this.getHeadersForView(view);
      
      // Update align property based on visibility
      const filteredArray = headers.map(x => {
        const currentAlign = (x.align || '').replace('d-none', '').trim();
        
        return {
          ...x,
          align: x.show === false 
            ? `${currentAlign} d-none`.trim()
            : currentAlign
        };
      });
      
      // Update viewHeaders and possibly tableHeaders
      this.viewHeaders[view] = filteredArray;
      if (view === 'default' || !this.tableHeaders.length) {
        this.tableHeaders = filteredArray;
      }
      
      // Save to localStorage
      localStorage.setItem(`tableHeaders_${view}`, JSON.stringify(filteredArray));
      
      // Return the updated headers array
      return filteredArray;
    },
    performSearch() {
      
      this.freshSearch = true;
      const searchFilterSort = useSearchFilterSortStore();
      
      searchFilterSort.searchParameters.page = 1;
      if (searchFilterSort.searchInput !== '') {
        searchFilterSort.saveThenClearSearchInput();
        searchFilterSort.searchParameters.q = searchFilterSort.activeSearchTerms;
      } else {
        searchFilterSort.searchParameters.q = "*";
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

      // Initialize sort direction if it's not set for this column yet
      if (column.key !== searchFilterSort.customSortColumn) {
        // First click on a new column - set to ascending by default
        searchFilterSort.customSortDirection = 'asc';
        searchFilterSort.customSortColumn = column.key;
      } else {
        // Toggle direction on subsequent clicks
        searchFilterSort.customSortDirection = searchFilterSort.customSortDirection === 'asc' ? 'desc' : 'asc';
      }
      
      // Build the sort string
      searchFilterSort.customSortString = column.key + ":" + searchFilterSort.customSortDirection + ", " + "name:" + searchFilterSort.nameSortDirection;
      
      // Apply the search with the new sort parameters
      this.applyNewSearch();
    },
    saveHeaderState(view = 'default') {
      const headers = this.getHeadersForView(view);
      
      // Create object mapping header keys to their visibility state
      const headerState = headers.reduce((acc, header) => {
        acc[header.key] = header.show;
        return acc;
      }, {});
      
      // Save to localStorage
      localStorage.setItem(`tableHeaderState_${view}`, JSON.stringify(headerState));
      
      // Make sure headers are updated
      this.updateHeaders(view);
    },
    loadHeaderState(view = 'default') {
      const headers = this.getHeadersForView(view);
      
      const savedState = localStorage.getItem(`tableHeaderState_${view}`);
      if (savedState) {
        const headerState = JSON.parse(savedState);
        
        // Apply saved visibility states to the headers
        headers.forEach(header => {
          if (Object.prototype.hasOwnProperty.call(headerState, header.key)) {
            header.show = headerState[header.key];
          }
        });
        
        // Update the viewHeaders with the modified headers
        this.viewHeaders[view] = headers;
        
        // If this is the default view, also update the tableHeaders
        if (view === 'default') {
          this.tableHeaders = headers;
        }
      }
    },
    moveColumnUp(key, view = 'default') {
      const allHeaders = this.getHeadersForView(view);
      const reorderableHeaders = this.getReorderableHeaders(view);
      
      // Find indices in both arrays
      const reorderableIndex = reorderableHeaders.findIndex(header => header.key === key);
      const allHeadersIndex = allHeaders.findIndex(header => header.key === key);
      
      // Check if we can move up in reorderable headers
      if (reorderableIndex <= 0) return false;
      
      // Check if the previous item has the same visibility
      const currentHeader = reorderableHeaders[reorderableIndex];
      const prevHeader = reorderableHeaders[reorderableIndex - 1];
      
      if (currentHeader.show !== prevHeader.show) return false;
      
      // Find the previous header in allHeaders
      const prevHeaderIndex = allHeaders.findIndex(header => header.key === prevHeader.key);
      
      // Swap in allHeaders
      [allHeaders[allHeadersIndex], allHeaders[prevHeaderIndex]] = 
      [allHeaders[prevHeaderIndex], allHeaders[allHeadersIndex]];
      
      // Update store and save to localStorage
      this.viewHeaders[view] = allHeaders;
      if (view === 'default' || !this.tableHeaders.length) {
        this.tableHeaders = allHeaders;
      }
      
      this.updateHeaders(view);
      
      return true;
    },
    
    moveColumnDown(key, view = 'default') {
      const allHeaders = this.getHeadersForView(view);
      const reorderableHeaders = this.getReorderableHeaders(view);
      
      // Find indices in both arrays
      const reorderableIndex = reorderableHeaders.findIndex(header => header.key === key);
      const allHeadersIndex = allHeaders.findIndex(header => header.key === key);
      
      // Check if we can move down in reorderable headers
      if (reorderableIndex < 0 || reorderableIndex >= reorderableHeaders.length - 1) {
        return false;
      }
      
      // Check if the next item has the same visibility
      const currentHeader = reorderableHeaders[reorderableIndex];
      const nextHeader = reorderableHeaders[reorderableIndex + 1];
      
      if (currentHeader.show !== nextHeader.show) return false;
      
      // Find the next header in allHeaders
      const nextHeaderIndex = allHeaders.findIndex(header => header.key === nextHeader.key);
      
      // Swap in allHeaders
      [allHeaders[allHeadersIndex], allHeaders[nextHeaderIndex]] = 
      [allHeaders[nextHeaderIndex], allHeaders[allHeadersIndex]];
      
      // Update store and save to localStorage
      this.viewHeaders[view] = allHeaders;
      if (view === 'default' || !this.tableHeaders.length) {
        this.tableHeaders = allHeaders;
      }
      
      this.updateHeaders(view);
      
      return true;
    },

    // Helper to get only headers that are appropriate for reordering
    getReorderableHeaders(view = 'default') {
      // Get the filtered headers for the columns editor
      const editableHeaders = this.filteredHeadersDataForColumnsEditor(view);
      
      // Get the current headers to maintain relative order
      const currentHeaders = this.getHeadersForView(view);
      
      // Split into visible and hidden columns
      const visibleHeaders = [];
      const hiddenHeaders = [];
      
      editableHeaders.forEach(header => {
        if (header.show === true) {
          visibleHeaders.push(header);
        } else {
          hiddenHeaders.push(header);
        }
      });
      
      // Sort the visible headers by position
      const sortedVisibleHeaders = visibleHeaders.sort((a, b) => {
        const indexA = currentHeaders.findIndex(h => h.key === a.key);
        const indexB = currentHeaders.findIndex(h => h.key === b.key);
        return indexA - indexB;
      });
      
      // Sort hidden headers alphabetically by title
      const sortedHiddenHeaders = hiddenHeaders.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
      
      // Return visible headers first, then alphabetically sorted hidden headers
      return [...sortedVisibleHeaders, ...sortedHiddenHeaders];
    },
    isFirstVisibleHeader(key, view = 'default') {
      const headers = this.getReorderableHeaders(view);
      if (headers.length === 0) return true;
      return headers[0].key === key;
    },
    
    isLastVisibleHeader(key, view = 'default') {
      const headers = this.getReorderableHeaders(view);
      if (headers.length === 0) return true;
      return headers[headers.length - 1].key === key;
    },
    getFilteredHeadersForDisplay(view = 'default') {
      const headers = this.getHeadersForView(view);
      
      // Filter out hidden headers
      const visibleHeaders = headers.filter(header => header.show !== false);
      
      // Return visible headers in their stored order
      return visibleHeaders;
    },
    canMoveColumnUp(key, view = 'default') {
      const reorderableHeaders = this.getReorderableHeaders(view);
      const index = reorderableHeaders.findIndex(header => header.key === key);
      
      // Can't move up if it's already at the top
      if (index <= 0) return false;
      
      // Can't move up if the previous header has different visibility
      const currentVisibility = reorderableHeaders[index].show === true;
      const prevVisibility = reorderableHeaders[index - 1].show === true;
      
      if (currentVisibility !== prevVisibility) return false;
      
      return true;
    },
    
    canMoveColumnDown(key, view = 'default') {
      const reorderableHeaders = this.getReorderableHeaders(view);
      const index = reorderableHeaders.findIndex(header => header.key === key);
      
      // Can't move down if it's already at the bottom
      if (index < 0 || index >= reorderableHeaders.length - 1) return false;
      
      // Can't move down if the next header has different visibility
      const currentVisibility = reorderableHeaders[index].show === true;
      const nextVisibility = reorderableHeaders[index + 1].show === true;
      
      if (currentVisibility !== nextVisibility) return false;
      
      return true;
    }
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

        return policies.length > 0 ? policies.join(', ') : '—';
      }
    }
  }
});