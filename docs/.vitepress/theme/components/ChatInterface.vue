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

  const messageToSend: WebSocketMessage = {
    bot_id: 'web',
    bot_self_id: 'web-client-001',
    msg_id: `msg_${Date.now()}`,
    user_type: userType,
    group_id: currentGroupId,
    user_id: 'user_web_01',
    sender: { nickname: '我', avatar: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png' },
    user_pm: 3,
    content: [{ type: 'text', data: text }],
  }

  sendWsMessage(messageToSend)

  messages.value.push({
    type: 'sent',
    text,
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
