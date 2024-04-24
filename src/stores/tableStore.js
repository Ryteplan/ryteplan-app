import { defineStore } from 'pinia';
import { dbFireStore } from "../firebase";
import { collection, getDocs, query, limit,  startAfter } from 'firebase/firestore'
import { useSearchFilterSortStore } from './searchFilterSortStore';

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
    loadItems ({ page, itemsPerPage, sortBy }) {
      console.log('loadItems', page, itemsPerPage, sortBy);
    },
    async fetchTableData() {

      this.loading = true;

        // Fetch manual from Firestore
        // const institutions = collection(dbFireStore, 'manual_institution_data');
        // const docSnap = await getDocs(institutions);

        // const transactionManual = db.transaction(['institutionsManual'], 'readwrite');
        // const storeManual = transactionManual.objectStore('institutionsManual');
        // this.tableDataManual = [];

        // docSnap.docs.forEach(doc => {
        //   const data = { ...doc.data(), id: doc.id };
        //   this.tableDataManual.push(data);
        //   storeManual.add(data);
        // });

        // Fetch from Firestore
        // Query the first page of docs
        const first = query(collection(dbFireStore, "institutions_v11"), limit(50));
        const documentSnapshots = await getDocs(first);

        console.log(documentSnapshots.docs);

        documentSnapshots.docs.forEach(doc => {
            const data = { ...doc.data(), id: doc.id };
            this.tableData.push(data);
        });

        // Get the last visible document
        const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
        console.log("last", lastVisible);

        // Construct a new query starting at this document,
        // get the next 50 cities.
        const next = query(collection(dbFireStore, "institutions_v11"),
            startAfter(lastVisible),
            limit(25));
        
        console.log(next);

        // Construct a new query starting at this document.
        // Note: this will not have the desired effect if multiple
        // cities have the exact same population value.
        // const next = db.collection('cities')
        //   .orderBy('population')
        //   .startAfter(last.data().population)
        //   .limit(3);

        // this.tableData = [];

        // docSnap.docs.forEach(doc => {
        //   const data = { ...doc.data(), id: doc.id };
        //   this.tableData.push(data);
        // });

        // // Add manual data to this.tableData
        // // iterate through the manual data and add it to the Petersons data
        // this.tableDataManual.forEach(data => {
        //   const index = this.tableData.findIndex(item => item.uri === data.id);
        //   if (index > -1) {
        //     this.tableData[index] = { ...this.tableData[index], ...data };
        //   }
        // });

        this.loading = false;
    },
    filteredTableData() {
      const searchFilterSort = useSearchFilterSortStore();
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
          { title: 'Undergraduates', key: 'enTotUgN', width: "140px", show: true },
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