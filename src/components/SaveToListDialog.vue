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
        ></v-btn>
      </v-card-title>
      <div class="pa-8">
        <div
          v-if="!showCreateNewListInput && !showGoToList" 
        >        
          <v-list>
            <v-list-item
              v-for="list in userLists"
              @click="addInstitutionToList(list.id)"
              :key="list.id"
            >
              <span class="d-flex justify-space-between align-center w-100">
                {{ list.name }}
              </span>
            </v-list-item>
          </v-list>
          <v-btn
            block
            class="mt-5"
            color="primary" 
            @click="showCreateNewListInput = true"
            >
            Create New List
          </v-btn>
        </div>
        <div 
          class="create-new-list-form hide"
          v-if="showCreateNewListInput && !listCreated" 
        >
          <h2 class="mb-3">Name your new list</h2>
          <v-text-field
            v-model="newListName"
            label="Enter List Name"
            density="compact"
            variant="solo"
            single-line
            hide-details
            clearable
          ></v-text-field>
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
          <h2 class="text-center">Saved to List Successfully!</h2>
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


export default {
  name: "SaveToListDialog",
  props: {
     value: Boolean,
     institutionId: String,
     selectedRows: Object
  },
  beforeMount() {
    getAuth().onAuthStateChanged((user) =>{
      if(user) {
        this.userID = user.uid;
        this.loadUserLists();
      } 
    });
  },
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('update:modelValue', value)
        setTimeout(()=>{
          this.showCreateNewListInput = false;
        },1000);
      }
    }
  },
  data() {
    return {
      newListName: "",
      userLists: {},
      showCreateNewListInput: false,
      listCreated: false,
      createdListId: null,
      savingToExistingList: false,
      showGoToList: false,
      listTheItemWasSavedTo: null
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
        }));
      });
    },
    async addInstitutionToList(listId) {
      let listIDToSaveInstitutionTo;

      if (listId !== null) {
        listIDToSaveInstitutionTo = listId;
        this.savingToExistingList = true;
      } else {
        // Generate a new document ID for the list

        const newListRef = doc(collection(dbFireStore, "lists"));
        listIDToSaveInstitutionTo = newListRef.id;
      }

      const listRef = doc(dbFireStore, "lists", listIDToSaveInstitutionTo);

      const docSnap = await getDoc(listRef);

      if (!docSnap.exists()) {
        await setDoc(listRef, {
          name: this.newListName,
          createdBy: this.userID,
          created: Timestamp.fromDate(new Date()),
          updated: Timestamp.fromDate(new Date()),
          institutions: []
        });
        this.listCreated = true;
      }

      this.listTheItemWasSavedTo = listIDToSaveInstitutionTo;

      if (this.selectedRows) {
        for (const institution of toRaw(this.selectedRows)) {
          await updateDoc(listRef, {
            institutions: arrayUnion(institution.id)
          });
        }
      } else if (this.institutionId) {
        await updateDoc(listRef, {
          institutions: arrayUnion(this.institutionId)
        });
        this.showGoToList = true;
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