import { ChatInterface } from './ChatInterface'

/**
 * /sp/chat 页面的外壳：撑满 docs 网格的 main 列高（扣除顶部 fixed Header）。
 * 真正的磨砂玻璃样式由内层的 .fd-chat-container 提供。
 *
 * · `not-prose` 屏蔽 DocsBody 自带的 prose 排版，否则会把玻璃底上的字号 / 颜色
 *   强行覆盖为正文规范。
 */
export function ChatLayout() {
  return (
    <div className="fd-chat-page-container not-prose">
      <ChatInterface />
    </div>
  )
}
