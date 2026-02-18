import { ref } from 'vue'
import type { Ref } from 'vue'

export interface ContentItem {
  type: 'image' | 'audio' | 'video'
  data: string
  fileName: string
  preview: string
}

export interface UseFileUploadReturn {
  fileInputRef: Ref<HTMLInputElement | null>
  isDragOver: Ref<boolean>
  MAX_FILE_SIZE: number
  supportedImageTypes: string[]
  supportedAudioTypes: string[]
  supportedVideoTypes: string[]
  getFileType: (file: File) => 'image' | 'audio' | 'video' | null
  fileToBase64: (file: File) => Promise<string>
  processFile: (file: File) => Promise<ContentItem | null>
  triggerFileUpload: (fileInput: HTMLInputElement | null, type: 'image' | 'audio' | 'video') => void
  handleFileSelect: (event: Event, processFn: (file: File) => Promise<void>) => void
  handleDragOver: (event: DragEvent) => void
  handleDragLeave: (event: DragEvent) => void
  handleDrop: (event: DragEvent, processFn: (file: File) => Promise<void>) => Promise<void>
  handlePaste: (event: ClipboardEvent, processFn: (file: File) => Promise<void>) => Promise<void>
}

export function useFileUpload(): UseFileUploadReturn {
  const fileInputRef = ref<HTMLInputElement | null>(null)
  const isDragOver = ref(false)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

  const supportedImageTypes = ['image/png', 'image/jpeg', 'image/jpg']
  const supportedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav']
  const supportedVideoTypes = ['video/mp4', 'video/webm']

  function getFileType(file: File): 'image' | 'audio' | 'video' | null {
    if (supportedImageTypes.includes(file.type))
      return 'image'
    if (supportedAudioTypes.includes(file.type))
      return 'audio'
    if (supportedVideoTypes.includes(file.type))
      return 'video'
    return null
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function processFile(file: File): Promise<ContentItem | null> {
    if (file.size > MAX_FILE_SIZE) {
      console.warn(`文件 ${file.name} 超过10MB限制`)
      return null
    }

    const fileType = getFileType(file)
    if (!fileType) {
      console.warn(`不支持的文件类型: ${file.name}`)
      return null
    }

    try {
      const base64Data = await fileToBase64(file)
      const base64WithoutHeader = base64Data.split(',')[1]

      return {
        type: fileType,
        data: `base64://${base64WithoutHeader}`,
        fileName: file.name,
        preview: base64Data,
      }
    }
    catch (error) {
      console.error('文件处理失败:', error)
      return null
    }
  }

  function triggerFileUpload(fileInput: HTMLInputElement | null, type: 'image' | 'audio' | 'video') {
    if (!fileInput)
      return

    fileInput.accept = type === 'image'
      ? 'image/*'
      : type === 'audio'
        ? 'audio/*'
        : type === 'video' ? 'video/*' : '*'
    fileInput.click()
  }

  function handleFileSelect(event: Event, processFn: (file: File) => Promise<void>) {
    const target = event.target as HTMLInputElement
    const files = Array.from(target.files || [])

    files.forEach(async (file) => {
      await processFn(file)
    })

    target.value = ''
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault()
    isDragOver.value = true
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault()
    isDragOver.value = false
  }

  async function handleDrop(event: DragEvent, processFn: (file: File) => Promise<void>) {
    event.preventDefault()
    isDragOver.value = false

    const files = event.dataTransfer?.files
    if (!files || files.length === 0)
      return

    for (const file of Array.from(files))
      await processFn(file)
  }

  async function handlePaste(event: ClipboardEvent, processFn: (file: File) => Promise<void>) {
    const items = event.clipboardData?.items
    if (!items)
      return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file)
          await processFn(file)
      }
    }
  }

  return {
    fileInputRef,
    isDragOver,
    MAX_FILE_SIZE,
    supportedImageTypes,
    supportedAudioTypes,
    supportedVideoTypes,
    getFileType,
    fileToBase64,
    processFile,
    triggerFileUpload,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
  }
}
