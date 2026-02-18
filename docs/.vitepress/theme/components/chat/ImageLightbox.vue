<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  imageSrc: string | null
  isVisible: boolean
  isPrevDisabled: boolean
  isNextDisabled: boolean
  imageTransform: string
  isDragging: boolean
  imageRenderKey: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'wheel', event: WheelEvent): void
  (e: 'mousedown', event: MouseEvent): void
}>()

const lightboxImage = ref<HTMLImageElement | null>(null)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="lightbox-overlay"
      @click="$emit('close')"
      @wheel="$emit('wheel', $event)"
    >
      <button
        class="lightbox-nav-button prev"
        :disabled="isPrevDisabled"
        @click.stop="$emit('prev')"
      >
        &#10094;
      </button>
      <img
        :key="imageRenderKey"
        ref="lightboxImage"
        :src="imageSrc || ''"
        alt="Enlarged image"
        class="lightbox-image"
        :class="{ 'is-dragging': isDragging }"
        :style="{ transform: imageTransform }"
        @click.stop
        @mousedown="$emit('mousedown', $event)"
      >

      <button
        class="lightbox-nav-button next"
        :disabled="isNextDisabled"
        @click.stop="$emit('next')"
      >
        &#10095;
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  cursor: zoom-out;
  transition: opacity 0.3s ease;
  overflow: hidden;
}

.lightbox-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  transition: transform 0.2s ease-out;
  will-change: transform;
  cursor: zoom-in;
}

.lightbox-image:hover {
  cursor: grab;
}

.lightbox-image.is-dragging {
  cursor: grabbing;
}

.lightbox-nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000000;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s, opacity 0.2s;
  user-select: none;
}

.lightbox-nav-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.lightbox-nav-button:disabled {
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
  opacity: 0.7;
}

.lightbox-nav-button.prev {
  left: 20px;
}

.lightbox-nav-button.next {
  right: 20px;
}
</style>
