import { Callout } from 'fumadocs-ui/components/callout'
import type { FaqItem } from '@/components/FaqList'

/**
 * 常见问题数据
 *
 * · 从 content/docs/faq/index.mdx 拆出来：MDX 3 不支持文件顶层
 *   `const` 声明（会被当作 markdown 段落渲染），所以把数据放到 .tsx 里
 *   用 import 引入。
 * · `cookieCode` / `stokenCode` 是控制台命令，里面的 `\\n` 一定要保留为
 *   字面两个字符（`\` + `n`），复制到浏览器控制台后才能被 JS 当成换义符。
 */

// 添加 Cookie：观测枢控制台代码
const cookieCode = `var cookie = document.cookie;
var Str_Num = cookie.indexOf('_MHYUUID=');
cookie = '添加 ' + cookie.substring(Str_Num);
var ask = confirm('Cookie:' + cookie + '\\n\\n按确认，然后粘贴发送给机器人');
if (ask == true) {
  copy(cookie);
  msg = cookie
} else {
  msg = 'Cancel'
}`

// 添加 Stoken：user.mihoyo.com 控制台代码
const stokenCode = `var cookie = document.cookie;
var ask = confirm('Cookie:' + cookie + '\\n\\nDo you want to copy the cookie to the clipboard?');
if (ask == true) {
  copy("添加 stoken" + cookie);
  msg = cookie
} else {
  msg = 'Cancel'
}`

