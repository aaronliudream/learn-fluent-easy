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

// ElevenLabs voices reserved for child-friendly narration. Front-end uses
// the `el:<key>` namespace so it's obvious in logs and never collides with
// OpenAI voice ids.
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  "el:lily":    "pFZP5JQG7iQjIQuC4Bku", // warm, soft female (British) — kept for back-compat
  "el:matilda": "XrExE9yKIg1WjnnlVkGX", // gentle storyteller female (US)
  "el:sarah":   "EXAVITQu4vr4xnSDxMaL", // friendly female (US)
  "el:brian":   "nPczCjzI2devNBz1zQrb", // warm adult male (US) — used for "Dad" lines
  "el:george":  "JBFqnCBsd6RMkjVDRZzb", // mature male narrator (British)
  "el:callum":  "N2lVS1w4EtoT3dr4eOWO", // playful male (Scottish) — kept for back-compat
  // American voices preferred for primary kids (no British/Scottish accent):
  "el:jessica": "cgSgspJ2msm6clMCkdW9", // bright friendly American female — kid/girl roles
  "el:laura":   "FGY2WhTYpPnrIDTdsKH5", // warm American young female
  "el:liam":    "TX3LPaxmHKxFdv7VOQHJ", // young American male — Spark / boy peers
  "el:eric":    "cjVigY5qzO86Huf0OWal", // friendly American male
};

// CosyVoice-v2 voice catalogue (all suffixed with _v2). Map our six OpenAI-style
// front-end voice handles to the closest CosyVoice-v2 timbre so cached audio is
// stable per voice and the assistant sounds like the same "person" across providers.
const COSYVOICE_VOICE_MAP: Record<string, string> = {
  shimmer: "longxiaochun_v2", // warm female "teacher" — default for 小月
  alloy:   "longxiaochun_v2",
  nova:    "longxiaoxia_v2",  // bright female
  fable:   "longwan_v2",      // gentle female narrator
  echo:    "longcheng_v2",    // calm male
  onyx:    "longshu_v2",      // deeper male
};

