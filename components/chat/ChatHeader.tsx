'use client'

import type { ConnectionStatus } from '@/hooks/useWebSocket'

interface ChatHeaderProps {
  wsUrl: string
  setWsUrl: (url: string) => void
  connectionStatus: ConnectionStatus
  isGroupMode: boolean
  groupId: string | null
  onToggleMode: () => void
  onCancelConnection: () => void
}

export function ChatHeader({
  wsUrl,
  setWsUrl,
  connectionStatus,
  isGroupMode,
  groupId,
  onToggleMode,
  onCancelConnection,
}: ChatHeaderProps) {
  const statusText = (() => {
    switch (connectionStatus) {
      case 'connecting': return '正在连接...'
      case 'connected': return '连接成功'
      case 'disconnected': return '已断开连接'
      case 'error': return '连接错误'
      default: return '未知状态'
    }
  })()

  const statusClass = (() => {
    if (connectionStatus === 'connecting') return 'connecting'
    if (connectionStatus === 'connected') return 'connected'
    return 'disconnected'
  })()

  return (
    <header className="fd-chat-header">
      <div className="fd-url-input-wrapper">
        <label htmlFor="ws-url-input">URL:</label>
        <input
          id="ws-url-input"
          value={wsUrl}
          type="text"
          placeholder="输入 WebSocket URL..."
          className="fd-url-input"
          disabled={connectionStatus === 'connecting'}
          onChange={e => setWsUrl(e.target.value)}
        />
      </div>

      <div className="fd-mode-toggle-wrapper">
        <span className="fd-mode-label">私聊</span>
        <button
          type="button"
          className={`fd-mode-toggle-switch ${isGroupMode ? 'group-mode' : ''}`}
          title={isGroupMode ? `群聊模式 - ${groupId}` : '私聊模式'}
          aria-label="切换聊天模式"
          onClick={onToggleMode}
        >
          <span className="fd-toggle-slider" />
        </button>
        <span className="fd-mode-label">群聊</span>
      </div>

      <div className="fd-status-wrapper">
        <span className={`fd-status fd-status-${statusClass}`}>{statusText}</span>
        {connectionStatus === 'connecting' && (
          <button type="button" className="fd-cancel-button" onClick={onCancelConnection}>
            取消
          </button>
        )}
      </div>
    </header>
  )
}
