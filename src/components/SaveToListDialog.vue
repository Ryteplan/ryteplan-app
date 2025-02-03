<template>
  <v-dialog
    v-model="show"
    width="400px"
  >
    <v-card>
      <div class="pa-8">
        <div
          v-if="!showCreateNewListInput && !listCreated" 
        >        
        <h2 class="mb-6 text-center">Add to list</h2>
        <v-list>
          <v-list-item
            v-for="list in userLists"
            @click="addInstitutionToList(list.id)"
            :key="list.id"
          >
            <div class="d-flex">
              <v-list-item-title>{{ list.name }}</v-list-item-title>
            </div>
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
          v-if="showCreateNewListInput" 
        >
          <h2 class="text-center">Name your new list</h2>
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
        <div v-if="listCreated">
          <h2 class="text-center">List Created Successfully!</h2>
          <v-btn
            block
            class="mt-5"
            color="primary" 
            @click="navigateToList"
          >
            Go to List
          </v-btn>
          <v-btn
            block
            class="mt-2"
            color="secondary" 
            @click="show = false"
          >
            Close
          </v-btn>
        </div>
      </div>
      <v-card-actions>
        <v-btn 
          color="primary" 
          block 
          @click="show=false"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { dbFireStore } from "../firebase";
import { query, collection, doc, orderBy, onSnapshot, where, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore'
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
      createdListId: null
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
    async addInstitutionToList(listId) {
      let listIDToSaveInstitutionTo;

      if (listId == null) {
        listIDToSaveInstitutionTo = this.newListName;
      } else {
        listIDToSaveInstitutionTo = listId;
      }

      const listRef = doc(dbFireStore, "lists", listIDToSaveInstitutionTo);

      // Check if the document exists
      const docSnap = await getDoc(listRef);
      if (!docSnap.exists()) {
        // Create the document if it doesn't exist
        await setDoc(listRef, {
          name: this.newListName,
          createdBy: this.userID,
          created: new Date(),
          institutions: []
        });
        this.listCreated = true;
        this.createdListId = listIDToSaveInstitutionTo;
        this.showCreateNewListInput = false;
      }

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
      }
    },
    navigateToList() {
      this.$router.push({ name: 'SingularListView', params: { id: this.createdListId } });
    }
  }
}
</script>