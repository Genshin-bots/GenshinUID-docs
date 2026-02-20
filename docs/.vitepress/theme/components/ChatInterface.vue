<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  type WebSocketMessage,
  useChatMode,
  useContentItems,
  useFileUpload,
  useLightbox,
  useMessageRenderer,
  useWebSocket,
} from '../composables/chat'
import {
  ChatHeader,
  ChatInputArea,
  ChatMessageList,
  ImageLightbox,
} from './chat'

// --- Composables ---
const {
  isMarkdownMode,
  renderContent,
  toggleMarkdownMode,
} = useMessageRenderer()

const {
  isGroupMode,
  groupId,
  toggleMode: toggleChatMode,
  getModeParams,
} = useChatMode()

const {
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
} = useLightbox()

const {
  fileInputRef,
  isDragOver,
  triggerFileUpload,
  processFile: processUploadedFile,
  handleFileSelect,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handlePaste,
} = useFileUpload()

const {
  items: messageContentItems,
  addItem,
  removeItem: removeContentItem,
  moveItem: moveContentItem,
  clearItems: clearContentItems,
} = useContentItems()

// --- State ---
const messages = ref<Array<{
  type: 'sent' | 'received' | 'system'
  text?: string
  html?: string
  sender?: { nickname: string; avatar: string }
  buttons?: Array<{ text: string; data: string; style?: number }>
}>>([])

const newMessage = ref('')
const messageContainer = ref<HTMLElement | null>(null)

// --- WebSocket ---
const {
  ws,
  connectionStatus,
  wsUrl,
  statusText,
  statusClass,
  connect: connectWebSocket,
  disconnect: disconnectWebSocket,
  sendMessage: sendWsMessage,
  cancelConnection,
} = useWebSocket(
  (data) => {
    // Handle incoming message
    if (data.content) {
      const mainContent = data.content.filter((c: any) => c.type !== 'buttons')
      const buttonContent = data.content.find((c: any) => c.type === 'buttons')
      const buttons = buttonContent ? buttonContent.data.flat() : []

      const renderedHtml = renderContent(mainContent)

      if ((renderedHtml && renderedHtml.trim() !== '') || buttons.length > 0) {
        messages.value.push({
          type: 'received',
          html: renderedHtml,
          buttons,
          sender: data.sender || { nickname: '服务器', avatar: 'https://s2.loli.net/2023/03/25/bareSdYcsmRPOyZ.png' },
        })
        scrollToBottom()
      }
    }
  },
  (errorText) => {
    messages.value.push({ type: 'system', text: errorText })
  }
)

// Watch connection status for system messages
watch(connectionStatus, (newStatus, oldStatus) => {
  if (newStatus === 'connected')
    messages.value.push({ type: 'system', text: `已连接到 ${wsUrl.value}` })
  else if (newStatus === 'disconnected' && oldStatus === 'connected')
    messages.value.push({ type: 'system', text: '与服务器的连接已断开' })
  else if (newStatus === 'error')
    messages.value.push({ type: 'system', text: '连接出现错误' })
})

// Watch for group mode changes
watch([isGroupMode, groupId], ([newIsGroupMode, newGroupId], [oldIsGroupMode]) => {
  if (newIsGroupMode !== oldIsGroupMode) {
    if (newIsGroupMode) {
      messages.value.push({
        type: 'system',
        text: `已切换到群聊模式 (群组ID: ${newGroupId})`,
      })
    }
    else {
      messages.value.push({
        type: 'system',
        text: '已切换到私聊模式',
      })
    }
  }
})

// --- Methods ---
function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value)
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  })
}

async function processFile(file: File) {
  const item = await processUploadedFile(file)
  if (item)
    addItem(item)
}

