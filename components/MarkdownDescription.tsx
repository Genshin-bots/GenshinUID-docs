import type { FC } from 'react';

/**
 * 文档页副标题：把字符串里的「轻量 Markdown」渲染成 React 节点。
 *
 * Fumadocs 自带的 DocsDescription 只把 children 当纯文本放进 <p>，
 * 不会解析 Markdown 语法。所以 frontmatter description 里写
 * `[commit f903e3](https://...)` 会原样输出 `[commit f903e3](https://...)`。
 *
 * 这里只解析两类最常用的内联语法（保持 description 始终是「人写的一句话」，
 * 与 dev_docs §4.2 红线一致）：
 *   - 链接 `[text](url)`        → <a>
 *   - 加粗 `**text**`           → <strong>
 *
 * 如果是空字符串 / undefined，直接返回 null（与 DocsDescription 行为一致），
 * 让 border-bottom 与 margin 不会多出一行空白。
 */
export const MarkdownDescription: FC<{ children?: string }> = ({
  children,
}) => {
  if (!children) return null;

  const nodes = parseInline(children);

  return <p className="fd-doc-description">{nodes}</p>;
};

/**
 * 把字符串切成 React 节点数组。
 * 策略：用一个「安全」的正则把 [text](url) 拆出来，
 * 剩下的纯文本段落再按 **...** 切成 <strong>。
 */
function parseInline(input: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  // 匹配 [text](url) ，url 不含空白 / ')'
  const linkRe = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = linkRe.exec(input)) !== null) {
    if (match.index > lastIndex) {
      pushBold(result, input.slice(lastIndex, match.index), key++);
    }
    const [, text, href] = match;
    const isExternal = /^https?:\/\//i.test(href);
    result.push(
      <a
        key={`l-${key++}`}
        href={href}
        {...(isExternal
          ? { target: '_blank', rel: 'noreferrer noopener' }
          : {})}
      >
        {text}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    pushBold(result, input.slice(lastIndex), key++);
  }

  return result;
}

function pushBold(
  result: React.ReactNode[],
  text: string,
  baseKey: number,
): void {
  // 把 **text** 切出来当 <strong>，其余当纯文本
  const re = /\*\*([^*\n]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    result.push(<strong key={`b-${baseKey}-${key++}`}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
}
