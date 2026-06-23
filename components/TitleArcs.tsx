/**
 * 文档标题前的「思考中」小动画：几段同心半圆弧，不同速度 / 方向旋转，
 * 描边带微微辉光（drop-shadow）+ 透明度呼吸，类似 AI 思考时的律动。
 * 纯展示元素，aria-hidden；尊重 prefers-reduced-motion（在 CSS 里停动）。
 * 颜色全部引用主题基调 token（primary / accent-vivid / accent-3），随基调旋转。
 */
export function TitleArcs() {
  return (
    <span className="fd-title-arcs" aria-hidden="true">
      <svg viewBox="0 0 40 40" className="fd-title-arcs__svg">
        <circle className="fd-title-arcs__ring fd-title-arcs__ring--1" cx="20" cy="20" r="16" />
        <circle className="fd-title-arcs__ring fd-title-arcs__ring--2" cx="20" cy="20" r="11" />
        <circle className="fd-title-arcs__ring fd-title-arcs__ring--3" cx="20" cy="20" r="6" />
      </svg>
    </span>
  )
}
