<template>
  <v-dialog
    v-model="show"
    width="700px"
  >
    <v-card>
      <div class="pa-8">
        <div
          v-if="!showCreateNewListInput" 
        >        
        <h2 class="text-center">Add to list</h2>
        <ul>
          <li v-for="list in userLists" :key="list.id">            
            {{ list.name }}
          </li>
        </ul>
        <v-btn
            class="mt-5"
            color="primary" 
            @click="showCreateNewListInput = true"
          >
          Create New List
        </v-btn>

        </div>
        <div 
          class="create-new-list-form"
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
              class="mt-5"
              color="primary" 
              @click="createNewList"
            >
            Create New List
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
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'


export default {
  name: "SaveToListDialog",
  props: {
     value: Boolean,
     institutionData: {},
  },
  beforeMount() {
    this.loadUserLists();
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
      showCreateNewListInput: false
    }
  },
  methods: {
    async loadUserLists() {
      const lists = collection(dbFireStore, 'lists');
      const docSnap = await getDocs(lists);
      this.userLists = docSnap.docs.map(doc => doc.data());
    },
    async createNewList() {
      const newListName = this.createNewListName;
      await setDoc(doc(dbFireStore, 'lists', newListName), {
        name: newListName
      })
    },
    saveToList() {
      console.log()
    }
  }
}
</script>