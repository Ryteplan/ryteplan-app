<template>
  <v-container class="pt-4">
    <div class="data-integration">
      <h1>Data Integration</h1>
      <p>When we update data using the UI we need to press this button to make sure that the main table gets updated.</p>
      <v-btn
        @click="doDataIntegration"
        color="primary"
      >
          Integrate Data
      </v-btn>
    </div>
    <div class="data-updated-container">
      <v-card v-for="item in petersonsData" :key="item.uri">
        <v-card-title>
          <h2>{{ item.name }}</h2>
        </v-card-title>
        <v-card-text>
          <p>{{ item.city }}, {{ item.stateCleaned }}</p>
          <p>{{ item.mainFunctionType }}</p>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import { dbFireStore } from "../firebase";
import { collection, query, getDocs, setDoc, doc } from 'firebase/firestore'

export default {
  name: 'DataIntegration',
  data() {
    return {
      petersonsData: [],
      manualData: [],
    }
  },
  methods: {
    async doDataIntegration() {
      console.log('doing data integration')
      
      const petersonsDataQuery = query(collection(dbFireStore, "institutions_v11"));      
      const petersonsSnapshots = await getDocs(petersonsDataQuery);

      petersonsSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.petersonsData.push(data);
      });


      // do manual replacements integration
      const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"));
      const manualSnapshots = await getDocs(manualDataQuery);

      manualSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.manualData.push(data);
      });


      this.manualData.forEach(data => {
        console.log(data);
        console.log(data.id);
        const index = this.petersonsData.findIndex(item => item.uri === data.id);
        if (index > -1) {
          console.log(this.petersonsData[index])
          this.petersonsData[index] = { ...this.petersonsData[index], ...data };
        }
      });

      // // If the field's value is 0, replace it with an em dash
      // this.petersonsData.map(d => {
      //   for (let key in d) {
      //     if (d[key] === 0) {
      //       d[key] = '—';
      //     }
      //   }
      // });

      // // Remove 2YEAR and Private Proprietary

      this.petersonsData = this.petersonsData.filter(d => {
        return d.mainFunctionType !== "2YEAR" && d.mainFunctionType !== "Private Proprietary";
      });

      // iterate over all items in petersonsData and if the item does not have a hidden field add it and make it false
      this.petersonsData.forEach(item => {
        if (!item.hidden) {
          item.hidden = false;
        }
      });

      // add all the things to the institutions_integrated collection
      this.petersonsData.forEach(async (institution) => {
        setDoc(doc(dbFireStore, 'institutions_integrated', institution["uri"]), {
          ...institution
        }, { merge: true })

        console.log('done adding: ' + institution.name);
      })
    }
  }
}
</script>

