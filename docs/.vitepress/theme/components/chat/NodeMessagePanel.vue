<script setup lang="ts">
import type { NodeContent, NodeMessage } from './ChatMessageList.vue'

const props = defineProps<{
  visible: boolean
  nodeData: NodeContent[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleOverlayClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('node-panel-overlay'))
    emit('close')
}

// 渲染单条消息内容
function renderMessage(msg: NodeMessage): string {
  switch (msg.type) {
    case 'text':
      return escapeHtml(msg.data).replace(/\n/g, '<br>')
    case 'image': {
      let src = msg.data
      if (src.startsWith('base64://'))
        src = `data:image/jpeg;base64,${src.substring(9)}`
      else if (src.startsWith('link://'))
        src = src.substring(7)
      return `<img src="${src}" alt="image" class="node-image" />`
    }
    case 'audio':
    case 'record': {
      let audioSrc = msg.data
      if (audioSrc.startsWith('base64://'))
        audioSrc = `data:audio/mpeg;base64,${audioSrc.substring(9)}`
      else if (audioSrc.startsWith('link://'))
        audioSrc = audioSrc.substring(7)
      return `<audio controls src="${audioSrc}" class="node-audio" />`
    }
    case 'video': {
      let videoSrc = msg.data
      if (videoSrc.startsWith('base64://')) {
        let base64Data = msg.data.substring(9)
        if (base64Data.startsWith('b\'') && base64Data.endsWith('\''))
          base64Data = base64Data.slice(2, -1)
        videoSrc = `data:video/mp4;base64,${base64Data}`
      }
      else if (videoSrc.startsWith('link://')) {
        videoSrc = videoSrc.substring(7)
      }
      return `<video controls src="${videoSrc}" class="node-video" />`
    }
    default:
      return `<span class="node-unknown">${escapeHtml(msg.data)}</span>`
  }
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;')
}

// 获取消息的简短预览（用于消息列表）
function getMessagePreview(msg: NodeMessage): string {
  if (msg.type === 'text')
    return msg.data.length > 30 ? `${msg.data.substring(0, 30)}...` : msg.data

  return `[${msg.type}]`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="node-panel-overlay"
        @click="handleOverlayClick"
      >
        <div class="node-panel">
          <div class="node-panel-header">
            <span class="node-panel-title">聊天记录</span>
            <button class="node-panel-close" @click="$emit('close')">
              ×
            </button>
          </div>
          <div class="node-panel-content">
            <div
              v-for="(node, index) in nodeData"
              :key="index"
              class="node-item"
            >
              <div class="node-item-header">
                <img :src="node.avatar" alt="avatar" class="node-avatar">
                <span class="node-username">服务器</span>
              </div>
              <div class="node-messages">
                <div
                  v-for="(msg, msgIndex) in node.messages"
                  :key="msgIndex"
                  class="node-message"
                  v-html="renderMessage(msg)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.node-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.node-panel {
  background-color: var(--vp-c-bg);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  height: 60vh;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.node-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.node-panel-title {
  font-size: 1.1em;
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.node-panel-close {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.node-panel-close:hover {
  background-color: var(--vp-c-bg-soft);
}

.node-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.node-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.node-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.node-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.node-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.node-username {
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.node-messages {
  margin-left: 40px;
}

.node-message {
  padding: 10px 14px;
  margin-bottom: 8px;
  background-color: #e8e8e8 !important;
  border: 1px solid #d0d0d0 !important;
  border-radius: 12px;
  color: #333333;
  font-size: 0.9em;
}

/* v-html 内容的样式需要用 :deep() */
.node-message :deep(div),
.node-message :deep(p),
.node-message :deep(span),
.node-message :deep(br) {
  background-color: transparent !important;
  border: none !important;
  color: #333333 !important;
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .node-message {
    background-color: #3a3a3a !important;
    border-color: #555555 !important;
    color: #e0e0e0 !important;
  }

  .node-message :deep(div),
  .node-message :deep(p),
  .node-message :deep(span),
  .node-message :deep(br) {
    color: #e0e0e0 !important;
  }
}

.node-message :deep(.node-image) {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
}

.node-message :deep(.node-audio) {
  max-width: 100%;
}

.node-message :deep(.node-video) {
  max-width: 100%;
  max-height: 200px;
}

.node-message :deep(.node-unknown) {
  color: var(--vp-c-text-3);
  font-style: italic;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
/* 非 scoped 样式，确保 v-html 内容能应用样式 */
.node-message {
  padding: 10px 14px !important;
  margin-bottom: 8px !important;
  background-color: #e8e8e8 !important;
  border: 1px solid #d0d0d0 !important;
  border-radius: 12px !important;
}

.node-message div,
.node-message p,
.node-message span,
.node-message br {
  background-color: transparent !important;
  border: none !important;
  color: #333333 !important;
}

@media (prefers-color-scheme: dark) {
  .node-message {
    background-color: #3a3a3a !important;
    border-color: #555555 !important;
  }

  .node-message div,
  .node-message p,
  .node-message span {
    color: #e0e0e0 !important;
  }
}
</style>
