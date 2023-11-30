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
      headers: [
        { title: 'id', key: 'id', width: "300px", show: false, align: "d-none" },
        { title: 'Institution name', key: 'name', width: "300px", fixed: true },
        { title: 'State', key: 'stateCode', width: "130px", show: true },
        { title: 'Country', key: 'countryCode', width: "130px", show: true },
        { title: 'Main Type of Degree Offered', key: 'mainFunctionType', width: "300px", show: true },
        { title: 'Type of Institution', key: 'mainInstControl', width: "80px", show: true },
        { title: 'Calendar', key: 'calendar', width: "180px", show: true },
        { title: 'HBCU', key: 'hbcu', width: "60px", show: true },          
        { title: 'Tribal', key: 'tribal', width: "60px", show: true },          
        { title: 'Urban-centric locale', key: 'urbanCentricLocale', width: "210px", show: true },          
        { title: 'COA in-state students', key: 'coaInStateStudents', width: "250px", show: true },          
        { title: 'COA out-of-state', key: 'coaOutOfState', width: "200px", show: true },          
        { title: 'Size range', key: 'sizeRange', width: "200px", show: true },          
        { title: 'Undergraduate enrollment', key: 'undergraduateEnrollment', width: "280px", show: true },          
        { title: 'Graduate enrollment', key: 'graduateEnrollment', width: "280px", show: true },          
      ],
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
    filteredHeadersData(){
      return this.headers.filter(header => header.title !== "id")
    },
    columnValueList(val) {
      return [...new Set(this.tableData.map(d => d[val]))] 
    },
    updatePage(pageNumber) {
      this.page = pageNumber;
      document.querySelector('#dataTable .v-table__wrapper').scrollTop = 0;
    },
    updateSelected(selectedRows) {
      this.selectedRows = selectedRows;
    },
    updateHeaders(){
      const filteredArray = this.headers.map(x => (x.show === false ? { ...x, align: " d-none" } : x));
      this.headers = filteredArray;
    }
  },
});