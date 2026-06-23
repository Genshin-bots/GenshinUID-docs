# 十、实时聊天室路由（/chat 独立全页 vs /sp/chat 文档内嵌）

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[九、首页 PPT 式硬翻页](./09-home-ppt-pager.md)

实时聊天室最初随 VitePress 时代以「`/sp/chat` 文档内嵌页」的形式存在，
迁移到 Fumadocs 后又新增了「`/chat` 独立全页路由」——两条路径都指向**同一份**核心交互逻辑，
仅外壳布局不同。本章拆解两者的关系、为什么需要双路由、`HomeLayout` 如何复用、
`ChatInterface` 内的状态机与边界细节，方便日后维护时知道在哪里改。

## 10.1 两条入口的边界

| 维度 | `/[lang]/chat`（独立全页） | `/[lang]/docs/sp/chat/`（文档内嵌） |
|------|---------------------------|------------------------------------|
| 外壳布局 | **`HomeLayout`** + 顶栏 `DocsNav` | **`DocsLayout`** + sidebar + TOC + 顶栏 `DocsNav` |
| 路由文件 | `app/[lang]/chat/page.tsx` | 由 `content/docs/sp/chat.mdx` 渲染（MDX） |
| 外层容器 | `.fd-chat-page-container--standalone` | `.fd-chat-page-container`（无 `--standalone` 修饰） |
| 顶栏 | 同 `DocsNav` | 同 `DocsNav` |
| 侧边栏 | **无** | 有 |
| 右侧 TOC | **无** | 有 |
| 导航菜单入口 | 「🎉 快速开始 / 🔰 在线聊天室」直接链 `/[lang]/chat/` | 由 `content/docs/sp/chat.mdx` 内的一段说明文字把用户引到 `/chat/`（已废弃保留作 redirect） |
| 状态 | **当前主入口** | **历史兼容**：旧链接 / 老用户收藏夹还能访问，正文已变成一段「请到新地址」的说明 |

> **设计目标**：`/chat` 给一个「沉浸式」聊天环境，聊天卡铺满整屏（除顶栏）；
> `/sp/chat` 作为遗留路径保留，正文直接告诉用户「去 `/chat` 吧」，避免 404。

## 10.2 文件结构

```
app/[lang]/chat/
├── layout.tsx          # 独立全页布局：HomeLayout + DocsNav + SidebarProvider
└── page.tsx            # 渲染 <ChatStandalone />，带 generateMetadata

app/chat/
└── page.tsx            # 0 秒 meta-refresh 跳到 /zh-CN/chat/；处理 output:export
                        # 下访问裸 /chat/ 时的 500（详见坑 #25）

components/chat/
├── ChatInterface.tsx   # ★ 核心：所有交互（WebSocket、消息列表、输入区、Lightbox、合并转发面板）
├── ChatLayout.tsx      # 文档内嵌版外壳（接 .fd-chat-page-container，给 MDX 用）
├── ChatStandalone.tsx  # 独立全页版外壳（接 .fd-chat-page-container--standalone，给 /chat 用）
├── ChatHeader.tsx      # 顶部：WS URL + 私聊/群聊切换 + 连接状态
├── ChatInputArea.tsx   # 底部：textarea + 工具栏 + 附件预览 + 发送
├── ChatMessageList.tsx # 中部：消息列表 + 智能滚动（见 §10.5）
├── ChatMessageItem.tsx # 单条消息：头像 / 气泡 / 按钮组 / 节点预览 / 操作按钮
├── ImageLightbox.tsx   # 全屏图片查看器
├── NodeMessagePanel.tsx # 合并转发面板
└── types.ts            # ChatMessage / NodeContent 类型

hooks/
├── useWebSocket.ts     # WebSocket 状态机（connecting/connected/disconnected/error）
├── useLightbox.ts      # 图片灯箱：上一张/下一张、缩放、拖动
├── useFileUpload.ts    # 拖拽 / 粘贴 / 选择文件 → base64 预览
├── useContentItems.ts  # 附件队列：增 / 删 / 上移 / 下移
├── useChatMode.ts      # 私聊 ↔ 群聊 + groupId
└── useMessageRenderer.ts # content[] → HTML（text / image / audio / video / markdown / button）
```

