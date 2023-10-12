<template>
  <v-container class="pt-8 px-8">
    <v-row class="d-flex justify-space-between">
      <v-col cols="3">
        <v-btn to="/lists">
        Back
        </v-btn>
      </v-col>
      <v-col cols="4" class="d-flex justify-end align-center">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              class="ml-3"
              v-bind="props"
              @click="onUpdateMenu"
            >
            three dots
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in selectedDropDown"
              @click="item.action"
              :key="index"
            >
              <div class="d-flex justify-end align-center">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
                <v-icon class="ml-3" :icon="item.icon"></v-icon>
              </div>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <v-col cols="6">
        <h2>{{ list.name }}</h2>
        {{ list.institutions }}
        <p>We'll want to customly sort this list too</p>
        <p>Also add ability to remove a school from the list</p>
      </v-col>
    </v-row>
  </v-container>
  <ShareDialog 
    v-model="showShareDialog" 
  />
</template>
<script>

import { dbFireStore } from "../firebase";
import { getDocs, query, collection, where } from 'firebase/firestore'
import { getAuth } from 'firebase/auth';
import ShareDialog from './ShareDialog'

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
      userID: "",
      showShareDialog: false,
      selectedDropDown: [
        { 
          title: 'Compare', 
          icon: 'mdi-ab-testing',
          action: this.compareClicked
        },
        { 
          title: 'Share',
          icon: 'mdi-account-plus',
          action: this.shareClicked
        }
      ],
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
    onUpdateMenu(open) {
      if (open) {
        setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
      }
    },
    shareClicked() {
      this.showShareDialog = true;
    },
  },
  components: {
    ShareDialog
  } 
};

</script>

<style>
 
</style>