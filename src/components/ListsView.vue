<template>
  <v-container class="pt-8 px-8">
    <h1>Lists</h1>
    <v-row class="mt-4">
      <v-col cols="4">
        <ul>
          <li class="mb-8" v-for="list in userLists" :key="list.id">
            {{ list }}
          </li>
        </ul>
      </v-col>
      <v-col cols="4">
        <v-text-field       
          type="text"       
          placeholder="Name"       
          v-model="createNewListName"     
        />
        <v-btn
          @click="createNewList"
        >
          Create new list
        </v-btn>     
      </v-col>
    </v-row>
  </v-container>
</template>
<script>

import { dbFireStore } from "../firebase";
import { collection, getDocs, setDoc, doc, Timestamp } from 'firebase/firestore'

export default {
  setup() {
  },
  mounted() {
    this.loadUserLists();
  },
  beforeUnmount() {
  },
  data() {
    return {
      createNewListName: "",
      userLists: {}
    }
  },
  methods: {
    async loadUserLists() {
      const lists = collection(dbFireStore, 'lists');
      const docSnap = await getDocs(lists);
      this.userLists = docSnap.docs.map(doc => doc.data());
    },
    async createNewList() {
      const newDocRef = doc(collection(dbFireStore, "lists"));
      await setDoc(newDocRef, 
        {
          id: newDocRef.id,
          name: this.createNewListName,
          created: Timestamp.fromDate(new Date())
        }
      );
    },
    async sendList() {
      // Send list
    }  
  }
};
</script>

<style>


</style>