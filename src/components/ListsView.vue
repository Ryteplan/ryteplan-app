<template>
  <v-container class="pt-8 px-8">
    <v-row class="mt-4">
      <v-col cols="6">
        <h2>Your lists</h2>
        <ul class="mt-4">
          <v-list-item 
            v-for="list in userLists" 
            :key="list.id"
            :to="`/list/${list.id}`"
          >
            <div class="d-flex">
              <v-list-item-title>{{ list.name }}</v-list-item-title>
            </div>
          </v-list-item>
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
  beforeMount() {
  },
  mounted() {
    getAuth().onAuthStateChanged((user) =>{
      if(user) {
        this.userID = user.uid;
        this.loadUserLists();
      } 
    });
  },
  beforeUnmount() {
  },
  data() {
    return {
      createNewListName: "",
      userLists: {},
      userID: ""
    }
  },
  methods: {
    async loadUserLists() {
      const listsQuery = query(
        collection(dbFireStore,"lists"),
        orderBy('created', 'desc'), 
        where("createdBy", "==", this.userID)
      );
      onSnapshot(listsQuery,(snapshot)=>{
        this.userLists = snapshot.docs.map((doc) => doc.data());
      });

    },
    async createNewList() {
      const newDocRef = doc(collection(dbFireStore, "lists"));
      await setDoc(newDocRef, 
        {
          id: newDocRef.id,
          name: this.createNewListName,
          createdBy: this.userID,
          created: Timestamp.fromDate(new Date()),
          updated: Timestamp.fromDate(new Date())
        }
      );
    }
  }
};
</script>

<style>


</style>