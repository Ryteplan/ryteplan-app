import { defineStore } from 'pinia';
import { dbFireStore } from "../firebase";
import { collection, getDocs } from 'firebase/firestore'
import { compress, decompress } from 'lz-string'


export const useTableStore = defineStore('table', {
  state: () => ({
      loading: true,
      tableData: [],
      filteredTableDataArray: [],
      filters: {
        State: [],
        Sector: [],
        Calendar: []
      },
      search: '',
      page: 1,
      selectedRows: [],
      tableHeaders: [],
  }),
  actions: {
    async fetchTableData() {
      if (localStorage.getItem("institutionTable")) {
        let decompressedTableData = decompress(localStorage.getItem("institutionTable"));
        this.tableData = JSON.parse(decompressedTableData);
      } else {
        try {
          const institutions = collection(dbFireStore, 'institutions');
          const docSnap = await getDocs(institutions);
          this.tableData = docSnap.docs.map(doc=>({...doc.data(), id:doc.id}));
          let compressedTableData = compress(JSON.stringify(this.tableData));
          localStorage.setItem("institutionTable", compressedTableData);
          this.loading = false;
        } catch (error) {
          console.error('Error fetching table data:', error);
        }
      }
    },
    filteredTableData(){
      return this.tableData.filter(d => {
        return Object.keys(this.filters).every(f => {
          return this.filters[f].length < 1 || this.filters[f].includes(d[f])
        })
      })
    },
    columnValueList(val) {
      return [...new Set(this.tableData.map(d => d[val]))] 
    },
    updatePage(pageNumber) {
      this.page = pageNumber;
      document.querySelector('#dataTable .v-tablewrapper').scrollTop = 0;
    },
    updateSelected(selectedRows) {
      this.selectedRows = selectedRows;
    },
    async loadTableHeaders() {
      if (localStorage.getItem("tableHeaders")) {
        this.tableHeaders = JSON.parse(localStorage.getItem("tableHeaders"));
      }
      else {
        this.tableHeaders = [
          { title: 'id', key: 'id', width: "300px", show: false, align: "d-none" },
          { title: 'Institution name', key: 'name', width: "300px", fixed: true },
          { title: 'State', key: 'stateCode', width: "130px", show: true },
          { title: 'City', key: 'city', width: "130px", show: true },
          { title: 'Country', key: 'countryCode', width: "130px", show: true },
          { title: 'Zipcode', key: 'zipcode', width: "130px", show: true },
          { title: 'Main Type of Degree Offered', key: 'mainFunctionType', width: "300px", show: true },
          { title: 'Type of Institution', key: 'mainInstControl', width: "80px", show: true },
          { title: 'Calendar', key: 'mainCalendar', width: "200px", show: true },          
          { title: 'Number of Undergraduates', key: 'grsBachInitN', width: "180px", show: true },
          { title: 'Admission Difficulty', key: 'adDiffAll', width: "60px", show: true },          
          { title: 'Campus Setting', key: 'cmpsSetting', width: "60px", show: true },          
          { title: 'Campus Size', key: 'cmpsSizeUnit', width: "210px", show: true },          
          { title: 'NCAA', key: 'assnAthlNcaa', width: "200px", show: true },          
          { title: 'NAIA', key: 'assnAthlNaia', width: "200px", show: true },          
          { title: 'NCCAA', key: 'assnAthlNccaa', width: "200px", show: true },          
          { title: 'Average GPA', key: 'frshGpa', width: "200px", show: true },          
          { title: 'Freshman Applicants', key: 'apRecd1stN', width: "200px", show: true },          
          { title: 'Freshman Admits', key: 'apAdmt1stN', width: "200px", show: true },          
          { title: 'Early Decision Applicants', key: 'apRecdEdecN', width: "200px", show: true },          
          { title: 'Early Decision Admits', key: 'apAdmtEdecN', width: "200px", show: true },          
          { title: 'Early Action Applicants', key: 'apRecdEactN', width: "200px", show: true },          
          { title: 'Early Action Admits', key: 'apAdmtEactN', width: "200px", show: true },          
          { title: 'Testing Policy', key: 'adTestPolicyT', width: "200px", show: true },          
          { title: 'Enrolled #Submitted SAT', key: 'submitSat1P', width: "200px", show: true },          
          { title: 'Enrolled #Submitted ACT', key: 'submitActP', width: "200px", show: true },          
          { title: 'SAT Verbal 25th', key: 'sat1Verb25ThP', width: "200px", show: true },          
          { title: 'SAT Verbal 75th', key: 'sat1Verb75ThP', width: "200px", show: true },          
          { title: 'SAT Math 25th', key: 'sat1Math25ThP', width: "200px", show: true },          
          { title: 'SAT Math 75th', key: 'sat1Math75ThP', width: "200px", show: true },          
          { title: 'ACT Composite 25th', key: 'actComp25ThP', width: "200px", show: true },          
          { title: 'ACT Composite 75th', key: 'actComp75ThP', width: "200px", show: true },          
          { title: 'Total Cost (Resident)', key: 'totResD', width: "200px", show: true },          
          { title: 'Tuition Non-Resident', key: 'tuitNres1StFtD', width: "200px", show: true },          
          { title: 'Tuition In-State', key: 'tuitState1StFtD', width: "200px", show: true },          
          { title: 'Admission Consideration Factors ', key: 'adFactorCode', width: "200px", show: true },          
          { title: 'Admission Consideration Factors, Level of Importance', key: 'adFactorLevel', width: "200px", show: true },          
          { title: 'Regular Decision Deadline Day', key: 'apDlFrshDay', width: "200px", show: true },          
          { title: 'Regular Decision Deadline Month', key: 'apDlFrshMon', width: "200px", show: true },          
          { title: 'Early Decision 2 Deadline Day', key: 'apDlEdec2Day', width: "200px", show: true },          
          { title: 'Early Decision 2 Deadline Month', key: 'apDlEdec2Mon', width: "200px", show: true },          
          { title: 'Early Decision Deadline Day', key: 'apDlEdec1Day', width: "200px", show: true },          
          { title: 'Early Decision Deadline Month', key: 'apDlEdec1Mon', width: "200px", show: true },          
          { title: 'Early Action Deadline Day', key: 'apDlEactDay', width: "200px", show: true },          
          { title: 'Early Action Deadline Month', key: 'apDlEactMon', width: "200px", show: true },          
          { title: 'Fall Freshman Priority Deadline Day', key: 'apDlPrioDay', width: "200px", show: true },          
          { title: 'Fall Freshman Priority Deadline Month', key: 'apDlPrioMon', width: "200px", show: true },          
          { title: 'Early Action is Restrictive', key: 'apEactRestrict', width: "200px", show: true },
        ];  
      }
    },
    filteredHeadersData(){
      return this.tableHeaders.filter(header => header.title !== "id")
    },
    updateHeaders() {
      const filteredArray = this.tableHeaders.map(x => (x.show === false ? { ...x, align: " d-none" } : { ...x, align: "" }));
      this.tableHeaders = filteredArray;
      let tableHeaders = JSON.stringify(filteredArray);
      localStorage.setItem("tableHeaders", tableHeaders);
    }
  },
});