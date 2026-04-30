// Lightweight, friendly trial tracking for AI Voice Chat.
// We let guests try the feature without signing up, and only nudge them
// after they've experienced the value once.

const KEY = "ai-talk:guest-trials";

export const GUEST_TRIAL_LIMIT = 1;       // free full sessions for guests
export const GUEST_SESSION_SECONDS = 180; // 3 min trial vs 10 min for members

export function getGuestTrialsUsed(): number {
  try {
    const v = Number(localStorage.getItem(KEY) || "0");
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

export function incrementGuestTrials(): number {
  const next = getGuestTrialsUsed() + 1;
  try { localStorage.setItem(KEY, String(next)); } catch { /* noop */ }
  return next;
}

export function guestTrialsRemaining(): number {
  return Math.max(0, GUEST_TRIAL_LIMIT - getGuestTrialsUsed());
}