// Volcano Engine (火山引擎) bigtts voice map — used for mainland-China traffic.
// These are English-capable "mars_bigtts" voices that also speak Chinese well,
// so a single voice handles bilingual explanations cleanly.
const VOLCANO_VOICE_MAP: Record<string, string> = {
  shimmer: "en_female_anna_mars_bigtts",   // warm female (default)
  alloy:   "en_female_anna_mars_bigtts",
  nova:    "en_female_skye_emo_v2_mars_bigtts", // bright female
  fable:   "en_female_sarah_mars_bigtts",  // gentle female narrator
  echo:    "en_male_adam_mars_bigtts",     // calm male
  onyx:    "en_male_smith_mars_bigtts",    // deeper male
  // ElevenLabs handles map to a sensible Volcano equivalent
  "el:lily":    "en_female_anna_mars_bigtts",
  "el:matilda": "en_female_sarah_mars_bigtts",
  "el:sarah":   "en_female_sarah_mars_bigtts",
  "el:jessica": "en_female_anna_mars_bigtts",
  "el:laura":   "en_female_anna_mars_bigtts",
  "el:brian":   "en_male_adam_mars_bigtts",
  "el:george":  "en_male_smith_mars_bigtts",
  "el:callum":  "en_male_adam_mars_bigtts",
  "el:liam":    "en_male_adam_mars_bigtts",
  "el:eric":    "en_male_adam_mars_bigtts",
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

// Optional Cloudflare (or other) CDN that reverse-proxies the Storage bucket.
// When set, this is what we hand BACK TO CLIENTS so they fetch MP3s via the
// CDN (fast in mainland China). Internally we still HEAD-probe the raw
// Supabase Storage URL — that path is the source of truth and we don't want
// CDN cache state to confuse cache-hit detection.
const AUDIO_CDN_BASE = (Deno.env.get("AUDIO_CDN_BASE") || "").replace(/\/$/, "");

function storageUrlFor(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

function publicUrlFor(path: string): string {
  // What clients see. CDN-first if configured, raw Storage otherwise.
  if (AUDIO_CDN_BASE) return `${AUDIO_CDN_BASE}/${path}`;
  return storageUrlFor(path);
}

async function existsInStorage(path: string): Promise<boolean> {
  // HEAD on the raw Storage URL (not the CDN) so we don't get fooled by
  // stale CDN 404 caching. Cheaper than the SDK list call.
  try {
    const r = await fetch(storageUrlFor(path), { method: "HEAD" });
    return r.ok;
  } catch { return false; }
}

async function uploadToStorage(path: string, bytes: ArrayBuffer): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: "audio/mpeg",
    // ★ 只能传秒数,Supabase 自己拼 `max-age=<值>`。
    // 之前传整串 header,拼出来是非法的 `max-age=public, max-age=31536000, immutable`
    // (2026-08-06 实测裸 Supabase URL 返回的就是这个)—— 走 audio.bigmooneducation.com
    // 时被 Cloudflare 规则覆盖所以没暴雷,但回退到裸 URL 的路径会失去缓存。
    // 存量 53787 条已由 SQLAA/DONE_storage_cache_control_fix.sql 刷正。
    cacheControl: "31536000",
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

async function synthesizeWithElevenLabs(text: string, voiceKey: string, speed: number, apiKey: string): Promise<ArrayBuffer> {
  const voiceId = ELEVENLABS_VOICE_MAP[voiceKey] || ELEVENLABS_VOICE_MAP["el:lily"];
  // ElevenLabs accepts speed 0.7-1.2 in voice_settings.
  const elSpeed = Math.min(1.2, Math.max(0.7, speed));
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.8,
        style: 0.35,
        use_speaker_boost: true,
        speed: elSpeed,
      },
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs ${response.status}: ${err}`);
  }
  return await response.arrayBuffer();
}

async function synthesizeWithVolcano(
  text: string,
  voiceType: string,
  speed: number,
  appId: string,
  accessToken: string,
  cluster: string,
): Promise<ArrayBuffer> {
  // Volcano Engine TTS — HTTP one-shot (non-streaming) endpoint.
  // Docs: https://www.volcengine.com/docs/6561/79817
  const url = "https://openspeech.bytedance.com/api/v1/tts";
  const body = {
    app: { appid: appId, token: accessToken, cluster },
    user: { uid: "fluentpath-anon" },
    audio: {
      voice_type: voiceType,
      encoding: "mp3",
      speed_ratio: Math.min(2.0, Math.max(0.5, speed)),
      rate: 24000,
    },
    request: {
      reqid: crypto.randomUUID(),
      text,
      operation: "query",
    },
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      // Note the literal "Bearer;" — Volcano requires the semicolon, not a space.
      Authorization: `Bearer;${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Volcano ${resp.status}: ${t}`);
  }
  const j = await resp.json() as { code?: number; message?: string; data?: string };
  if (!j.data || (j.code !== undefined && j.code !== 3000)) {
    throw new Error(`Volcano code=${j.code} msg=${j.message || "no data"}`);
  }
  // data is base64-encoded MP3.
  const bin = atob(j.data);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text, voiceId, speed, accent, format } = await req.json();
    if (!text) return json({ error: "text is required" }, 400);

    const requestedVoice = typeof voiceId === "string" ? voiceId : "alloy";
    const isElevenLabs = requestedVoice.startsWith("el:");
    let selectedVoice = isElevenLabs
      ? (ELEVENLABS_VOICE_MAP[requestedVoice] ? requestedVoice : "el:lily")
      : (OPENAI_VOICES.has(requestedVoice) ? requestedVoice : "alloy");
    const accentUpper = typeof accent === "string" ? accent.toUpperCase() : "";
    if (!isElevenLabs) {
      if (accentUpper === "UK") selectedVoice = "fable";
      else if (accentUpper === "US") selectedVoice = "alloy";
    }
    // Allow slower speeds for young learners (down to 0.6).
    const safeSpeed = Math.min(1.2, Math.max(0.6, Number(speed) || 0.95));
    const safeText = String(text).slice(0, 4000);
    const isShort = safeText.length <= 40;
    // Routing:
    //   - Mainland-China traffic → Volcano Engine (火山引擎) bigtts, which is
    //     reachable inside China and avoids the OpenAI / ElevenLabs round-trip
    //     that often stalls on the Great Firewall.
    //   - Everyone else → ElevenLabs for `el:` voices, OpenAI otherwise.
    // Content-addressed Supabase Storage cache means each unique
    // (provider, voice, speed, text) is only synthesized ONCE; subsequent
    // plays for ANY user worldwide are served from CDN (<200ms).
    const fromCN = isMainlandChina(req);
    const provider: "volcano" | "aliyun" | "openai" | "elevenlabs" =
      fromCN && Deno.env.get("VOLCANO_TTS_APP_ID") && Deno.env.get("VOLCANO_TTS_ACCESS_TOKEN")
        ? "volcano"
        : isElevenLabs
        ? "elevenlabs"
        : "openai";

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

    if (provider === "elevenlabs") {
      const k = Deno.env.get("ELEVENLABS_API_KEY");
      if (k) {
        try {
          bytes = await synthesizeWithElevenLabs(safeText, selectedVoice, safeSpeed, k);
          usedProvider = "elevenlabs";
        } catch (err) {
          console.error("ElevenLabs failed, falling back to OpenAI:", err);
        }
      }
    } else if (provider === "volcano") {
      const appId = Deno.env.get("VOLCANO_TTS_APP_ID");
      const token = Deno.env.get("VOLCANO_TTS_ACCESS_TOKEN");
      const cluster = Deno.env.get("VOLCANO_TTS_CLUSTER") || "volcano_tts";
      if (appId && token) {
        try {
          const v = VOLCANO_VOICE_MAP[selectedVoice] || VOLCANO_VOICE_MAP[requestedVoice] || "en_female_anna_mars_bigtts";
          bytes = await synthesizeWithVolcano(safeText, v, safeSpeed, appId, token, cluster);
          usedProvider = "volcano" as typeof usedProvider;
        } catch (err) {
          console.error("Volcano TTS failed, falling back to OpenAI:", err);
        }
      }
    } else if (provider === "aliyun") {
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
        // Fallback voice if we asked for ElevenLabs but it failed: pick a warm female.
        const fallbackVoice = isElevenLabs ? "shimmer" : selectedVoice;
        bytes = await synthesizeWithOpenAI(safeText, fallbackVoice, safeSpeed, k, isShort);
        usedProvider = "openai";
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("OpenAI TTS error:", msg);
        return json({ error: "TTS provider error", detail: msg }, 502);
      }
    }

    // Persist for everyone BEFORE responding, so the client can immediately
    // fetch the MP3 from the CDN (Cloudflare). This adds ~100-300ms to the
    // first-ever request for a phrase, but every subsequent play (for any
    // user, anywhere) skips the Edge Function entirely and is served from
    // the CDN — critical for mainland-China latency.
    await uploadToStorage(path, bytes!);

    // Cold path: return CDN URL as JSON. We no longer return the raw MP3
    // bytes through the Edge Function — that bypassed the CDN and was the
    // reason China users saw slow first plays.
    if (format === "url") {
      return json({
        audioUrl: cdnUrl,
        cached: false,
        provider: usedProvider,
        mimeType: "audio/mpeg",
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
