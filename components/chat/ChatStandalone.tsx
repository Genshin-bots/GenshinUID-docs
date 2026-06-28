'use client';

import { ChatInterface } from './ChatInterface';

/**
 * /[lang]/chat 独立全页聊天外壳
 * --------------------------------------------------------------------------
 * · 与 /sp/chat 共用同一套 ChatInterface，视觉仅差在"是否带 docs 网格"：
 *   - /sp/chat → <ChatLayout />：嵌入 docs 网格，main 列内嵌进文章容器
 *   - /chat   → <ChatStandalone />：脱离 docs 网格，铺满整屏（除顶栏）
 * · `not-prose` 屏蔽 DocsBody 自带的 prose 排版
 * · `.fd-chat-standalone` 用于全局 CSS 把聊天卡的高度从 main 列高 改为
 *   「视口高度 - 顶栏 3.5rem」，让聊天列表能真正滚动到底
 */
export function ChatStandalone() {
  return (
    <div className="fd-chat-page-container fd-chat-page-container--standalone not-prose">
      <ChatInterface />
    </div>
  );
}
