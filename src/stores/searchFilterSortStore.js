import { defineStore } from 'pinia';

export const useSearchFilterSortStore = defineStore('searchFilterSort', {
  state: () => ({
    hideHidden: true,
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
    sortBy: [{ key: 'name', order: 'asc' }],
  }),
  persist: true,
  actions: {
    updatePage(pageNumber) {
      this.page = pageNumber;
      document.querySelector('.v-table__wrapper').scrollTop = 0;
    },
  },
});