'use client';

import { Link2, Loader2, User, Users, X } from 'lucide-react';
import type { ConnectionStatus } from '@/hooks/useWebSocket';

interface ChatHeaderProps {
  wsUrl: string;
  setWsUrl: (url: string) => void;
  connectionStatus: ConnectionStatus;
  isGroupMode: boolean;
  groupId: string | null;
  onToggleMode: () => void;
  onCancelConnection: () => void;
}

const STATUS_TEXT: Record<ConnectionStatus, string> = {
  connecting: '正在连接',
  connected: '已连接',
  disconnected: '未连接',
  error: '连接错误',
};

export function ChatHeader({
  wsUrl,
  setWsUrl,
  connectionStatus,
  isGroupMode,
  groupId,
  onToggleMode,
  onCancelConnection,
}: ChatHeaderProps) {
  return (
    <header className="fd-chat-header">
      <div className="fd-url-input-wrapper">
        <span className="fd-url-icon" aria-hidden>
          <Link2 size={14} strokeWidth={2} />
        </span>
        <input
          value={wsUrl}
          type="text"
          placeholder="输入 WebSocket URL..."
          className="fd-url-input"
          disabled={connectionStatus === 'connecting'}
          onChange={(e) => setWsUrl(e.target.value)}
          aria-label="WebSocket URL"
        />
      </div>

      <div
        className="fd-mode-toggle-wrapper"
        role="group"
        aria-label="聊天模式"
      >
        <span
          className={`fd-mode-label ${!isGroupMode ? 'active' : ''}`}
          onClick={isGroupMode ? onToggleMode : undefined}
          role="button"
          tabIndex={isGroupMode ? 0 : -1}
          onKeyDown={(e) => {
            if (isGroupMode && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onToggleMode();
            }
          }}
        >
          <User size={14} strokeWidth={2} />
          <span>私聊</span>
        </span>
        <button
          type="button"
          className={`fd-mode-toggle-switch ${isGroupMode ? 'group-mode' : ''}`}
          title={isGroupMode ? `群聊模式 · ${groupId ?? ''}` : '私聊模式'}
          aria-label={isGroupMode ? '切换到私聊' : '切换到群聊'}
          aria-pressed={isGroupMode}
          onClick={onToggleMode}
        >
          <span className="fd-toggle-slider" />
        </button>
        <span
          className={`fd-mode-label ${isGroupMode ? 'active' : ''}`}
          onClick={!isGroupMode ? onToggleMode : undefined}
          role="button"
          tabIndex={!isGroupMode ? 0 : -1}
          onKeyDown={(e) => {
            if (!isGroupMode && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onToggleMode();
            }
          }}
        >
          <span>群聊</span>
          <Users size={14} strokeWidth={2} />
        </span>
      </div>

      <div className="fd-status-wrapper">
        <span
          className={`fd-status fd-status-${connectionStatus}`}
          data-status={connectionStatus}
        >
          {connectionStatus === 'connecting' && (
            <Loader2 size={12} strokeWidth={2.4} className="fd-status-spin" />
          )}
          {STATUS_TEXT[connectionStatus]}
        </span>
        {connectionStatus === 'connecting' && (
          <button
            type="button"
            className="fd-cancel-button"
            onClick={onCancelConnection}
            title="取消连接"
            aria-label="取消连接"
          >
            <X size={12} strokeWidth={2.4} />
            取消
          </button>
        )}
      </div>
    </header>
  );
}
