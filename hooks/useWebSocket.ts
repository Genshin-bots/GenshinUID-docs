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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [wsUrl, setWsUrl] = useState(defaultUrl)

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    setConnectionStatus('connecting')

    try {
      wsRef.current = new WebSocket(wsUrl)
    }
    catch (error) {
      console.error('创建 WebSocket 失败: 无效的URL?', error)
      setConnectionStatus('error')
      onError?.(`连接失败：无效的URL "${wsUrl}"`)
      wsRef.current = null
      return
    }

    wsRef.current.onopen = () => {
      setConnectionStatus('connected')
    }

    wsRef.current.onmessage = async (event) => {
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
        console.error('解析消息失败:', error, '原始数据:', event.data)
        onError?.('收到一条无法解析的消息')
      }
    }

    wsRef.current.onclose = () => {
      setConnectionStatus('disconnected')
      wsRef.current = null
    }

    wsRef.current.onerror = (error) => {
      setConnectionStatus('error')
      console.error('WebSocket 错误:', error)
      wsRef.current = null
    }
  }, [wsUrl, onMessage, onError])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
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
      wsRef.current.close()
    }
  }, [])

  // Watch URL changes
  useEffect(() => {
    if (connectionStatus !== 'disconnected') {
      disconnect()
      setTimeout(() => {
        connect()
      }, 100)
    }
  }, [wsUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

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
