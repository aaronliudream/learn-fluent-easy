/**
 * Centralized feedback / juice config.
 *
 * Goal: avoid over-stimulation. All confetti + XP bursts in the app go
 * through this module so we can tune frequency and intensity in one place.
 *
 * Three intensity tiers:
 *   - subtle    : tiny ack, fires often (per-question correct answer)
 *   - normal    : section finished with decent score
 *   - celebrate : milestone (first 100% mastery, weekly goal hit)
 *
 * Also enforces:
 *   - global cooldown so confetti can't fire twice within N ms
 *   - reduced-motion respect (no confetti, shorter XP burst)
 *   - confetti score threshold (default 0.8) so weak finishes stay quiet
 */
const COLORS = ["#F59E0B", "#EC4899", "#6366F1", "#10B981", "#FACC15", "#0EA5E9"];

export type Intensity = "subtle" | "normal" | "celebrate";

interface ConfettiPreset {
  count: number;
  spreadPx: number;
  durationMs: number;
  cooldownMs: number;
}

interface XPPreset {
  durationMs: number; // total CSS animation duration
  driftPx: number;    // how far it floats up
}

export const FEEDBACK = {
  // Min score ratio (0..1) required to fire confetti on a quiz finish.
  confettiScoreThreshold: 0.8,
  // Min ms between two confetti bursts globally — prevents stacked spam.
  globalConfettiCooldownMs: 2500,
  confetti: {
    subtle:    { count: 14, spreadPx: 140, durationMs: 1100, cooldownMs: 1200 },
    normal:    { count: 28, spreadPx: 220, durationMs: 1400, cooldownMs: 1800 },
    celebrate: { count: 60, spreadPx: 320, durationMs: 1800, cooldownMs: 2500 },
  } satisfies Record<Intensity, ConfettiPreset>,
  xp: {
    subtle:    { durationMs:  900, driftPx: 60 },
    normal:    { durationMs: 1100, driftPx: 80 },
    celebrate: { durationMs: 1400, driftPx: 110 },
  } satisfies Record<Intensity, XPPreset>,
};

let lastConfettiAt = 0;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function fireConfetti(
  intensity: Intensity = "normal",
  originX?: number,
  originY?: number,
) {
  if (typeof window === "undefined") return;
  if (prefersReducedMotion()) return;
  const now = Date.now();
  if (now - lastConfettiAt < FEEDBACK.globalConfettiCooldownMs) return;
  lastConfettiAt = now;

  const preset = FEEDBACK.confetti[intensity];
  const x = originX ?? window.innerWidth / 2;
  const y = originY ?? window.innerHeight / 3;
  const layer = document.createElement("div");
  layer.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;";
  document.body.appendChild(layer);

  for (let i = 0; i < preset.count; i++) {
    const el = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const dist = preset.spreadPx * (0.4 + Math.random() * 0.6);
    const dx = Math.cos(angle) * dist;
    const size = 6 + Math.random() * 6;
    const dur = (preset.durationMs / 1000) * (0.8 + Math.random() * 0.4);
    el.style.cssText = `
      position:absolute;
      left:${x}px; top:${y}px;
      width:${size}px; height:${size * 0.4}px;
      background:${COLORS[i % COLORS.length]};
      border-radius:1px;
      --cx:${dx}px;
      --cr:${(Math.random() * 720 - 360).toFixed(0)}deg;
      animation: confetti-fall ${dur}s cubic-bezier(.2,.6,.4,1) forwards;
    `;
    layer.appendChild(el);
  }
  setTimeout(() => layer.remove(), preset.durationMs + 400);
}

/**
 * Fire confetti only if the score ratio passes the global threshold.
 * Use at quiz/lesson completion sites.
 */
export function fireConfettiIfPassed(
  correct: number,
  total: number,
  intensity: Intensity = "normal",
) {
  if (total <= 0) return;
  if (correct / total < FEEDBACK.confettiScoreThreshold) return;
  fireConfetti(intensity);
}

export function getXPPreset(intensity: Intensity = "subtle"): XPPreset {
  if (prefersReducedMotion()) {
    return { durationMs: 600, driftPx: 30 };
  }
  return FEEDBACK.xp[intensity];
}
