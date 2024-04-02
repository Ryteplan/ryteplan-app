import { defineStore } from 'pinia';
import { dbFireStore } from "../firebase";
import { collection, getDocs } from 'firebase/firestore'
import { useSearchFilterSortStore } from './searchFilterSortStore';
import { useAppVersionStore } from './appVersionStore';

export const useTableStore = defineStore('table', {
  state: () => ({
      loading: true,
      tableData: [],
      tableDataManual: [],
      hideHidden: true,
      executeSearchTerms: '',
      selectedRows: [],
      tableHeaders: [],
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
            console.log("Opening IndexedDB - attempt: ", attempt)
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
              const db = event.target.result;
              db.onversionchange = () => {
                  db.close();
              };
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
      const appVersionStore = useAppVersionStore();

      this.loading = true;

      try {
        const db = await this.openIndexedDB();

        // Manual
        const transactionManual = db.transaction(['institutionsManual'], 'readonly');
        const storeManual = transactionManual.objectStore('institutionsManual');
        const getAllRequestManual = storeManual.getAll();

        getAllRequestManual.onsuccess = async () => {

          if (getAllRequestManual.result && getAllRequestManual.result.length > 0 && appVersionStore.versionMatch) {
            // Fetch from IndexedDB
            this.tableDataManual = getAllRequestManual.result;
          } else {
            // Fetch from Firestore
            const institutions = collection(dbFireStore, 'manual_institution_data');
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
          if (getAllRequestPetersons.result && getAllRequestPetersons.result.length > 0 && appVersionStore.versionMatch) {
            // Fetch from IndexedDB
            console.log('Fetching from IndexedDB')
            this.tableData = getAllRequestPetersons.result;
            this.tableData.sort((a, b) => a.id.localeCompare(b.id));
            this.loading = false;
          } else {
            // Fetch from Firestore
            console.log('Fetching from Firestore')
            const institutions = collection(dbFireStore, 'institutions_v9');
            const docSnap = await getDocs(institutions);

            const transactionPetersons = db.transaction(['institutionsPetersons'], 'readwrite');
            const storePetersons = transactionPetersons.objectStore('institutionsPetersons');
            this.tableData = [];

            docSnap.docs.forEach(doc => {
              const data = { ...doc.data(), id: doc.id };
              this.tableData.push(data);
            });

            // Add manual data to this.tableData
            // iterate through the manual data and add it to the Petersons data
            this.tableDataManual.forEach(data => {
              const index = this.tableData.findIndex(item => item.uri === data.id);
              if (index > -1) {
                this.tableData[index] = { ...this.tableData[index], ...data };
              }
            });
  
            this.tableData.forEach(data => {
              const data1 = { ...data, id: data.id };
              storePetersons.add(data1);
            });
            this.loading = false;
          }
        };
      } catch (error) {
        console.error('Error fetching table data:', error);
        this.loading = false;
      }
    },
    filteredTableData() {
      const searchFilterSort = useSearchFilterSortStore()

      return this.tableData.map(d => {
        // Iterate over each field in the object
        for (let key in d) {
          // If the field's value is 0, replace it with an em dash
          if (d[key] === 0) {
            d[key] = '—';
          }
        }
        return d;
      }).filter(d => {
        if (this.hideHidden) {
          return d.hidden == true && d.mainFunctionType !== '2YEAR' && d.mainInstControlDesc !== 'Private Proprietary' && Object.keys(searchFilterSort.filters).every(f => {
            return searchFilterSort.filters[f].length < 1 || searchFilterSort.filters[f].includes(d[f])
          })  
        } else {
          return d.hidden !== true && d.mainFunctionType !== '2YEAR' && d.mainInstControlDesc !== 'Private Proprietary' && Object.keys(searchFilterSort.filters).every(f => {
            return searchFilterSort.filters[f].length < 1 || searchFilterSort.filters[f].includes(d[f])
          })
        }
      })
    },
    columnValueList(val) {
      return [...new Set(this.tableData.map(d => d[val]))].sort();
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
          { title: 'Sector', key: 'mainInstControlDesc', width: "140px", show: true },
          { title: 'Calendar', key: 'mainCalendar', width: "140px", show: true },          
          { title: 'Undergraduates', key: 'undergradEnrollTotal', width: "140px", show: true },
          { title: 'Difficulty', key: 'adDiffAll', width: "140px", show: true },          
          { title: 'Locale', key: 'cmpsSetting', width: "140px", show: true },          
          { title: 'Campus Size', key: 'cmpsSizeUnit', width: "210px", show: false },          
          { title: 'Average GPA', key: 'frshGpa', width: "160px", show: true },          
          { title: 'Applicants', key: 'apRecd1stN', width: "140px", show: true },          
          { title: 'Admits', key: 'apAdmt1stN', width: "140px", show: true },          
          { title: 'HBCU', key: 'hbcu', width: "100px", show: false },
          { title: 'Tribal', key: 'tribal', width: "100px", show: false },
          { title: 'Early Decision Applicants', key: 'apRecdEdecN', width: "240px", show: false },          
          { title: 'Early Decision Admits', key: 'apAdmtEdecN', width: "240px", show: false },          
          { title: 'Early Action Applicants', key: 'apRecdEactN', width: "240px", show: false },          
          { title: 'Early Action Admits', key: 'apAdmtEactN', width: "200px", show: false },          
          { title: 'Enrolled #Submitted SAT', key: 'submitSat1P', width: "240px", show: false },          
          { title: 'Enrolled #Submitted ACT', key: 'submitActP', width: "240px", show: false },          
          { title: 'Total Cost (Resident)', key: 'totResD', width: "200px", show: false },          
          { title: 'Tuition Non-Resident', key: 'tuitNres1StFtD', width: "200px", show: false },          
          { title: 'Tuition In-State', key: 'tuitState1StFtD', width: "200px", show: false },          
          { title: 'Admission Consideration Factors ', key: 'adFactorCode', width: "290px", show: false },          
          { title: 'Admission Consideration Factors, Level of Importance', key: 'adFactorLevel', width: "420px", show: false },          
          { title: 'Early Action is Restrictive', key: 'apEactRestrict', width: "250px", show: false },
          { title: 'Hidden', key: 'hidden', width: "100px", show: false, hideFromUser: true },
          // { title: 'Main Type of Degree Offered', key: 'mainFunctionType', width: "260px", show: true },
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
      const searchFilterSort = useSearchFilterSortStore()
      this.executeSearchTerms = searchFilterSort.searchInput;
    },
    async refreshTableData() {
      console.log('Refreshing table data');

      const appVersionStore = useAppVersionStore();
      this.loading = true;

      const dbRequest = indexedDB.open('MyDatabase');
      dbRequest.onsuccess = function(event) {
        const db = event.target.result;

        // Get the names of all object stores
        const storeNames = db.objectStoreNames;

        // Open a transaction for each object store and clear it
        for (let i = 0; i < storeNames.length; i++) {
          const storeName = storeNames[i];
          const transaction = db.transaction(storeName, 'readwrite');
          const objectStore = transaction.objectStore(storeName);
          objectStore.clear();
        }

        db.close();
      }
      dbRequest.onerror = function(event) {
        console.error("Error opening database:", event.target.error);
      };

      this.fetchTableData();
      localStorage.setItem("appVersion", appVersionStore.getVersion());
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
        localStorage.setItem("hideHidden", this.hideHidden);
    }
  },
});