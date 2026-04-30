// Decides which realtime AI provider to use for a given user.
//
// - "openai" — OpenAI Realtime over WebRTC (best quality, blocked in mainland China)
// - "qwen"   — Alibaba Qwen-Omni Realtime via our edge-function proxy (works in CN)
//
// We pick lazily: the very first time a user opens the AI Talk dialog we
// race a tiny image fetch against api.openai.com with a 1.5s timeout. If
// it succeeds → openai. If it fails or times out → qwen. The result is
// cached in localStorage so subsequent sessions skip the probe.

export type AIProvider = "openai" | "qwen";

const STORAGE_KEY = "fluentpath.aiProvider";
const STORAGE_TS_KEY = "fluentpath.aiProvider.ts";
// Re-probe at most every 6 hours in case the user changes networks.
const TTL_MS = 6 * 60 * 60 * 1000;

export function getCachedProvider(): AIProvider | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    const ts = Number(localStorage.getItem(STORAGE_TS_KEY) || "0");
    if ((v === "openai" || v === "qwen") && Date.now() - ts < TTL_MS) return v;
  } catch { /* ignore */ }
  return null;
}

function cacheProvider(p: AIProvider) {
  try {
    localStorage.setItem(STORAGE_KEY, p);
    localStorage.setItem(STORAGE_TS_KEY, String(Date.now()));
  } catch { /* ignore */ }
}

export function clearProviderCache() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TS_KEY);
  } catch { /* ignore */ }
}

/**
 * Probe whether OpenAI's API is reachable from this network.
 *
 * We fetch a tiny static image with no-cors mode from openai.com — it
 * doesn't matter if the response is opaque, only whether the network
 * round-trip completes in time. Mainland China typically times out or
 * fails immediately (DNS reset / TCP reset).
 */
export async function probeOpenAIReachable(timeoutMs = 1500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // openai.com favicon — small, cacheable, served from the same edge as
    // the Realtime API. no-cors so the browser doesn't trip on CORS.
    await fetch("https://api.openai.com/favicon.ico", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve which provider to use, with caching.
 *
 * Pass `force = true` to skip the cache (e.g. user manually retried after
 * switching VPN on/off).
 */
export async function resolveProvider(force = false): Promise<AIProvider> {
  if (!force) {
    const cached = getCachedProvider();
    if (cached) return cached;
  }
  const ok = await probeOpenAIReachable();
  const provider: AIProvider = ok ? "openai" : "qwen";
  cacheProvider(provider);
  return provider;
}