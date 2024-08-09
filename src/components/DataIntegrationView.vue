<template>
  <v-container class="pt-4">
    <div class="data-integration">
      <!-- <h1>Data Backup</h1>
       <p>Note to developer: Update the setDoc for versioning of the backup</p>
      <v-btn
        @click="duplicateCollection"
        color="primary"
      >
        Backup Data
      </v-btn> -->
      
      <!-- <h1>Data Integration</h1>
      <p>When we update data using the UI we need to press this button to make sure that the main table gets updated.</p>
      <v-btn
        @click="doDataIntegration"
        color="primary"
      >
          Integrate Data
      </v-btn> -->
      <!-- <h1>Adding majors to the mix</h1>
      <p>When we update data using the UI we need to press this button to make sure that the main table gets updated.</p>
      <v-btn
        @click="updateWithMajors"
        color="primary"
      >
          Update data with majors
      </v-btn> -->
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
import { collection, query, getDocs, setDoc, doc, where, documentId } from 'firebase/firestore'

export default {
  name: 'DataIntegration',
  data() {
    return {
      petersonsData: [],
      manualData: [],
      integratedData: []
    }
  },
  methods: {
    async updateWithMajors() {
      const integratedDataQuery = query(collection(dbFireStore, "institutions_integrated"));      
      const integratedDataSnapshots = await getDocs(integratedDataQuery);

      integratedDataSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.integratedData.push(data);
      });
      
      this.integratedData.forEach(async (institution) => {
        const inunId = institution.inunId.toString();
        console.log(inunId);
        const majorsTable = collection(dbFireStore, 'test_for_arrays');
        const q = query(majorsTable, where(documentId(), "==",inunId));
        const docSnap = await getDocs(q);
        docSnap.forEach((doc) => {
          institution.cipCode = doc.data().cipCode
        });
        console.log(institution);
        setDoc(doc(dbFireStore, 'institutions_integrated', institution.uri), {
          ...institution
        }, { merge: true })
        console.log('done adding major codes to: ' + institution.name + ' to institutions_integrated');
      })
    },
    async duplicateCollection() {
      const integratedDataQuery = query(collection(dbFireStore, "institutions_integrated"));      
      const integratedDataSnapshots = await getDocs(integratedDataQuery);

      integratedDataSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.integratedData.push(data);
      });

      this.integratedData.forEach(async (institution) => {
        setDoc(doc(dbFireStore, 'institutions_integrated_v12_backup_1', institution["uri"]), {
          ...institution
        }, { merge: true })
        console.log('done adding: ' + institution.name + ' to institutions_integrated_v12_backup_1');
      })


    },
    async doDataIntegration() {
      console.log('doing data integration')
      
      const petersonsDataQuery = query(collection(dbFireStore, "institutions_petersons_processed_v12"));      
      const petersonsSnapshots = await getDocs(petersonsDataQuery);

      petersonsSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.petersonsData.push(data);
      });


      const manualDataQuery = query(collection(dbFireStore, "manual_institution_data"));
      const manualSnapshots = await getDocs(manualDataQuery);

      manualSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        this.manualData.push(data);
      });

      // do manual replacements integration
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

