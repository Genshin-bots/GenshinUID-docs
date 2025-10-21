<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'

// --- 响应式状态定义 (这部分不变) ---
const ws = ref(null)
const messages = ref([])
const newMessage = ref('')
const connectionStatus = ref('disconnected')
const messageContainer = ref(null)
const wsUrl = ref('ws://localhost:8765/ws/web')
let debounceTimer = null;
const lightboxImage = ref(null);
let repaintDebounceTimer = null;
const lightboxOverlay = ref(null);
const imageRenderKey = ref(0);

// --- 图片放大功能的状态 (这部分不变) ---
const lightboxImageSrc = ref(null);
const isLightboxVisible = computed(() => !!lightboxImageSrc.value);
const chatImages = ref([]); // 存储聊天记录中所有图片的URL
const currentImageIndex = ref(-1); // 当前放大图片的索引

const isPrevButtonDisabled = computed(() => currentImageIndex.value <= 0);
const isNextButtonDisabled = computed(() => currentImageIndex.value >= chatImages.value.length - 1);

// --- 用于图片缩放和拖动的状态 (这部分不变) ---
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const startDragX = ref(0);
const startDragY = ref(0);

// --- 计算属性，用于动态生成 transform 样式 (这部分不变) ---
const imageTransform = computed(() => {
  return `scale(${scale.value}) translate(${translateX.value}px, ${translateY.value}px)`;
});

// --- 计算属性 (这部分不变) ---
const statusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connecting': return '正在连接...'
    case 'connected': return '连接成功'
    case 'disconnected': return '已断开连接'
    case 'error': return '连接错误'
    default: return '未知状态'
  }
})

const statusClass = computed(() => {
  return {
    connecting: connectionStatus.value === 'connecting',
    connected: connectionStatus.value === 'connected',
    disconnected: connectionStatus.value === 'disconnected' || connectionStatus.value === 'error',
  }
})

// --- 消息渲染辅助函数 (这部分不变) ---
const renderContent = (content) => {
  const htmlParts = content.map(msg => {
    switch (msg.type) {
      case 'text':
      case 'markdown':
        const safeHtml = escapeHtml(msg.data);
        const formattedHtml = safeHtml.replace(/\n/g, '<br>');
        return `<div>${formattedHtml}</div>`;
      case 'image':
        if (msg.data && typeof msg.data === 'string') {
          let src = msg.data;
          if (src.startsWith('base64://')) {
            src = `data:image/jpeg;base64,${src.substring(9)}`; 
          } else if (src.startsWith('link://')) {
            src = src.substring(7);
          }
          return `<img src="${src}" alt="image" class="chat-image" />`;
        }
        return '<div>[图片]</div>';
      default:
        return null;
    }
  });
  return htmlParts.filter(part => part).join('');
}

const escapeHtml = (unsafe) => {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// --- 图片放大相关函数 (这部分不变) ---
const handleMessageClick = (event) => {
  const target = event.target;
  if (target.tagName === 'IMG' && target.classList.contains('chat-image')) {
    // 1. 更新所有图片列表
    const allImageElements = messageContainer.value.querySelectorAll('img.chat-image');
    chatImages.value = Array.from(allImageElements).map(img => img.src);
    
    // 2. 找到当前点击图片的索引
    const clickedSrc = target.src;
    const index = chatImages.value.findIndex(src => src === clickedSrc);

    if (index !== -1) {
      // 3. 设置当前索引和图片SRC
      currentImageIndex.value = index;
      lightboxImageSrc.value = clickedSrc;
    }
  }
}

const closeLightbox = () => {
  lightboxImageSrc.value = null;
  // --- NEW: 重置索引 ---
  currentImageIndex.value = -1; 
  chatImages.value = [];
  // ---
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
  isDragging.value = false;
  clearTimeout(repaintDebounceTimer); 
  imageRenderKey.value = 0;
}

const resetImageTransform = () => {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
};


const showPrevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
    lightboxImageSrc.value = chatImages.value[currentImageIndex.value];
    resetImageTransform(); // 切换图片时重置缩放和位置
  }
}

const showNextImage = () => {
  if (currentImageIndex.value < chatImages.value.length - 1) {
    currentImageIndex.value++;
    lightboxImageSrc.value = chatImages.value[currentImageIndex.value];
    resetImageTransform(); // 切换图片时重置缩放和位置
  }
}

