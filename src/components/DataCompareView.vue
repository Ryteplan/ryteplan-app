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
    <v-data-table
      :headers="headers"
      :items="schools"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :search="searchQuery"
      class="mt-8"
      item-value="id"
      expand-on-click
      :expanded="expanded"  
      @update:options="handleTableUpdate"
      >
      <template v-slot:expanded-row="{ item }" >
        <tr>
          <td :colspan="headers.length">
            <div class="grid-container field-headers mt-2 mb-2">
              <h4>field name</h4>
              <h4>V12</h4>
              <h4>V13</h4>
              <h4>V14</h4>
              <h4>manual</h4>
            </div>
            <div 
              class="grid-container field-container py-2"
              v-for="field in getFilteredFields(item)" 
              :key='field.name'
            >
              <p>{{ field.name }}</p>
              <p>{{ getPetersonsField1(item.id, field.name) }}</p>
              <p>{{ getPetersonsField2(item.id, field.name) }}</p>
              <p>{{ getPetersonsField3(item.id, field.name) }}</p>
              <p>{{ field.value }}</p>
            </div>
          </td>
        </tr>
      </template>
      <template #item="{ item }">
        <tr>
          <td>
            <div class="d-flex align-center">
              <router-link 
                :to="`/institution/${item.id}`" 
                target="_blank"
                class="view-link text-decoration-none"
              >
                <span class="text-black font-weight-bold mr-1">{{ item.name }}</span>
                <v-icon size="small" color="black">mdi-arrow-top-right</v-icon>
              </router-link>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { dbFireStore } from "../firebase";
import { collection, query, getDocs } from 'firebase/firestore';

export default {
  name: 'DataCompareView',
  data() {
    return {
      loading: true,
      petersonsData1: [],
      petersonsData2: [],
      petersonsData3: [],
      manualData: [],
      itemsPerPage: 10,
      searchQuery: '',
      headers: [
        { title: 'School Name', key: 'name', width: '100%' }
      ],
      expanded: [],
    }
  },
  computed: {
    schools() {
      return this.manualData.map(school => {
        const petersonsRecord = this.petersonsData1.find(item => item.id === school.id);
        return {
          ...school,
          name: petersonsRecord?.name || school.id
        }
      });
    }
  },
  mounted() {
    this.getManualAndPetersonsData();    // Expand all rows after data is loaded
  },
  methods: {
    async getManualAndPetersonsData() {
      // Get manual data
      const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"));
      const manualSnapshots = await getDocs(manualDataQuery);

      this.manualData = manualSnapshots.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(data => data.hidden !== true);

      // Get petersons data
      const collections = [
        { name: "institutions_petersons_processed_v12", target: this.petersonsData1 },
        { name: "institutions_v13", target: this.petersonsData2 },
        { name: "institutions_v14", target: this.petersonsData3 }
      ];

      for (const col of collections) {
        const dataQuery = query(collection(dbFireStore, col.name));
        const snapshots = await getDocs(dataQuery);
        col.target.push(...snapshots.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      }

      this.expanded = this.schools.map(item => item.id);
      this.loading = false;
    },
    getPetersonsField1(schoolId, fieldName) {
      const petersonsRecord = this.petersonsData1.find(item => item.id === schoolId);
      return petersonsRecord ? petersonsRecord[fieldName] : null;
    },
    getPetersonsField2(schoolId, fieldName) {
      const petersonsRecord = this.petersonsData2.find(item => item.id === schoolId);
      return petersonsRecord ? petersonsRecord[fieldName] : null;
    },
    getPetersonsField3(schoolId, fieldName) {
      const petersonsRecord = this.petersonsData3.find(item => item.id === schoolId);
      return petersonsRecord ? petersonsRecord[fieldName] : null;
    },
    getFilteredFields(school) {
      return Object.keys(school)
        .filter(key => key !== 'id' && key !== 'sports' && key !== 'name')
        .map(key => ({ name: key, value: school[key] }));
    },
    handleSearch() {
      // The v-data-table handles the search automatically with the :search prop
    },
    handleTableUpdate() {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 0);
    }
  }
}
</script>

<style>

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
