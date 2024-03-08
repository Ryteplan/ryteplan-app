import { defineStore } from 'pinia';
import { dbFireStore } from "../firebase";
import { collection, getDocs } from 'firebase/firestore'


export const useTableStore = defineStore('table', {
  state: () => ({
      loading: true,
      tableData: [],
      tableDataManual: [],
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
      const retryCount = 3;
      const retryDelay = 1000;
      let attempt = 0;
      
      return new Promise((resolve, reject) => {
        const tryOpenDB = async () => {
          attempt++;
          try {
            const request = indexedDB.open('MyDatabase', 1);
    
            request.onerror = (event) => {
              console.error("IndexedDB error:", event.target.error);
              if (attempt <= retryCount) {
                setTimeout(tryOpenDB, retryDelay);
              } else {
                reject(event.target.error);
              }
            };
    
            request.onupgradeneeded = (event) => {
              const db = event.target.result;
              if (!db.objectStoreNames.contains('institutionsPetersons')) {
                db.createObjectStore('institutionsPetersons', { keyPath: 'id' });
              }
              if (!db.objectStoreNames.contains('institutionsManual')) {
                db.createObjectStore('institutionsManual', { keyPath: 'id' });
              }
            };
    
            request.onsuccess = (event) => {
              resolve(event.target.result);
            };
          } catch (error) {
            console.error('Error opening IndexedDB:', error);
            if (attempt <= retryCount) {
              setTimeout(tryOpenDB, retryDelay);
            } else {
              reject(error);
            }
          }
        };
    
        tryOpenDB();
      });
    },    
    async fetchTableData() {
      this.loading = true;
      try {
        const db = await this.openIndexedDB();

        // Manual

        const transactionManual = db.transaction(['institutionsManual'], 'readonly');
        const storeManual = transactionManual.objectStore('institutionsManual');
        const getAllRequestManual = storeManual.getAll();

        getAllRequestManual.onsuccess = async () => {
          if (getAllRequestManual.result.length > 0) {
            // Data is available in IndexedDB
            this.tableDataManual = getAllRequestManual.result;
            this.loading = false;
          } else {
            // Fetch from Firestore and store in IndexedDB
            const institutions = collection(dbFireStore, 'institutions_v7');
            const docSnap = await getDocs(institutions);

            const transactionManual = db.transaction(['institutionsManual'], 'readwrite');
            const storeManual = transactionManual.objectStore('institutionsManual');
            this.tableDataManual = [];

            docSnap.docs.forEach(doc => {
              const data = { ...doc.data(), id: doc.id };
              this.tableDataManual.push(data);
              storeManual.add(data);
            });

          }
        };

        // Petersons
        const transactionPetersons = db.transaction(['institutionsPetersons'], 'readonly');
        const storePetersons = transactionPetersons.objectStore('institutionsPetersons');
        const getAllRequestPetersons = storePetersons.getAll();

        getAllRequestPetersons.onsuccess = async () => {
          if (getAllRequestPetersons.result.length > 0) {
            // Data is available in IndexedDB
            this.tableData = getAllRequestPetersons.result;
            this.loading = false;
          } else {
            // Fetch from Firestore and store in IndexedDB
            const institutions = collection(dbFireStore, 'institutions_v7');
            const docSnap = await getDocs(institutions);

            const transactionPetersons = db.transaction(['institutionsPetersons'], 'readwrite');
            const storePetersons = transactionPetersons.objectStore('institutionsPetersons');
            this.tableData = [];

            docSnap.docs.forEach(doc => {
              const data = { ...doc.data(), id: doc.id };
              this.tableData.push(data);
              storePetersons.add(data);
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
        return d.mainFunctionType !== '2YEAR' && d.mainInstControlDesc !== 'Private Proprietary' && Object.keys(this.filters).every(f => {
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
          { title: 'City', key: 'city', width: "220px", show: false },
          { title: 'Country', key: 'countryCode', width: "130px", show: false },
          { title: 'Zipcode', key: 'zipcode', width: "130px", show: false },
          // { title: 'Main Type of Degree Offered', key: 'mainFunctionType', width: "260px", show: true },
          { title: 'Type of Institution', key: 'mainInstControlDesc', width: "180px", show: true },
          { title: 'Calendar', key: 'mainCalendar', width: "140px", show: true },          
          { title: 'Number of Undergraduates', key: 'grsBachInitN', width: "240px", show: true },
          { title: 'Admission Difficulty', key: 'adDiffAll', width: "220px", show: true },          
          { title: 'Campus Setting', key: 'cmpsSetting', width: "180px", show: true },          
          { title: 'Campus Size', key: 'cmpsSizeUnit', width: "210px", show: true },          
          { title: 'Average GPA', key: 'frshGpa', width: "200px", show: true },          
          { title: 'Freshman Applicants', key: 'apRecd1stN', width: "200px", show: true },          
          { title: 'Freshman Admits', key: 'apAdmt1stN', width: "200px", show: true },          
          { title: 'Early Decision Applicants', key: 'apRecdEdecN', width: "240px", show: true },          
          { title: 'Early Decision Admits', key: 'apAdmtEdecN', width: "240px", show: true },          
          { title: 'Early Action Applicants', key: 'apRecdEactN', width: "240px", show: true },          
          { title: 'Early Action Admits', key: 'apAdmtEactN', width: "200px", show: true },          
          { title: 'Enrolled #Submitted SAT', key: 'submitSat1P', width: "240px", show: true },          
          { title: 'Enrolled #Submitted ACT', key: 'submitActP', width: "240px", show: true },          
          { title: 'Total Cost (Resident)', key: 'totResD', width: "200px", show: true },          
          { title: 'Tuition Non-Resident', key: 'tuitNres1StFtD', width: "200px", show: true },          
          { title: 'Tuition In-State', key: 'tuitState1StFtD', width: "200px", show: true },          
          { title: 'Admission Consideration Factors ', key: 'adFactorCode', width: "290px", show: false },          
          { title: 'Admission Consideration Factors, Level of Importance', key: 'adFactorLevel', width: "420px", show: false },          
          { title: 'Early Action is Restrictive', key: 'apEactRestrict', width: "250px", show: true },
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