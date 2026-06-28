import type { HTMLAttributes, ReactNode } from 'react';
import { TitleArcs } from '@/components/TitleArcs';

/**
 * 「小节标题」H2 渲染器 —— 用作 `getMDXComponents().h2` 的映射目标。
 *
 * 设计动机：
 *   · 文档页头 `DocsTitle` 是「浮动光团 + 磨砂玻璃渐变」的大标题，
 *     用户希望章节里的小节标题（一、二、三…）也享受同等视觉待遇。
 *   · 但如果改用 `<SectionTitle>...</SectionTitle>` JSX 组件，
 *     fumadocs TOC（在构建期扫 HAST 的 h1~h6 节点）就看不到这些标题，
 *     右下角"On this page"会丢失整个章节树——这是关键约束。
 *
 * 解法：
 *   · MDX 里仍然写 `## 一、xxx` —— remark-heading 能识别并加进 TOC。
 *   · 通过 `getMDXComponents({ sectionTitles: true })` 把 `h2` 映射到本组件，
 *     渲染时套上 TitleArcs + 渐变文字，**TOC 与视觉兼顾**。
 *
 * 与旧 `components/SectionTitle.tsx` 的区别：
 *   · 旧组件是 JSX，需要 `<SectionTitle>...</SectionTitle>` 调用，会丢 TOC；
 *   · 本组件是 h2 映射，MDX 写法不变（继续写 `##`），TOC 正常。
 *
 * 用法（page.tsx）：
 *   getMDXComponents({ sectionTitles: page.data.sectionTitles })
 */
export function SectionTitleHeading({
  id,
  children,
}: {
  id?: string;
  children?: ReactNode;
}) {
  return (
    <h2 id={id} className="fd-section-title">
      <TitleArcs />
      <span className="fd-section-title__text">{children}</span>
    </h2>
  );
}

// 让 React / TypeScript 把 h2 上额外的 HTML 属性（className、style 等）
// 透传走，不阻断上游调用方。MDX 实际只传 id + children，但写宽一点更稳。
export type SectionTitleHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  id?: string;
};
