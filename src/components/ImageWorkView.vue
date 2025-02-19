<template>
  <v-container class="pt-4">
    <div class="image-work">      
      <div class="mb-4">
        <h1 class="mr-4">Image Work</h1>        
        <div class="d-flex justify-space-between align-end">
            <div>
              <v-btn
                v-if="prevSchoolId"
                :to="`/image-work/${prevSchoolId}`"
                color="primary"
                variant="text"
                prepend-icon="mdi-arrow-left"
                class="mr-2"
              >
                {{ prevSchoolId }}
              </v-btn>
            </div>
            <div class="flex-column text-center align-center">
              <div v-if="hiddenValue" class="text-caption mr-4">
                Note: This university is hidden.
              </div>
              <v-btn
                :to="`/institution/${schoolId}`"
                color="primary"
                variant="text"
                class="mr-2"
                append-icon="mdi-arrow-top-right"
              >
                View {{ schoolId }}
              </v-btn>
            </div>
            <v-btn
              v-if="nextSchoolId"
              :to="`/image-work/${nextSchoolId}`"
              color="primary"
              variant="text"
              append-icon="mdi-arrow-right"
            >
              {{ nextSchoolId }}
            </v-btn>
        </div>
      </div>  
      <v-row>
        <!-- Storage Images Column -->
        <v-col cols="12">
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
            <div v-if="storageImages.length" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div 
                v-for="(image, index) in sortedStorageImages" 
                :key="image.url"
                :class="{
                  'mb-4': true,
                  'moved-item': movedIndex === index,
                  'affected-item': affectedIndex === index
                }"
              >
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="mr-2 text-caption">{{ index + 1 }} / {{ storageImages.length }}</span>
                  <div class="d-flex align-center">
                    <v-btn
                      icon="mdi-arrow-up"
                      size="small"
                      variant="text"
                      :disabled="index === 0"
                      @click="changePosition(index, 'up')"
                    ></v-btn>
                    <v-btn
                      icon="mdi-arrow-down"
                      size="small"
                      variant="text"
                      :disabled="index === storageImages.length - 1"
                      @click="changePosition(index, 'down')"
                    ></v-btn>
                  </div>
                </div>
                <v-img
                  :src="image.url"
                  cover
                  class="bg-grey-lighten-2 square-image"
                />
                <div class="mt-2">
                  <TiptapInputA
                    placeholder="Enter caption"
                    v-model="image.caption"
                    class="caption-editor"
                    @update:modelValue="handleCaptionChange(index)"
                  />
                  <v-btn
                    v-if="editedCaptions[index]"
                    color="primary"
                    size="small"
                    class="mt-2"
                    :loading="savingCaption === index"
                    @click="saveCaption(index, image)"
                  >
                    Save Caption
                  </v-btn>
                </div>
                <v-btn
                  class="mt-4"
                  size="small"
                  color="error"
                  :loading="deletingImage === image.url"
                  @click="deleteImage(image)"
                >
                    Delete
                </v-btn>
                <v-divider thickness="1" opacity=".3" class="mt-8 "></v-divider>
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
import { collection, query, getDocs, where, documentId, doc, getDoc, setDoc, orderBy, startAfter, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import axios from 'axios';
import TiptapInputA from '../components/TiptapInputA.vue';
import imageCompression from 'browser-image-compression';

export default {
  name: 'ImageWork',
  components: {
    TiptapInputA
  },
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
      editedCaptions: {},
      savingCaption: null,
      nextSchoolId: null,
      prevSchoolId: null,
      movedIndex: null,
      affectedIndex: null,
      isProcessingAll: false,
      hiddenValue: null,
    }
  },
  computed: {
    schoolId() {
      return this.$route.params.slug
    },
    sortedStorageImages() {
      return [...this.storageImages].sort((a, b) => a.position - b.position);
    },
    sortedImagesData() {
      if (!this.imagesData) return null;
      
      // Convert object to array of entries and sort by key
      const entries = Object.entries(this.imagesData).sort((a, b) => {
        // Extract numeric part from keys (e.g., "image1" -> 1)
        const numA = parseInt(a[0].replace(/\D/g, ''));
        const numB = parseInt(b[0].replace(/\D/g, ''));
        return numA - numB;
      });
      
      // Convert back to object
      return Object.fromEntries(entries);
    }
  },
  mounted() {
    this.loadImages()
    this.loadImageCredits()
    this.findNextSchool()
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

      // Load hidden value
      const manualDataRef = doc(dbFireStore, 'manual_institution_data', this.schoolId);
      const manualDataSnap = await getDoc(manualDataRef);
      if (manualDataSnap.exists()) {
        this.hiddenValue = manualDataSnap.data().hidden;
      }

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
          this.storageImages = data.images.map(image => ({
            url: image.URL || image.url,
            caption: image.caption,
            position: image.position
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
      
      try {
        this.results.push(`Processing ${key}...`);
        
        // Try to download the image
        try {
          const response = await axios.get(url, { responseType: 'blob' });
          const imageBlob = response.data;
          
          // Compress and convert to WebP
          const options = {
            maxSizeMB: 3,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/webp'
          };

          this.results.push('Converting to WebP format...');
          const compressedFile = await imageCompression(imageBlob, options);
          
          // Create a new filename with .webp extension
          const newImageName = `${key}.webp`;
          
          this.results.push(`Uploading ${newImageName}...`);
          
          // Upload to Firebase Storage
          const storage = getStorage();
          const storageRef = ref(storage, `${this.schoolId}/${newImageName}`);
          await uploadBytes(storageRef, compressedFile);
          newUrl = await getDownloadURL(storageRef);
          
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
            
            this.results.push(`✅ Successfully uploaded ${newImageName}`);
            await this.loadStorageImages();
          } else {
            throw new Error('Failed to upload image');
          }
        } catch (downloadError) {
          // If we get a CORS error, show the manual download dialog
          this.manualUploadUrl = url;
          this.showManualDialog = true;
          this.results.push(`Manual download required for this image`);
          return;
        }
      } catch (error) {
        console.error('Error processing image:', error);
        this.results.push(`❌ Error: ${error.message}`);
        
        // Clean up if we got a URL but failed to complete the process
        if (newUrl) {
          try {
            // Delete from storage
            const storage = getStorage();
            const imageRef = ref(storage, `${this.schoolId}/${key}.webp`);
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
        // Compress and convert to WebP
        const options = {
          maxSizeMB: 3,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp'
        };

        this.results.push(`📦 Processing image (${(file.size / (1024 * 1024)).toFixed(2)}MB)...`);
        const compressedFile = await imageCompression(file, options);
        this.results.push(`✅ Processed to ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`);

        // Create a new filename with .webp extension
        const originalName = file.name.split('.')[0];
        const newFileName = `${originalName}.webp`;

        const storage = getStorage();
        const storageRef = ref(storage, `${this.schoolId}/${newFileName}`);
        
        await uploadBytes(storageRef, compressedFile);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Get existing images array or initialize it
        const imageRef = doc(dbFireStore, 'institution_images_v2', this.schoolId);
        const docSnap = await getDoc(imageRef);
        const images = docSnap.exists() ? (docSnap.data().images || []) : [];

        // Create new image object
        const imageObject = {
          url: downloadURL,
          caption: null,
          position: images.length
        };

        // Add new image to array
        images.push(imageObject);

        // Update the document with the images array
        await setDoc(imageRef, {
          images: images
        }, { merge: true });

        this.results.push(`✅ Successfully uploaded ${newFileName}`);
        await this.loadStorageImages();
      } catch (error) {
        console.error('Error uploading file:', error);
        this.results.push(`❌ Failed to upload: ${error.message}`);
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
      if (!confirm(`Are you sure you want to delete this image?`)) {
        return;
      }
      
      this.deletingImage = image.url;
      this.deletingImagePosition = image.position;
      try {

        // Extract the actual file path from the URL
        const url = new URL(image.url);
        const fileName = decodeURIComponent(url.pathname.split('/').pop());

        // Attempt to delete from storage
        const storage = getStorage();
        const imageRef = ref(storage, `${fileName}`);
        await deleteObject(imageRef);

      } catch (error) {
        console.error('Error deleting image from storage:', error);
        this.results.push(`⚠️ Failed to delete from storage: ${error.message}`);
      } finally {
        try {
          // Update Firestore document regardless of storage deletion outcome
          const docRef = doc(dbFireStore, 'institution_images_v2', this.schoolId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('this.deletingImage', this.deletingImage);
            console.log('this.deletingImagePosition', this.deletingImagePosition);
            const updatedImages = data.images.filter(img => img.position !== this.deletingImagePosition);
            
            console.log('updatedImages', updatedImages);
            // Update positions of remaining images
            updatedImages.forEach((img, index) => {
              img.position = index;
            });

            await setDoc(docRef, { images: updatedImages }, { merge: true });
          }

          // Update local state
          this.results.push(`✅ Successfully deleted image`);
          await this.loadStorageImages();
        } catch (firestoreError) {
          console.error('Error updating Firestore document:', firestoreError);
          this.results.push(`❌ Failed to update Firestore: ${firestoreError.message}`);
        } finally {
          this.deletingImage = null;
        }
      }
    },

    handleCaptionChange(index) {
      this.editedCaptions[index] = true;
    },

    async saveCaption(index, image) {
      this.savingCaption = index;
      try {
        const docRef = doc(dbFireStore, 'institution_images_v2', this.schoolId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const images = data.images;
          images[index].caption = image.caption;
          await setDoc(docRef, { images }, { merge: true });
          this.editedCaptions[index] = false;
          this.results.push('✅ Caption saved successfully');
        }
      } catch (error) {
        console.error('Error saving caption:', error);
        this.results.push(`❌ Failed to save caption: ${error.message}`);
      } finally {
        this.savingCaption = null;
      }
    },

    async findNextSchool() {
      try {
        const institutionsRef = collection(dbFireStore, 'institution_images');
        const q = query(
          institutionsRef,
          orderBy(documentId()),
          startAfter(this.schoolId),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          this.nextSchoolId = querySnapshot.docs[0].id;
        } else {
          this.nextSchoolId = null;
        }
      } catch (error) {
        console.error('Error finding next school:', error);
        this.nextSchoolId = null;
      }
    },

    async findPrevSchool() {
      try {
        const institutionsRef = collection(dbFireStore, 'institution_images');
        const q = query(
          institutionsRef,
          orderBy(documentId(), 'desc'),
          startAfter(this.schoolId),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          this.prevSchoolId = querySnapshot.docs[0].id;
        } else {
          this.prevSchoolId = null;
        }
      } catch (error) {
        console.error('Error finding previous school:', error);
        this.prevSchoolId = null;
      }
    },

    async changePosition(index, direction) {
      const images = [...this.storageImages];
      let swapIndex;

      if (direction === 'up' && index > 0) {
        swapIndex = index - 1;
      } else if (direction === 'down' && index < images.length - 1) {
        swapIndex = index + 1;
      } else {
        return;
      }

      // Swap the images in the array
      [images[index], images[swapIndex]] = [images[swapIndex], images[index]];

      // Update positions
      images[index].position = index;
      images[swapIndex].position = swapIndex;

      // Set animation indices
      this.movedIndex = index;
      this.affectedIndex = swapIndex;

      // Clear animation classes after animation completes
      setTimeout(() => {
        this.movedIndex = null;
        this.affectedIndex = null;
      }, 1000);

      try {
        // Update Firestore with validated data
        const docRef = doc(dbFireStore, 'institution_images_v2', this.schoolId);
        await setDoc(docRef, { images }, { merge: true });

        // Reload images to ensure proper sorting
        await this.loadStorageImages();
      } catch (error) {
        console.error('Error updating positions:', error);
        this.results.push(`❌ Failed to update positions: ${error.message}`);
      }
    },

    async transferAllImages() {
      if (!confirm('Are you sure you want to transfer all images?')) return;
      
      this.isProcessingAll = true;
      this.results = [];
      
      try {
        const entries = Object.entries(this.sortedImagesData);
        
        for (const [key, url] of entries) {
          this.results.push(`\n--- Processing ${key} ---`);
          await this.transferSingleImage(key, url, this.imageCredits[key]);
          // Add a small delay between transfers to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        this.results.push('\n✅ Completed processing all images');
      } catch (error) {
        console.error('Error in batch transfer:', error);
        this.results.push(`\n❌ Batch transfer error: ${error.message}`);
      } finally {
        this.isProcessingAll = false;
      }
    },
  },
  watch: {
    schoolId: {
      handler() {
        this.findNextSchool();
        this.findPrevSchool();
      },
      immediate: true
    }
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

.square-image {
  width: 100%;
  aspect-ratio: 1 / 1;
}

.caption-editor {
  font-size: 12px;
}

.caption-editor .tiptap {
  background: transparent;
  padding: 8px;
}

.caption-editor .tiptap p {
  margin: 0;
}

.moved-item {
  animation: highlightGreen 1s ease;
}

.affected-item {
  animation: highlightYellow 1s ease;
}

@keyframes highlightGreen {
  0% {
    background-color: #4CAF50;
  }
  100% {
    background-color: white;
  }
}

@keyframes highlightYellow {
  0% {
    background-color: #FFC107;
  }
  100% {
    background-color: white;
  }
}

/* Make sure the background shows through */
.v-card {
  transition: background-color 1s ease;
}

</style>
