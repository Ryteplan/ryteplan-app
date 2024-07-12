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
        <div class="three-col-grid-container field-headers mt-2 mb-2">
          <h4>field name</h4>
          <h4>petersons value</h4>
          <h4>manual value</h4>
        </div>
        <div 
          class="three-col-grid-container field-container py-2"
          v-for="(field, fieldName) in school" 
          :key='field.id'
        >
          <p>{{ fieldName }}</p>
          <p>{{ this.getPetersonsField(school.id, fieldName) }}</p>
          <p>{{ field }}</p>
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
      petersonsData: [],
      manualData: [],
      comparisonData: []
    }
  },
  methods: {
    async getManualAndPetersonsData() {
      const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"));
      // const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"), limit(10));
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

      const petersonsDataQuery = query(collection(dbFireStore, "institutions_petersons_processed_v12"));      
      const petersonsSnapshots = await getDocs(petersonsDataQuery);

      petersonsSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.petersonsData.push(data);
      });
    },
    getPetersonsField(schoolId, fieldName) {
      // search petersonsData for a record that has an id equal to schoolId and return the value of the item that matches the fieldName 
      const petersonsRecord = this.petersonsData.find(item => item.id === schoolId);
      if (petersonsRecord) {
        return petersonsRecord[fieldName];
      }
      return null;
    },
    getSchoolUrl(schoolId) {
      return '/institution/' + schoolId
    }
  }
}
</script>
<style>
  .three-col-grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .field-container {
    border-top: 1px solid #e3e3e3;
  }
</style>