### 复用关系

```
ChatInterface（核心交互）
   ├─ 由 <ChatLayout>      包裹 → /sp/chat（docs 网格内）
   └─ 由 <ChatStandalone>  包裹 → /chat    （独立全页）
```

`ChatInterface` 不关心自己处在哪条路由里，只把容器高度 `100%` 用满；
外层两个 wrapper 各自负责不同的 padding / margin / 高度基线。

## 10.3 `/chat` 路由实现

### layout.tsx：用 `HomeLayout` 而不是 `DocsLayout`

```tsx
// app/[lang]/chat/layout.tsx
return (
  <SidebarProvider>
    <HomeLayout
      nav={{ component: <DocsNav lang={lang} /> }}
      searchToggle={{ enabled: false }}   // 顶栏已自带搜索
      themeSwitch={{ enabled: false }}   // 顶栏已自带
      i18n={false}
      className="fd-default-layout fd-chat-standalone"
    >
      {children}
    </HomeLayout>
  </SidebarProvider>
)
```

**为什么用 `HomeLayout`？**

- 它不渲染 sidebar / toc，聊天卡可以铺满整个 main 区。
- 它只渲染顶栏，正好让我们把「已经在所有页面共用的 `DocsNav`」作为 `nav.component` 注入。
- `SidebarProvider` 仍然需要保留——`DocsNav` 内部 `useSidebar()` / `useSearchContext()`
  要靠它提供 React 上下文。

### CSS：给 main 留出顶栏空间

`DocsLayout` 在 `#nd-docs-layout` 上有 `padding-top: 3.5rem`（腾出给 fixed `.glass-header`），
但 `HomeLayout` 的 `<main id="nd-home-layout">` 默认没有这个 padding。直接套用会让聊天卡
被顶栏盖住首行。

修复（`app/global.css`）：

```css
#nd-home-layout.fd-chat-standalone {
  --fd-banner-height: 3.5rem;
  --fd-layout-width: 100%;   /* 拉满；默认 1400px 会留白 */
  padding-top: 3.5rem;        /* 留给 fixed glass-header */
}
```

`.fd-chat-standalone` 由 layout.tsx 加到 `HomeLayout` 的 `className` 上，会落到
`<main>` 元素。`#nd-home-layout` 是 `HomeLayout` 容器的内置 id。

### page.tsx：纯壳 + metadata

```tsx
// app/[lang]/chat/page.tsx
export default async function ChatPage({ params }) {
  const { lang } = await params
  if (!i18n.languages.includes(lang)) notFound()
  return <ChatStandalone />
}
```

`generateMetadata` 单独抽出来写三语 title / description，与 `lang` 强绑定。

## 10.4 `ChatInterface` 状态机

### 5 类消息 + 3 种来源

```ts
type ChatMessage =
  | { type: 'system'; text: string }                          // 系统提示（连接 / 模式切换）
  | { type: 'sent'; html; sender; buttons }                   // 自己发的
  | { type: 'received'; html; sender; buttons }               // Bot / 别人回的
  | { type: 'node'; nodeData: NodeContent[]; sender }         // 合并转发（点开 → NodeMessagePanel）
```

### WebSocket 状态

```ts
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
```

| 触发事件 | 状态变化 | 系统消息 | UI 反馈 |
|----------|----------|----------|---------|
| 首次 mount → `connect()` | `disconnected → connecting → connected` | `已连接到 <URL>` | Header 状态徽章变绿，input 区域可写 |
| ws.onerror | `* → error` | `连接出现错误`（仅从未出错切到出错时刷一次） | Header 状态徽章变红，input 区域被 reconnect 浮层盖住 |
| ws.onclose（异常） | `connected → disconnected` | `与服务器的连接已断开` | 同上 |
| 用户改 URL | 旧 ws.close → 新 ws.connect | 自动重连 | Header 出现「正在连接」+「取消」按钮 |
| 群 / 私聊模式切换 | （与 ws 无关）| `已切换到群聊模式（群组ID: xxx）` / `已切换到私聊模式` | Header 私聊 / 群聊 toggle 滑动 |
| 收到 JSON 解析失败 | — | `收到一条无法解析的消息` | 系统消息条 |
| 收到 / 发送时 schema 异常 | — | `连接失败：无效的URL "..."` | 系统消息条 |

