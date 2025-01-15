<template>
  <v-container class="pt-4">
    <div class="data-compare">      
      <h1>Data Compare</h1>
      <div class="d-flex align-center gap-2">
        <v-text-field
          v-model="searchQuery"
          label="Search schools"
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          clearable
          class="mt-4"
          hide-details
          @keyup.enter="handleSearch"
        ></v-text-field>
        <v-btn
          color="primary"
          class="mt-4"
          @click="handleSearch"
        >
          Search
        </v-btn>
      </div>
    </div>
    <div class="data-updated-container">
      <v-card 
        class="mt-8 py-4 px-6"
        v-for="school in paginatedSchools" 
        :key="school.id"
      >
        <a :href=getSchoolUrl(school.id) target="_blank">
          <h3>{{ school.id }}</h3>
        </a>
        <div class="grid-container field-headers mt-2 mb-2">
          <h4>field name</h4>
          <h4>V12</h4>
          <h4>V13</h4>
          <h4>V14</h4>
          <h4>manual</h4>
        </div>
        <div 
          class="grid-container field-container py-2"
          v-for="field in getFilteredFields(school)" 
          :key='field.id'
        >
          <p>{{ field.name }}</p>
          <p>{{ this.getPetersonsField1(school.id, field.name) }}</p>
          <p>{{ this.getPetersonsField2(school.id, field.name) }}</p>
          <p>{{ this.getPetersonsField3(school.id, field.name) }}</p>
          <p>{{ field.value }}</p>
        </div>
      </v-card>
    </div>
    <!-- Update pagination controls -->
    <div class="d-flex justify-center align-center mt-6">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        @update:model-value="handlePageChange"
      ></v-pagination>
      <div class="ml-4 d-flex align-center">
        <v-text-field
          v-model="pageInput"
          type="number"
          :min="1"
          :max="totalPages"
          density="compact"
          hide-details
          class="page-input"
          style="width: 80px"
          @keyup.enter="goToPage"
        ></v-text-field>
        <span class="ml-2">of {{ totalPages }}</span>
      </div>
    </div>
  </v-container>
</template>

<script>
import { dbFireStore } from "../firebase";

// eslint-disable-next-line
import { collection, query, getDocs, setDoc, doc, limit } from 'firebase/firestore'

export default {
  name: 'DataIntegration',
  setup() {
  },
  mounted() {
    this.getManualAndPetersonsData();
    // Check for page parameter in URL
    const pageFromUrl = parseInt(this.$route.query.page);
    if (pageFromUrl && pageFromUrl <= this.totalPages) {
      this.currentPage = pageFromUrl;
      this.pageInput = pageFromUrl.toString();
    }
  },
  data() {
    return {
      loading: true,
      petersonsData1: [],
      petersonsData2: [],
      petersonsData3: [],
      manualData: [],
      comparisonData: [],
      currentPage: 1,
      itemsPerPage: 10,
      pageInput: '1',
      searchQuery: '',
      filteredSchools: [],
    }
  },
  computed: {
    totalPages() {
      const schoolsToUse = this.filteredSchools.length > 0 ? this.filteredSchools : this.manualData;
      return Math.ceil(schoolsToUse.length / this.itemsPerPage);
    },
    paginatedSchools() {
      const schoolsToUse = this.filteredSchools.length > 0 ? this.filteredSchools : this.manualData;
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return schoolsToUse.slice(start, end);
    }
  },
  methods: {
    async getManualAndPetersonsData() {
      const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"));
      const manualSnapshots = await getDocs(manualDataQuery);

      manualSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        if (data.hidden !== true) {
          this.manualData.push(data);
        }
      });

      this.manualData.forEach(school => {
        Object.keys(school).sort().forEach(key => {
          const value = school[key];
          delete school[key];
          school[key] = value;
        });
      });

      const petersonsDataQuery1 = query(collection(dbFireStore, "institutions_petersons_processed_v12"));      
      const petersonsSnapshots1 = await getDocs(petersonsDataQuery1);

      petersonsSnapshots1.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.petersonsData1.push(data);
      });

      const petersonsDataQuery2 = query(collection(dbFireStore, "institutions_v13"));      
      const petersonsSnapshots2 = await getDocs(petersonsDataQuery2);

      petersonsSnapshots2.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.petersonsData2.push(data);
      });

      const petersonsDataQuery3 = query(collection(dbFireStore, "institutions_v14"));      
      const petersonsSnapshots3 = await getDocs(petersonsDataQuery3);

        petersonsSnapshots3.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.petersonsData3.push(data);
      });

      this.loading = false;
    },
    getPetersonsField1(schoolId, fieldName) {
      // search petersonsData1 for a record that has an id equal to schoolId and return the value of the item that matches the fieldName 
      const petersonsRecord = this.petersonsData1.find(item => item.id === schoolId);
      if (petersonsRecord) {
        return petersonsRecord[fieldName];
      }
      return null;
    },
    getPetersonsField2(schoolId, fieldName) {
      // search petersonsData2 for a record that has an id equal to schoolId and return the value of the item that matches the fieldName 
      const petersonsRecord = this.petersonsData2.find(item => item.id === schoolId);
      if (petersonsRecord) {
        return petersonsRecord[fieldName];
      }
      return null;
    },

    getPetersonsField3(schoolId, fieldName) {
      // search petersonsData2 for a record that has an id equal to schoolId and return the value of the item that matches the fieldName 
      const petersonsRecord = this.petersonsData3.find(item => item.id === schoolId);
      if (petersonsRecord) {
        return petersonsRecord[fieldName];
      }
      return null;
    },
    getSchoolUrl(schoolId) {
      return '/institution/' + schoolId
    },
    getFilteredFields(school) {
      return Object.keys(school)
        .filter(key => 
          key !== 'id' && 
          key !== 'sports'
        )
        .map(key => ({ name: key, value: school[key] }));
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.pageInput = page.toString();
      
      // Update URL with current page
      this.$router.push({
        query: { ...this.$route.query, page: page.toString() }
      });
      
      this.$nextTick(() => {
        document.querySelector('.v-container').scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      });
    },
    goToPage() {
      const page = parseInt(this.pageInput)
      if (page && page >= 1 && page <= this.totalPages) {
        this.handlePageChange(page)
      } else {
        this.pageInput = this.currentPage.toString()
      }
    },
    handleSearch() {
      if (!this.searchQuery) {
        this.filteredSchools = this.manualData;
      } else {
        const query = this.searchQuery.toLowerCase();
        this.filteredSchools = this.manualData.filter(school => {
          // Get the school name from petersonsData1 (using V12 as source of truth for names)
          const schoolRecord = this.petersonsData1.find(item => item.id === school.id);
          const schoolName = schoolRecord?.name || '';
          return schoolName.toLowerCase().includes(query);
        });
      }
      this.currentPage = 1;
      this.pageInput = '1';
    },
  },
  watch: {
    '$route.query.page'(newPage) {
      const page = parseInt(newPage);
      if (page && page !== this.currentPage && page <= this.totalPages) {
        this.handlePageChange(page);
      }
    }
  }
}
</script>
<style>
  .data-updated-container {
    margin-bottom: 2rem;
  }

  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr; 
  }

  .field-container {
    border-top: 1px solid #e3e3e3;
  }

  .gap-2 {
    gap: 8px;
  }

</style>
