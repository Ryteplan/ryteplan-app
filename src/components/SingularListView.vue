<template>
  <v-container class="pt-8 px-8">
    <div class="mt-4 d-flex justify-space-between">
      <div>
        <router-link to="/lists">
        Back
        </router-link>
      </div>
      <div>
        Share
        Dots for renname and delete
      </div>
    </div>
    <v-row class="mt-4">
      <v-col cols="6">
        <h2>{{ list.name }}</h2>
        {{ list.institutions }}
        <p>We'll want to customly sort this list too</p>
        <p>Also add ability to remove a school from the list</p>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>

import { dbFireStore } from "../firebase";
import { getDocs, query, collection, where } from 'firebase/firestore'
import { getAuth } from 'firebase/auth';


export default {
  beforeMount() {
  },
  mounted() {
    getAuth().onAuthStateChanged((user) =>{
      if(user) {
        this.userID = user.uid;
        this.loadList();
      } 
    });
  },
  beforeUnmount() {
  },
  data() {
    return {
      createNewListName: "",
      list: {},
      userID: ""
    }
  },
  methods: {
    async loadList() {
      const lists = collection(dbFireStore, 'lists');
      const idFromURL = this.$route.params.id;
      const q = query(lists, where("id", "==", idFromURL));
      const docSnap = await getDocs(q);
      docSnap.forEach((doc) => {
        this.list = doc.data();
      });

    },
  }
};
</script>

<style>


</style>