<template>
  <v-container class="pt-4">
    <div class="image-work">      
      <h1>Image Work</h1>
    </div>
    <v-card 
      class="mt-8 py-4 px-6"
      v-for="school in imagesData" 
      :key="school.id"
    >
      {{ school.id }}
      <div 
        v-for="image in getFilteredFields(school)" 
        :key='image.id'
      >
        <p>{{ image }}</p>
      </div>
    </v-card>
  </v-container>
</template>

<script>
/* eslint-disable no-unused-vars */
import { dbFireStore } from "../firebase";
import { collection, query, getDocs, setDoc, doc, limit } from 'firebase/firestore'

export default {
  name: 'ImageWork',
  setup() {
  },
  mounted() {
    this.getImagesData()
  },
  data() {
    return {
      imagesData: [],
    }
  },
  methods: {
    async getImagesData() {
      // const imagesDataQuery = query(collection(dbFireStore, "institution_images"));
      const imagesDataQuery = query(collection(dbFireStore, "institution_images"), limit(1));
      const imagesSnapshots = await getDocs(imagesDataQuery);
    
      imagesSnapshots.docs.forEach(doc => {
        const data = { ...doc.data(), id: doc.id };
        if (data.hidden !== true) {
          this.imagesData.push(data);
        }
      });
    },   
    getFilteredFields(school) {
      return Object.keys(school)
      .map(key => ({ name: key, value: school[key] }));

    } 
  }
}
</script>
<style>

</style>
