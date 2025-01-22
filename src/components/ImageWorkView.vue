<template>
  <v-container class="pt-4">
    <div class="image-work">      
      <div class="mb-4">
        <h1 class="mr-4">Image Work</h1>
        <v-btn
          :to="`/institution/${schoolId}`"
          color="primary"
          variant="text"
          prepend-icon="mdi-arrow-left"
        >
          Back to {{ schoolId }}
        </v-btn>
      </div>  
      <v-row>
        <!-- Database Images Column -->
        <v-col cols="6">
          <v-card class="pa-4">
            <h2 class="text-h6 mb-4">External URL Images</h2>
            <div v-if="imagesData">
              <div v-for="(url, key) in imagesData" :key="key" class="mb-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="font-weight-bold">{{ key }}</span>
                  <v-btn
                    size="small"
                    color="primary"
                    :loading="processingImage === key"
                    @click="transferSingleImage(key, url, imageCredits[key])"
                  >
                    Transfer →
                  </v-btn>
                </div>
                <a :href="url" target="_blank" class="image-link">
                  <v-img
                    :src="url"
                    height="200"
                    cover
                    class="bg-grey-lighten-2"
                  />
                </a>
                <div class="mt-2 text-caption">
                  <div v-if="imageCredits[key]" v-html="imageCredits[key]"></div>
                  <div v-else class="text-italic">No caption has been entered</div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              No database images found
            </div>
            <!-- Add results for external images -->
            <v-card v-if="processingImage" class="mt-4 pa-4">
              <div v-for="(result, index) in results" :key="index" class="mb-2">
                {{ result }}
              </div>
            </v-card>
          </v-card>
        </v-col>

        <!-- Storage Images Column -->
        <v-col cols="6">
          <v-card class="pa-4">
            <div class="d-flex justify-space-between align-center mb-4">
              <h2 class="text-h6">Self Hosted Images</h2>
              <v-btn
                color="primary"
                prepend-icon="mdi-upload"
                @click="$refs.fileInput.click()"
                :loading="uploading"
              >
                Upload Image
              </v-btn>
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                @change="handleFileUpload"
              >
            </div>
            <div v-if="storageImages.length">
              <div v-for="(image, index) in storageImages" :key="index" class="mb-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <v-btn
                    size="small"
                    color="error"
                    :loading="deletingImage === image.name"
                    @click="deleteImage(image)"
                  >
                    Delete
                  </v-btn>
                </div>
                <v-img
                  :src="image.url"
                  height="200"
                  cover
                  class="bg-grey-lighten-2"
                />
                <div class="mt-2 text-caption">
                  <div v-if="image.caption" v-html="image.caption"></div>
                  <div v-else class="text-italic">No caption has been entered</div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              No storage images found
            </div>
            <!-- Add results for storage images -->
            <v-card v-if="uploading || deletingImage" class="mt-4 pa-4">
              <div v-for="(result, index) in results" :key="index" class="mb-2">
                {{ result }}
              </div>
            </v-card>
          </v-card>
        </v-col>
      </v-row>

      <!-- Add Dialog -->
      <v-dialog v-model="showManualDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h5">
            Manual Upload Required
          </v-card-title>
          <v-card-text>
            <p class="mt-4">This image needs to be downloaded manually from:</p>
            <p class="mt-2"><a :href="manualUploadUrl" target="_blank">{{ manualUploadUrl }}</a></p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              @click="showManualDialog = false"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script>
