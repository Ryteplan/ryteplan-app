<template>
  <v-container class="pt-8 px-8">
    <h1>Playground</h1>
    <div>
        <h2>getting the majors for Bowling Green 7241</h2>
        <h3>Names</h3>
        <ol class="pl-4">
          <li 
            v-for="major in majorStringsForInstitution"
            :key="major"
          >
            {{ major }}
          </li>
        </ol>
        <h3>Codes</h3>
        {{ majorCodesForInstitution }}
    </div>
  </v-container>
 </template>  
 
<script>
import { dbFireStore } from "../firebase";
import { collection, documentId, query, where, getDocs } from 'firebase/firestore'
import cipCodesData from '../assets/cipCodes.json';

export default {
  setup() {
    
  },
  mounted() {
    this.getMajors()
  },
  beforeUnmount() {
  },
  data() {
    return {
      majorCodesForInstitution: {},
      majorStringsForInstitution: [],
      cipCodes: cipCodesData
    }
  },
  methods: {
    async getMajors() {
      const majorsTable = collection(dbFireStore, 'test_for_arrays');
      const q = query(majorsTable, where(documentId(), "==", "5414"));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.majorCodesForInstitution = doc.data().cipCode
      });

      this.majorStringsForInstitution = this.majorCodesForInstitution.map((majorCode) => {
        return this.cipCodes[majorCode]
      })

    }
  },
  components: {
  }
};
</script>

<style>


</style>