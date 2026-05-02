import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// OpenAI TTS voice IDs we expose. Our app already uses these names, so this
// is a 1:1 mapping — every voice produces highly natural English speech on
// every browser/device because the audio is synthesized server-side and
// delivered as MP3.
const OPENAI_VOICES = new Set([
  "alloy", "shimmer", "nova", "echo", "onyx", "fable",
]);

// Map our app's voice IDs to Alibaba CosyVoice voice IDs. CosyVoice has
// excellent English voices — we pick natural-sounding ones that roughly
// match the timbre of the OpenAI voice the user picked, so switching
// providers feels seamless.
const COSYVOICE_VOICE_MAP: Record<string, string> = {
  alloy:   "loongstella",  // warm female English
  shimmer: "loongstella",
  nova:    "loongstella",
  fable:   "loongstella",
  echo:    "loongbella",   // male-leaning English
  onyx:    "loongbella",
};

// Detect whether a request is coming from mainland China. We rely on
// Cloudflare's `cf-ipcountry` header (set on Supabase Edge), then fall
// back to `accept-language` containing zh-CN. False = treat as overseas
// and use OpenAI; true = use Alibaba CosyVoice (much faster inside CN).
function isMainlandChina(req: Request): boolean {
  const country = (req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  if (country === "CN") return true;
  if (country && country !== "CN" && country !== "XX") return false; // trusted non-CN
  // No country header — fall back to language hint.
  const lang = (req.headers.get("accept-language") || "").toLowerCase();
  return lang.startsWith("zh-cn") || lang.includes(",zh-cn");
}

// In-memory cache shared across requests on the same edge instance. Short
// utterances (single words / phrases) are looked up reliably here, so
// repeated clicks on the same word return instantly without re-calling
// the upstream provider. Capped to keep memory bounded.
const audioCache = new Map<string, string>();
const MAX_CACHE = 500;
const cacheGet = (k: string) => {
  const v = audioCache.get(k);
  if (v !== undefined) {
    // refresh LRU position
    audioCache.delete(k);
    audioCache.set(k, v);
  }
  return v;
};
const cacheSet = (k: string, v: string) => {
  if (audioCache.size >= MAX_CACHE) {
    const firstKey = audioCache.keys().next().value;
    if (firstKey) audioCache.delete(firstKey);
  }
  audioCache.set(k, v);
};

// Call Alibaba DashScope CosyVoice TTS. Returns base64-encoded MP3 on
// success, or throws with a descriptive error.
async function synthesizeWithCosyVoice(opts: {
  text: string;
  voice: string;
  speed: number;
  apiKey: string;
}): Promise<string> {
  const response = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "cosyvoice-v2",
        input: { text: opts.text },
        parameters: {
          voice: opts.voice,
          format: "mp3",
          sample_rate: 22050,
          volume: 100,
          rate: opts.speed, // 0.5 – 2.0
          pitch: 1.0,
        },
      }),
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`CosyVoice ${response.status}: ${errText}`);
  }

  // CosyVoice sync endpoint returns MP3 audio directly when Accept is audio,
  // or a JSON wrapper with `output.audio.data` (base64) otherwise. We sent
  // JSON content-type without an Accept override, so handle both.
  const ct = response.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await response.json();
    const b64 = j?.output?.audio?.data;
    if (typeof b64 === "string" && b64.length > 0) return b64;
    throw new Error(`CosyVoice unexpected JSON: ${JSON.stringify(j).slice(0, 300)}`);
  }
  const buf = await response.arrayBuffer();
  return base64Encode(buf);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, voiceId, speed, accent } = await req.json();
    if (!text) {
      return json({ error: "text is required" }, 400);
    }

    const requestedVoice = typeof voiceId === "string" ? voiceId : "alloy";
    let selectedVoice = OPENAI_VOICES.has(requestedVoice) ? requestedVoice : "alloy";

    // Accent override: force a UK or US voice when caller specifies one.
    // OpenAI's `fable` is the British-leaning voice; `alloy` is General American.
    const accentUpper = typeof accent === "string" ? accent.toUpperCase() : "";
    if (accentUpper === "UK") selectedVoice = "fable";
    else if (accentUpper === "US") selectedVoice = "alloy";
    // Both providers support roughly 0.5–2.0; clamp to a friendly learning range.
    const safeSpeed = Math.min(1.2, Math.max(0.75, Number(speed) || 0.95));
    const safeText = String(text).slice(0, 4000);

    const isShort = safeText.length <= 40;

    // Pick provider based on the user's geography. Mainland China users
    // get Alibaba CosyVoice (servers inside CN → ~200ms vs ~3s for OpenAI),
    // everyone else gets OpenAI's natural English voices.
    const useAliyun = isMainlandChina(req);
    const provider: "aliyun" | "openai" = useAliyun ? "aliyun" : "openai";

    // Check the in-memory cache first for short utterances. We only cache
    // shorts because long paragraphs would blow the memory budget quickly
    // and aren't repeated enough to benefit from caching.
    const cacheKey = isShort ? `${provider}|${selectedVoice}|${safeSpeed}|${safeText}` : null;
    if (cacheKey) {
      const hit = cacheGet(cacheKey);
      if (hit) {
        return json({ audioContent: hit, mimeType: "audio/mpeg", cached: true });
      }
    }

    // ===== Mainland China → Alibaba CosyVoice =====
    if (provider === "aliyun") {
      const DASHSCOPE_API_KEY = Deno.env.get("DASHSCOPE_API_KEY");
      if (!DASHSCOPE_API_KEY) {
        // Fall back to OpenAI if Aliyun key is not configured.
        console.warn("DASHSCOPE_API_KEY missing; falling back to OpenAI");
      } else {
        try {
          const cosyVoice = COSYVOICE_VOICE_MAP[selectedVoice] || "loongstella";
          const audioContent = await synthesizeWithCosyVoice({
            text: safeText,
            voice: cosyVoice,
            speed: safeSpeed,
            apiKey: DASHSCOPE_API_KEY,
          });
          if (cacheKey) cacheSet(cacheKey, audioContent);
          return json({ audioContent, mimeType: "audio/mpeg", provider: "aliyun" });
        } catch (err) {
          // On any CosyVoice failure, fall through to OpenAI so the user
          // still hears something rather than getting an error.
          console.error("CosyVoice failed, falling back to OpenAI:", err);
        }
      }
    }

    // ===== Overseas (or fallback) → OpenAI =====
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "TTS provider is not configured" }, 503);

    // Use the faster `tts-1` model for short utterances (single words /
    // short phrases) — 3–5× faster than `tts-1-hd` and the quality
    // difference is inaudible at this length.
    const model = isShort ? "tts-1" : "tts-1-hd";

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice: selectedVoice,
        input: safeText,
        speed: safeSpeed,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI TTS via Lovable AI error:", response.status, err);
      if (response.status === 429) {
        return json({ error: "Rate limit exceeded, please try again later.", retryable: true }, 429);
      }
      if (response.status === 402) {
        return json({ error: "TTS provider credits are exhausted" }, 402);
      }
      if (response.status === 401 || response.status === 403) {
        return json({ error: "TTS provider rejected the configured key" }, 503);
      }
      return json({ error: "TTS provider error", retryable: response.status >= 500 }, 502);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioContent = base64Encode(audioBuffer);

    if (cacheKey) cacheSet(cacheKey, audioContent);

    return json({ audioContent, mimeType: "audio/mpeg", provider: "openai" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("tts error:", msg);
    return json({ error: "TTS service error" }, 500);
  }
});
