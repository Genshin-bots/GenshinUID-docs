<script setup lang="ts">
import type { ContentItem } from '../../composables/chat'

const props = defineProps<{
  modelValue: string
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  isMarkdownMode: boolean
  contentItems: ContentItem[]
  isDragOver: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'reconnect'): void
  (e: 'toggleMarkdown'): void
  (e: 'removeContentItem', index: number): void
  (e: 'moveContentItem', payload: { index: number; direction: -1 | 1 }): void
  (e: 'triggerFileUpload', type: 'image' | 'audio' | 'video'): void
  (e: 'dragOver', event: DragEvent): void
  (e: 'dragLeave', event: DragEvent): void
  (e: 'drop', event: DragEvent): void
  (e: 'paste', event: ClipboardEvent): void
}>()
</script>

<template>
  <footer class="chat-input-area">
    <div v-if="connectionStatus !== 'connected'" class="reconnect-overlay">
      <button class="reconnect-button" @click="$emit('reconnect')">
        {{ connectionStatus === 'connecting' ? '连接中...' : '重新连接' }}
      </button>
    </div>

    <div
      class="rich-input-container"
      :class="{ 'drag-over': isDragOver }"
      @dragover="$emit('dragOver', $event)"
      @dragleave="$emit('dragLeave', $event)"
      @drop="$emit('drop', $event)"
      @paste="$emit('paste', $event)"
    >
      <!-- Content Preview Area -->
      <div v-if="contentItems.length > 0" class="content-preview-area">
        <div
          v-for="(item, index) in contentItems"
          :key="index"
          class="content-preview-item"
        >
          <button
            v-if="index > 0"
            class="move-button move-up"
            @click="$emit('moveContentItem', { index, direction: -1 })"
          >
            ↑
          </button>
          <button
            v-if="index < contentItems.length - 1"
            class="move-button move-down"
            @click="$emit('moveContentItem', { index, direction: 1 })"
          >
            ↓
          </button>

          <div v-if="item.type === 'image'" class="preview-image">
            <img :src="item.preview" :alt="item.fileName">
          </div>
          <div v-else-if="item.type === 'audio'" class="preview-audio">
            <span class="file-icon">🎵</span>
            <span class="file-name">{{ item.fileName }}</span>
          </div>
          <div v-else-if="item.type === 'video'" class="preview-video">
            <span class="file-icon">🎬</span>
            <span class="file-name">{{ item.fileName }}</span>
          </div>

          <button class="remove-button" @click="$emit('removeContentItem', index)">
            ×
          </button>
        </div>
      </div>

      <!-- Text Input -->
      <div class="text-input-wrapper">
        <textarea
          :value="modelValue"
          placeholder="输入消息..."
          class="message-input"
          :disabled="connectionStatus !== 'connected'"
          @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
          @keydown.enter.prevent="!isMarkdownMode ? $emit('send') : null"
        />
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <button
            class="tool-button"
            :class="{ active: isMarkdownMode }"
            :title="isMarkdownMode ? '切换为普通文本' : '切换为Markdown'"
            @click="$emit('toggleMarkdown')"
          >
            📝
          </button>
          <button
            class="tool-button"
            :disabled="connectionStatus !== 'connected'"
            title="添加图片"
            @click="$emit('triggerFileUpload', 'image')"
          >
            🖼️
          </button>
          <button
            class="tool-button"
            :disabled="connectionStatus !== 'connected'"
            title="添加音频"
            @click="$emit('triggerFileUpload', 'audio')"
          >
            🎵
          </button>
          <button
            class="tool-button"
            :disabled="connectionStatus !== 'connected'"
            title="添加视频"
            @click="$emit('triggerFileUpload', 'video')"
          >
            🎬
          </button>
        </div>

        <div class="toolbar-right">
          <button
            class="send-button"
            :disabled="connectionStatus !== 'connected' || (!modelValue.trim() && contentItems.length === 0)"
            @click="$emit('send')"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.chat-input-area {
  display: flex;
  padding: 1.2rem;
  border-top: 1px solid var(--vp-c-divider);
  position: relative;
  flex-shrink: 0;
  gap: 12px;
  align-items: flex-end;
}

.reconnect-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

@media (prefers-color-scheme: dark) {
  .reconnect-overlay {
    background-color: rgba(0, 0, 0, 0.6);
  }
}

.reconnect-button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background-color: #5cb85c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.reconnect-button:hover {
  opacity: 0.9;
}

.rich-input-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 8px;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 8px;
  transition: all 0.3s ease;
}

.rich-input-container.drag-over {
  border-color: var(--vp-c-brand);
  background-color: var(--vp-c-brand-soft);
}

.content-preview-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
}

.content-preview-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 4px 8px;
}

.preview-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-audio,
.preview-video {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
}

.file-icon {
  font-size: 1.2em;
}

.file-name {
  font-size: 0.85em;
  color: var(--vp-c-text-2);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.move-button {
  width: 24px;
  height: 24px;
  border: none;
  background-color: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.move-button:hover {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
}

.remove-button {
  width: 24px;
  height: 24px;
  border: none;
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-button:hover {
  background-color: #ff4444;
  color: white;
}

.text-input-wrapper {
  width: 100%;
}

.text-input-wrapper .message-input {
  width: 100%;
  min-height: 120px;
  max-height: 400px;
  overflow-y: auto;
  box-sizing: border-box;
}

.message-input {
  flex-grow: 1;
  padding: 0.8rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  resize: none;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.message-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
  border-top: 1px solid var(--vp-c-divider);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tool-button {
  width: 36px;
  height: 36px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tool-button:hover:not(:disabled) {
  background-color: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand);
}

.tool-button.active {
  background-color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.tool-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button {
  margin-left: 0.5rem;
  padding: 0.8rem 1.5rem;
  border: none;
  background-color: var(--vp-c-brand);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  height: auto;
  min-height: 48px;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.send-button:disabled {
  background-color: var(--vp-c-gray-soft);
  cursor: not-allowed;
}
</style>
