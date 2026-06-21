'use client'

import { useEffect, useRef } from 'react'
import { ChatMessageItem } from './ChatMessageItem'
import type { ChatMessage, NodeContent } from './types'

interface ChatMessageListProps {
  messages: ChatMessage[]
  onResend: (text: string) => void
  onButtonClick: (button: { text: string; data: string; style?: number }) => void
  onImageClick: (src: string) => void
  onCopy: (payload: { text?: string; html?: string }) => void
  onNodeClick: (nodeData: NodeContent[]) => void
}

export function ChatMessageList({
  messages,
  onResend,
  onButtonClick,
  onImageClick,
  onCopy,
  onNodeClick,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <div ref={containerRef} className="fd-message-list">
      {messages.map((msg, idx) => (
        <ChatMessageItem
          key={idx}
          message={msg}
          onResend={onResend}
          onButtonClick={onButtonClick}
          onImageClick={onImageClick}
          onCopy={onCopy}
          onNodeClick={onNodeClick}
        />
      ))}
    </div>
  )
}
