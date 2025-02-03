<template>
  <div v-if="images.length > 0">
    <div class="institution-images-container">
      <div class="img-bg position-relative" 
           @mouseenter="hoveredImageIndex = 1" 
           @mouseleave="hoveredImageIndex = null">
        <img 
          class="institution-image" 
          :src="getImageByPosition(1)?.url || getImageByPosition(1)?.URL" 
        />
        <v-btn
          v-show="hoveredImageIndex === 1"
          icon="mdi-information"
          size="small"
          class="image-info-btn"
          @click="showImageCreditInfo(1)"
        />
      </div>
      <div class="institution-images-grid">
        <template v-for="i in 4" :key="i">
          <div class="img-bg position-relative"
               @mouseenter="hoveredImageIndex = i + 1" 
               @mouseleave="hoveredImageIndex = null">
            <img 
              class="institution-image" 
              :src="getImageByPosition(i + 1)?.url || getImageByPosition(i + 1)?.URL" 
            />
            <v-btn
              v-show="hoveredImageIndex === i + 1"
              icon="mdi-information"
              size="small"
              class="image-info-btn"
              @click="showImageCreditInfo(i + 1)"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Image Credit Dialog -->
    <v-dialog v-model="showCreditDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Image Credit
        </v-card-title>
        <v-card-text>
          <div v-if="selectedImage?.caption" v-html="selectedImage.caption"></div>
          <div v-else>No credit information available</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="showCreditDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'StorageImagesCollection',
  props: {
    images: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      hoveredImageIndex: null,
      showCreditDialog: false,
      selectedImage: null
    }
  },
  methods: {
    getImageByPosition(position) {
      return this.images.find(img => img.position === position - 1)
    },
    showImageCreditInfo(position) {
      this.selectedImage = this.getImageByPosition(position)
      this.showCreditDialog = true
    }
  }
}
</script>

<style scoped>
.institution-images-container {
  display: flex;
  gap: 8px;
}

.img-bg {
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.institution-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.institution-images-container > .img-bg {
  flex: 1;
  aspect-ratio: 1;
}

.institution-images-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.image-info-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9) !important;
}
</style> 