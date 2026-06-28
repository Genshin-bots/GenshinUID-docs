/**
 * /chat（无语言前缀）→ /zh-CN/chat/ 静态重定向
 * --------------------------------------------------------------------------
 * · `output: 'export'` 模式下，所有路由必须在 build 时通过 `generateStaticParams`
 *   列出。这里提供一个零秒跳转的静态页，让用户访问 `/chat/`（无 lang 前缀）
 *   不会因为 generateStaticParams 缺失而 500。
 * · 选 meta refresh 而不是 server redirect（`output: export` 不支持 server 端
 *   动态 redirect），同时附一个 `<a>` 链接做兜底（meta refresh 被禁用时仍能跳转）。
 * · 静态导出后产物是 `out/chat/index.html`，由 build 期间的 static GET 自动收集。
 */
export const dynamic = 'force-static';

export default function ChatRootRedirect() {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="refresh" content="0; url=/zh-CN/chat/" />
        <title>正在跳转到在线聊天室…</title>
      </head>
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <p>
          正在跳转到 <a href="/zh-CN/chat/">在线聊天室</a>…
        </p>
      </body>
    </html>
  );
}

export const metadata = {
  title: '正在跳转到在线聊天室…',
  robots: { index: false, follow: false },
};
