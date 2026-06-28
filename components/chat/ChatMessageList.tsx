'use client';

import { useEffect, useRef } from 'react';
import { ChatMessageItem } from './ChatMessageItem';
import type { ChatMessage, NodeContent } from './types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  onResend: (text: string) => void;
  onButtonClick: (button: {
    text: string;
    data: string;
    style?: number;
  }) => void;
  onImageClick: (src: string) => void;
  onCopy: (payload: { text?: string; html?: string }) => void;
  onNodeClick: (nodeData: NodeContent[]) => void;
}

export function ChatMessageList({
  messages,
  onResend,
  onButtonClick,
  onImageClick,
  onCopy,
  onNodeClick,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // 「是否贴底」标记：用户手动向上滚（查看历史消息）时改为 false，
  // 用户重新滚到底时再回到 true。这样新消息到来时若用户在看历史，就不强制拉回。
  const stuckToBottomRef = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      // 距底 < 16px 视为「贴底」
      const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      stuckToBottomRef.current = distanceToBottom < 16;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    // 只有在贴底时才自动滚动；用户在翻历史时不打扰
    if (stuckToBottomRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages.length]);

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
  );
}
