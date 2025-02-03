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
      <v-col cols="12">
        <v-data-table
          :headers="filteredHeaders"
          :items="institutions"
          @click:row="navigateToInstitution" 
          item-key="name"
          class="elevation-1"
          density="comfortable"
          fixed-header 
          return-object
        >
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
  <ShareDialog 
    v-model="showShareDialog" 
  />
</template>

<script>
import { dbFireStore } from "../firebase";
import { getDoc, doc, getDocs, query, collection, where } from 'firebase/firestore'
import ShareDialog from './ShareDialog'
import { useTableStore } from '../stores/tableStore';

export default {
  setup() {
    const tableStore = useTableStore();
    if (tableStore.tableHeaders.length == 0) {
      tableStore.loadTableHeaders();
      tableStore.loadHeaderState();
      tableStore.updateHeaders();
    }
    return { tableStore };
  },
  mounted() {    
    this.loadList();
  },
  data() {
    return {
      createNewListName: "",
      list: {},
      institutions: [],
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
    navigateToInstitution(event, item) {
      const institution = JSON.parse(JSON.stringify(item));
      const targetRowKey = institution.item.name;

      if (targetRowKey == "Load more") {
        this.tableStore.loadMoreItems();
      } else {
        localStorage.setItem("lastClickedRow", targetRowKey);

        const slug = JSON.parse(JSON.stringify(item.item.uri));

        let route = this.$router.resolve({
          name: 'institutionPage',
          params: {
            slug: slug,
          }
        });

        // Always open in new tab
        window.open(route.href, '_blank');
      }
    },

    async loadList() {
      try {
        const lists = collection(dbFireStore, 'lists');
        const idFromURL = this.$route.params.id;
        const q = query(lists, where("id", "==", idFromURL));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.error('No list found with this ID');
          return;
        }

        const listDoc = querySnapshot.docs[0];
        this.list = listDoc.data();

        if (!this.list?.institutions?.length) {
          console.log('No institutions in this list');
          return;
        }

        this.institutions = [];

        const institutionPromises = this.list.institutions.map(institutionID => 
          getDoc(doc(dbFireStore, 'institutions_integrated', institutionID))
        );      

        const institutionDocs = await Promise.all(institutionPromises);

        this.institutions = institutionDocs
          .filter(doc => doc.exists())
          .map(doc => doc.data());

      } catch (error) {
        console.error('Error loading list:', error);
      }
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
  computed: {
    filteredHeaders() {
      
      return this.tableStore.tableHeaders.filter(header => header.key !== "hidden" && header.key !== "id");
    }
  },
  components: {
    ShareDialog
  } 
};
</script>

<style>
 
</style>