> **去重**：状态变化用 `prevStatusRef` 记录上一态，避免「连接成功 → 改 URL → 自动重连」
> 这种连续过渡连刷两条「已连接到 ...」。

## 10.5 消息列表的智能滚动

`ChatMessageList` 维护一个 `stuckToBottomRef`（默认 `true`）：

- 监听 `scroll` 事件，距底 < 16px 视为「贴底」，置 `true`。
- 距底 ≥ 16px（用户主动往上翻历史）置 `false`。
- 新消息到来时**只在 `stuckToBottomRef.current === true` 时**才把 `scrollTop` 拉到底。

这样用户翻历史时不会被「自己刚发出去的消息」或「服务端刚推的消息」强行拽回底部。
比 VitePress 版本（每次新消息都强制 scrollToBottom）更礼貌。

## 10.6 模式切换 / 群 ID

`useChatMode` 暴露：

```ts
isGroupMode: boolean          // 私聊 = false / 群聊 = true
groupId: string | null        // 群 ID（默认 929275476，对应 Mihomo 群）
toggleMode(): void
getModeParams(): { userType: 'direct' | 'group'; groupId: string | null }
```

`getModeParams` 给 `sendMessage` 用，按模式注入 `user_type` / `group_id`。
**用户切换模式时一定会断后重连**——因为连接级状态（比如 `user_type`）是 WS 握手时决定的，
当前实现里我们用「系统消息」提示用户「已切换到 X 模式」，但底层连接并不会自动重连。
如果以后要做「切模式即重连」，在 `useChatMode.toggleMode` 里调用 `connect()` 即可。

## 10.7 输入区交互细节

`ChatInputArea` 的核心约束：

| 元素 | 行为 |
|------|------|
| `textarea` | `Enter` 发送（非 Markdown 模式）；`Shift+Enter` 换行；Markdown 模式下 `Enter` 仅换行，发送靠按钮 |
| 附件预览 | 每个附件左侧有「上移 / 下移」按钮（队列最前 / 最后会 disable），右侧删除按钮；图片直出 56×56 缩略图，音视频显示文件名 + icon |
| 工具栏 | Markdown 切换（高亮表示开启）、图片 / 音频 / 视频 按钮（不可用时置灰） |
| 发送按钮 | text 为空且无附件时 disable；连接断开时整个 footer 被 reconnect 浮层盖住（`pointer-events: none`） |
| 拖拽 | 整个 `.fd-rich-input-container` 进入 `drag-over` 状态（边框 + 背景变主题色） |
| 粘贴 | `onPaste` 直接走 `useFileUpload.processFile`，从剪贴板图片得到 base64 |
| 移动端 | header wrap 三行、toolbar 按钮压缩、发送按钮隐藏「发送」文字只留 icon |

## 10.8 图片 / 合并转发

### 图片灯箱（ImageLightbox）

- 收到点击 → `useLightbox.openLightbox(src, allImages, index)`。
- `Esc` 关闭、`←` / `→` 翻页、滚轮缩放（`useLightbox.handleWheel`）、鼠标拖动平移。
- 关闭后 `imageTransform` 重置，避免下次打开还是上次的缩放/位移。

### 媒体 URL 翻译（`base64://` / `link://`）

GsCore 协议里图片 / 音频 / 视频统一用两种自定义「协议前缀」编码：

