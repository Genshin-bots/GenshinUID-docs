'use client';

import { MessageSquareText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '@/lib/media';
import type { NodeContent, NodeMessage } from './types';

interface NodeMessagePanelProps {
  visible: boolean;
  nodeData: NodeContent[];
  onClose: () => void;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMessage(msg: NodeMessage): string {
  switch (msg.type) {
    case 'text':
      return escapeHtml(msg.data).replace(/\n/g, '<br>');
    case 'image': {
      // 旧实现里还要剥一下 Python bytes 字面量（`b'...'`），
      // 新的 resolveMediaUrl 不识别这种格式，所以这里显式处理一下。
      let src = msg.data;
      if (src.startsWith('base64://') && src.includes("b'")) {
        const match = src.match(/base64:\/\/(.+)$/);
        if (match) {
          let inner = match[1];
          if (inner.startsWith("b'") && inner.endsWith("'"))
            inner = inner.slice(2, -1);
          src = `base64://${inner}`;
        }
      }
      return `<img src="${resolveMediaUrl(src, 'image')}" alt="image" class="node-image" />`;
    }
    case 'audio':
    case 'record': {
      return `<audio controls src="${resolveMediaUrl(msg.data, 'audio')}" class="node-audio" />`;
    }
    case 'video': {
      // 旧 video 路径里同样有剥 Python bytes 的细节，沿用
      let src = msg.data;
      if (src.startsWith('base64://')) {
        const after = src.substring('base64://'.length);
        if (after.startsWith("b'") && after.endsWith("'")) {
          src = `base64://${after.slice(2, -1)}`;
        }
      }
      return `<video controls src="${resolveMediaUrl(src, 'video')}" class="node-video" />`;
    }
    default:
      return `<span class="node-unknown">${escapeHtml(msg.data)}</span>`;
  }
}

export function NodeMessagePanel({
  visible,
  nodeData,
  onClose,
}: NodeMessagePanelProps) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setFade(true), 10);
      return () => clearTimeout(t);
    } else {
      setFade(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fd-node-panel-overlay ${fade ? 'fade-in' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fd-node-panel">
        <div className="fd-node-panel-header">
          <span className="fd-node-panel-title">
            <MessageSquareText size={16} strokeWidth={2} />
            聊天记录
          </span>
          <button
            type="button"
            className="fd-node-panel-close"
            onClick={onClose}
            aria-label="关闭"
            title="关闭"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>
        <div className="fd-node-panel-content">
          {nodeData.map((node, index) => (
            <div key={index} className="fd-node-item">
              <div className="fd-node-item-header">
                <img
                  src={node.avatar}
                  alt="avatar"
                  className="fd-node-avatar"
                />
                <span className="fd-node-username">服务器</span>
              </div>
              <div className="fd-node-messages">
                {node.messages.map((msg, msgIndex) => (
                  <div
                    key={msgIndex}
                    className="fd-node-message"
                    dangerouslySetInnerHTML={{ __html: renderMessage(msg) }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
