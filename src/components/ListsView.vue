<template>
  <v-container class="pt-4">
    <v-row class="flex-column align-center">
      <v-col cols="12" lg="6">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center justify-space-between w-100">
            <h1 class="text-h6">Your lists</h1>
            <v-btn
              size="x-small"
              @click="showCreateListDialog = true"
              class="ml-6"
              :disabled="userLists.length >= 30"
            >
              <v-icon>mdi-plus</v-icon>
              <span class="ml-2">Create new list</span>
            </v-btn>
          </div>
        </div>
        <div class="d-flex align-end justify-space-between mt-4">
          <span class="text-caption" style="color: #888888">
            ({{ userLists.length }}/30)
          </span>
          <v-menu class="" offset-y>
            <template v-slot:activator="{ props }">
              <v-btn
                text
                v-bind="props"
                size="x-small"
              >
                <v-icon left>mdi-sort</v-icon>
                Sort by:
                {{ sortOptions.find((opt) => opt.value === currentSort).text }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="option in sortOptions"
                :key="option.value"
                @click="currentSort = option.value"
              >
                <v-list-item-title>{{ option.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div v-if="userLists.length > 0" class="mt-2">
          <ul class="">
            <v-list>
              <v-list-item
                v-for="list in sortedLists"
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
import {
  query,
  collection,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useUserActionsStore } from "@/stores/userActionsStore.js";

export default {
  setup() {
    const userActionsStore = useUserActionsStore();
    return {
      userActionsStore,
    };
  },
  beforeMount() {},
  mounted() {
    getAuth().onAuthStateChanged((user) => {
      if (user) {
        this.userID = user.uid;
        this.loadUserLists();
      } else {
        this.userID = "";
        this.userLists = [];
      }
    });
  },
  beforeUnmount() {},
  data() {
    return {
      createNewListName: "",
      userLists: [],
      userID: "",
      showCreateListDialog: false,
      currentSort: "name",
      sortOptions: [
        { text: "Name (A-Z)", value: "name" },
        { text: "Name (Z-A)", value: "name-desc" },
        { text: "Recently Created", value: "created" },
        { text: "Oldest Created", value: "created-asc" },
      ],
    };
  },
  computed: {
    sortedLists() {
      const lists = [...this.userLists];
      switch (this.currentSort) {
        case "name":
          return lists.sort((a, b) => a.name.localeCompare(b.name));
        case "name-desc":
          return lists.sort((a, b) => b.name.localeCompare(a.name));
        case "created":
          return lists.sort((a, b) => b.created.toDate() - a.created.toDate());
        case "created-asc":
          return lists.sort((a, b) => a.created.toDate() - b.created.toDate());
        default:
          return lists;
      }
    },
  },
  methods: {
    async loadUserLists() {
      const listsQuery = query(
        collection(dbFireStore, "lists"),
        orderBy("created", "desc"),
        where("createdBy", "==", this.userID)
      );
      onSnapshot(listsQuery, (snapshot) => {
        this.userLists = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    },
    async createNewList() {
      const response = await this.userActionsStore.createNewList(
        this.createNewListName
      );
      if (response.isError) {
        console.error("Error creating new list:", response);
      } else {
        console.info("Created new list:", response);
      }
      this.showCreateListDialog = false;
      this.createNewListName = "";
      this.loadUserLists();
    },
    navigateToList(event, list) {
      let route = this.$router.resolve({
        name: "SingularListView",
        params: {
          id: list.id,
        },
      });

      // Open in new tab for right click or if holding Ctrl/Cmd key
      if (event.ctrlKey || event.metaKey) {
        window.open(route.href, "_blank");
      } else {
        // Navigate in current tab for normal left click
        this.$router.push(route);
      }
    },
  },
};
</script>

<style></style>
