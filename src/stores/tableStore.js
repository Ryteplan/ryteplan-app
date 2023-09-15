import { defineStore } from 'pinia';
import * as XLSX from 'xlsx';

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
        { title: 'Institution name', key: 'institution name', width: "300px", fixed: true },
        { title: 'State', key: 'State ', width: "130px", show: true },
        { title: 'Sector', key: 'Sector', width: "300px", show: true },
        { title: 'Admittance', key: '%admit', width: "80px", show: true },
        { title: 'Calendar', key: 'Calendar', width: "180px", show: true },
        { title: 'HBCU', key: 'HBCU', width: "60px", show: true },          
        { title: 'Tribal', key: 'Tribal', width: "60px", show: true },          
        { title: 'Urban-centric locale', key: 'Urban-centric locale', width: "210px", show: true },          
        { title: '%reg DSPS', key: '%reg DSPS', width: "200px", show: true },          
        { title: 'COA in-state students', key: 'COA in-state students', width: "250px", show: true },          
        { title: 'COA out-of-state', key: 'COA out-of-state', width: "200px", show: true },          
        { title: 'Size range', key: 'Size range', width: "200px", show: true },          
        { title: 'Undergraduate enrollment', key: 'Undergraduate enrollment', width: "280px", show: true },          
        { title: 'Graduate enrollment', key: 'Graduate enrollment', width: "280px", show: true },          
      ],
  }),
  actions: {
    async fetchTableData() {
      try {
        const file = '/21-22 updated IPEDS 09-15-2023.xlsx'; 
        fetch(file)
          .then((res) => res.arrayBuffer())
          .then((data) => {
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            localStorage.setItem("institutionTable", JSON.stringify(XLSX.utils.sheet_to_json(worksheet)));
            this.tableData = JSON.parse(localStorage.getItem("institutionTable"));
            this.loading = false;
          })
      } catch (error) {
        console.error('Error fetching table data:', error);
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