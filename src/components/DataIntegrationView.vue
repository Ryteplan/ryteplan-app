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
import { collection, getDocs, limit } from 'firebase/firestore'

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
      const querySnapshot = await getDocs(collection(dbFireStore, 'institutions_v11'), limit(10))
      querySnapshot.forEach(doc => {
        this.data.push(doc.data())
      })
      // do manual replacements integration

      // remove 

      // add all the things to the institutions_MASTER collection
      // this.data.forEach(async (doc) => {
      //   console.log(doc.name);
      //   console.log('done adding' + doc.name);
      // })
    }
  }
}
</script>

