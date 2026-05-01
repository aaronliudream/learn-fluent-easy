/**
 * Tiny dependency-free confetti. Fires a burst of paper squares from a
 * given DOM origin (or screen center). Auto-cleans after 1.6s.
 * Use sparingly — meant for milestone moments (lesson finished, badge
 * unlocked, weekly goal hit).
 */
const COLORS = ["#F59E0B", "#EC4899", "#6366F1", "#10B981", "#FACC15", "#0EA5E9"];

export function fireConfetti(originX?: number, originY?: number, count = 36) {
  if (typeof window === "undefined") return;
  const x = originX ?? window.innerWidth / 2;
  const y = originY ?? window.innerHeight / 3;
  const layer = document.createElement("div");
  layer.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  document.body.appendChild(layer);

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 220;
    const dx = Math.cos(angle) * dist;
    const size = 6 + Math.random() * 6;
    el.style.cssText = `
      position:absolute;
      left:${x}px; top:${y}px;
      width:${size}px; height:${size * 0.4}px;
      background:${COLORS[i % COLORS.length]};
      border-radius:1px;
      --cx:${dx}px;
      --cr:${(Math.random() * 720 - 360).toFixed(0)}deg;
      animation: confetti-fall ${1 + Math.random() * 0.6}s cubic-bezier(.2,.6,.4,1) forwards;
    `;
    layer.appendChild(el);
  }
  setTimeout(() => layer.remove(), 1800);
}