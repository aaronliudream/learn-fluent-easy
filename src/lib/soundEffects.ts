/**
 * Tiny Web Audio SFX generator. No assets needed; tones are synthesized
 * on demand. Honors localStorage('sfx_enabled') === 'false' as mute.
 */

const SFX_KEY = "sfx_enabled";

let _ctx: AudioContext | null = null;
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx) return _ctx;
  const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!Ctor) return null;
  try { _ctx = new Ctor(); } catch { _ctx = null; }
  return _ctx;
}

export function isSfxEnabled(): boolean {
  try { return localStorage.getItem(SFX_KEY) !== "false"; } catch { return true; }
}
export function setSfxEnabled(on: boolean) {
  try { localStorage.setItem(SFX_KEY, on ? "true" : "false"); } catch { /* noop */ }
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", gainStart = 0.18, when = 0) {
  const c = ctx();
  if (!c) return;
  // Resume autoplay-blocked context lazily
  if (c.state === "suspended") c.resume().catch(() => {});
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(gainStart, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function sweep(from: number, to: number, dur: number, type: OscillatorType = "sine") {
  const c = ctx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(0.18, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export type SfxType = "click" | "correct" | "wrong" | "complete" | "chapter";

export function playSfx(type: SfxType) {
  if (!isSfxEnabled()) return;
  switch (type) {
    case "click":
      tone(880, 0.08, "triangle", 0.1);
      break;
    case "correct":
      // rising arpeggio C-E-G
      sweep(660, 990, 0.18, "triangle");
      tone(1320, 0.12, "sine", 0.12, 0.15);
      break;
    case "wrong":
      // gentle descending blip
      sweep(500, 320, 0.18, "sine");
      break;
    case "complete":
      // C major chord arpeggio
      tone(523, 0.18, "triangle", 0.15, 0);     // C
      tone(659, 0.18, "triangle", 0.13, 0.12);  // E
      tone(784, 0.28, "triangle", 0.13, 0.24);  // G
      tone(1046, 0.32, "sine", 0.12, 0.36);     // C
      break;
    case "chapter":
      // longer fanfare
      tone(523, 0.2, "triangle", 0.16, 0);
      tone(659, 0.2, "triangle", 0.14, 0.18);
      tone(784, 0.2, "triangle", 0.14, 0.36);
      tone(1046, 0.45, "sine", 0.16, 0.55);
      tone(1318, 0.6,  "sine", 0.13, 0.95);
      break;
  }
}