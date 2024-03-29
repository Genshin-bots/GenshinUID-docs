<script lang="ts" setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  nickname: string
  color: string
  avatar: string
  tag: string
  type: string
}>()

const colorMap = {
  Alice: '#cc0066',
  Bob: '#00994d',
  Carol: '#1e90ff',
  Dave: '#f4a460',
  群友A: '#f4a460',
  干扰用户: '#f4a460',
}

const avatarMap = {
  Wuyi无疑: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png',
  GsCore: 'https://s2.loli.net/2023/03/25/bareSdYcsmRPOyZ.png',
}

const typeMap = {
  GsCore: 'tip',
  Wuyi无疑: 'danger',
}

const tagMap = {
  GsCore: '机器人',
  Wuyi无疑: '用户',
}

const shown = ref(false)
const active = ref(false)
const moving = ref(false)
const root = ref<HTMLElement>()

const backgroundColor = computed(() => props.color || colorMap[props.nickname])
const avatar = computed(() => props.avatar || avatarMap[props.nickname])
const tag = computed(() => props.tag || tagMap[props.nickname])
const type = computed(() => props.type || typeMap[props.nickname])

function getPrevious() {
  let last: Element
  for (const current of document.querySelectorAll('.chat-message')) {
    if (current === root.value)
      return last
    last = current
  }
}

watch(active, (value) => {
  if (!value)
    return shown.value = false
  const prev = getPrevious()
  if (!prev)
    return appear()
  const rect = prev.getBoundingClientRect()
  if (rect.bottom < 0)
    return appear()
  const prevExposed = prev.__vue__.exposed as typeof exposed
  if (prevExposed.moving.value || !prevExposed.shown.value)
    prevExposed.onappear(appear)
  else
    appear()
})

let appearCallback = () => {}

function appear() {
  shown.value = true
  moving.value = true
  setTimeout(() => {
    moving.value = false
    appearCallback()
  }, 100)
}

function handleScroll() {
  const rect = root.value.getBoundingClientRect()
  if (rect.top < innerHeight)
    active.value = true
  // active.value = rect.top < innerHeight
}

const instance = getCurrentInstance()

const exposed = {
  moving,
  shown,
  onappear(callback: any) {
    appearCallback = callback
  },
}

defineExpose(exposed)

onMounted(() => {
  root.value.__vue__ = instance
  handleScroll()
  addEventListener('scroll', handleScroll)
  addEventListener('resize', handleScroll)
})

onBeforeUnmount(() => {
  removeEventListener('scroll', handleScroll)
  removeEventListener('resize', handleScroll)
})
</script>

<template>
  <div ref="root" class="chat-message" :class="{ shown }">
    <img v-if="avatar" class="avatar" :src="avatar">
    <div v-else class="avatar" :style="{ backgroundColor }">
      {{ nickname[0] }}
    </div>
    <div class="nickname">
      {{ nickname }}
      <Badge :type="type" :text="tag" />
    </div>
    <div class="message-box">
      <slot>&nbsp;</slot>
    </div>
  </div>
</template>

<style lang="scss">
$avatar-size: 2.8rem;
$msgbox-left: 4.2rem;

.chat-message {
  position: relative;
  margin: 1rem 0;
  opacity: 0;
  transform: translateX(-20%);
  transition: transform 0.3s ease-out, opacity 0.3s ease;

  &.shown {
    opacity: 1;
    transform: translateX(0);
  }

  .avatar {
    width: $avatar-size;
    height: $avatar-size;
    position: absolute;
    border-radius: 100%;
    transform: translateY(-1px);
    user-select: none;
    pointer-events: none;
    text-align: center;
    line-height: $avatar-size;
    font-size: 1.6rem;
    color: white;
    font-family: "Comic Sans MS";
  }

  .nickname {
    user-select: none;
    position: relative;
    margin: 0 0 0.4rem $msgbox-left;
    font-weight: bold;
    font-size: 0.9rem;
  }
}

.chat-message:not(.no-padding) .message-box {
  padding: 0.5rem 0.7rem;
}

.chat-message .message-box {
  position: relative;
  margin-left: $msgbox-left;
  width: fit-content;
  border-radius: 0.5rem;
  background-color: var(--vp-c-bg);
  word-break: break-all;
  line-height: 26px !important;

  > img {
    border-radius: 0.5rem;
  }

  img {
    vertical-align: middle;
  }

  p > img {
    margin: 0.2rem 0;
  }

  &::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 0px;
    width: 12px;
    height: 12px;
    border: 0 solid transparent;
    border-bottom-width: 8px;
    border-bottom-color: currentColor;
    border-radius: 0 0 0 32px;
    color: var(--vp-c-bg);
  }

  p {
    margin: 0 !important;
    line-height: 26px !important;
  }

  p.indent-1 {
    padding-left: 1rem;
  }

  p.indent-2 {
    padding-left: 2rem;
  }

  blockquote {
    font-size: 0.9rem;
    margin: 0 0 0.2rem;
    background-color: #f3f6f9;
    border: none;
    border-radius: 0.5rem;
    padding: 0.2rem 0.6rem;
    background-color: var(--vp-c-bg-alt);
    color: var(--vp-c-text-2);
  }
}
</style>