import { dbFireStore } from "../firebase";
import { collection, query, getDocs, where, documentId, doc, getDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import axios from 'axios';

export default {
  name: 'ImageWork',
  data() {
    return {
      isProcessing: false,
      processingImage: null,
      results: [],
      imagesData: {},
      storageImages: [],
      showManualDialog: false,
      manualUploadUrl: '',
      uploading: false,
      imageCredits: {},
      deletingImage: null,
    }
  },
  computed: {
    schoolId() {
      return this.$route.params.slug
    }
  },
  mounted() {
    this.loadImages()
    this.loadImageCredits()
  },
  methods: {
    async loadImages() {
      // Load database images
      const imageURLsFromDB = collection(dbFireStore, 'institution_images');
      const q = query(imageURLsFromDB, where(documentId(), "==", this.schoolId));
      const docSnap = await getDocs(q);
      
      docSnap.forEach((doc) => {
        this.imagesData = doc.data();
      });

      // Load storage images
      await this.loadStorageImages();
    },

    async loadStorageImages() {
      try {
        // Get the document from institution_images_v2 collection
        const imageRef = doc(dbFireStore, 'institution_images_v2', this.schoolId);
        const docSnap = await getDoc(imageRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Convert the images array into the same format as before
          this.storageImages = (data.images || []).map(image => ({
            name: image.URL.split('/').pop(), // Extract filename from URL
            url: image.URL,
            caption: image.caption
          }));
        } else {
          this.storageImages = [];
        }
      } catch (error) {
        console.error('Error loading storage images:', error);
        this.storageImages = [];
      }
    },

    async transferSingleImage(key, url, caption) {
      if (!url) return;
      
      this.processingImage = key;
      this.results = [];
      let newUrl = null;
      let ext = null;  // Declare ext outside try block
      
      try {
        ext = url.startsWith('data:') ? 'png' : url.split('.').pop().split(/[#?]/)[0];
        const newImageName = `${key}.${ext}`;
        
        this.results.push(`Processing ${newImageName}...`);
        
        newUrl = await this.uploadImageToStorage(url, this.schoolId, newImageName);
        
        if (newUrl) {
          // Get existing images array or initialize it
          const imageRef = doc(dbFireStore, 'institution_images_v2', this.schoolId);
          const docSnap = await getDoc(imageRef);
          const images = docSnap.exists() ? (docSnap.data().images || []) : [];

          // Create new image object with position set to array length
          const imageObject = {
            URL: newUrl,
            caption: caption || null,
            position: images.length
          };

          // Add new image to array
          images.push(imageObject);

          // Update the document with the images array
          await setDoc(imageRef, {
            images: images
          }, { merge: true });
          
          // Update local state
          this.imagesData[key] = newUrl;
          
          this.results.push(`✅ Successfully uploaded ${newImageName}`);
          await this.loadStorageImages();
        } else {
          throw new Error('Failed to upload image');
        }
      } catch (error) {
        console.error('Error processing image:', error);
        this.results.push(`❌ Error: ${error.message}`);
        
        // Clean up if we got a URL but failed to complete the process
        if (newUrl) {
          try {
            // Delete from storage
            const storage = getStorage();
            const imageRef = ref(storage, `${this.schoolId}/${key}.${ext}`);
            await deleteObject(imageRef);
            
            // Remove from institution_images_v2 if it was added
            const docRef = doc(dbFireStore, 'institution_images_v2', this.schoolId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              const updatedImages = data.images.filter(img => img.URL !== newUrl);
              await setDoc(docRef, { images: updatedImages }, { merge: true });
            }
            
            this.results.push(`✅ Cleaned up failed upload`);
          } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
            this.results.push(`⚠️ Failed to clean up: ${cleanupError.message}`);
          }
        }
      } finally {
        this.processingImage = null;
      }
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
          try {
            const response = await axios.get(imageUrl, { 
              responseType: 'arraybuffer'
            });
            const storageRef = ref(storage, `${schoolName}/${imageName}`);
            await uploadBytes(storageRef, response.data);
            return await getDownloadURL(storageRef);
          } catch (error) {
            // Show dialog with manual upload message
            this.manualUploadUrl = imageUrl;
            this.showManualDialog = true;
            throw new Error(`This image needs to be downloaded manually`);
          }
        }
      } catch (error) {
        console.error(`Error uploading ${imageName}:`, error);
        return null;
      }
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.uploading = true;
      try {
        const storage = getStorage();
        const storageRef = ref(storage, `${this.schoolId}/${file.name}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Get existing images array or initialize it
        const imageRef = doc(dbFireStore, 'institution_images_v2', this.schoolId);
        const docSnap = await getDoc(imageRef);
        const images = docSnap.exists() ? (docSnap.data().images || []) : [];

        // Create new image object
        const imageObject = {
          URL: downloadURL,
          caption: null,
          position: images.length
        };

        // Add new image to array
        images.push(imageObject);

        // Update the document with the images array
        await setDoc(imageRef, {
          images: images
        }, { merge: true });

        this.results.push(`✅ Successfully uploaded ${file.name}`);
        await this.loadStorageImages();
      } catch (error) {
        console.error('Error uploading file:', error);
        this.results.push(`❌ Failed to upload ${file.name}: ${error.message}`);
      } finally {
        this.uploading = false;
        // Reset the file input
        event.target.value = '';
      }
    },

    async loadImageCredits() {
      try {
        const creditsRef = doc(dbFireStore, 'image_credits', this.schoolId);
        const creditsSnap = await getDoc(creditsRef);
        if (creditsSnap.exists()) {
          this.imageCredits = creditsSnap.data();
        }
      } catch (error) {
        console.error('Error loading image credits:', error);
      }
    },

    async deleteImage(image) {
      if (!confirm(`Are you sure you want to delete ${image.name}?`)) {
        return;
      }

      this.deletingImage = image.name;
      try {
        // Delete from storage
        const storage = getStorage();
        const imageRef = ref(storage, `${this.schoolId}/${image.name}`);
        await deleteObject(imageRef);

        // Update Firestore document
        const docRef = doc(dbFireStore, 'institution_images_v2', this.schoolId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const updatedImages = data.images.filter(img => img.URL !== image.url);
          await setDoc(docRef, { images: updatedImages }, { merge: true });
        }

        // Update local state
        this.results.push(`✅ Successfully deleted ${image.name}`);
        await this.loadStorageImages();
      } catch (error) {
        console.error('Error deleting image:', error);
        this.results.push(`❌ Failed to delete ${image.name}: ${error.message}`);
      } finally {
        this.deletingImage = null;
      }
    },
  }
}
</script>

<style>
.image-work {
  margin-bottom: 2rem;
}

.image-link {
  display: block;
  cursor: pointer;
  transition: opacity 0.2s;
}

.image-link:hover {
  opacity: 0.9;
}
</style>
