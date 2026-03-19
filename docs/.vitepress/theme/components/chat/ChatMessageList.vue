<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import ChatMessageItem from './ChatMessageItem.vue'

// 合并转发消息中的单条消息类型
export interface NodeMessage {
  type: string
  data: string
}

// 合并转发消息段
export interface NodeContent {
  id: string
  username: string
  avatar: string
  messages: NodeMessage[]
}

export interface Message {
  type: 'sent' | 'received' | 'system' | 'node'
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
  // 合并转发相关字段
  nodeData?: NodeContent[] // 合并转发的消息列表
}

const props = defineProps<{
  messages: Message[]
}>()

const emit = defineEmits<{
  (e: 'resend', text: string): void
  (e: 'buttonClick', button: { text: string; data: string; style?: number }): void
  (e: 'imageClick', src: string): void
  (e: 'copy', payload: { text?: string; html?: string }): void
  (e: 'nodeClick', nodeData: NodeContent[]): void // 打开合并转发面板
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
      @copy="$emit('copy', $event)"
      @node-click="$emit('nodeClick', $event)"
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
