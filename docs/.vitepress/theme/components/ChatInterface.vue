<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'

// --- 响应式状态定义 ---
const ws = ref(null)
const messages = ref([])
const newMessage = ref('')
const connectionStatus = ref('disconnected')
const messageContainer = ref(null)

// ✅ 1. 将 WebSocket URL 改为响应式 ref
const wsUrl = ref('ws://localhost:8765/ws/web')
let debounceTimer = null;

// --- 计算属性，用于UI显示 ---
const statusText = computed(() => {
  // ... (此部分代码不变)
  switch (connectionStatus.value) {
    case 'connecting': return '正在连接...'
    case 'connected': return '连接成功'
    case 'disconnected': return '已断开连接'
    case 'error': return '连接错误'
    default: return '未知状态'
  }
})

const statusClass = computed(() => {
  // ... (此部分代码不变)
  return {
    connecting: connectionStatus.value === 'connecting',
    connected: connectionStatus.value === 'connected',
    disconnected: connectionStatus.value === 'disconnected' || connectionStatus.value === 'error',
  }
})

// --- 消息渲染辅助函数 ---
const renderContent = (content) => {
  const htmlParts = content.map(msg => {
    switch (msg.type) {
      case 'text':
      case 'markdown':
        return `<div>${escapeHtml(msg.data)}</div>`;

      case 'image':
        if (msg.data && typeof msg.data === 'string') {
          let src = msg.data;
          if (src.startsWith('base64:///')) {
            src = `data:image/jpeg;base64,${src.substring(10)}`;
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
  // ... (此部分代码不变)
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}


// --- WebSocket 核心逻辑 ---
const connectWebSocket = () => {
  // 如果当前有连接，先断开
  if (ws.value) {
    ws.value.close();
  }
  
  connectionStatus.value = 'connecting'
  messages.value = []
  
  // ... (onopen, onmessage, onclose, onerror 逻辑基本不变)
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
          // 这一步不变，生成 HTML 内容
          const renderedHtml = renderContent(messageData.content);
          
          // ✅ 新增判断：只有在内容不为空时，才显示这条消息
          if (renderedHtml && renderedHtml.trim() !== '') {
            messages.value.push({
              type: 'received',
              html: renderedHtml,
              sender: messageData.sender || { nickname: '服务器', avatar: 'https://s2.loli.net/2023/03/25/bareSdYcsmRPOyZ.png' } 
            });
            scrollToBottom();
          } else {
            // （可选）可以在控制台打印一条日志，表示我们收到并忽略了一条空内容消息
            console.log('收到一条仅包含不支持内容的消息，已忽略。', messageData);
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

// --- 发送消息 ---
const sendMessage = () => {
  // ... (此部分代码不变)
  if (connectionStatus.value !== 'connected' || !ws.value || !newMessage.value.trim()) {
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
    content: [ { type: 'text', data: newMessage.value } ]
  }
  const jsonString = JSON.stringify(messageToSend);
  const encoder = new TextEncoder();
  const binaryData = encoder.encode(jsonString);
  ws.value.send(binaryData);
  messages.value.push({
    type: 'sent',
    html: escapeHtml(newMessage.value),
    sender: messageToSend.sender
  });
  newMessage.value = ''
  scrollToBottom()
}

// --- 滚动到底部 ---
const scrollToBottom = () => { /* ... (不变) ... */ 
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// ✅ 3. 添加 watch 来监听 URL 变化并自动重连
watch(wsUrl, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl) {
    // 使用防抖，防止用户在输入过程中频繁重连
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`URL 发生变化，将从 ${oldUrl} 重新连接到 ${newUrl}`);
      connectWebSocket();
    }, 500); // 停止输入 500ms 后执行
  }
});

// --- Vue 生命周期钩子 ---
onMounted(() => {
  connectWebSocket()
})

onUnmounted(() => {
  clearTimeout(debounceTimer); // 组件销毁时清除计时器
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
      <span class="status" :class="statusClass">{{ statusText }}</span>
    </header>

    <div class="message-list" ref="messageContainer">
      <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="`message-${msg.type}`">
        <template v-if="msg.type === 'system'">
          <div class="system-message">{{ msg.text }}</div>
        </template>
        <template v-else>
          <img :src="msg.sender.avatar" alt="avatar" class="avatar" />
          <div class="message-content">
            <div class="sender-name">{{ msg.sender.nickname }}</div>
            <div class="message-bubble" v-html="msg.html"></div>
          </div>
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
        @keydown.enter.prevent="sendMessage"
        placeholder="输入消息..."
        class="message-input"
        :disabled="connectionStatus !== 'connected'"
      ></textarea>
      <button @click="sendMessage" class="send-button" :disabled="connectionStatus !== 'connected'">发送</button>
    </footer>
  </div>
</template>

<style scoped>
/* ... (大部分样式不变) ... */
.chat-container { display: flex; flex-direction: column; height: 100%; font-family: sans-serif; background-color: var(--vp-c-bg); color: var(--vp-c-text-1); }
.chat-header { padding: 0.8rem 1rem; border-bottom: 1px solid var(--vp-c-divider); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; gap: 1rem; }

/* ✅ 5. 为新的 URL 输入框添加样式 */
.url-input-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1; /* 占据可用空间 */
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
.message-bubble :deep(img.chat-image) { max-width: 200px; border-radius: 8px; display: block; }
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
</style>
