interface MarqueeProps {
  items: string[];
}

interface MarqueeRowProps {
  items: string[];
  /** 是否反向滚动（第二行用），默认 false */
  reverse?: boolean;
  /** 给到 list 的 React key 用，避免同时出现两个相同 key 的渲染问题 */
  rowKey: string;
}

/**
 * 单行大字无限滚动。导出为独立组件，便于「把上下两行分别塞进
 * 不同位置（如标题上下）」的布局场景。
 * 纯 CSS 动画：内容复制两份做无缝循环；hover 时所在 marquee 暂停。
 */
export function MarqueeRow({ items, reverse, rowKey }: MarqueeRowProps) {
  const doubled = [...items, ...items];
  return (
    <div
      className={`marquee__row${reverse ? ' marquee__row--reverse' : ''}`}
      aria-hidden
    >
      <div className="marquee__track">
        {doubled.map((t, i) => (
          <span key={`${rowKey}-${i}`} className="marquee__item">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * 全宽大字无限滚动条（haoqi 式大胆排版）—— 两行反向滚动。
 * 留作向后兼容：以前直接放在 Hero 与 Showcase 之间，现在两行被「
 * 嵌入展示区标题页的上/下」（见 HomeShowcase）。
 */
export function Marquee({ items }: MarqueeProps) {
  return (
    <div className="marquee" aria-hidden>
      <MarqueeRow items={items} rowKey="a" />
      <MarqueeRow items={items} rowKey="b" reverse />
    </div>
  );
}
