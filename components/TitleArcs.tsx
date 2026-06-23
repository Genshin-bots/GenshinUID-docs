/**
 * 文档标题前的小动画：三个柔光光团按 120° 聚拢成一个三叶草轮廓，
 * 各自以略微错开的节奏缓慢缩放 + 透明度呼吸，配合 blur 朦胧辉光，像三瓣光晕轻轻聚散。
 * 纯展示元素，aria-hidden；始终保持动画（不随 prefers-reduced-motion 停动）。
 * 三团颜色分别引用主题基调 token（primary / accent-vivid / accent-3），随基调旋转。
 */
export function TitleArcs() {
  return (
    <span className="fd-title-arcs" aria-hidden="true">
      <span className="fd-title-arcs__orb fd-title-arcs__orb--1" />
      <span className="fd-title-arcs__orb fd-title-arcs__orb--2" />
      <span className="fd-title-arcs__orb fd-title-arcs__orb--3" />
    </span>
  )
}