// --- 图片缩放/拖动相关函数 (这部分不变) ---
const handleWheel = (event) => {
  event.preventDefault(); 
  const zoomSpeed = 0.1;
  if (event.deltaY < 0) {
    scale.value = Math.min(scale.value + zoomSpeed, 5);
  } else {
    scale.value = Math.max(scale.value - zoomSpeed, 0.5);
  }
  
  if (scale.value <= 1) {
    translateX.value = 0;
    translateY.value = 0;
  }
  clearTimeout(repaintDebounceTimer);
  repaintDebounceTimer = setTimeout(forceRepaint, 150);
}

const forceRepaint = () => {
  imageRenderKey.value++;
};

const handleMouseDown = (event) => {
  if (scale.value <= 1) return;
  event.preventDefault();
  isDragging.value = true;
  startDragX.value = event.clientX - translateX.value;
  startDragY.value = event.clientY - translateY.value;
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
}

const handleMouseMove = (event) => {
  if (isDragging.value) {
    translateX.value = event.clientX - startDragX.value;
    translateY.value = event.clientY - startDragY.value;
  }
}

const handleMouseUp = () => {
  isDragging.value = false;
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
}


// --- MODIFIED START: WebSocket 消息处理 ---
const connectWebSocket = () => {
  if (ws.value) {
    ws.value.close();
  }
  connectionStatus.value = 'connecting'
  // messages.value = []
  try {
    ws.value = new WebSocket(wsUrl.value);
  } catch (error) {
    console.error('创建 WebSocket 失败: 无效的URL?', error);
    connectionStatus.value = 'error';
    messages.value.push({ type: 'system', text: `连接失败：无效的URL "${wsUrl.value}"` });
    ws.value = null;
    return;
  }
  ws.value.onopen = () => {
    connectionStatus.value = 'connected'
    messages.value.push({ type: 'system', text: `已连接到 ${wsUrl.value}` })
  }
  ws.value.onmessage = async (event) => {
    try {
      let messageText;
      if (event.data instanceof Blob) {
        messageText = await event.data.text();
      } else if (event.data instanceof ArrayBuffer) {
        messageText = new TextDecoder('utf-8').decode(event.data);
      } else {
        messageText = event.data;
      }
      const messageData = JSON.parse(messageText);

      if (messageData.content) {
        // 分离主内容和按钮内容
        const mainContent = messageData.content.filter(c => c.type !== 'buttons');
        const buttonContent = messageData.content.find(c => c.type === 'buttons');
        const buttons = buttonContent ? buttonContent.data.flat() : [];

        const renderedHtml = renderContent(mainContent);
        
        console.log('Received button data:', JSON.stringify(buttons));
        
        // 只有在有HTML内容或有按钮时才显示消息
        if ((renderedHtml && renderedHtml.trim() !== '') || buttons.length > 0) {
          messages.value.push({
            type: 'received',
            html: renderedHtml,
            buttons: buttons, // 新增：将按钮数组添加到消息对象
            sender: messageData.sender || { nickname: '服务器', avatar: 'https://s2.loli.net/2023/03/25/bareSdYcsmRPOyZ.png' } 
          });
          scrollToBottom();
        } else {
          console.log('收到一条空消息或仅包含不支持内容的消息，已忽略。', messageData);
        }
      }
    } catch (error) {
      console.error('解析消息失败:', error, '原始数据:', event.data)
      messages.value.push({ type: 'system', text: '收到一条无法解析的消息' })
    }
  };
  ws.value.onclose = () => {
    connectionStatus.value = 'disconnected'
    console.log('WebSocket 连接已关闭')
    messages.value.push({ type: 'system', text: '与服务器的连接已断开' })
    ws.value = null;
  }
  ws.value.onerror = (error) => {
    connectionStatus.value = 'error'
    console.error('WebSocket 错误:', error)
    messages.value.push({ type: 'system', text: '连接出现错误' })
    ws.value = null;
  }
}
// --- MODIFIED END ---

const cancelConnection = () => {
  if (ws.value) {
    console.log('用户取消连接尝试...');
    ws.value.close();
  }
}

