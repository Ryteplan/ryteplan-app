<template>
  <v-container class="pt-8 px-8">
    <v-row class="mt-4">
      <v-col cols="4">
        <h2>Your lists</h2>
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
import { query, collection, setDoc, doc, Timestamp, orderBy, onSnapshot, where } from 'firebase/firestore'
import { getAuth } from 'firebase/auth';

export default {
  setup() {
  },
  beforeMount() {

  },
  mounted() {
    this.loadUserLists();
  },
  beforeUnmount() {
  },
  data() {
    return {
      createNewListName: "",
      userLists: {},
    }
  },
  methods: {
    async loadUserLists() {
      return getAuth().currentUser.uid
        .then((uid) => {
          const listsQuery = query(
            collection(dbFireStore,"lists"),
            orderBy('created'), 
            where("createdBy", "==", uid)
          );
          onSnapshot(listsQuery,(snapshot)=>{
            this.userLists = snapshot.docs.map((doc) => doc.data());
          });
        })
        .catch((error) => {
          console.log('Error fetching user data:', error);
        });
    },
    async createNewList() {
      let userID = getAuth().currentUser.uid;
      const newDocRef = doc(collection(dbFireStore, "lists"));
      await setDoc(newDocRef, 
        {
          id: newDocRef.id,
          name: this.createNewListName,
          createdBy: userID,
          created: Timestamp.fromDate(new Date()),
          updated: Timestamp.fromDate(new Date())
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