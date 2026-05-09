import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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
  // CosyVoice-v2 has dropped the synchronous REST endpoint; the only supported
  // transport now is WebSocket at wss://dashscope.aliyuncs.com/api-ws/v1/inference/
  // We open the socket, drive the duplex protocol (run-task → continue-task →
  // finish-task), collect binary audio frames, and return one stitched MP3 buffer.
  // npm:ws is required because Deno's stock WebSocket client cannot send custom
  // headers (we need `Authorization: bearer …`).
  const { default: WebSocket } = await import("npm:ws@8.18.0");
  const url = "wss://dashscope.aliyuncs.com/api-ws/v1/inference/";
  const taskId = crypto.randomUUID().replace(/-/g, "");

  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const ws = new WebSocket(url, {
      headers: { Authorization: `bearer ${apiKey}`, "X-DashScope-DataInspection": "enable" },
    });
    const chunks: Uint8Array[] = [];
    let started = false;
    const fail = (msg: string) => { try { ws.close(); } catch { /* noop */ } reject(new Error(`CosyVoice WS: ${msg}`)); };
    const timer = setTimeout(() => fail("timeout after 30s"), 30_000);

    ws.on("open", () => {
      ws.send(JSON.stringify({
        header: { action: "run-task", task_id: taskId, streaming: "duplex" },
        payload: {
          task_group: "audio", task: "tts", function: "SpeechSynthesizer",
          model: "cosyvoice-v2",
          parameters: {
            text_type: "PlainText", voice, format: "mp3",
            sample_rate: 22050, volume: 50, rate: speed, pitch: 1.0,
          },
          input: {},
        },
      }));
    });

    ws.on("message", (data: ArrayBuffer | Buffer, isBinary: boolean) => {
      if (isBinary) { chunks.push(new Uint8Array(data as ArrayBuffer)); return; }
      let msg: { header?: { event?: string; error_message?: string } };
      try { msg = JSON.parse(typeof data === "string" ? data : new TextDecoder().decode(data as ArrayBuffer)); }
      catch { return; }
      const ev = msg.header?.event;
      if (ev === "task-started" && !started) {
        started = true;
        ws.send(JSON.stringify({
          header: { action: "continue-task", task_id: taskId, streaming: "duplex" },
          payload: { input: { text } },
        }));
        ws.send(JSON.stringify({
          header: { action: "finish-task", task_id: taskId, streaming: "duplex" },
          payload: { input: {} },
        }));
      } else if (ev === "task-failed") {
        fail(msg.header?.error_message || "task-failed");
      } else if (ev === "task-finished") {
        clearTimeout(timer);
        const total = chunks.reduce((n, c) => n + c.length, 0);
        const out = new Uint8Array(total);
        let off = 0;
        for (const c of chunks) { out.set(c, off); off += c.length; }
        try { ws.close(); } catch { /* noop */ }
        if (out.length === 0) reject(new Error("CosyVoice WS: empty audio"));
        else resolve(out.buffer);
      }
    });

    ws.on("error", (e: Error) => fail(e.message || String(e)));
    ws.on("close", () => { clearTimeout(timer); if (!started) fail("closed before task-started"); });
  });
}

async function synthesizeWithOpenAI(text: string, voice: string, speed: number, apiKey: string, isShort: boolean): Promise<ArrayBuffer> {
  // gpt-4o-mini-tts is OpenAI's fastest TTS model — noticeably lower
  // time-to-first-byte than tts-1, and quality is on par with tts-1-hd
  // for short utterances. Falls back to tts-1 only for very long input.
  const model = isShort ? "gpt-4o-mini-tts" : "tts-1";
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
    const hasAliyun = Boolean(Deno.env.get("DASHSCOPE_API_KEY"));
    // Prefer Aliyun whenever it is configured. The previous country-header
    // detection is unreliable behind hosted edge networks, so mainland users
    // could still be routed to OpenAI and wait a very long time. Aliyun is now
    // the primary low-latency TTS path; OpenAI remains the safety fallback.
    const useAliyun = hasAliyun || isMainlandChina(req);
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
      const b64 = base64Encode(bytes);
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

    // Persist for everyone — fire-and-forget so we don't add latency to this
    // request. The first user pays the synthesis cost; everyone after them
    // gets a CDN hit (<200ms).
    queueMicrotask(() => uploadToStorage(path, bytes!).catch(() => {}));

    // Cold path: return raw audio/mpeg bytes when the client supports it.
    // This skips base64 encoding (~33% smaller payload) and the JSON parse,
    // and lets the browser start decoding the MP3 immediately. Saves
    // ~200-500ms vs. the legacy base64-in-JSON envelope.
    if (format === "url") {
      return new Response(bytes, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
          "Content-Length": String(bytes.byteLength),
          "Cache-Control": "public, max-age=31536000, immutable",
          "x-audio-url": cdnUrl,
          "x-cache": "MISS",
        },
      });
    }
    const b64 = base64Encode(bytes);
    // Legacy clients still get the base64-in-JSON envelope.
    return json({ audioContent: b64, audioUrl: cdnUrl, mimeType: "audio/mpeg", cached: false, provider: usedProvider });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("tts error:", msg);
    return json({ error: "TTS service error" }, 500);
  }
});