const sendMessage = (text) => {
  if (connectionStatus.value !== 'connected' || !ws.value || !text.trim()) {
    return
  }
  const messageToSend = {
    bot_id: 'web',
    bot_self_id: 'web-client-001',
    msg_id: `msg_${Date.now()}`,
    user_type: 'direct',
    group_id: null,
    user_id: 'user_web_01',
    sender: { nickname: '我', avatar: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png' },
    user_pm: 3,
    content: [ { type: 'text', data: text } ]
  }
  const jsonString = JSON.stringify(messageToSend);
  const encoder = new TextEncoder();
  const binaryData = encoder.encode(jsonString);
  ws.value.send(binaryData);
  messages.value.push({
    type: 'sent',
    html: escapeHtml(text),
    sender: messageToSend.sender,
    buttons: []
  });
  // newMessage.value = '' // 这行不能在这里，否则会影响按钮功能
  scrollToBottom()
}

// --- NEW FEATURE START ---
const sendInputMessage = () => {
  sendMessage(newMessage.value);
  newMessage.value = '';
}

const resendMessage = (text) => {
  if (!text || !text.trim()) return;
  sendMessage(text);
}
// --- NEW FEATURE END ---

// --- NEW FUNCTION START: 处理按钮点击 ---
const handleButtonClick = (button) => {
  if (connectionStatus.value !== 'connected' || !ws.value) {
    console.warn('无法发送按钮回调：WebSocket未连接。');
    return;
  }
  
  // 从按钮的 'data' 字段构建要发送的消息
  // 结构模仿 sendMessage 函数
  const messageToSend = {
    bot_id: 'web',
    bot_self_id: 'web-client-001',
    msg_id: `msg_${Date.now()}`,
    user_type: 'direct',
    group_id: null,
    user_id: 'user_web_01',
    // 发送者信息可以保持和普通消息一致
    sender: { nickname: '我', avatar: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png' },
    user_pm: 3,
    // 核心：按钮的 data 作为 text 内容发送
    content: [ { type: 'text', data: button.data } ]
  };

  console.log('发送按钮点击事件:', messageToSend);

  const jsonString = JSON.stringify(messageToSend);
  const encoder = new TextEncoder();
  const binaryData = encoder.encode(jsonString);
  ws.value.send(binaryData);
  
  // 根据要求，点击按钮后不渲染新的“我已发送”消息
}
// --- NEW FUNCTION END ---


const scrollToBottom = () => { 
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// --- 生命周期钩子和侦听器 (这部分不变) ---
watch(wsUrl, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`URL 发生变化，将从 ${oldUrl} 重新连接到 ${newUrl}`);
      connectWebSocket();
    }, 500); 
  }
});
onMounted(() => {
  connectWebSocket()
})
onUnmounted(() => {
  clearTimeout(debounceTimer); 
  if (ws.value) {
    ws.value.onclose = null; 
    ws.value.close()
  }
})
</script>