export const faqItems: FaqItem[] = [
  {
    q: '安装 gsuid_core 的时候，输入命令 poetry install 出现报错 DBusErrorResponse',
    tag: 'warning',
    a: (
      <>
        输入命令{' '}
        <code>export PYTHON_KEYRING_BACKEND=keyring.backends.null.Keyring</code>{' '}
        之后再次尝试 <code>poetry install</code>。
      </>
    ),
  },
  {
    q: '使用命令中报错 No such file or directory',
    tag: 'tip',
    a: (
      <>
        缺少相关资源文件夹，可尝试使用命令 <code>core 重启</code> 或者{' '}
        <code>下载全部资源</code>。如仍然报错，请提供错误日志并反馈。
      </>
    ),
  },
  {
    q: '启动出现报错 SSLCertVerificationError，但是 Bot 可以正常使用',
    tag: 'info',
    a: (
      <>
        涉及功能「深渊概览」，缺少 SSL 证书。进入{' '}
        <a
          href="https://akashadata.feixiaoqiu.com/static/data/abyss_total.js"
          target="_blank"
          rel="noreferrer"
        >
          虚空数据库
        </a>{' '}
        后点击左上角、链接左边的小锁，按{' '}
        <code>链接是安全的 → 证书有效 → 详细信息 → 导出证书</code>{' '}
        顺序操作，文件名随便写一个、后缀改为 <code>.crt</code>，
        双击安装证书即可。
      </>
    ),
  },
  {
    q: '启动出现报错 Httpx AsyncClient Timeout Error 等，但是 Bot 可以正常使用',
    tag: 'info',
    a: <>涉及功能「版本深渊」，网络无法连接内鬼网。</>,
  },
  {
    q: '「签到」「每日」等功能出现报错、或者错误码 1034',
    tag: 'danger',
    a: (
      <>
        米游社采取全域验证码校验，需要手动上米游社解除验证码风控
        （我的 → 我的角色）。<strong>目前暂无公开解决方法。</strong>
      </>
    ),
  },
  {
    q: '群友使用命令无反馈、仅自己可用',
    tag: 'tip',
    a: (
      <>
        使用 <code>重置 core 配置</code> 后重启。
      </>
    ),
  },
  {
    q: '使用 gs 帮助无反应，其他命令有效',
    tag: 'tip',
    a: (
      <>
        使用 <code>core 重启</code> 重新加载帮助图（大概率是由于更新后不重启导致的）。
      </>
    ),
  },
  {
    q: '能不能一次性更新 GenshinUID v4 和 gsuid-core（早柚核心）',
    tag: 'tip',
    a: (
      <>
        <p>
          使用 <code>gs 全部更新</code>，如遇 v4 更新报错，可进一步使用{' '}
          <code>gs 强制更新</code>。
        </p>
        <p>
          （注意：无法强制更新 core、也不推荐在 core 目录下使用{' '}
          <code>git rm</code>、<code>git clean</code> 等高危命令）
        </p>
      </>
    ),
  },
  {
    q: '启动资源下载过慢，有没有离线资源包',
    tag: 'tip',
    a: (
      <>
        可以前往群内获取最新的离线资源包链接，下载后覆盖到{' '}
        <code>gsuid_core/data/GenshinUID/resource</code> 即可。
      </>
    ),
  },
  {
    q: 'NoneBot2 的配置、添加适配器的教程',
    tag: 'info',
    a: (
      <>
        请自行前往对应文档查看，例如{' '}
        <a href="https://nb2.baka.icu/" target="_blank" rel="noreferrer">
          NoneBot2 文档
        </a>
        、以及各个适配器的文档，善用{' '}
        <a href="https://github.com" target="_blank" rel="noreferrer">
          GitHub
        </a>{' '}
        的搜索功能。
      </>
    ),
  },
  {
    q: 'ValueError: the greenlet library is required to use this function. DLL load failed while importing _greenlet: 找不到指定的模块。',
    tag: 'warning',
    a: (
      <>
        <p>
          安装依赖 <code>greenlet</code>（如果你是 Windows，还需要额外安装{' '}
          <code>msvc-runtime</code>）。
        </p>
        <p>
          视环境使用 <code>poetry run pip install greenlet</code> 或者{' '}
          <code>pip install greenlet</code>。安装 <code>msvc-runtime</code> 同理。
        </p>
      </>
    ),
  },
  {
    q: '如何添加 Cookie / Stoken？',
    tag: 'tip',
    a: (
      <>
        <Callout type="warn">
          <strong>前提是绑定了 UID</strong>。以下方法选择其一即可。
        </Callout>
        <Callout type="info">
          添加 Stoken 会 <strong>自动</strong> 补充添加 Cookie。
        </Callout>
        <p>
          <strong>方法一 · 观测枢</strong>：进入{' '}
          <a
            href="https://bbs.mihoyo.com/ys/obc/?bbs_presentation_style=no_header"
            target="_blank"
            rel="noreferrer"
          >
            观测枢
          </a>
          ，在页面上右键检查或 <code>Ctrl+Shift+i</code>，将以下代码粘贴到
          控制台运行。确认后会自动复制 CK，私聊发送给 Bot 即可。
        </p>
        <pre>
          <code>{cookieCode}</code>
        </pre>
        <p>
          <strong>方法二 · 扫码登录</strong>：群聊发送 <code>扫码登陆</code>，
          进入米游社扫码登录即可完成绑定。
        </p>
        <Callout type="warn">
          QQ BOT 因为发送二维码可能会遭到腾讯风控；<code>扫码登陆</code> 会{' '}
          <strong>一并</strong> 添加 <code>Stoken</code>。
        </Callout>
        <p>
          <strong>方法三 · 直接添加 Stoken</strong>：将以下代码粘贴到控制台：
        </p>
        <pre>
          <code>{stokenCode}</code>
        </pre>
        <ol>
          <li>
            复制上面全部代码，打开{' '}
            <a
              href="http://user.mihoyo.com/"
              target="_blank"
              rel="noreferrer"
            >
              user.mihoyo.com
            </a>
            ；
          </li>
          <li>在页面上右键检查或 <code>Ctrl+Shift+i</code>；</li>
          <li>
            选择控制台（Console），粘贴，回车，在弹出的窗口点确认
            （点完自动复制）；
          </li>
          <li>然后在和机器人的私聊窗口，粘贴发送即可。</li>
        </ol>
      </>
    ),
  },
  {
    q: '能不能添加某个功能',
    tag: 'info',
    a: (
      <>
        在 GenshinUID 的项目里提 Issue，如果合理并且有余力，会加入{' '}
        <code>todo list</code>。
      </>
    ),
  },
  {
    q: '能不能修改 v4-nonebot2 连接到 core 的端口',
    tag: 'tip',
    a: (
      <>
        在 nb2 的环境文件中（例如 <code>.env</code>）添加{' '}
        <code>gsuid_core_host="127.0.0.1"</code> 和{' '}
        <code>gsuid_core_port="9527"</code>，IP 地址和端口改成你需要的就可以。
      </>
    ),
  },
  {
    q: '能不能修改 core 接受链接的端口',
    tag: 'tip',
    a: (
      <>
        在 <code>gsuid_core/data/config.json</code> 中，调整 IP 和 PORT 后重启 core。
      </>
    ),
  },
]
