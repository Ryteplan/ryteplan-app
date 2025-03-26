<template>
  <v-container class="pt-4">
    <v-row class="">
      <v-col cols="6">
        <div class="d-flex align-center" >
          <h1 class="text-h6">Your lists</h1>
          <v-btn
            size="28"
            @click="showCreateListDialog = true"
            class="ml-6"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
        <div v-if="userLists.length > 0" class="mt-5">
          <ul class="mt-4">
            <v-list>
              <v-list-item 
                v-for="list in userLists" 
                :key="list.id"
                @click="navigateToList($event, list)"
              >
                <div class="d-flex">
                  <v-list-item-title>{{ list.name }}</v-list-item-title>
                </div>
              </v-list-item>
            </v-list>
          </ul>
        </div>
      </v-col>
      <v-col cols="4">
        <v-dialog v-model="showCreateListDialog" max-width="500">
          <v-card>
            <v-card-title>
              <span>Create New List</span>
            </v-card-title>
            <v-card-text>
              <v-text-field       
                type="text"       
                placeholder="Name"       
                v-model="createNewListName"     
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="showCreateListDialog = false">Cancel</v-btn>
              <v-btn color="primary" @click="createNewList">Create</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
      userID: "",
      showCreateListDialog: false
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
        this.userLists = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => a.name.localeCompare(b.name));
      });
    },
    async createNewList() {
      const newDocRef = doc(collection(dbFireStore, "lists"));
      await setDoc(newDocRef, 
        {
          name: this.createNewListName,
          createdBy: this.userID,
          created: Timestamp.fromDate(new Date()),
          updated: Timestamp.fromDate(new Date())
        }
      );
      this.showCreateListDialog = false;
      this.createNewListName = "";
      this.loadUserLists();
    },
    navigateToList(event, list) {
      let route = this.$router.resolve({
        name: 'SingularListView',
        params: {
          id: list.id,
        }
      });

      // Open in new tab for right click or if holding Ctrl/Cmd key
      if (event.ctrlKey || event.metaKey) {
        window.open(route.href, '_blank');
      } else {
        // Navigate in current tab for normal left click
        this.$router.push(route);
      }
    }
  }
};
</script>

<style>


</style>