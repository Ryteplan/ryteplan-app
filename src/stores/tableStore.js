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
      selectedRows: []
  }),
  actions: {
    async fetchTableData() {
      try {
        const file = '/21-22 updated IPEDS 09-02-2023.xlsx'; 
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
    },
    updateSelected(selectedRows) {
      this.selectedRows = selectedRows;
    }
  },
});