<template>
  <v-container>
    {{ institution }}
  </v-container>
</template>
 
<script>
import { dbFireStore } from "../firebase";
import { collection, query, where, getDocs } from 'firebase/firestore'

export default {
  setup() {
  },
  mounted() {
    this.loadInstitutionData();
  },
  beforeUnmount() {
  },
  data() {
    return {
      institution: {}
    }
  },
  methods: {
    async loadInstitutionData() {
      const slugFromURL = this.$route.params.slug;

      const institutions = collection(dbFireStore, 'institutions');

      const q = query(institutions, where("slug", "==", slugFromURL));

      const docSnap = await getDocs(q);

      docSnap.forEach((doc) => {
        this.institution = doc.data();
      });
    },
    async addInstitutionToList() {
      // Add to list
    }
  }
};

</script>

<style>


</style>