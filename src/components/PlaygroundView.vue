<template>
  <v-container class="pt-8 px-8">
    <p>Lets get stuff from the firestore </p>
    <!-- {{ institutions }} -->
    <!-- <ul>
      <li v-for="institution in institutions" :key="institution.id">{{ institution.name }}</li>
    </ul> -->
  </v-container>
 </template>
 
<script>

import 'firebase/database'

export default {
  setup() {
  },
  mounted() {
  },
  beforeUnmount() {
  },
  data() {
    return {
      institutions: 123
    }
  },
  methods: {
    getData() {
      // this.institutions = useDatabaseList(dbRef(db, 'institutions'))
    }
  },
};
</script>

<style>


</style>