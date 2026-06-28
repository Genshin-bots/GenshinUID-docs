'use client';

import { Copy, MessageSquareText, RotateCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, NodeContent } from './types';

interface ChatMessageItemProps {
  message: ChatMessage;
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

const avatarMap: Record<string, string> = {
  Wuyi无疑: 'https://s2.loli.net/2023/10/05/GHjJNWBP4nezgIU.png',
  GsCore: 'https://s2.loli.net/2023/03/25/bareSdYcsmRPOyZ.png',
};

function getNodePreview(nodeData: NodeContent[]): string {
  if (!nodeData || nodeData.length === 0) return '[聊天记录]';
  const count = nodeData.length;
  const first = nodeData[0];
  let preview = `${first.username}: `;
  const firstMsg = first.messages?.[0];
  if (firstMsg) {
    const content = firstMsg.data?.substring(0, 20) || '[消息]';
    preview +=
      content + (firstMsg.data && firstMsg.data.length > 20 ? '…' : '');
  }
  if (count > 1) preview += ` 等 ${count} 条消息`;
  return preview;
}

export function ChatMessageItem({
  message,
  onResend,
  onButtonClick,
  onImageClick,
  onCopy,
  onNodeClick,
}: ChatMessageItemProps) {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (message.type === 'system') {
    return (
      <div className="fd-system-message">
        <span className="fd-system-pill">{message.text}</span>
      </div>
    );
  }

  if (message.type === 'node') {
    return (
      <div
        ref={ref}
        className={`fd-message-item fd-message-node ${shown ? 'shown' : ''}`}
      >
        <img
          src={message.sender?.avatar}
          alt="avatar"
          className="fd-msg-avatar"
        />
        <div className="fd-msg-content">
          <div className="fd-sender-name">{message.sender?.nickname}</div>
          <button
            type="button"
            className="fd-msg-bubble fd-node-message-bubble"
            onClick={() => message.nodeData && onNodeClick(message.nodeData)}
          >
            <div className="fd-node-preview">
              <span className="fd-node-icon">
                <MessageSquareText size={16} strokeWidth={2} />
              </span>
              <span className="fd-node-text">
                {getNodePreview(message.nodeData || [])}
              </span>
            </div>
            <div className="fd-node-hint">点击查看详情</div>
          </button>
        </div>
      </div>
    );
  }

  const avatar =
    message.sender?.avatar || avatarMap[message.sender?.nickname || ''] || '';

  return (
    <div
      ref={ref}
      className={`fd-message-item fd-message-${message.type} ${shown ? 'shown' : ''}`}
    >
      <img src={avatar} alt="avatar" className="fd-msg-avatar" />
      <div className="fd-msg-content">
        <div className="fd-sender-name">{message.sender?.nickname}</div>
        {message.html && (
          <div
            className="fd-msg-bubble"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (
                target.tagName === 'IMG' &&
                target.classList.contains('chat-image')
              ) {
                onImageClick((target as HTMLImageElement).src);
              }
            }}
            dangerouslySetInnerHTML={{ __html: message.html }}
          />
        )}
        {message.buttons && message.buttons.length > 0 && (
          <div className="fd-button-container">
            {message.buttons.map((button, idx) => (
              <button
                key={idx}
                type="button"
                className={`fd-chat-button ${button.style === 1 ? 'style-1' : 'style-0'}`}
                onClick={() => onButtonClick(button)}
              >
                {button.text || button.data}
              </button>
            ))}
          </div>
        )}
      </div>
      {message.type === 'sent' && (
        <div className="fd-msg-actions">
          <button
            type="button"
            className="fd-icon-button"
            onClick={() => onCopy({ text: message.text, html: message.html })}
            title="复制到输入框"
            aria-label="复制到输入框"
          >
            <Copy size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="fd-icon-button"
            onClick={() => onResend(message.text || message.html || '')}
            title="重新发送"
            aria-label="重新发送"
          >
            <RotateCw size={14} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
