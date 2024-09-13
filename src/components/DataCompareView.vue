<template>
  <v-container class="pt-4">
    <div class="data-compare">      
      <h1>Data Compare</h1>
    </div>
    <div class="data-updated-container">
      <v-card 
        class="mt-8 py-4 px-6"
        v-for="school in manualData" 
        :key="school.id"
      >
        <a :href=getSchoolUrl(school.id) target="_blank">
          <h3>{{ school.id }}</h3>
        </a>
        <div class="grid-container field-headers mt-2 mb-2">
          <h4>field name</h4>
          <h4>petersons 2023</h4>
          <h4>petersons 2024</h4>
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
          <p>{{ field.value }}</p>
        </div>
      </v-card>
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
  },
  data() {
    return {
      loading: true,
      petersonsData1: [],
      petersonsData2: [],
      manualData: [],
      comparisonData: []
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

      this.loading = false;
    },
    getPetersonsField1(schoolId, fieldName) {
      // search petersonsData for a record that has an id equal to schoolId and return the value of the item that matches the fieldName 
      const petersonsRecord = this.petersonsData1.find(item => item.id === schoolId);
      if (petersonsRecord) {
        return petersonsRecord[fieldName];
      }
      return null;
    },
    getPetersonsField2(schoolId, fieldName) {
      // search petersonsData for a record that has an id equal to schoolId and return the value of the item that matches the fieldName 
      const petersonsRecord = this.petersonsData2.find(item => item.id === schoolId);
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
          key !== 'undergradEnrollTotal' &&
          key !== 'undergrad_enroll_total'
        )
        .map(key => ({ name: key, value: school[key] }));
    }
  }
}
</script>
<style>
  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr; 
  }

  .field-container {
    border-top: 1px solid #e3e3e3;
  }
</style>
