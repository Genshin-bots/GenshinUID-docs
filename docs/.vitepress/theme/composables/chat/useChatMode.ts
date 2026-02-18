import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export interface UseChatModeReturn {
  isGroupMode: Ref<boolean>
  groupId: Ref<string | null>
  modeText: ComputedRef<string>
  toggleMode: () => void
  generateGroupId: () => string
  getModeParams: () => { userType: string; groupId: string | null }
}

export function useChatMode(): UseChatModeReturn {
  const isGroupMode = ref(false)
  const groupId = ref<string | null>(null)

  const modeText = computed(() => isGroupMode.value ? '群聊' : '私聊')

  function generateGroupId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  function toggleMode() {
    isGroupMode.value = !isGroupMode.value

    if (isGroupMode.value) {
      if (!groupId.value)
        groupId.value = generateGroupId()
    }
  }

  function getModeParams() {
    return {
      userType: isGroupMode.value ? 'group' : 'direct',
      groupId: isGroupMode.value ? groupId.value : null,
    }
  }

  return {
    isGroupMode,
    groupId,
    modeText,
    toggleMode,
    generateGroupId,
    getModeParams,
  }
}
