'use client'

import { useState, useCallback } from 'react'
import type { ContentItem } from './useFileUpload'

export function useContentItems() {
  const [items, setItems] = useState<ContentItem[]>([])

  const addItem = useCallback((item: ContentItem) => {
    setItems(prev => [...prev, item])
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  const moveItem = useCallback((index: number, direction: -1 | 1) => {
    setItems(prev => {
      const newItems = [...prev]
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev
      const temp = newItems[index]
      newItems[index] = newItems[targetIndex]
      newItems[targetIndex] = temp
      return newItems
    })
  }, [])

  const clearItems = useCallback(() => {
    setItems([])
  }, [])

  return {
    items,
    addItem,
    removeItem,
    moveItem,
    clearItems,
  }
}
