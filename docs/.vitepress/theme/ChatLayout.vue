<script setup>
import ChatInterface from './components/ChatInterface.vue'
</script>

<template>
  <div class="chat-page-container">
    <ChatInterface />
  </div>
</template>

<style>
div.Content > .container {
  width: 100% !important;
  padding: 0 !important;
}
.chat-container {
    width: 100%
}
</style>

<style scoped>
.chat-page-container {
  /* 让聊天界面填满父容器的高度 */
  height: calc(100vh - var(--vp-nav-height));
  display: flex;
  width: 100%;
}
</style>