// Daily voice-call quota: 1 free voice session / authed user / day.
// Lightweight client-side enforcement (止血方案) — keyed by user id +
// local YYYY-MM-DD. Server-side enforcement should follow in stage 5.

const KEY = "fluentpath.dailyVoiceQuota.v1";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Store = Record<string, { date: string; count: number }>;

function read(): Store {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") as Store; }
  catch { return {}; }
}
function write(s: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export const DAILY_VOICE_LIMIT = 1;

/** Returns how many voice sessions the user has left today. */
export function voiceQuotaRemaining(userId: string | null | undefined): number {
  if (!userId) return DAILY_VOICE_LIMIT;
  const s = read();
  const entry = s[userId];
  if (!entry || entry.date !== todayStr()) return DAILY_VOICE_LIMIT;
  return Math.max(0, DAILY_VOICE_LIMIT - entry.count);
}

/** Records one voice-session use for today. */
export function consumeVoiceQuota(userId: string | null | undefined) {
  if (!userId) return;
  const s = read();
  const today = todayStr();
  const entry = s[userId];
  if (!entry || entry.date !== today) {
    s[userId] = { date: today, count: 1 };
  } else {
    s[userId] = { date: today, count: entry.count + 1 };
  }
  write(s);
}
