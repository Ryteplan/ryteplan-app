<template>
  <div v-if="images.length > 0">
    <div class="institution-images-container">
      <div class="img-bg position-relative" 
           @mouseenter="hoveredImageIndex = 1" 
           @mouseleave="hoveredImageIndex = null">
        <img 
          class="institution-image" 
          :src="getImageByPosition(1)?.URL" 
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
              :src="getImageByPosition(i + 1)?.URL" 
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
  </div>
</template>

<script>
export default {
  name: 'StorageImagesCollection',
  props: {
    images: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      hoveredImageIndex: null
    }
  },
  methods: {
    getImageByPosition(position) {
      return this.images.find(img => img.position === position);
    },
    showImageCreditInfo(position) {
      const image = this.getImageByPosition(position);
      if (image?.caption) {
        // Emit event to parent to handle showing the caption
        this.$emit('show-credit', image.caption);
      }
    }
  }
}
</script>

<style scoped>
.institution-images-container {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr;
}

.institution-images-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, 1fr);
}

.img-bg {
  background: #eee;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.institution-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-info-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9) !important;
}
</style> 