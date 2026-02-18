import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export interface WebSocketMessage {
  bot_id: string
  bot_self_id: string
  msg_id: string
  user_type: string
  group_id: string | null
  user_id: string
  sender: {
    nickname: string
    avatar: string
  }
  user_pm: number
  content: Array<{
    type: string
    data: string
  }>
}

export interface UseWebSocketReturn {
  ws: Ref<WebSocket | null>
  connectionStatus: Ref<'connecting' | 'connected' | 'disconnected' | 'error'>
  wsUrl: Ref<string>
  statusText: ComputedRef<string>
  statusClass: ComputedRef<Record<string, boolean>>
  connect: () => void
  disconnect: () => void
  sendMessage: (message: WebSocketMessage) => void
  cancelConnection: () => void
}

export function useWebSocket(
  onMessage: (data: any) => void,
  onError?: (error: any) => void
): UseWebSocketReturn {
  const ws = ref<WebSocket | null>(null)
  const connectionStatus = ref<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const wsUrl = ref('ws://localhost:8765/ws/web')

  const statusText = computed(() => {
    switch (connectionStatus.value) {
      case 'connecting': return '正在连接...'
      case 'connected': return '连接成功'
      case 'disconnected': return '已断开连接'
      case 'error': return '连接错误'
      default: return '未知状态'
    }
  })

  const statusClass = computed(() => ({
    connecting: connectionStatus.value === 'connecting',
    connected: connectionStatus.value === 'connected',
    disconnected: connectionStatus.value === 'disconnected' || connectionStatus.value === 'error',
  }))

  function connect() {
    if (ws.value)
      ws.value.close()

    connectionStatus.value = 'connecting'

    try {
      ws.value = new WebSocket(wsUrl.value)
    }
    catch (error) {
      console.error('创建 WebSocket 失败: 无效的URL?', error)
      connectionStatus.value = 'error'
      if (onError)
        onError(`连接失败：无效的URL "${wsUrl.value}"`)
      ws.value = null
      return
    }

    ws.value.onopen = () => {
      connectionStatus.value = 'connected'
    }

    ws.value.onmessage = async (event) => {
      try {
        let messageText: string
        if (event.data instanceof Blob)
          messageText = await event.data.text()
        else if (event.data instanceof ArrayBuffer)
          messageText = new TextDecoder('utf-8').decode(event.data)
        else
          messageText = event.data

        const messageData = JSON.parse(messageText)
        onMessage(messageData)
      }
      catch (error) {
        console.error('解析消息失败:', error, '原始数据:', event.data)
        if (onError)
          onError('收到一条无法解析的消息')
      }
    }

    ws.value.onclose = () => {
      connectionStatus.value = 'disconnected'
      // console.log('WebSocket 连接已关闭')
      ws.value = null
    }

    ws.value.onerror = (error) => {
      connectionStatus.value = 'error'
      console.error('WebSocket 错误:', error)
      ws.value = null
    }
  }

  function disconnect() {
    if (ws.value) {
      ws.value.onclose = null
      ws.value.close()
      ws.value = null
    }
  }

  function sendMessage(message: WebSocketMessage) {
    if (connectionStatus.value !== 'connected' || !ws.value)
      return

    const jsonString = JSON.stringify(message)
    const encoder = new TextEncoder()
    const binaryData = encoder.encode(jsonString)
    ws.value.send(binaryData)
  }

  function cancelConnection() {
    if (ws.value) {
      // console.log('用户取消连接尝试...')
      ws.value.close()
    }
  }

  // Watch for URL changes and reconnect
  watch(wsUrl, (newUrl, oldUrl) => {
    if (newUrl !== oldUrl && connectionStatus.value !== 'disconnected') {
      // console.log(`URL 变化: ${oldUrl} -> ${newUrl}, 重新连接...`)
      disconnect()
      setTimeout(() => {
        connect()
      }, 100)
    }
  })

  return {
    ws,
    connectionStatus,
    wsUrl,
    statusText,
    statusClass,
    connect,
    disconnect,
    sendMessage,
    cancelConnection,
  }
}
