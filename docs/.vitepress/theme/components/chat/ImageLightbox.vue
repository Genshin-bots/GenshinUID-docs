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

<style>
.lightbox-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background-color: rgba(0, 0, 0, 0.7) !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  z-index: 2147483647 !important;
  cursor: zoom-out !important;
  transition: opacity 0.3s ease;
  overflow: hidden !important;
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
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  background-color: rgba(0, 0, 0, 0.4) !important;
  color: white !important;
  border: none !important;
  border-radius: 50% !important;
  width: 44px !important;
  height: 44px !important;
  font-size: 24px !important;
  font-weight: bold !important;
  cursor: pointer !important;
  z-index: 2147483647 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  transition: background-color 0.2s, opacity 0.2s !important;
  user-select: none !important;
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
