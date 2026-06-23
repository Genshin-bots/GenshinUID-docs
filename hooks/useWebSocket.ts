'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

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

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export function useWebSocket(
  onMessage: (data: any) => void,
  onError?: (errorText: string) => void,
  defaultUrl = 'ws://localhost:8765/ws/web',
) {
  const wsRef = useRef<WebSocket | null>(null)
  // 标记当前 WebSocket 实例：用于 onerror / onclose / onmessage 等异步回调
  // 判断"这个事件是不是当前 ws 触发的"，避免旧连接的事件污染新连接 / 卸载后的状态。
  const wsInstanceIdRef = useRef(0)
  // 标记 hook 是否还活着：异步回调里 setState 前先看一眼，组件已卸载就跳过，
  // 避免 React 19 "state update on unmounted component" 警告。
  const mountedRef = useRef(true)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [wsUrl, setWsUrl] = useState(defaultUrl)

  // 组件卸载时关闭 ws + 标记 mounted = false
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (wsRef.current) {
        // 主动关闭时把所有 handler 摘掉，避免异步回调误触
        wsRef.current.onopen = null
        wsRef.current.onmessage = null
        wsRef.current.onerror = null
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  const connect = useCallback(() => {
    // 已经有连接就先关掉旧连接；旧 ws 的所有 handler 也要摘，避免脏回调
    if (wsRef.current) {
      wsRef.current.onopen = null
      wsRef.current.onmessage = null
      wsRef.current.onerror = null
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }

    setConnectionStatus('connecting')

    let ws: WebSocket
    try {
      ws = new WebSocket(wsUrl)
    }
    catch (error) {
      // 仅在组件还活着时刷状态，避免卸载后 setState
      if (mountedRef.current) {
        setConnectionStatus('error')
        onError?.(`连接失败：无效的URL "${wsUrl}"`)
      }
      return
    }

    wsRef.current = ws
    const instanceId = ++wsInstanceIdRef.current

    ws.onopen = () => {
      // 旧实例的 onopen 不应该影响当前状态
      if (instanceId !== wsInstanceIdRef.current || !mountedRef.current) return
      setConnectionStatus('connected')
    }

    ws.onmessage = async (event) => {
      if (instanceId !== wsInstanceIdRef.current || !mountedRef.current) return
      try {
        let messageText: string
        if (event.data instanceof Blob) {
          messageText = await event.data.text()
        }
        else if (event.data instanceof ArrayBuffer) {
          messageText = new TextDecoder('utf-8').decode(event.data)
        }
        else {
          messageText = event.data
        }
        const messageData = JSON.parse(messageText)
        onMessage(messageData)
      }
      catch (error) {
        // 用 console.warn：连接层错误不是「程序 bug」，不该触发 dev overlay 红屏
        console.warn('[useWebSocket] 解析消息失败:', error, '原始数据:', event.data)
        if (mountedRef.current) {
          onError?.('收到一条无法解析的消息')
        }
      }
    }

    ws.onclose = () => {
      // 主动 disconnect 时会先 onclose = null 再 close，所以这里能区分"用户主动断"和"对端掉线"
      if (instanceId !== wsInstanceIdRef.current || !mountedRef.current) return
      setConnectionStatus('disconnected')
      wsRef.current = null
    }

    ws.onerror = (event) => {
      if (instanceId !== wsInstanceIdRef.current || !mountedRef.current) return
      setConnectionStatus('error')
      // 用 console.warn 而非 console.error：
      //   - dev mode 下 console.error 会被 Next.js / React 19 拦截并显示为 error overlay，
      //     "连接失败（端口未开）"是预期场景，不该用红屏让用户以为代码崩了。
      //   - console.warn 是「已知非致命问题」的语义。
      console.warn('[useWebSocket] WebSocket 连接错误:', event)
      wsRef.current = null
    }
  }, [wsUrl, onMessage, onError])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      // 先摘 handler，让异步回调即使 fire 也会被 instanceId 检查挡掉
      wsRef.current.onopen = null
      wsRef.current.onmessage = null
      wsRef.current.onerror = null
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (connectionStatus !== 'connected' || !wsRef.current) return
    const jsonString = JSON.stringify(message)
    const encoder = new TextEncoder()
    const binaryData = encoder.encode(jsonString)
    wsRef.current.send(binaryData)
  }, [connectionStatus])

  const cancelConnection = useCallback(() => {
    if (wsRef.current) {
      // 取消时同样摘 handler
      wsRef.current.onopen = null
      wsRef.current.onmessage = null
      wsRef.current.onerror = null
      wsRef.current.onclose = null
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  // Watch URL changes
  useEffect(() => {
    if (connectionStatus !== 'disconnected') {
      disconnect()
      const timer = setTimeout(() => {
        connect()
      }, 100)
      return () => clearTimeout(timer)
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl])

  return {
    ws: wsRef,
    connectionStatus,
    wsUrl,
    setWsUrl,
    statusText: (() => {
      switch (connectionStatus) {
        case 'connecting': return '正在连接...'
        case 'connected': return '连接成功'
        case 'disconnected': return '已断开连接'
        case 'error': return '连接错误'
        default: return '未知状态'
      }
    })(),
    connect,
    disconnect,
    sendMessage,
    cancelConnection,
  }
}
