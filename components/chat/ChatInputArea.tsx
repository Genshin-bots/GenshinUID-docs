'use client';

import {
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Loader2,
  Music,
  RefreshCw,
  Send,
  Video,
  X,
} from 'lucide-react';
import type { ChangeEvent, ClipboardEvent, DragEvent } from 'react';
import type { ContentItem } from '@/hooks/useFileUpload';
import type { ConnectionStatus } from '@/hooks/useWebSocket';

interface ChatInputAreaProps {
  value: string;
  onChange: (v: string) => void;
  connectionStatus: ConnectionStatus;
  isMarkdownMode: boolean;
  contentItems: ContentItem[];
  isDragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSend: () => void;
  onReconnect: () => void;
  onToggleMarkdown: () => void;
  onRemoveContentItem: (index: number) => void;
  onMoveContentItem: (index: number, direction: -1 | 1) => void;
  onTriggerFileUpload: (type: 'image' | 'audio' | 'video') => void;
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onPaste: (e: ClipboardEvent) => void;
}

function fileTypeIcon(type: ContentItem['type']) {
  if (type === 'image') return <ImageIcon size={14} strokeWidth={2} />;
  if (type === 'audio') return <Music size={14} strokeWidth={2} />;
  return <Video size={14} strokeWidth={2} />;
}

export function ChatInputArea({
  value,
  onChange,
  connectionStatus,
  isMarkdownMode,
  contentItems,
  isDragOver,
  fileInputRef,
  onSend,
  onReconnect,
  onToggleMarkdown,
  onRemoveContentItem,
  onMoveContentItem,
  onTriggerFileUpload,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onPaste,
}: ChatInputAreaProps) {
  const disabled = connectionStatus !== 'connected';
  const canSend =
    !disabled && (value.trim().length > 0 || contentItems.length > 0);

  return (
    <footer className="fd-chat-input-area">
      {connectionStatus !== 'connected' && (
        <div className="fd-reconnect-overlay">
          <button
            type="button"
            className="fd-reconnect-button"
            onClick={onReconnect}
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? (
              <>
                <Loader2
                  size={16}
                  strokeWidth={2.4}
                  className="fd-status-spin"
                />
                <span>连接中…</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} strokeWidth={2.4} />
                <span>重新连接</span>
              </>
            )}
          </button>
        </div>
      )}

      <div
        className={`fd-rich-input-container ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {contentItems.length > 0 && (
          <div className="fd-content-preview-area">
            {contentItems.map((item, index) => (
              <div
                key={`${item.fileName}-${index}`}
                className="fd-content-preview-item"
              >
                <div className="fd-move-stack">
                  <button
                    type="button"
                    className="fd-move-button"
                    disabled={index === 0}
                    onClick={() => onMoveContentItem(index, -1)}
                    aria-label="上移"
                    title="上移"
                  >
                    <ChevronUp size={12} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    className="fd-move-button"
                    disabled={index === contentItems.length - 1}
                    onClick={() => onMoveContentItem(index, 1)}
                    aria-label="下移"
                    title="下移"
                  >
                    <ChevronDown size={12} strokeWidth={2.4} />
                  </button>
                </div>

                {item.type === 'image' ? (
                  <div className="fd-preview-image">
                    <img src={item.preview} alt={item.fileName} />
                  </div>
                ) : (
                  <div className="fd-preview-file">
                    <span className="fd-file-icon">
                      {fileTypeIcon(item.type)}
                    </span>
                    <span className="fd-file-name">{item.fileName}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="fd-remove-button"
                  onClick={() => onRemoveContentItem(index)}
                  aria-label="移除附件"
                  title="移除"
                >
                  <X size={12} strokeWidth={2.6} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="fd-text-input-wrapper">
          <textarea
            value={value}
            placeholder="输入消息… (Shift+Enter 换行，Enter 发送)"
            className="fd-message-input"
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isMarkdownMode) {
                e.preventDefault();
                onSend();
              }
            }}
            onPaste={onPaste}
            rows={3}
          />
        </div>

        <div className="fd-toolbar">
          <div className="fd-toolbar-left">
            <button
              type="button"
              className={`fd-tool-button ${isMarkdownMode ? 'active' : ''}`}
              title={isMarkdownMode ? '切换为普通文本' : '切换为 Markdown'}
              aria-label={isMarkdownMode ? '切换为普通文本' : '切换为 Markdown'}
              aria-pressed={isMarkdownMode}
              onClick={onToggleMarkdown}
            >
              <FileText size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="fd-tool-button"
              disabled={disabled}
              title="添加图片"
              aria-label="添加图片"
              onClick={() => onTriggerFileUpload('image')}
            >
              <ImageIcon size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="fd-tool-button"
              disabled={disabled}
              title="添加音频"
              aria-label="添加音频"
              onClick={() => onTriggerFileUpload('audio')}
            >
              <Music size={16} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="fd-tool-button"
              disabled={disabled}
              title="添加视频"
              aria-label="添加视频"
              onClick={() => onTriggerFileUpload('video')}
            >
              <Video size={16} strokeWidth={2} />
            </button>
          </div>

          <div className="fd-toolbar-right">
            <button
              type="button"
              className="fd-send-button"
              disabled={!canSend}
              onClick={onSend}
              title="发送消息"
            >
              <span>发送</span>
              <Send size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={onFileSelect}
      />
    </footer>
  );
}