<template>
  <div class="chat-container">
    <header class="chat-header">
      <div class="url-input-wrapper">
        <label for="ws-url-input">URL:</label>
        <input 
          id="ws-url-input"
          type="text"
          v-model="wsUrl"
          placeholder="输入 WebSocket URL..."
          class="url-input"
          :disabled="connectionStatus === 'connecting'"
        />
      </div>
      <div class="status-wrapper">
        <span class="status" :class="statusClass">{{ statusText }}</span>
        <button v-if="connectionStatus === 'connecting'" @click="cancelConnection" class="cancel-button">
          取消
        </button>
      </div>
    </header>

    <div class="message-list" ref="messageContainer" @click="handleMessageClick">
      <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="`message-${msg.type}`">
        <template v-if="msg.type === 'system'">
          <div class="system-message">{{ msg.text }}</div>
        </template>
        <template v-else>
          <img :src="msg.sender.avatar" alt="avatar" class="avatar" />
          <div class="message-content">
            <div class="sender-name">{{ msg.sender.nickname }}</div>
            <div v-if="msg.html" class="message-bubble" v-html="msg.html"></div>
            <div v-if="msg.buttons && msg.buttons.length" class="button-container">
              <button
                v-for="(button, btnIndex) in msg.buttons"
                :key="btnIndex"
                class="chat-button"
                :class="{
                  'style-0': button.style === 0,
                  'style-1': button.style === 1
                }"
                @click="handleButtonClick(button)"
              >
                {{ button.text || button.data }}
              </button>
            </div>
          </div>
          <button v-if="msg.type === 'sent'" class="resend-button" @click="resendMessage(msg.html)">
            +1
          </button>
          </template>
      </div>
    </div>

    <footer class="chat-input-area">
      <div v-if="connectionStatus !== 'connected'" class="reconnect-overlay">
        <button @click="connectWebSocket" class="reconnect-button">
          {{ connectionStatus === 'connecting' ? '连接中...' : '重新连接' }}
        </button>
      </div>
      <textarea
        v-model="newMessage"
        @keydown.enter.prevent="sendInputMessage"
        placeholder="输入消息..."
        class="message-input"
        :disabled="connectionStatus !== 'connected'"
      ></textarea>
      <button @click="sendInputMessage" class="send-button" :disabled="connectionStatus !== 'connected'">发送</button>
    </footer>

    <Teleport to="body">
    <div 
      v-if="isLightboxVisible" 
      class="lightbox-overlay" 
      @click="closeLightbox"
      @wheel="handleWheel"
    >
      <button 
        class="lightbox-nav-button prev"
        :disabled="isPrevButtonDisabled"
        @click.stop="showPrevImage"
      >
        &#10094;
      </button>
      <img 
        :key="imageRenderKey"
        ref="lightboxImage"
        :src="lightboxImageSrc" 
        alt="Enlarged image" 
        class="lightbox-image"
        :class="{ 'is-dragging': isDragging }"
        :style="{ transform: imageTransform }"
        @click.stop
        @mousedown="handleMouseDown"
      />

      <button 
        class="lightbox-nav-button next"
        :disabled="isNextButtonDisabled"
        @click.stop="showNextImage"
      >
        &#10095;
      </button>
      </div>
  </Teleport>
  </div>
</template>

<style scoped>
/* --- 图片放大层的样式 (这部分不变) --- */
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

.message-bubble :deep(img.chat-image) { 
  max-width: 200px; 
  border-radius: 8px; 
  display: block; 
  cursor: pointer;
  transition: opacity 0.2s;
}

.message-bubble :deep(img.chat-image:hover) {
  opacity: 0.8;
}

/* --- NEW STYLES START: 按钮样式 --- */
.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  /* 确保容器不会超出消息内容区域 */
  max-width: 100%; 
}

.chat-button {
  padding: 6px 12px;
  border-radius: 6px;
  background-color: transparent;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  border: 1px solid;
  /* --- ADD THESE THREE LINES --- */
  min-width: 40px; /* Ensures a minimum clickable area */
  display: inline-flex; /* Improves alignment of content */
  justify-content: center; /* Centers the text horizontally */
}

/* Style 0: 灰色线框 */
.chat-button.style-0 {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
.chat-button.style-0:hover {
  background-color: var(--vp-c-bg-mute);
  border-color: var(--vp-c-text-2);
}

/* Style 1: 蓝色线框 */
.chat-button.style-1 {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}
.chat-button.style-1:hover {
  background-color: var(--vp-c-brand-soft);
}

/* 在发送者气泡中的按钮样式调整 */
.message-sent .chat-button.style-0 {
    border-color: rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.9);
}
.message-sent .chat-button.style-0:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: white;
}
.message-sent .chat-button.style-1 {
  border-color: white;
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
}
.message-sent .chat-button.style-1:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
/* --- NEW STYLES END --- */


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
  z-index: 1000000; /* 确保在图片之上 */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s, opacity 0.2s;
  user-select: none; /* 防止双击选中文本 */
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

/* --- 原有样式 (这部分不变) --- */
.status-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.cancel-button {
  background-color: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  border-radius: 99px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}
