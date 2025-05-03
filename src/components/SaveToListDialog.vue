<template>
  <v-dialog
    v-model="show"
    width="400px"
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div class="text-h5 ps-2">
          Add to list
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="show = false"
        />
      </v-card-title>
      <div class="pa-8">
        <div
          v-if="!showCreateNewListInput && !showGoToList" 
        >        
          <v-list>
            <v-list-item
              v-for="list in userLists"
              :key="list.id"
              @click="addInstitutionToList(list.id)"
            >
              <span class="d-flex justify-space-between align-center w-100">
                {{ list.name }}
                <span 
                  v-if="list.institutions && list.institutions.length"
                  class="text-caption" 
                  style="color: #888888"
                >
                  ({{ list.institutions.length || 0 }}/30)
                </span>
              </span>
            </v-list-item>
          </v-list>
          <v-btn
            v-if="userLists.length <= 30"
            block
            class="mt-5" 
            color="primary"
            @click="showCreateNewListInput = true"
          >
            Create New List
          </v-btn>
          <span
            v-if="userLists.length >= 30"
            class="text-caption"
            style="color: #888888"
          >
            You have reached the maximum limit of 30 lists. Please delete some lists before creating new ones.
          </span>
        </div>
        <div 
          v-if="showCreateNewListInput && !listCreated"
          class="create-new-list-form hide" 
        >
          <h2 class="mb-3">
            Name your new list
          </h2>
          <v-text-field
            v-model="newListName"
            label="Enter List Name"
            density="compact"
            variant="solo"
            single-line
            hide-details
            clearable
          />
          <v-btn
            block
            class="mt-5"
            color="primary" 
            @click="addInstitutionToList(null)"
          >
            Create New List
          </v-btn>
        </div>
        <div v-if="showGoToList">
          <h2 class="text-center">
            Saved to List Successfully!
          </h2>
          <v-btn
            block
            class="mt-5"
            color="primary" 
            @click="navigateToList"
          >
            Go to List
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { dbFireStore } from "../firebase";
import { query, collection, doc, orderBy, onSnapshot, where, updateDoc, arrayUnion, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { toRaw } from 'vue';
import { getAuth } from 'firebase/auth';
import { useUserActionsStore } from '@/stores/userActionsStore.js';

export default {
  name: "SaveToListDialog",
  setup() {
    const userActionsStore = useUserActionsStore();
    return {
      userActionsStore
    }
  },
  props: {
     value: Boolean,
     institutionId: String,
     selectedRows: Object
  },
  data() {
    return {
      newListName: "",
      userLists: {},
      showCreateNewListInput: false,
      listCreated: false,
      createdListId: null,
      showGoToList: false,
      listTheItemWasSavedTo: null
    }
  },
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('update:modelValue', value)
        if (!value) { 
          setTimeout(() => {
              this.resetDialogState();
          }, 300);
        }
      }
    }
  },
  beforeMount() {
    getAuth().onAuthStateChanged((user) =>{
      if(user) {
        this.userID = user.uid;
        this.loadUserLists();
      } 
    });
  },
  methods: {
    resetDialogState() {
        this.newListName = "";
        this.showCreateNewListInput = false;
        this.listCreated = false;
        this.createdListId = null;
        this.showGoToList = false;
        this.listTheItemWasSavedTo = null;
    },
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
        }));
      });
    },
    async addInstitutionToList(listId) {
      let listIDToSaveInstitutionTo;
      let isCreatingNewList = false;

      if (listId !== null) {
        // TODO: Use the userActionsStore to save the institution to the list
        listIDToSaveInstitutionTo = listId;
      } else {
        const newListName = this.newListName.trim();
        
        
        if (!newListName) {
          alert("Please enter a name for the new list.");
          return;
        }
        const institutionIds = this.institutionId ? [this.institutionId] : this.selectedRows.map(row => row.id);
        const response = await this.userActionsStore.createNewList(newListName, institutionIds);
        if (response.isError) {
          this.showCreateNewListInput = false;
          this.showGoToList = false;
          return;
        }
        this.listTheItemWasSavedTo = response.data.listId;
        this.showCreateNewListInput = false;
        this.showGoToList = true;
        return
      }

      // TODO: Use the userActionsStore to save the institution to the list

      const listRef = doc(dbFireStore, "lists", listIDToSaveInstitutionTo);
      const docSnap = await getDoc(listRef);

      let currentInstitutions = [];
      let currentListSize = 0;
      if (docSnap.exists()) {
        const listData = docSnap.data();
        currentInstitutions = listData.institutions || [];
        currentListSize = currentInstitutions.length;
      }

      let potentialInstitutions = [];
      let institutionsToAddIds = [];
      let duplicateInstitutions = [];

      if (this.selectedRows && this.selectedRows.length > 0) {
        potentialInstitutions = toRaw(this.selectedRows);
      } else if (this.institutionId) {
        potentialInstitutions = [{ id: this.institutionId }]; 
      } else {
        console.error("SaveToListDialog: No institution or rows selected.");
        alert("Error: No institution selected.");
        return;
      }

      potentialInstitutions.forEach(inst => {
        if (currentInstitutions.includes(inst.id)) {
          duplicateInstitutions.push(inst);
        } else {
          institutionsToAddIds.push(inst.id);
        }
      });

      // Handle duplicates
      if (duplicateInstitutions.length > 0) {
        // Check if the *only* item provided was a single institution ID and it was a duplicate
        if (this.institutionId && !this.selectedRows && duplicateInstitutions.length === 1 && institutionsToAddIds.length === 0) {
          alert(`Note: This institution is already in the list.`);
          this.show = false; // Close the dialog
          return; // Stop execution
        }

        // Otherwise, prepare and show the general duplicate alert message
        let duplicateAlertMessage = "";
         if (this.selectedRows && this.selectedRows.length > 0) {
            // We have names if selectedRows was used
            const duplicateNames = duplicateInstitutions.map(inst => inst.name || inst.id).join(', ');
            duplicateAlertMessage = `Note: ${duplicateInstitutions.length} selected institution(s) are already in this list:\n${duplicateNames}`;
         } else {
             duplicateAlertMessage = `Note: This institution is already in the list.`;
         }
         alert(duplicateAlertMessage);
      }

      const newItemsCount = institutionsToAddIds.length;
      if (currentListSize + newItemsCount > 30) {
        alert(`Cannot add ${newItemsCount} new item(s). The list currently has ${currentListSize} items and adding these would exceed the limit of 30.`);
        return;
      }

      if (newItemsCount === 0 && !isCreatingNewList) {
          this.listTheItemWasSavedTo = listIDToSaveInstitutionTo;
          this.showCreateNewListInput = false;
          this.showGoToList = true;
          return;
      }

      try {
        if (isCreatingNewList) {
          if (institutionsToAddIds.length > 30) {
              alert(`Cannot create a list with ${institutionsToAddIds.length} items. The maximum limit is 30.`);
              return;
          }
          await setDoc(listRef, {
            name: this.newListName.trim(),
            createdBy: this.userID,
            created: Timestamp.fromDate(new Date()),
            updated: Timestamp.fromDate(new Date()),
            institutions: institutionsToAddIds
          });
          this.listCreated = true;
        } else {
          if (newItemsCount > 0) {
            await updateDoc(listRef, {
              institutions: arrayUnion(...institutionsToAddIds),
              updated: Timestamp.fromDate(new Date())
            });
          }
        }

        this.listTheItemWasSavedTo = listIDToSaveInstitutionTo;
        this.showCreateNewListInput = false;
        this.showGoToList = true;

      } catch (error) {
          console.error("Error saving to list:", error);
          alert(`An error occurred while saving to the list: ${error.message}`);
      }
    },
    navigateToList() {
      this.$router.push({ 
        name: 'SingularListView', 
        query: {
          showBackButton: true
        },
        params: { 
          id: this.listTheItemWasSavedTo,
        }, 
      });
    }
  }
}
</script>