| 收到的 `data` | 翻译后 | 说明 |
|---------------|--------|------|
| `data:image/jpeg;base64,...` | 原样 | 自己上传的，已经格式化 |
| `base64:///9j/4AAQ...` | `data:image/jpeg;base64,/9j/4AAQ...` | 服务端下行，MIME 通过 base64 前 12 字符嗅探 |
| `link://https://i.pximg.net/...` | `https://i.pximg.net/...` | 剥前缀 |
| 纯 base64（无前缀）| `data:<mime>;base64,...` | 兜底 |

统一在 `lib/media.ts` 的 `resolveMediaUrl(raw, kind)`，**主消息渲染与
NodeMessagePanel 共享**——以前只有合并转发面板里有翻译，主消息气泡图片 broken。
详见 [七、坑 #27](./07-pitfalls.md)。

### 合并转发（NodeMessagePanel）

- 收到 `node` 类型消息 → 消息条上展示「首条消息预览 + 等 N 条消息」。
- 点击 → `setCurrentNodeData(nodeData)` + `isNodePanelVisible = true`。
- 面板里按 `node.username` 分组，渲染 `text / image / audio / record / video`。
- `base64://` / `link://` 前缀在 `NodeMessagePanel.renderMessage` 里被翻译成真正的 `data:` / 真实 URL。
- 关闭：点遮罩 / `Esc` / 标题栏的 X。`fade-in` 走 0.22s opacity 过渡。

## 10.9 已知边界 & 容易踩的坑

1. **WebSocket 跨域 / 反代**：`ws://localhost:8765/ws/web` 是默认 URL。生产环境如果用 https，
   要同步改成 `wss://`。本组件不强制限定 origin，跨域错误会在 onerror 里被吞成「连接错误」状态。
2. **大消息的 base64 传输**：图片 / 音频走 `base64://` 前缀，体积大时建议先压缩（`useFileUpload.processFile`
   会原样塞进 `content` 数组，没做压缩 / 缩放）。
3. **`@/hooks` 别名引用**：所有 chat 组件用 `@/hooks/...` 引用，不要改成相对路径。
4. **`not-prose` 必须有**：`<ChatLayout>` / `<ChatStandalone>` 的最外层都加了 `not-prose`，
   否则 DocsBody / DocsPage 的 prose 样式会强行覆盖字号 / 颜色。
5. **静态导出 (`output: 'export'`)**：所有 chat 组件都跑在客户端（`'use client'`），SSR 时不会执行
   `useWebSocket` / `useFileUpload`，所以服务端渲染的 HTML 里只有空壳——这是预期的，连接逻辑
   等到 hydration 后才发生。
6. **不要往 ChatInterface 顶层加 useState 缓存消息列表**：会破坏 WebSocket 实时性；消息应该
   始终在 `useState<ChatMessage[]>` 里按 append 累积。
7. **切换模式不重连**：见 §10.6；如果后端协议要求切模式即重连，记得在 `useChatMode` 加 `connect` 依赖。
8. **WebSocket 错误日志用 `console.warn` 而非 `console.error`**：React 19 / Next 16 dev
   会把 `console.error` 拦截并显示为 error overlay 红屏，但「连不上 localhost:8765」是
   预期场景，不该红屏。详见 [七、坑 #26](./07-pitfalls.md)。
9. **WebSocket 异步回调一定要 `mountedRef` + `wsInstanceIdRef` 双重守卫**：
   - `mountedRef` 防「组件已卸载，setState 撞 React 19 warning」
   - `wsInstanceIdRef` 防「旧 ws 事件污染新 ws 状态」
   详见 [七、坑 #26](./07-pitfalls.md)。

## 10.10 相关文件 / 章节

- 聊天界面 CSS（`.fd-chat-*`）：`app/global.css`
- 顶栏 `DocsNav`（磨砂玻璃 Header）：[二、§2.5](./02-theme-and-styling.md)
- i18n（语言切换 / 顶栏 nav 链）：[五](./05-i18n.md)
- 静态聊天示例 `ChatPanel` / `ChatMessage`（与本实时聊天室无关，但容易混淆）：
  [三、§3.3](./03-components.md)
- 主题色与玻璃质感变量：[二、§2.4](./02-theme-and-styling.md)
