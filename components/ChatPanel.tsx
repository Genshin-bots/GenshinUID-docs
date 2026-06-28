import type { ReactNode } from 'react';

/**
 * 静态聊天示例组件（复刻原 VitePress 的 <ChatPanel>/<ChatMessage>）。
 * 用于在文档里展示"向 Bot 发送 xxx → Bot 回复 yyy"的对话示例。
 *
 * 用法（MDX）：
 * <ChatPanel title="绑定UID">
 *   <ChatMessage nickname="Wuyi无疑">绑定uid100740568</ChatMessage>
 *   <ChatMessage nickname="GsCore">绑定UID100740568成功！</ChatMessage>
 * </ChatPanel>
 *
 * 注意：消息文本若含有 `{ }`，在 MDX 里会被当作 JS 表达式，需用反引号包成行内代码。
 */

// 昵称里含 core / bot / gsuid 视为「机器人」（左侧气泡），其余视为用户（右侧气泡）。
const BOT_PATTERN = /core|bot|gsuid/i;

function isBot(nickname?: string) {
  return !!nickname && BOT_PATTERN.test(nickname);
}

interface ChatPanelProps {
  title?: string;
  children?: ReactNode;
}

export function ChatPanel({ title, children }: ChatPanelProps) {
  return (
    <div className="fd-chatpanel not-prose">
      <div className="fd-chatpanel-bar">
        <span className="fd-chatpanel-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        {title && <span className="fd-chatpanel-title">{title}</span>}
      </div>
      <div className="fd-chatpanel-body">{children}</div>
    </div>
  );
}

interface ChatMessageProps {
  nickname?: string;
  /** 显式指定是否为机器人气泡（默认按昵称推断） */
  bot?: boolean;
  /** 群聊中「其他用户」的标签，如「用户」。带 tag 的消息显示在左侧、样式区别于「你」 */
  tag?: string;
  /** 兼容旧文档的属性（如 type="danger"），目前仅占位不强制上色 */
  type?: string;
  children?: ReactNode;
}

export function ChatMessage({
  nickname,
  bot,
  tag,
  children,
}: ChatMessageProps) {
  const fromBot = bot ?? isBot(nickname);
  const side = fromBot ? 'is-bot' : tag ? 'is-other' : 'is-user';
  return (
    <div className={`fd-chatmsg ${side}`}>
      <div className="fd-chatmsg-avatar" aria-hidden>
        {nickname?.trim()?.[0] ?? '?'}
      </div>
      <div className="fd-chatmsg-main">
        {nickname && (
          <div className="fd-chatmsg-name">
            {nickname}
            {tag && <span className="fd-chatmsg-tag">{tag}</span>}
          </div>
        )}
        <div className="fd-chatmsg-bubble">{children}</div>
      </div>
    </div>
  );
}
