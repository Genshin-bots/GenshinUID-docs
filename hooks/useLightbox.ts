'use client'

import { useState, useCallback, useRef } from 'react'

export function useLightbox() {
  const [lightboxImageSrc, setLightboxImageSrc] = useState<string | null>(null)
  const [isLightboxVisible, setIsLightboxVisible] = useState(false)
  const [imageTransform, setImageTransform] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [imageRenderKey, setImageRenderKey] = useState(0)

  const imagesRef = useRef<string[]>([])
  const currentIndexRef = useRef(0)
  const scaleRef = useRef(1)
  const translateXRef = useRef(0)
  const translateYRef = useRef(0)
  const dragStartRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 })

  const isPrevButtonDisabled = currentIndexRef.current <= 0
  const isNextButtonDisabled = currentIndexRef.current >= imagesRef.current.length - 1

  const updateTransform = useCallback(() => {
    setImageTransform(`translate(${translateXRef.current}px, ${translateYRef.current}px) scale(${scaleRef.current})`)
  }, [])

  const openLightbox = useCallback((src: string, allImages: string[], index: number) => {
    imagesRef.current = allImages
    currentIndexRef.current = index
    scaleRef.current = 1
    translateXRef.current = 0
    translateYRef.current = 0
    setLightboxImageSrc(src)
    setIsLightboxVisible(true)
    updateTransform()
  }, [updateTransform])

  const closeLightbox = useCallback(() => {
    setIsLightboxVisible(false)
    setLightboxImageSrc(null)
    scaleRef.current = 1
    translateXRef.current = 0
    translateYRef.current = 0
  }, [])

  const showPrevImage = useCallback(() => {
    if (currentIndexRef.current > 0) {
      currentIndexRef.current--
      const newSrc = imagesRef.current[currentIndexRef.current]
      setLightboxImageSrc(newSrc)
      setImageRenderKey(k => k + 1)
      scaleRef.current = 1
      translateXRef.current = 0
      translateYRef.current = 0
      updateTransform()
    }
  }, [updateTransform])

  const showNextImage = useCallback(() => {
    if (currentIndexRef.current < imagesRef.current.length - 1) {
      currentIndexRef.current++
      const newSrc = imagesRef.current[currentIndexRef.current]
      setLightboxImageSrc(newSrc)
      setImageRenderKey(k => k + 1)
      scaleRef.current = 1
      translateXRef.current = 0
      translateYRef.current = 0
      updateTransform()
    }
  }, [updateTransform])

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    scaleRef.current = Math.max(0.5, Math.min(5, scaleRef.current + delta))
    updateTransform()
  }, [updateTransform])

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true)
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      initialX: translateXRef.current,
      initialY: translateYRef.current,
    }
  }, [])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return
    const dx = event.clientX - dragStartRef.current.x
    const dy = event.clientY - dragStartRef.current.y
    translateXRef.current = dragStartRef.current.initialX + dx
    translateYRef.current = dragStartRef.current.initialY + dy
    updateTransform()
  }, [isDragging, updateTransform])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // attach global mouse events when dragging
  if (typeof window !== 'undefined' && isDragging) {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return {
    lightboxImageSrc,
    isLightboxVisible,
    isPrevButtonDisabled,
    isNextButtonDisabled,
    imageTransform,
    isDragging,
    imageRenderKey,
    openLightbox,
    closeLightbox,
    showPrevImage,
    showNextImage,
    handleWheel,
    handleMouseDown,
  }
}