function sendRichMessage() {
  const content: Array<{ type: string; data: string }> = []

  // Add text content
  if (newMessage.value.trim()) {
    content.push({
      type: isMarkdownMode.value ? 'markdown' : 'text',
      data: newMessage.value,
    })
  }

  // Add media content
  content.push(...messageContentItems.value.map(item => ({
    type: item.type as 'image' | 'audio' | 'video',
    data: item.data,
  })))

  if (content.length === 0)
    return
  if (connectionStatus.value !== 'connected' || !ws.value)
    return

  const { userType, groupId: currentGroupId } = getModeParams()

  const messageToSend: WebSocketMessage = {
    bot_id: 'web',
    bot_self_id: 'web-client-001',
    msg_id: `msg_${Date.now()}`,
    user_type: userType,
    group_id: currentGroupId,
    user_id: 'user_web_01',
    sender: { nickname: '我', avatar: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png' },
    user_pm: 3,
    content,
  }

  sendWsMessage(messageToSend)

  // Render sent message
  const renderedHtml = renderContent(content as Array<{ type: 'text' | 'audio' | 'video' | 'image' | 'markdown'; data: string }>)
  messages.value.push({
    type: 'sent',
    html: renderedHtml,
    sender: messageToSend.sender,
    buttons: [],
  })

  // Clear input
  newMessage.value = ''
  clearContentItems()
  scrollToBottom()
}

function sendSimpleMessage(text: string) {
  if (connectionStatus.value !== 'connected' || !ws.value || !text.trim())
    return

  const { userType, groupId: currentGroupId } = getModeParams()

  // 检测文本是否包含 HTML 标签
  const hasHtmlTags = /<[^>]+>/.test(text)

  // 构建 content 数组
  const content: Array<{ type: string; data: string }> = []

  if (hasHtmlTags) {
    // 解析 HTML 提取文本和图片
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = text

    // 提取纯文本（移除图片后的文本）
    const textDiv = tempDiv.cloneNode(true) as HTMLDivElement
    const images = textDiv.querySelectorAll('img')
    images.forEach(img => img.remove())
    const plainText = (textDiv.textContent || textDiv.innerText || '').trim()

    // 添加文本内容
    if (plainText)
      content.push({ type: 'text', data: plainText })

    // 提取图片
    const originalImages = tempDiv.querySelectorAll('img')
    originalImages.forEach((img) => {
      const src = img.getAttribute('src') || ''
      if (src)
        content.push({ type: 'image', data: src })
    })
  }
  else {
    // 纯文本
    content.push({ type: 'text', data: text.trim() })
  }

  // 如果没有内容，不发送
  if (content.length === 0)
    return

  const messageToSend: WebSocketMessage = {
    bot_id: 'web',
    bot_self_id: 'web-client-001',
    msg_id: `msg_${Date.now()}`,
    user_type: userType,
    group_id: currentGroupId,
    user_id: 'user_web_01',
    sender: { nickname: '我', avatar: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png' },
    user_pm: 3,
    content,
  }

  sendWsMessage(messageToSend)

  // 使用 renderContent 渲染 HTML 用于显示
  const renderedHtml = renderContent(content as Array<{ type: 'text' | 'audio' | 'video' | 'image' | 'markdown'; data: string }>)
  messages.value.push({
    type: 'sent',
    html: renderedHtml,
    sender: messageToSend.sender,
    buttons: [],
  })

  scrollToBottom()
}

function handleButtonClick(button: { text: string; data: string; style?: number }) {
  if (connectionStatus.value !== 'connected' || !ws.value) {
    console.warn('无法发送按钮回调：WebSocket未连接。')
    return
  }

  const messageToSend: WebSocketMessage = {
    bot_id: 'web',
    bot_self_id: 'web-client-001',
    msg_id: `msg_${Date.now()}`,
    user_type: 'direct',
    group_id: null,
    user_id: 'user_web_01',
    sender: { nickname: '我', avatar: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png' },
    user_pm: 3,
    content: [{ type: 'text', data: button.data }],
  }

  sendWsMessage(messageToSend)
  // console.log('发送按钮点击事件:', messageToSend)
}

function handleImageClick(src: string) {
  // Collect all images from messages
  const allImages: string[] = []
  messages.value.forEach((msg) => {
    if (msg.html) {
      const div = document.createElement('div')
      div.innerHTML = msg.html
      const imgs = div.querySelectorAll('img.chat-image')
      imgs.forEach((img) => {
        const imgSrc = (img as HTMLImageElement).src
        if (!allImages.includes(imgSrc))
          allImages.push(imgSrc)
      })
    }
  })

  const index = allImages.findIndex(s => s === src)
  openLightbox(src, allImages, index >= 0 ? index : 0)
}

function handleCopyToInput(payload: { text?: string; html?: string }) {
  // 优先使用原始文本，如果没有则使用 html 内容
  const contentToCopy = payload.text || payload.html || ''

  // 先清空现有的 content items
  clearContentItems()

  // 如果内容包含 HTML 标签，需要提取文本和图片
  if (contentToCopy.includes('<')) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = contentToCopy

    // 提取纯文本（去除图片后的文本）
    // 先克隆一份用于提取文本
    const textDiv = tempDiv.cloneNode(true) as HTMLDivElement
    // 移除所有图片元素
    const images = textDiv.querySelectorAll('img')
    images.forEach(img => img.remove())
    const plainText = (textDiv.textContent || textDiv.innerText || '').trim()

    // 设置文本到输入框
    newMessage.value = plainText

    // 提取图片并添加到 content items
    images.forEach((img, index) => {
      const src = img.getAttribute('src') || ''
      if (src) {
        // 从 URL 或 base64 中提取文件名
        let fileName = `image_${index + 1}.png`
        if (src.startsWith('data:')) {
          // base64 格式，尝试提取 mime 类型
          const match = src.match(/data:image\/([a-zA-Z]+);/)
          if (match)
            fileName = `image_${index + 1}.${match[1]}`
        }
        else {
          // URL 格式，尝试提取文件名
          const urlParts = src.split('/')
          const lastPart = urlParts[urlParts.length - 1]
          if (lastPart && lastPart.includes('.'))
            fileName = lastPart
        }

        addItem({
          type: 'image',
          data: src,
          fileName,
          preview: src,
        })
      }
    })
  }
  else {
    // 纯文本，直接设置
    newMessage.value = contentToCopy.trim()
  }

  // 聚焦到输入框并将光标移到末尾
  nextTick(() => {
    const textarea = document.querySelector('.message-input') as HTMLTextAreaElement
    if (textarea) {
      textarea.focus()
      textarea.setSelectionRange(newMessage.value.length, newMessage.value.length)
    }
  })
}

// Lifecycle
onMounted(() => {
  connectWebSocket()
})

onUnmounted(() => {
  disconnectWebSocket()
})
</script>

<template>
  <div class="chat-container">
    <ChatHeader
      v-model:ws-url="wsUrl"
      :connection-status="connectionStatus"
      :is-group-mode="isGroupMode"
      :group-id="groupId"
      @toggle-mode="toggleChatMode"
      @cancel-connection="cancelConnection"
    />

    <ChatMessageList
      ref="messageContainer"
      :messages="messages"
      @resend="sendSimpleMessage"
      @button-click="handleButtonClick"
      @image-click="handleImageClick"
      @copy="handleCopyToInput"
    />

    <ChatInputArea
      v-model="newMessage"
      :connection-status="connectionStatus"
      :is-markdown-mode="isMarkdownMode"
      :content-items="messageContentItems"
      :is-drag-over="isDragOver"
      @send="sendRichMessage"
      @reconnect="connectWebSocket"
      @toggle-markdown="toggleMarkdownMode"
      @remove-content-item="removeContentItem"
      @move-content-item="moveContentItem"
      @trigger-file-upload="(type: 'image' | 'audio' | 'video') => triggerFileUpload(fileInputRef, type)"
      @file-select="handleFileSelect($event, processFile)"
      @drag-over="handleDragOver"
      @drag-leave="handleDragLeave"
      @drop="handleDrop($event, processFile)"
      @paste="handlePaste($event, processFile)"
    />

    <ImageLightbox
      :image-src="lightboxImageSrc"
      :is-visible="isLightboxVisible"
      :is-prev-disabled="isPrevButtonDisabled"
      :is-next-disabled="isNextButtonDisabled"
      :image-transform="imageTransform"
      :is-dragging="isDragging"
      :image-render-key="imageRenderKey"
      @close="closeLightbox"
      @prev="showPrevImage"
      @next="showNextImage"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
    />

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      style="display: none"
      multiple
      @change="handleFileSelect($event, processFile)"
    >
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: sans-serif;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
</style>
