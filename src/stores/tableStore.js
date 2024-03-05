import { defineStore } from 'pinia';
import { dbFireStore } from "../firebase";
import { collection, getDocs } from 'firebase/firestore'


export const useTableStore = defineStore('table', {
  state: () => ({
      loading: true,
      tableData: [],
      manualTableData: [],
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
          if (!db.objectStoreNames.contains('institutionsManual')) {
            db.createObjectStore('institutionsManual', { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
      });
    },
    async fetchTableData() {
      this.loading = true;
      const maxRetries = 3;
      let retries = 0;
      let success = false;
      
      while (retries < maxRetries && !success) {
        try {

          console.log(this);
          const db = await this.openIndexedDB();

          console.log(db);

          // Manual Institution Data
          // const transactionManual = db.transaction(['institutionsManual'], 'readonly');
          // const storeManual = transactionManual.objectStore('institutionsManual');
          // const getAllManualRequest = new Promise((resolve, reject) => {
          //   const request = storeManual.getAll();
          //   request.onsuccess = () => resolve(request.result);
          //   request.onerror = () => reject(request.error);
          // });
    
          // const manualData = await getAllManualRequest;
    
          // if (manualData.length > 0) {
          //   this.manualTableData = manualData;
          // } else {
          //   const manual_institution_data = collection(dbFireStore, 'manual_institution_data');
          //   const manual_institution_dataSnap = await getDocs(manual_institution_data);
    
          //   manual_institution_dataSnap.forEach((doc) => {
          //     const manualInstituionData = { ...doc.data(), id: doc.id };
          //     this.manualTableData.push(manualInstituionData);
          //     storeManual.add(manualInstituionData);
          //   });    
          // }
          
          // Petersons Institution Data
          const transactionPetersons = db.transaction(['institutionsPetersons'], 'readwrite');
          const storePetersons = transactionPetersons.objectStore('institutionsPetersons');

          const getAllPetersonsRequest = new Promise((resolve, reject) => {
            const request = storePetersons.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
          });

          const petersonsData = await getAllPetersonsRequest;

          console.log(petersonsData);

          if (petersonsData.length > 0) {
            if (getAllPetersonsRequest.result.length > 0) {
              this.tableData = getAllPetersonsRequest.result;
              this.loading = false;
            } else {

              // Petersons Institution Data
              const institutions = collection(dbFireStore, 'institutions_v7');
              const institutionsSnap = await getDocs(institutions);

              this.tableData = [];

              institutionsSnap.docs.forEach(doc => {
                const institutionData = { ...doc.data(), id: doc.id };

                // check for user hidden institutions
                const matchingObject = this.manualTableData.find(obj => obj.id === institutionData.uri && obj.hidden === true);

                if (!matchingObject) {
                  this.tableData.push(institutionData);
                  storePetersons.add(institutionData);
                }
              });
            }
            this.loading = false;
          }
          success = true;
        } catch (error) {
          console.error('Error fetching table data:', error);
          retries++;
          if (retries < maxRetries) {
            console.log(`Retrying (${retries}/${maxRetries})...`);
            // Optional: introduce a delay before retrying
            // await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.error(`Maximum retries (${maxRetries}) reached.`);
            this.loading = false;
          }
        }
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
