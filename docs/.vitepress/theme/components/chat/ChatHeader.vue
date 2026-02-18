<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  wsUrl: string
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  isGroupMode: boolean
  groupId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:wsUrl', value: string): void
  (e: 'toggleMode'): void
  (e: 'cancelConnection'): void
}>()

const statusText = computed(() => {
  switch (props.connectionStatus) {
    case 'connecting': return '正在连接...'
    case 'connected': return '连接成功'
    case 'disconnected': return '已断开连接'
    case 'error': return '连接错误'
    default: return '未知状态'
  }
})

const statusClass = computed(() => ({
  connecting: props.connectionStatus === 'connecting',
  connected: props.connectionStatus === 'connected',
  disconnected: props.connectionStatus === 'disconnected' || props.connectionStatus === 'error',
}))
</script>

<template>
  <header class="chat-header">
    <div class="url-input-wrapper">
      <label for="ws-url-input">URL:</label>
      <input
        id="ws-url-input"
        :value="wsUrl"
        type="text"
        placeholder="输入 WebSocket URL..."
        class="url-input"
        :disabled="connectionStatus === 'connecting'"
        @input="$emit('update:wsUrl', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <div class="mode-toggle-wrapper">
      <span class="mode-label">私聊</span>
      <button
        class="mode-toggle-switch"
        :class="{ 'group-mode': isGroupMode }"
        :title="isGroupMode ? `群聊模式 - ${groupId}` : '私聊模式'"
        aria-label="切换聊天模式"
        @click="$emit('toggleMode')"
      >
        <span class="toggle-slider" />
      </button>
      <span class="mode-label">群聊</span>
    </div>

    <div class="status-wrapper">
      <span class="status" :class="statusClass">{{ statusText }}</span>
      <button v-if="connectionStatus === 'connecting'" class="cancel-button" @click="$emit('cancelConnection')">
        取消
      </button>
    </div>
  </header>
</template>

<style scoped>
.chat-header {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  gap: 1rem;
}

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

.status-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.status {
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  color: white;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.status.connecting {
  background-color: #f0ad4e;
}

.status.connected {
  background-color: #5cb85c;
}

.status.disconnected {
  background-color: #d9534f;
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

.mode-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 1rem;
}

.mode-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.mode-toggle-switch {
  position: relative;
  width: 56px;
  height: 28px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background-color: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  padding: 0;
  margin: 0;
  background-image: none;
}

.mode-toggle-switch .toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: block;
}

.mode-toggle-switch.group-mode {
  background-color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.mode-toggle-switch.group-mode .toggle-slider {
  transform: translateX(28px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.mode-toggle-switch:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.mode-toggle-switch:active {
  transform: scale(0.95);
}

.mode-toggle-switch.group-mode:hover {
  box-shadow: 0 0 0 3px rgba(var(--vp-c-brand), 0.3);
}
</style>
