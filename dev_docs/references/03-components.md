# 三、自定义组件

> **返回主入口**：[`../SKILL.md`](../SKILL.md) · **上一章**：[二、主题与样式](./02-theme-and-styling.md) · **下一章**：[四、怎么写文档](./04-writing-mdx.md)

本章列出文档里可用的自定义组件、它们对应的源码与样式钩子，以及**怎么新增一个组件**。

## 3.1 组件注册表：`components/mdx.tsx`

所有能在 `.mdx` 里直接用的组件，都在 `getMDXComponents()` 里注册：

```ts
return {
  ...defaultMdxComponents,   // Fumadocs 默认（pre/code/table/...）
  h1: () => null,            // 首个 H1 不渲染（标题已在 banner 用 DocsTitle 显示）
  Badge, Card, NavCard, DataPanel, PageInfo, VideoLink, CopyRight, Contact,
  ChatLayout,                // /sp/chat 实时聊天室
  ChatPanel, ChatMessage,    // 文档内静态聊天示例
  Callout,                   // Fumadocs 提示框
  ...components,
}
```

> 新组件**必须**在这里注册，否则 MDX 里写 `<Foo>` 会被当成未知 JSX 报错。

## 3.2 组件清单

| 组件 | 文件 | 用途 | 样式钩子（global.css） |
|------|------|------|----------------------|
| `Badge` | `components/Badge.tsx` | 标题 / 卡片旁的小胶囊（`type=info/tip/warning/danger`） | `.fd-badge`, `.fd-badge-*` |
| `Card` | `components/Card.tsx` | **插件市场**：拉 `/plugin_list.json` 渲染插件卡片网格 | `.fd-plugin-list`, `.fd-plugin-card*` |
| `NavCard` | `components/NavCard.tsx` | 两列导航卡片 | 内联 Tailwind |
| `ChatPanel` / `ChatMessage` | `components/ChatPanel.tsx` | **静态聊天示例**（复刻 VitePress） | `.fd-chatpanel*`, `.fd-chatmsg*` |
| `Callout` | fumadocs-ui | 提示 / 警告框（`type=info/warn/error/success`） | `.prose [style*="--callout-color"]` |
| `DataPanel` | `components/DataPanel.tsx` | 不蒜子访问量统计 | 内联 Tailwind |
| `PageInfo` | `components/PageInfo.tsx` | 字数 / 阅读时长 | 内联 Tailwind |
| `VideoLink` | `components/VideoLink.tsx` | B 站视频链接卡片 | 内联 Tailwind |
| `Contact` / `CopyRight` | 同名文件 | 联系方式 / 版权 | 内联 Tailwind |
| `ChatLayout` | `components/chat/` | `/sp/chat` 的 **WebSocket 实时聊天室**（与 ChatPanel 无关） | `.fd-chat-*` |

## 3.3 重点：ChatPanel / ChatMessage（静态聊天示例）

复刻自 VitePress 的 `<ChatPanel>/<ChatMessage>`，用于展示"向 Bot 发 xxx → Bot 回 yyy"。

```mdx
<ChatPanel title="绑定UID">
<ChatMessage nickname="Wuyi无疑">绑定uid100740568</ChatMessage>
<ChatMessage nickname="GsCore">绑定UID100740568成功！</ChatMessage>
<ChatMessage nickname="群友A" tag="用户">你们在说什么呢？</ChatMessage>
</ChatPanel>
```

- **左右分边**：昵称含 `core`/`bot`/`gsuid`（不分大小写）→ 机器人，**左侧**灰气泡；
  其余 → 用户「你」，**右侧** primary 气泡。
- `tag="用户"`：群聊里的"其他人"，显示在**左侧**并带一个小标签 chip（区别于"你"）。
- `bot` 属性可显式指定是否机器人气泡。
- **含 `{ }` 的消息必须包成 JS 字符串**：`{'mys设备登录{"oaid":"..."}'}`，否则 MDX 把 `{...}`
  当表达式求值报错。见 [四、写文档 §4.5](./04-writing-mdx.md)。

## 3.4 重点：插件市场卡片（Card）

- `components/Card.tsx` 在客户端 `fetch('/plugin_list.json')`，按 `fun_plugins` / `tool_plugins`
  分组渲染 `.fd-plugin-card`。
- `content === '停止维护'` 或 `type === 'danger'` → `isDeprecated` → 卡片置灰（`.fd-plugin-card-deprecated`）。
- **样式 `.fd-plugin-*` 全部在 `app/global.css`**（迁移初期这些类完全没样式，是后来补的）。
- 卡片里的徽章必须 `white-space: nowrap; flex-shrink: 0`，标题用省略号截断，否则长徽章（如"停止维护"）
  会被挤成竖排。见 [七、坑 #5](./07-pitfalls.md)。
- 增删插件条目改 `public/plugin_list.json`（不是改组件）。

## 3.5 怎么新增一个 MDX 组件

1. 在 `components/` 新建 `Foo.tsx`。**默认是 Server Component**；用到 `useState`/`useEffect`/事件 /
   浏览器 API 时在文件首行加 `'use client'`。
2. 颜色 / 间距用主题变量或 `*-fd-*` 工具类（见 [二](./02-theme-and-styling.md)），需要玻璃质感就套
   §2.4 的玻璃套路；专属样式加到 `app/global.css`（用 `fd-foo-*` 前缀避免冲突）。
3. 在 `components/mdx.tsx` 的 `getMDXComponents()` 里 `import` 并加入返回对象。
4. 在某个 `.mdx` 里 `<Foo />` 使用（无需额外 import，MDX 自动用映射表）。
5. `pnpm build` 验证（组件类型 / MDX 解析错误此时才暴露）。

> **可序列化注意**：`Providers.tsx` 是 client component，因为搜索弹窗里有函数（`initOrama`）
> 无法从 server component 跨边界传递。若你的组件需要给 `RootProvider` 传函数 / 组件 prop，
> 同理要放在 client 包裹里。见 [六、搜索](./06-search.md)。
