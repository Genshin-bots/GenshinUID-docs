'use client'

import type { ChangeEvent, ClipboardEvent, DragEvent } from 'react'
import type { ContentItem } from '@/hooks/useFileUpload'
import type { ConnectionStatus } from '@/hooks/useWebSocket'

interface ChatInputAreaProps {
  value: string
  onChange: (v: string) => void
  connectionStatus: ConnectionStatus
  isMarkdownMode: boolean
  contentItems: ContentItem[]
  isDragOver: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onSend: () => void
  onReconnect: () => void
  onToggleMarkdown: () => void
  onRemoveContentItem: (index: number) => void
  onMoveContentItem: (index: number, direction: -1 | 1) => void
  onTriggerFileUpload: (type: 'image' | 'audio' | 'video') => void
  onFileSelect: (e: ChangeEvent<HTMLInputElement>) => void
  onDragOver: (e: DragEvent) => void
  onDragLeave: (e: DragEvent) => void
  onDrop: (e: DragEvent) => void
  onPaste: (e: ClipboardEvent) => void
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
  return (
    <footer className="fd-chat-input-area">
      {connectionStatus !== 'connected' && (
        <div className="fd-reconnect-overlay">
          <button type="button" className="fd-reconnect-button" onClick={onReconnect}>
            {connectionStatus === 'connecting' ? '连接中...' : '重新连接'}
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
              <div key={index} className="fd-content-preview-item">
                {index > 0 && (
                  <button
                    type="button"
                    className="fd-move-button fd-move-up"
                    onClick={() => onMoveContentItem(index, -1)}
                  >
                    ↑
                  </button>
                )}
                {index < contentItems.length - 1 && (
                  <button
                    type="button"
                    className="fd-move-button fd-move-down"
                    onClick={() => onMoveContentItem(index, 1)}
                  >
                    ↓
                  </button>
                )}

                {item.type === 'image' && (
                  <div className="fd-preview-image">
                    <img src={item.preview} alt={item.fileName} />
                  </div>
                )}
                {item.type === 'audio' && (
                  <div className="fd-preview-audio">
                    <span className="fd-file-icon">🎵</span>
                    <span className="fd-file-name">{item.fileName}</span>
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="fd-preview-video">
                    <span className="fd-file-icon">🎬</span>
                    <span className="fd-file-name">{item.fileName}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="fd-remove-button"
                  onClick={() => onRemoveContentItem(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="fd-text-input-wrapper">
          <textarea
            value={value}
            placeholder="输入消息..."
            className="fd-message-input"
            disabled={connectionStatus !== 'connected'}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && !isMarkdownMode) {
                e.preventDefault()
                onSend()
              }
            }}
            onPaste={onPaste}
          />
        </div>

        <div className="fd-toolbar">
          <div className="fd-toolbar-left">
            <button
              type="button"
              className={`fd-tool-button ${isMarkdownMode ? 'active' : ''}`}
              title={isMarkdownMode ? '切换为普通文本' : '切换为Markdown'}
              onClick={onToggleMarkdown}
            >
              📝
            </button>
            <button
              type="button"
              className="fd-tool-button"
              disabled={connectionStatus !== 'connected'}
              title="添加图片"
              onClick={() => onTriggerFileUpload('image')}
            >
              🖼️
            </button>
            <button
              type="button"
              className="fd-tool-button"
              disabled={connectionStatus !== 'connected'}
              title="添加音频"
              onClick={() => onTriggerFileUpload('audio')}
            >
              🎵
            </button>
            <button
              type="button"
              className="fd-tool-button"
              disabled={connectionStatus !== 'connected'}
              title="添加视频"
              onClick={() => onTriggerFileUpload('video')}
            >
              🎬
            </button>
          </div>

          <div className="fd-toolbar-right">
            <button
              type="button"
              className="fd-send-button"
              disabled={connectionStatus !== 'connected' || (!value.trim() && contentItems.length === 0)}
              onClick={onSend}
            >
              发送
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
  )
}
