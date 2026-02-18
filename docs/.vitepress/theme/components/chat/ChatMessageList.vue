<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import ChatMessageItem from './ChatMessageItem.vue'

export interface Message {
  type: 'sent' | 'received' | 'system'
  text?: string
  html?: string
  sender?: {
    nickname: string
    avatar: string
  }
  buttons?: Array<{
    text: string
    data: string
    style?: number
  }>
}

const props = defineProps<{
  messages: Message[]
}>()

const emit = defineEmits<{
  (e: 'resend', text: string): void
  (e: 'buttonClick', button: { text: string; data: string; style?: number }): void
  (e: 'imageClick', src: string): void
}>()

const messageContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value)
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  })
}

watch(() => props.messages.length, scrollToBottom, { immediate: true })

defineExpose({ scrollToBottom })
</script>

<template>
  <div ref="messageContainer" class="message-list">
    <ChatMessageItem
      v-for="(msg, index) in messages"
      :key="index"
      :message="msg"
      @resend="$emit('resend', $event)"
      @button-click="$emit('buttonClick', $event)"
      @image-click="$emit('imageClick', $event)"
    />
  </div>
</template>

<style scoped>
.message-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
}
</style>
