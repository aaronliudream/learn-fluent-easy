// Aliyun (DashScope) Paraformer-v2 ASR — async file recognition.
//
// Flow:
//   1. Client POSTs { audio_base64, mime, language_hints? } (or { audio_url })
//   2. We upload the audio to the public `asr-input` bucket so DashScope can fetch it
//   3. Submit an async transcription task to paraformer-v2
//   4. Poll the task until SUCCEEDED / FAILED (typically 1–3s for short clips)
//   5. Fetch the transcription JSON, return { text, duration_ms, task_id }
//
// Why async file API instead of WebSocket realtime?
//   - Accepts every container kids' browsers actually record (webm/opus, mp4, m4a, mp3, wav)
//   - No need to transcode opus → pcm in Deno (which is painful)
//   - One-shot HTTP from the client; the polling stays server-side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DASHSCOPE_KEY = Deno.env.get("DASHSCOPE_API_KEY");
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const BUCKET = "asr-input";

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("mp4") || m.includes("m4a") || m.includes("aac")) return "m4a";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  if (m.includes("wav")) return "wav";
  if (m.includes("ogg")) return "ogg";
  return "webm";
}

async function uploadAudio(bytes: Uint8Array, mime: string): Promise<string> {
  const ext = extFromMime(mime);
  const id = crypto.randomUUID();
  const path = `${id.slice(0, 2)}/${id}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: mime || "application/octet-stream",
    cacheControl: "no-cache",
    upsert: false,
  });
  if (error) throw new Error(`upload failed: ${error.message}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function submitTask(audioUrl: string, languageHints: string[]): Promise<string> {
  const r = await fetch(
    "https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DASHSCOPE_KEY}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "paraformer-v2",
        input: { file_urls: [audioUrl] },
        parameters: { language_hints: languageHints },
      }),
    },
  );
  if (!r.ok) throw new Error(`submit failed ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const taskId = j?.output?.task_id;
  if (!taskId) throw new Error(`no task_id in submit response: ${JSON.stringify(j)}`);
  return taskId;
}

async function pollTask(taskId: string, timeoutMs = 30_000): Promise<{ status: string; results?: Array<{ transcription_url?: string; subtask_status?: string; message?: string }> }> {
  const start = Date.now();
  let delay = 600;
  while (Date.now() - start < timeoutMs) {
    const r = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${DASHSCOPE_KEY}` },
    });
    if (!r.ok) throw new Error(`poll failed ${r.status}: ${await r.text()}`);
    const j = await r.json();
    const status = j?.output?.task_status as string | undefined;
    if (status === "SUCCEEDED" || status === "FAILED") {
      return { status, results: j?.output?.results };
    }
    await new Promise((res) => setTimeout(res, delay));
    delay = Math.min(delay + 400, 2_000);
  }
  throw new Error("polling timeout");
}

async function fetchTranscript(transcriptionUrl: string): Promise<{ text: string; duration_ms: number }> {
  const r = await fetch(transcriptionUrl);
  if (!r.ok) throw new Error(`transcription fetch failed ${r.status}`);
  const j = await r.json();
  // Paraformer JSON: { transcripts: [{ text, sentences: [...] }], properties: { ... } }
  const text = (j?.transcripts?.[0]?.text || "").trim();
  const sentences = j?.transcripts?.[0]?.sentences || [];
  const last = sentences[sentences.length - 1];
  const duration = typeof last?.end_time === "number" ? last.end_time : 0;
  return { text, duration_ms: duration };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!DASHSCOPE_KEY) return json({ error: "DASHSCOPE_API_KEY not configured" }, 503);

  try {
    const body = await req.json().catch(() => ({}));
    const { audio_base64, audio_url, mime, language_hints } = body as {
      audio_base64?: string;
      audio_url?: string;
      mime?: string;
      language_hints?: string[];
    };

    let url: string;
    if (audio_url) {
      url = audio_url;
    } else if (audio_base64) {
      const bytes = b64ToBytes(audio_base64);
      if (bytes.length === 0) return json({ error: "empty audio" }, 400);
      if (bytes.length > 25 * 1024 * 1024) return json({ error: "audio too large (>25MB)" }, 413);
      url = await uploadAudio(bytes, mime || "audio/webm");
    } else {
      return json({ error: "audio_base64 or audio_url is required" }, 400);
    }

    const hints = Array.isArray(language_hints) && language_hints.length ? language_hints : ["en", "zh"];
    const taskId = await submitTask(url, hints);
    const polled = await pollTask(taskId);

    if (polled.status !== "SUCCEEDED") {
      const sub = polled.results?.[0];
      return json({
        error: "transcription failed",
        task_status: polled.status,
        subtask_status: sub?.subtask_status,
        detail: sub?.message,
      }, 502);
    }

    const tUrl = polled.results?.[0]?.transcription_url;
    if (!tUrl) return json({ error: "no transcription_url" }, 502);

    const { text, duration_ms } = await fetchTranscript(tUrl);
    return json({ text, duration_ms, task_id: taskId, audio_url: url, provider: "aliyun-paraformer-v2" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("asr-aliyun error:", msg);
    return json({ error: "ASR service error", detail: msg }, 500);
  }
});