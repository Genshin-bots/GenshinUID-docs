<script setup lang="ts">
import type { Message } from './ChatMessageList.vue'

const props = defineProps<{
  message: Message
}>()

const emit = defineEmits<{
  (e: 'resend', text: string): void
  (e: 'buttonClick', button: { text: string; data: string; style?: number }): void
  (e: 'imageClick', src: string): void
}>()

function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === 'IMG' && target.classList.contains('chat-image'))
    emit('imageClick', (target as HTMLImageElement).src)
}
</script>

<template>
  <div class="message-item" :class="`message-${message.type}`">
    <template v-if="message.type === 'system'">
      <div class="system-message">
        {{ message.text }}
      </div>
    </template>
    <template v-else>
      <img :src="message.sender?.avatar" alt="avatar" class="avatar">
      <div class="message-content">
        <div class="sender-name">
          {{ message.sender?.nickname }}
        </div>
        <div v-if="message.html" class="message-bubble" @click="handleClick" v-html="message.html" />
        <div v-if="message.buttons && message.buttons.length" class="button-container">
          <button
            v-for="(button, btnIndex) in message.buttons"
            :key="btnIndex"
            class="chat-button"
            :class="{
              'style-0': button.style === 0,
              'style-1': button.style === 1,
            }"
            @click="$emit('buttonClick', button)"
          >
            {{ button.text || button.data }}
          </button>
        </div>
      </div>
      <button v-if="message.type === 'sent'" class="resend-button" @click="$emit('resend', message.text || '')">
        +1
      </button>
    </template>
  </div>
</template>

<style scoped>
.message-item {
  display: flex;
  margin-bottom: 1rem;
  max-width: 80%;
}

.message-item.message-system {
  max-width: 100% !important;
}

.system-message {
  width: 100%;
  text-align: center;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.5rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.message-content {
  display: flex;
  flex-direction: column;
}

.sender-name {
  font-size: 0.8em;
  color: var(--vp-c-text-2);
  margin-bottom: 4px;
}

.message-bubble {
  padding: 0.6rem 1rem;
  border-radius: 12px;
  background-color: var(--vp-c-bg-mute);
  word-wrap: break-word;
  overflow-wrap: break-word;
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

.message-sent {
  margin-left: auto;
  flex-direction: row-reverse;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.message-sent .avatar {
  margin-right: 0;
  margin-left: 0;
}

.message-sent .message-content {
  align-items: flex-end;
  margin-right: 0;
}

.message-sent .sender-name {
  text-align: right;
}

.message-sent .message-bubble {
  background-color: var(--vp-c-brand);
  color: white;
  margin-right: 0;
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
  margin-right: 8px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resend-button:hover {
  background-color: var(--vp-c-brand-soft);
}

.message-sent .resend-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Button styles */
.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
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
  min-width: 40px;
  display: inline-flex;
  justify-content: center;
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
</style>
