interface MarqueeProps {
  items: string[];
}

/**
 * 全宽大字无限滚动条（haoqi 式大胆排版）。
 * 纯 CSS 动画：把内容复制两份做无缝循环；两行反向滚动、hover 暂停。
 */
export function Marquee({ items }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__row">
        <div className="marquee__track">
          {doubled.map((t, i) => (
            <span key={`a-${i}`} className="marquee__item">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="marquee__row marquee__row--reverse">
        <div className="marquee__track">
          {doubled.map((t, i) => (
            <span key={`b-${i}`} className="marquee__item">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
