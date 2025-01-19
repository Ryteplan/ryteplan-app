<template>
  <v-container class="pt-4">
    <div class="image-work">      
      <h1>Image Work</h1>
      <v-btn 
        @click="processImages" 
        :loading="isProcessing"
        color="primary"
        class="mt-4"
      >
        Test Image Upload
      </v-btn>
    </div>
    
    <v-card v-if="results.length" class="mt-8 pa-4">
      <div v-for="(result, index) in results" :key="index" class="mb-2">
        {{ result }}
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { dbFireStore } from "../firebase";
import { collection, query, getDocs, where, documentId } from 'firebase/firestore';
import axios from 'axios';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default {
  name: 'ImageWork',
  data() {
    return {
      isProcessing: false,
      results: [],
      imagesData: {}
    }
  },
  methods: {
    async getImages(schoolId) {
      const imageURLsFromDB = collection(dbFireStore, 'institution_images');
      const q = query(imageURLsFromDB, where(documentId(), "==", schoolId));
      const docSnap = await getDocs(q);
      
      docSnap.forEach((doc) => {
        this.imagesData = doc.data();
      });
      
      return this.imagesData;
    },

    async uploadImageToStorage(imageUrl, schoolName, imageName) {
      try {
        const storage = getStorage();
        
        // Handle base64 images
        if (imageUrl.startsWith('data:')) {
          const base64Data = imageUrl.split(',')[1];
          const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const storageRef = ref(storage, `${schoolName}/${imageName}`);
          
          await uploadBytes(storageRef, binaryData);
          return await getDownloadURL(storageRef);
        } 
        // Handle URL images
        else {
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const storageRef = ref(storage, `${schoolName}/${imageName}`);
          await uploadBytes(storageRef, response.data);
          return await getDownloadURL(storageRef);
        }
      } catch (error) {
        console.error(`Error uploading ${imageName}:`, error);
        return null;
      }
    },

    async processImages() {
      this.isProcessing = true;
      this.results = [];
      
      try {
        // Test with one school for now
        const schoolId = 'aaniiih-nakoda-college';
        const images = await this.getImages(schoolId);
        
        for (const [key, url] of Object.entries(images)) {
          if (!url) continue;
          
          const ext = url.startsWith('data:') ? 'png' : url.split('.').pop().split(/[#?]/)[0];
          const newImageName = `${key}.${ext}`;
          
          this.results.push(`Processing ${newImageName}...`);
          
          const newUrl = await this.uploadImageToStorage(url, schoolId, newImageName);
          
          if (newUrl) {
            this.results.push(`✅ Successfully uploaded ${newImageName}`);
          } else {
            this.results.push(`❌ Failed to upload ${newImageName}`);
          }
        }
      } catch (error) {
        console.error('Error processing images:', error);
        this.results.push(`❌ Error: ${error.message}`);
      } finally {
        this.isProcessing = false;
      }
    }
  }
}
</script>
<style>

</style>
