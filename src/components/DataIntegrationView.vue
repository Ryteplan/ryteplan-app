<template>
  <div class="data-integration">
    <h1>Data Integration</h1>
    <v-btn
      @click="doDataIntegration"
      color="primary"
    >
        Do integration
    </v-btn>
  </div>
</template>

<script>
import { dbFireStore } from "../firebase";
import { collection, query, getDocs, setDoc, limit, doc } from 'firebase/firestore'

export default {
  name: 'DataIntegration',
  data() {
    return {
      data: []
    }
  },
  methods: {
    async doDataIntegration() {
      console.log('doing data integration')
      const querySnapshot = query(collection(dbFireStore, "institutions_v11"),
          limit(5));
      
      const documentSnapshots = await getDocs(querySnapshot);

      documentSnapshots.forEach(doc => {
        this.data.push(doc.data())
      })

      // do manual replacements integration

      // remove 

      // add all the things to the institutions_MASTER collection
      this.data.forEach(async (institution) => {
        setDoc(doc(dbFireStore, 'institutions_integrated', institution["uri"]), {
          ...institution
        }, { merge: true })
        console.log('done adding: ' + institution.name);
      })
    }
  }
}
</script>

