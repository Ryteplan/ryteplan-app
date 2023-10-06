<template>
  <v-container class="pt-8 px-8">
    <h1>Students</h1>
    <v-row class="mt-4">
      <v-col cols="4">
        <ul>
          <li v-for="student in userStudents" :key="student.id">{{ student.name }}</li>
        </ul>
      </v-col>
      <v-col cols="4">
        <v-text-field       
          type="text"       
          placeholder="Name"       
          v-model="createNewStudentName"     
        />
        <v-btn
          @click="createNewStudent"
        >
          Create new student
        </v-btn>     
      </v-col>
    </v-row>
  </v-container>
</template>
<script>

import { dbFireStore } from "../firebase";
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'

export default {
  setup() {
  },
  mounted() {
    this.loadUserStudents();
  },
  beforeUnmount() {
  },
  data() {
    return {
      createNewStudentName: "",
      userStudents: {}
    }
  },
  methods: {
    async loadUserStudents() {
      const students = collection(dbFireStore, 'students');
      const docSnap = await getDocs(students);
      this.userStudents = docSnap.docs.map(doc => doc.data());
    },
    async createNewStudent() {
      const newStudentName = this.createNewStudentName;
      await setDoc(doc(dbFireStore, 'students', newStudentName), {
        name: newStudentName
      })
    },
    async sendStudent() {
      // Send student
    }  
  }
};
</script>

<style>


</style>