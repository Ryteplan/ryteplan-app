import { defineStore } from 'pinia';
import { dbFireStore } from "../firebase";
import { collection, getDocs } from 'firebase/firestore'


export const useTableStore = defineStore('table', {
  state: () => ({
      loading: true,
      tableData: [],
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
      executeSearchTerms: '',
      page: 1,
      selectedRows: [],
      tableHeaders: [],
      sortBy: [{ key: 'name', order: 'asc' }],
  }),
  actions: {
    async openIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('MyDatabase', 1);

        request.onerror = (event) => {
          console.error("IndexedDB error:", event.target.error);
          reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('institutions')) {
            db.createObjectStore('institutions', { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
      });
    },
    async fetchTableData() {
      this.loading = true;
      try {
        const db = await this.openIndexedDB();
        const transaction = db.transaction(['institutions'], 'readonly');
        const store = transaction.objectStore('institutions');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = async () => {
          if (getAllRequest.result.length > 0) {
            // Data is available in IndexedDB
            this.tableData = getAllRequest.result;
            this.loading = false;
          } else {
            // Fetch from Firestore and store in IndexedDB
            const institutions = collection(dbFireStore, 'institutions_v6');
            const docSnap = await getDocs(institutions);

            const transaction = db.transaction(['institutions'], 'readwrite');
            const store = transaction.objectStore('institutions');
            this.tableData = [];

            docSnap.docs.forEach(doc => {
              const data = { ...doc.data(), id: doc.id };
              this.tableData.push(data);
              store.add(data);
            });

            this.loading = false;
          }
        };
      } catch (error) {
        console.error('Error fetching table data:', error);
        this.loading = false;
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
      document.querySelector('.v-table__wrapper').scrollTop = 0;
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
          { title: 'State', key: 'stateCleaned', width: "130px", show: false },
          { title: 'City', key: 'city', width: "130px", show: false },
          { title: 'Country', key: 'countryCode', width: "130px", show: false },
          { title: 'Zipcode', key: 'zipcode', width: "130px", show: false },
          { title: 'Main Type of Degree Offered', key: 'mainFunctionType', width: "300px", show: true },
          { title: 'Type of Institution', key: 'mainInstControlDesc', width: "80px", show: true },
          { title: 'Calendar', key: 'mainCalendar', width: "200px", show: true },          
          { title: 'Number of Undergraduates', key: 'grsBachInitN', width: "180px", show: true },
          { title: 'Admission Difficulty', key: 'adDiffAll', width: "60px", show: true },          
          { title: 'Campus Setting', key: 'cmpsSetting', width: "60px", show: true },          
          { title: 'Campus Size', key: 'cmpsSizeUnit', width: "210px", show: true },          
          { title: 'Average GPA', key: 'frshGpa', width: "200px", show: true },          
          { title: 'Freshman Applicants', key: 'apRecd1stN', width: "200px", show: true },          
          { title: 'Freshman Admits', key: 'apAdmt1stN', width: "200px", show: true },          
          { title: 'Early Decision Applicants', key: 'apRecdEdecN', width: "200px", show: true },          
          { title: 'Early Decision Admits', key: 'apAdmtEdecN', width: "200px", show: true },          
          { title: 'Early Action Applicants', key: 'apRecdEactN', width: "200px", show: true },          
          { title: 'Early Action Admits', key: 'apAdmtEactN', width: "200px", show: true },          
          { title: 'Enrolled #Submitted SAT', key: 'submitSat1P', width: "200px", show: true },          
          { title: 'Enrolled #Submitted ACT', key: 'submitActP', width: "200px", show: true },          
          { title: 'Total Cost (Resident)', key: 'totResD', width: "200px", show: true },          
          { title: 'Tuition Non-Resident', key: 'tuitNres1StFtD', width: "200px", show: true },          
          { title: 'Tuition In-State', key: 'tuitState1StFtD', width: "200px", show: true },          
          { title: 'Admission Consideration Factors ', key: 'adFactorCode', width: "200px", show: true },          
          { title: 'Admission Consideration Factors, Level of Importance', key: 'adFactorLevel', width: "200px", show: true },          
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
    },
    performSeach() {
      this.executeSearchTerms = this.searchInput;
    }
  },
});