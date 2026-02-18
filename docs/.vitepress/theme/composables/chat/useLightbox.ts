import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export interface UseLightboxReturn {
  lightboxImageSrc: Ref<string | null>
  isLightboxVisible: ComputedRef<boolean>
  chatImages: Ref<string[]>
  currentImageIndex: Ref<number>
  isPrevButtonDisabled: ComputedRef<boolean>
  isNextButtonDisabled: ComputedRef<boolean>
  scale: Ref<number>
  translateX: Ref<number>
  translateY: Ref<number>
  isDragging: Ref<boolean>
  imageTransform: ComputedRef<string>
  imageRenderKey: Ref<number>
  openLightbox: (src: string, allImages: string[], currentIndex: number) => void
  closeLightbox: () => void
  showPrevImage: () => void
  showNextImage: () => void
  handleWheel: (event: WheelEvent) => void
  handleMouseDown: (event: MouseEvent) => void
  resetImageTransform: () => void
}

export function useLightbox(): UseLightboxReturn {
  // Lightbox visibility and image
  const lightboxImageSrc = ref<string | null>(null)
  const isLightboxVisible = computed(() => !!lightboxImageSrc.value)

  // Image list navigation
  const chatImages = ref<string[]>([])
  const currentImageIndex = ref(-1)

  const isPrevButtonDisabled = computed(() => currentImageIndex.value <= 0)
  const isNextButtonDisabled = computed(() => currentImageIndex.value >= chatImages.value.length - 1)

  // Zoom and pan state
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)
  const isDragging = ref(false)
  const startDragX = ref(0)
  const startDragY = ref(0)

  // Force re-render key
  const imageRenderKey = ref(0)

  // Computed transform style
  const imageTransform = computed(() => {
    return `scale(${scale.value}) translate(${translateX.value}px, ${translateY.value}px)`
  })

  function openLightbox(src: string, allImages: string[], currentIndex: number) {
    chatImages.value = allImages
    currentImageIndex.value = currentIndex
    lightboxImageSrc.value = src
    resetImageTransform()
  }

  function closeLightbox() {
    lightboxImageSrc.value = null
    currentImageIndex.value = -1
    chatImages.value = []
    resetImageTransform()
  }

  function showPrevImage() {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--
      lightboxImageSrc.value = chatImages.value[currentImageIndex.value]
      resetImageTransform()
    }
  }

  function showNextImage() {
    if (currentImageIndex.value < chatImages.value.length - 1) {
      currentImageIndex.value++
      lightboxImageSrc.value = chatImages.value[currentImageIndex.value]
      resetImageTransform()
    }
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault()
    const zoomSpeed = 0.1
    if (event.deltaY < 0)
      scale.value = Math.min(scale.value + zoomSpeed, 5)
    else
      scale.value = Math.max(scale.value - zoomSpeed, 0.5)

    if (scale.value <= 1) {
      translateX.value = 0
      translateY.value = 0
    }

    // Debounce re-render
    setTimeout(() => {
      imageRenderKey.value++
    }, 150)
  }

  function handleMouseDown(event: MouseEvent) {
    if (scale.value <= 1)
      return
    event.preventDefault()
    isDragging.value = true
    startDragX.value = event.clientX - translateX.value
    startDragY.value = event.clientY - translateY.value

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.value) {
        translateX.value = e.clientX - startDragX.value
        translateY.value = e.clientY - startDragY.value
      }
    }

    const handleMouseUp = () => {
      isDragging.value = false
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  function resetImageTransform() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
    isDragging.value = false
  }

  return {
    lightboxImageSrc,
    isLightboxVisible,
    chatImages,
    currentImageIndex,
    isPrevButtonDisabled,
    isNextButtonDisabled,
    scale,
    translateX,
    translateY,
    isDragging,
    imageTransform,
    imageRenderKey,
    openLightbox,
    closeLightbox,
    showPrevImage,
    showNextImage,
    handleWheel,
    handleMouseDown,
    resetImageTransform,
  }
}
