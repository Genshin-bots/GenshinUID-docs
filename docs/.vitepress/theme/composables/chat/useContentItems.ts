import { ref } from 'vue'
import type { Ref } from 'vue'

export interface ContentItem {
  type: 'image' | 'audio' | 'video'
  data: string
  fileName: string
  preview: string
}

export interface UseContentItemsReturn {
  items: Ref<ContentItem[]>
  addItem: (item: ContentItem) => void
  removeItem: (index: number) => void
  moveItem: (fromIndex: number, direction: -1 | 1) => void
  clearItems: () => void
}

export function useContentItems(): UseContentItemsReturn {
  const items = ref<ContentItem[]>([])

  function addItem(item: ContentItem) {
    items.value.push(item)
  }

  function removeItem(index: number) {
    if (index >= 0 && index < items.value.length)
      items.value.splice(index, 1)
  }

  function moveItem(fromIndex: number, direction: -1 | 1) {
    const toIndex = fromIndex + direction
    if (toIndex >= 0 && toIndex < items.value.length) {
      const temp = items.value[fromIndex]
      items.value[fromIndex] = items.value[toIndex]
      items.value[toIndex] = temp
    }
  }

  function clearItems() {
    items.value = []
  }

  return {
    items,
    addItem,
    removeItem,
    moveItem,
    clearItems,
  }
}
