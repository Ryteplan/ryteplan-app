<template>
  <v-dialog
    v-model="show"
    width="400px"
  >
    <v-card>
      <div class="pa-8">
        <div>        
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
import { collection, setDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth';
import {useRoute} from 'vue-router'

export default {
  name: "ShareDialog",
  setup() {
  },
  props: {
     value: Boolean,
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
    const route=useRoute();
    const path = route.path;
    this.link = "https://ryteplan.com" + path;
  },
  computed: {
    show: {
      get () {
        return this.value
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
      link: ""
    }
  },
  methods: {
    async shareList(emailAddress) {
      console.log(emailAddress);
      const newDocRef = doc(collection(dbFireStore, "emails"));
      await setDoc(newDocRef, 
        {
          to: [
            {
              email: this.emailShareAddress,
            }
          ],
          from: {
            email: 'noreply@ryteplan.com',
            name: 'Ryte Plan'
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
        }
      );
    }      
  }
}
</script>