import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "x-audio-url, x-cache",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const OPENAI_VOICES = new Set(["alloy", "shimmer", "nova", "echo", "onyx", "fable"]);

const COSYVOICE_VOICE_MAP: Record<string, string> = {
  alloy: "loongstella", shimmer: "loongstella", nova: "loongstella",
  fable: "loongstella", echo: "loongbella", onyx: "loongbella",
};

function isMainlandChina(req: Request): boolean {
  const country = (req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  if (country === "CN") return true;
  if (country && country !== "CN" && country !== "XX") return false;
  const lang = (req.headers.get("accept-language") || "").toLowerCase();
  return lang.startsWith("zh-cn") || lang.includes(",zh-cn");
}

// SHA-256 → hex (content-addressed cache key).
async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const BUCKET = "tts-audio";

function publicUrlFor(path: string): string {
  // Constructed manually so we can return it before/after upload without an extra round-trip.
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function existsInStorage(path: string): Promise<boolean> {
  // HEAD on the public URL is cheaper than the SDK list call.
  try {
    const r = await fetch(publicUrlFor(path), { method: "HEAD" });
    return r.ok;
  } catch { return false; }
}

async function uploadToStorage(path: string, bytes: ArrayBuffer): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: "audio/mpeg",
    cacheControl: "public, max-age=31536000, immutable",
    upsert: true,
  });
  if (error) console.warn("[tts] storage upload failed:", error.message);
}

async function synthesizeWithCosyVoice(text: string, voice: string, speed: number, apiKey: string): Promise<ArrayBuffer> {
  const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/audio/tts/", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "cosyvoice-v2",
      input: { text },
      parameters: { voice, format: "mp3", sample_rate: 22050, volume: 100, rate: speed, pitch: 1.0 },
    }),
  });
  if (!response.ok) {
    throw new Error(`CosyVoice ${response.status}: ${await response.text()}`);
  }
  const ct = response.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const j = await response.json();
    const b64 = j?.output?.audio?.data;
    if (typeof b64 === "string" && b64.length > 0) {
      // Decode base64 → bytes.
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out.buffer;
    }
    throw new Error(`CosyVoice unexpected JSON: ${JSON.stringify(j).slice(0, 300)}`);
  }
  return await response.arrayBuffer();
}

async function synthesizeWithOpenAI(text: string, voice: string, speed: number, apiKey: string, isShort: boolean): Promise<ArrayBuffer> {
  const model = isShort ? "tts-1" : "tts-1-hd";
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, voice, input: text, speed, response_format: "mp3" }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI ${response.status}: ${err}`);
  }
  return await response.arrayBuffer();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, voiceId, speed, accent, format } = await req.json();
    if (!text) return json({ error: "text is required" }, 400);

    const requestedVoice = typeof voiceId === "string" ? voiceId : "alloy";
    let selectedVoice = OPENAI_VOICES.has(requestedVoice) ? requestedVoice : "alloy";
    const accentUpper = typeof accent === "string" ? accent.toUpperCase() : "";
    if (accentUpper === "UK") selectedVoice = "fable";
    else if (accentUpper === "US") selectedVoice = "alloy";
    const safeSpeed = Math.min(1.2, Math.max(0.75, Number(speed) || 0.95));
    const safeText = String(text).slice(0, 4000);
    const isShort = safeText.length <= 40;
    const useAliyun = isMainlandChina(req);
    const provider: "aliyun" | "openai" = useAliyun ? "aliyun" : "openai";

    // Content-addressed cache key — same text+voice+speed always lands on the same file.
    const keyInput = `${provider}|${selectedVoice}|${safeSpeed}|${accentUpper}|${safeText}`;
    const hash = await sha256Hex(keyInput);
    const path = `${hash.slice(0, 2)}/${hash}.mp3`;
    const cdnUrl = publicUrlFor(path);

    // FAST PATH: cache hit → return URL immediately. No synthesis, no bytes
    // passing through edge. Client fetches from CDN directly.
    if (await existsInStorage(path)) {
      // `format=url` clients want JSON with the URL; legacy clients still get base64.
      if (format === "url") {
        return json({ audioUrl: cdnUrl, cached: true, provider, mimeType: "audio/mpeg" });
      }
      // Legacy: still answer with base64 for back-compat. Fetch & re-encode.
      const r = await fetch(cdnUrl);
      const bytes = await r.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
      return json({ audioContent: b64, audioUrl: cdnUrl, mimeType: "audio/mpeg", cached: true, provider });
    }

    // SLOW PATH: synthesize once.
    let bytes: ArrayBuffer | null = null;
    let usedProvider = provider;

    if (provider === "aliyun") {
      const k = Deno.env.get("DASHSCOPE_API_KEY");
      if (k) {
        try {
          const v = COSYVOICE_VOICE_MAP[selectedVoice] || "loongstella";
          bytes = await synthesizeWithCosyVoice(safeText, v, safeSpeed, k);
        } catch (err) {
          console.error("CosyVoice failed, falling back to OpenAI:", err);
        }
      }
    }
    if (!bytes) {
      const k = Deno.env.get("OPENAI_API_KEY");
      if (!k) return json({ error: "TTS provider is not configured" }, 503);
      try {
        bytes = await synthesizeWithOpenAI(safeText, selectedVoice, safeSpeed, k, isShort);
        usedProvider = "openai";
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("OpenAI TTS error:", msg);
        return json({ error: "TTS provider error", detail: msg }, 502);
      }
    }

    // Persist for everyone (fire-and-forget so we don't add latency to this call).
    queueMicrotask(() => uploadToStorage(path, bytes!).catch(() => {}));

    if (format === "url") {
      // For URL-mode clients, we still need to wait for the upload so the
      // file is there when they fetch it. But we already have the bytes —
      // give them an inline data URL instead so they can play immediately
      // while the upload happens in the background.
      const b64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
      return json({
        audioContent: b64,
        audioUrl: cdnUrl, // available momentarily; client may pre-warm cache
        mimeType: "audio/mpeg",
        cached: false,
        provider: usedProvider,
      });
    }

    const b64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));
    return json({ audioContent: b64, audioUrl: cdnUrl, mimeType: "audio/mpeg", cached: false, provider: usedProvider });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("tts error:", msg);
    return json({ error: "TTS service error" }, 500);
  }
});
