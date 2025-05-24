<template>
  <v-dialog
    v-model="show"
    width="400px"
  >
    <v-card>
      <div class="pa-8">
        <div v-if="!shareSuccess">        
          <h2 class="mb-6 text-center">Share List</h2>
          <v-text-field
            v-model="emailShareAddress"
            label="Enter email address"
            density="compact"
            variant="solo"
            single-line
            hide-details
            clearable
          ></v-text-field>
          <v-btn
            class="mt-2" 
            color="primary" 
            block 
            @click="shareList(emailShareAddress)"
          >
            Share
          </v-btn>
        </div>
        <div v-else>
          <h2 class="mb-6 text-center">List Shared Successfully!</h2>
          <v-btn
            color="primary"
            block
            @click="show = false"
          >
            Close
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { dbFireStore } from "../firebase";
import { collection, setDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth';
import {useRoute} from 'vue-router'

export default {
  name: "ShareDialog",
  setup() {
  },
  props: {
     modelValue: Boolean,
     institutionId: String,
     selectedRows: Object
  },
  mounted() {
    getAuth().onAuthStateChanged((user) =>{
      if(user) {
        this.userID = user.uid;
        this.userFullName = user.displayName;
      } 
    });
    const route = useRoute();
    const path = route.path;
    this.link = "https://app.ryteplan.com" + path;
  },
  computed: {
    show: {
      get () {
        return this.modelValue
      },
      set (value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  data() {
    return {
      emailShareAddress: "",
      userFullName: "",
      link: "",
      shareSuccess: false
    }
  },
  methods: {
    async shareList() {
      try {
        const newDocRef = doc(collection(dbFireStore, "emails"));
        await setDoc(newDocRef, {
          to: [
            {
              email: this.emailShareAddress,
            }
          ],
          from: {
            email: 'noreply@ryteplan.com',
            name: 'RytePlan'
          },
          template_id: '351ndgwzp0qgzqx8',
          variables: [
            {
              email: this.emailShareAddress,
              substitutions:[
                {
                  var: 'userFullName',
                  value: this.userFullName
                },
                {
                  var: 'link',
                  value: this.link
                }
              ]
            }
          ],
          tags: ['Share List Email'],
          reply_to: {
            email: 'reply_to@example.com',
            name: 'Reply to name'
          },
        });
        this.shareSuccess = true;
        this.emailShareAddress = "";
      } catch (error) {
        console.error("Error sharing list:", error);
      }
    }      
  },
  watch: {
    show(newValue) {
      if (!newValue) {
        // Reset shareSuccess when the dialog is closed
        this.shareSuccess = false;
      }
    }
  }
}
</script>