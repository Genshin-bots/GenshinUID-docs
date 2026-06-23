'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ChatHeader } from './ChatHeader'
import { ChatInputArea } from './ChatInputArea'
import { ChatMessageList } from './ChatMessageList'
import { ImageLightbox } from './ImageLightbox'
import { NodeMessagePanel } from './NodeMessagePanel'
import { useWebSocket, type ConnectionStatus } from '@/hooks/useWebSocket'
import { useLightbox } from '@/hooks/useLightbox'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useContentItems } from '@/hooks/useContentItems'
import { useChatMode } from '@/hooks/useChatMode'
import { useMessageRenderer } from '@/hooks/useMessageRenderer'
import type { ChatMessage, NodeContent } from './types'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isNodePanelVisible, setIsNodePanelVisible] = useState(false)
  const [currentNodeData, setCurrentNodeData] = useState<NodeContent[]>([])

  const { isMarkdownMode, renderContent, toggleMarkdownMode } = useMessageRenderer()
  const { isGroupMode, groupId, toggleMode: toggleChatMode, getModeParams } = useChatMode()
  const lightbox = useLightbox()
  const fileUpload = useFileUpload()
  const { items: contentItems, addItem, removeItem, moveItem, clearItems } = useContentItems()

  /**
   * 追加一条系统消息（连接状态 / 模式切换 / 错误等）。
   * 用 setMessages 包装一层，所有 system 消息都从这条路径走，便于后续
   * 统一插「时间戳 / 国际化」等元数据。
   */
  const pushSystemMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, { type: 'system', text }])
  }, [])

  const onWsMessage = useCallback((data: any) => {
    if (data.content) {
      const nodeContent = data.content.find((c: any) => c.type === 'node')
      if (nodeContent && Array.isArray(nodeContent.data)) {
        const nodeData: NodeContent[] = nodeContent.data.map((msg: any) => ({
          id: msg.id || String(Date.now()),
          username: msg.username || msg.sender?.nickname || '用户',
          avatar: msg.avatar || msg.sender?.avatar || 'https://s2.loli.net/2023/03/25/bareSdYcsmRPOyZ.png',
          messages: Array.isArray(msg.messages) ? msg.messages : [{ type: msg.type || 'text', data: msg.data || '' }],
        }))
        setMessages(prev => [...prev, {
          type: 'node',
          nodeData,
          sender: data.sender || { nickname: '服务器', avatar: 'https://s2.loli.net/2023/03/25/bareSdYcsmRPOyZ.png' },
        }])
        return
      }

      const mainContent = data.content.filter((c: any) => c.type !== 'buttons')
      const buttonContent = data.content.find((c: any) => c.type === 'buttons')
      const buttons = buttonContent ? buttonContent.data.flat() : []
      const renderedHtml = renderContent(mainContent)

      if ((renderedHtml && renderedHtml.trim() !== '') || buttons.length > 0) {
        setMessages(prev => [...prev, {
          type: 'received',
          html: renderedHtml,
          buttons,
          sender: data.sender || { nickname: '服务器', avatar: 'https://s2.loli.net/2023/03/25/bareSdYcsmRPOyZ.png' },
        }])
      }
    }
  }, [renderContent])

  const onWsError = useCallback((errorText: string) => {
    pushSystemMessage(errorText)
  }, [pushSystemMessage])

  const { wsUrl, setWsUrl, connectionStatus, connect: connectWs, disconnect: disconnectWs, sendMessage: sendWsMessage, cancelConnection } = useWebSocket(onWsMessage, onWsError)

  // 连接状态变化：把"已连接 / 断开 / 出错"刷成 system 消息
  // 用 ref 记录上一态，避免 wsUrl 单独变化时（自动重连）连刷两条
  const prevStatusRef = useRef<ConnectionStatus | null>(null)
  useEffect(() => {
    const prev = prevStatusRef.current
    if (connectionStatus === 'connected' && prev !== 'connected') {
      pushSystemMessage(`已连接到 ${wsUrl}`)
    }
    else if (connectionStatus === 'disconnected' && prev === 'connected') {
      pushSystemMessage('与服务器的连接已断开')
    }
    else if (connectionStatus === 'error' && prev !== 'error') {
      pushSystemMessage('连接出现错误')
    }
    prevStatusRef.current = connectionStatus
  }, [connectionStatus, wsUrl, pushSystemMessage])

  // 群聊 / 私聊模式切换：把切换事件刷成 system 消息（沿用 VitePress 时代的反馈）
  useEffect(() => {
    if (isGroupMode) {
      pushSystemMessage(`已切换到群聊模式（群组ID: ${groupId ?? ''}）`)
    }
    else {
      pushSystemMessage('已切换到私聊模式')
    }
    // 只在 isGroupMode 变化时触发，避免 groupId 变化重复刷
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGroupMode])

  useEffect(() => {
    connectWs()
    return () => disconnectWs()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const processFile = useCallback(async (file: File) => {
    const item = await fileUpload.processFile(file)
    if (item) addItem(item)
  }, [fileUpload, addItem])

  const sendRichMessage = useCallback(() => {
    const content: Array<{ type: string; data: string }> = []

    if (newMessage.trim()) {
      content.push({
        type: isMarkdownMode ? 'markdown' : 'text',
        data: newMessage,
      })
    }

    content.push(...contentItems.map(item => ({
      type: item.type,
      data: item.data,
    })))

    if (content.length === 0) return
    if (connectionStatus !== 'connected') return

    const { userType, groupId: currentGroupId } = getModeParams()

    const messageToSend = {
      bot_id: 'web',
      bot_self_id: 'web-client-001',
      msg_id: `msg_${Date.now()}`,
      user_type: userType,
      group_id: currentGroupId,
      user_id: 'user_web_01',
      sender: { nickname: '我', avatar: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png' },
      user_pm: 3,
      content,
    }

    sendWsMessage(messageToSend)

    const renderedHtml = renderContent(content as any)
    setMessages(prev => [...prev, {
      type: 'sent',
      html: renderedHtml,
      sender: messageToSend.sender,
      buttons: [],
    }])

    setNewMessage('')
    clearItems()
  }, [newMessage, isMarkdownMode, contentItems, connectionStatus, getModeParams, sendWsMessage, renderContent, clearItems])

  const sendSimpleMessage = useCallback((text: string) => {
    if (connectionStatus !== 'connected' || !text.trim()) return
    const { userType, groupId: currentGroupId } = getModeParams()

    const hasHtmlTags = /<[^>]+>/.test(text)
    const content: Array<{ type: string; data: string }> = []

    if (hasHtmlTags) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = text
      const textDiv = tempDiv.cloneNode(true) as HTMLDivElement
      const images = textDiv.querySelectorAll('img')
      images.forEach(img => img.remove())
      const plainText = (textDiv.textContent || textDiv.innerText || '').trim()
      if (plainText) content.push({ type: 'text', data: plainText })

      const originalImages = tempDiv.querySelectorAll('img')
      originalImages.forEach((img) => {
        const src = img.getAttribute('src') || ''
        if (src) content.push({ type: 'image', data: src })
      })
    }
    else {
      content.push({ type: 'text', data: text.trim() })
    }

    if (content.length === 0) return

    const messageToSend = {
      bot_id: 'web',
      bot_self_id: 'web-client-001',
      msg_id: `msg_${Date.now()}`,
      user_type: userType,
      group_id: currentGroupId,
      user_id: 'user_web_01',
      sender: { nickname: '我', avatar: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png' },
      user_pm: 3,
      content,
    }
    sendWsMessage(messageToSend)

    const renderedHtml = renderContent(content as any)
    setMessages(prev => [...prev, {
      type: 'sent',
      html: renderedHtml,
      sender: messageToSend.sender,
      buttons: [],
    }])
  }, [connectionStatus, getModeParams, sendWsMessage, renderContent])

  const handleButtonClick = useCallback((button: { text: string; data: string; style?: number }) => {
    if (connectionStatus !== 'connected') return
    const messageToSend = {
      bot_id: 'web',
      bot_self_id: 'web-client-001',
      msg_id: `msg_${Date.now()}`,
      user_type: 'direct',
      group_id: null,
      user_id: 'user_web_01',
      sender: { nickname: '我', avatar: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png' },
      user_pm: 3,
      content: [{ type: 'text', data: button.data }],
    }
    sendWsMessage(messageToSend)
  }, [connectionStatus, sendWsMessage])

  const handleImageClick = useCallback((src: string) => {
    const allImages: string[] = []
    messages.forEach((msg) => {
      if (msg.html) {
        const div = document.createElement('div')
        div.innerHTML = msg.html
        const imgs = div.querySelectorAll('img.chat-image')
        imgs.forEach((img) => {
          const imgSrc = (img as HTMLImageElement).src
          if (!allImages.includes(imgSrc)) allImages.push(imgSrc)
        })
      }
    })
    const index = allImages.findIndex(s => s === src)
    lightbox.openLightbox(src, allImages, index >= 0 ? index : 0)
  }, [messages, lightbox])

  const handleNodeClick = useCallback((nodeData: NodeContent[]) => {
    setCurrentNodeData(nodeData)
    setIsNodePanelVisible(true)
  }, [])

  const handleCopyToInput = useCallback((payload: { text?: string; html?: string }) => {
    const contentToCopy = payload.text || payload.html || ''
    clearItems()

    if (contentToCopy.includes('<')) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = contentToCopy
      const textDiv = tempDiv.cloneNode(true) as HTMLDivElement
      const images = textDiv.querySelectorAll('img')
      images.forEach(img => img.remove())
      const plainText = (textDiv.textContent || textDiv.innerText || '').trim()
      setNewMessage(plainText)

      images.forEach((img, index) => {
        const src = img.getAttribute('src') || ''
        if (src) {
          let fileName = `image_${index + 1}.png`
          if (src.startsWith('data:')) {
            const match = src.match(/data:image\/([a-zA-Z]+);/)
            if (match) fileName = `image_${index + 1}.${match[1]}`
          }
          else {
            const urlParts = src.split('/')
            const lastPart = urlParts[urlParts.length - 1]
            if (lastPart && lastPart.includes('.')) fileName = lastPart
          }
          addItem({ type: 'image', data: src, fileName, preview: src })
        }
      })
    }
    else {
      setNewMessage(contentToCopy.trim())
    }
  }, [addItem, clearItems])

  return (
    <div className="fd-chat-container">
      <ChatHeader
        wsUrl={wsUrl}
        setWsUrl={setWsUrl}
        connectionStatus={connectionStatus}
        isGroupMode={isGroupMode}
        groupId={groupId}
        onToggleMode={toggleChatMode}
        onCancelConnection={cancelConnection}
      />

      <ChatMessageList
        messages={messages}
        onResend={sendSimpleMessage}
        onButtonClick={handleButtonClick}
        onImageClick={handleImageClick}
        onCopy={handleCopyToInput}
        onNodeClick={handleNodeClick}
      />

      <ChatInputArea
        value={newMessage}
        onChange={setNewMessage}
        connectionStatus={connectionStatus}
        isMarkdownMode={isMarkdownMode}
        contentItems={contentItems}
        isDragOver={fileUpload.isDragOver}
        fileInputRef={fileUpload.fileInputRef}
        onSend={sendRichMessage}
        onReconnect={connectWs}
        onToggleMarkdown={toggleMarkdownMode}
        onRemoveContentItem={removeItem}
        onMoveContentItem={moveItem}
        onTriggerFileUpload={type => fileUpload.triggerFileUpload(fileUpload.fileInputRef, type)}
        onFileSelect={e => fileUpload.handleFileSelect(e, processFile)}
        onDragOver={fileUpload.handleDragOver}
        onDragLeave={fileUpload.handleDragLeave}
        onDrop={e => fileUpload.handleDrop(e, processFile)}
        onPaste={e => fileUpload.handlePaste(e, processFile)}
      />

      <ImageLightbox
        imageSrc={lightbox.lightboxImageSrc}
        isVisible={lightbox.isLightboxVisible}
        isPrevDisabled={lightbox.isPrevButtonDisabled}
        isNextDisabled={lightbox.isNextButtonDisabled}
        imageTransform={lightbox.imageTransform}
        isDragging={lightbox.isDragging}
        imageRenderKey={lightbox.imageRenderKey}
        onClose={lightbox.closeLightbox}
        onPrev={lightbox.showPrevImage}
        onNext={lightbox.showNextImage}
        onWheel={lightbox.handleWheel}
        onMouseDown={lightbox.handleMouseDown}
      />

      <NodeMessagePanel
        visible={isNodePanelVisible}
        nodeData={currentNodeData}
        onClose={() => setIsNodePanelVisible(false)}
      />
    </div>
  )
}
