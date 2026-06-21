'use client'

import { useEffect, useRef } from 'react'

interface ImageLightboxProps {
  imageSrc: string | null
  isVisible: boolean
  isPrevDisabled: boolean
  isNextDisabled: boolean
  imageTransform: string
  isDragging: boolean
  imageRenderKey: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onWheel: (event: WheelEvent) => void
  onMouseDown: (event: React.MouseEvent) => void
}

export function ImageLightbox({
  imageSrc,
  isVisible,
  isPrevDisabled,
  isNextDisabled,
  imageTransform,
  isDragging,
  imageRenderKey,
  onClose,
  onPrev,
  onNext,
  onWheel,
  onMouseDown,
}: ImageLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && !isPrevDisabled) onPrev()
      if (e.key === 'ArrowRight' && !isNextDisabled) onNext()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isVisible, isPrevDisabled, isNextDisabled, onClose, onPrev, onNext])

  if (!isVisible) return null

  return (
    <div
      ref={overlayRef}
      className="fd-lightbox-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      onWheel={(e) => onWheel(e.nativeEvent)}
    >
      <button
        type="button"
        className="fd-lightbox-nav-button prev"
        disabled={isPrevDisabled}
        onClick={onPrev}
      >
        ❮
      </button>
      <img
        key={imageRenderKey}
        src={imageSrc || ''}
        alt="Enlarged"
        className={`fd-lightbox-image ${isDragging ? 'is-dragging' : ''}`}
        style={{ transform: imageTransform }}
        onClick={e => e.stopPropagation()}
        onMouseDown={onMouseDown}
        draggable={false}
      />
      <button
        type="button"
        className="fd-lightbox-nav-button next"
        disabled={isNextDisabled}
        onClick={onNext}
      >
        ❯
      </button>
    </div>
  )
}