.cancel-button:hover {
  border-color: var(--vp-c-brand-light);
  color: var(--vp-c-brand-light);
}
.chat-container { display: flex; flex-direction: column; height: 100%; font-family: sans-serif; background-color: var(--vp-c-bg); color: var(--vp-c-text-1); }
.chat-header { padding: 0.8rem 1rem; border-bottom: 1px solid var(--vp-c-divider); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; gap: 1rem; }
.url-input-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
  background-color: var(--vp-c-bg-soft);
  border-radius: 6px;
  padding: 0 0.5rem;
  border: 1px solid var(--vp-c-divider);
}
.url-input-wrapper label {
  font-size: 0.9em;
  font-weight: bold;
  color: var(--vp-c-text-2);
  margin-right: 0.5rem;
}
.url-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0.5rem 0.2rem;
  font-size: 0.9em;
  color: var(--vp-c-text-1);
}
.url-input:focus {
  outline: none;
}
.url-input:disabled {
  opacity: 0.7;
}
.status { font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 99px; color: white; transition: background-color 0.3s; flex-shrink: 0;}
.status.connecting { background-color: #f0ad4e; }
.status.connected { background-color: #5cb85c; }
.status.disconnected { background-color: #d9534f; }
.message-list { flex-grow: 1; overflow-y: auto; padding: 1rem; }
.message-item { display: flex; margin-bottom: 1rem; max-width: 80%; }
.avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; flex-shrink: 0; }
.message-content { display: flex; flex-direction: column; }
.sender-name { font-size: 0.8em; color: var(--vp-c-text-2); margin-bottom: 4px; }
.message-bubble { padding: 0.6rem 1rem; border-radius: 12px; background-color: var(--vp-c-bg-mute); word-wrap: break-word; overflow-wrap: break-word; }
.message-sent { margin-left: auto; flex-direction: row-reverse; }
.message-sent .avatar { margin-right: 0; margin-left: 12px; }
.message-sent .sender-name { text-align: right; }
.message-sent .message-bubble { background-color: var(--vp-c-brand); color: white; }
.message-item.message-system {
    max-width: 100% !important
}
.system-message {
  width: 100%;
  text-align: center;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.5rem;
}
.chat-input-area { display: flex; padding: 1rem; border-top: 1px solid var(--vp-c-divider); position: relative; flex-shrink: 0; }
.message-input { flex-grow: 1; padding: 0.6rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; resize: none; background-color: var(--vp-c-bg-soft); color: var(--vp-c-text-1); font-family: inherit; font-size: 1rem; line-height: 1.5; height: 50px; }
.message-input:focus { outline: none; border-color: var(--vp-c-brand); }
.send-button { margin-left: 0.8rem; padding: 0 1.2rem; border: none; background-color: var(--vp-c-brand); color: white; border-radius: 8px; cursor: pointer; font-weight: bold; }
.send-button:disabled { background-color: var(--vp-c-gray-soft); cursor: not-allowed; }
.reconnect-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(2px); display: flex; justify-content: center; align-items: center; z-index: 10; }
@media (prefers-color-scheme: dark) { .reconnect-overlay { background-color: rgba(0, 0, 0, 0.6); } }
.reconnect-button { padding: 0.8rem 1.5rem; font-size: 1rem; font-weight: bold; color: white; background-color: #5cb85c; border: none; border-radius: 8px; cursor: pointer; }
.reconnect-button:hover { opacity: 0.9; }

/* NEW FEATURE START */
.message-sent {
  align-items: flex-end; /* 垂直居右对齐，确保按钮在气泡旁边 */
}

.resend-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: transparent;
  color: rgb(48, 179, 255);
  border: 1px solid rgb(48, 179, 255);
  font-weight: bold;
  font-size: 0.8rem;
  margin-right: 8px; /* 调整按钮与气泡的间距 */
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 防止按钮被压缩 */
}

.resend-button:hover {
  background-color: var(--vp-c-brand-soft);
}


.message-sent .resend-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 调整发送气泡的布局，让按钮和气泡在一行 */
.message-sent {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-end; /* align items to the bottom */
  gap: 8px;
}

/* 调整发送气泡的头像和气泡的布局 */
.message-sent .avatar {
  margin-right: 0;
  margin-left: 0; /* Remove left margin on sent messages */
}

.message-sent .message-content {
  align-items: flex-end; /* Align sender name and bubble to the right */
  margin-right: 0;
}

/* 确保气泡和按钮之间有间距 */
.message-sent .message-bubble {
  margin-right: 0;
}
/* NEW FEATURE END */
</style>