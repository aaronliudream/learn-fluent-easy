import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Msg = { role: "user" | "assistant"; content: string; part?: number };

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function base64ToBytes(input: string): Uint8Array {
  const clean = input.includes(",") ? input.split(",").pop() || "" : input;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function buildSystem(opts: { part: number; targetBand: number; topicCategory: string | null; cueCard: string | null }) {
  const cue = opts.cueCard || `Describe a place you have visited that you would recommend to others.
You should say:
• where it is
• when you went there
• what you did there
• and explain why you would recommend it.`;

  return `You are Daniel, a certified British IELTS Speaking examiner running a realistic IELTS Speaking mock test.

Return ONLY the next examiner line to be spoken aloud. No markdown. No labels. No analysis.

Rules:
- Be neutral, polite, and examiner-like. Never teach, correct, praise, or explain during the test.
- Keep most turns to one short question. The candidate must do most of the talking.
- Speak natural British English.
- Target band: ${opts.targetBand}. ${opts.topicCategory ? `Preferred topic theme: ${opts.topicCategory}.` : ""}

Flow:
- If the transcript is empty, say: "Good morning. My name is Daniel, and I'll be your examiner today. Could you please tell me your full name?"
- Part 1: ask short personal questions one at a time. After about 4 candidate answers, move to Part 2.
- Part 2: introduce the cue card exactly once:
"Now I'm going to give you a topic and I'd like you to talk about it for one to two minutes.
${cue}
You have one minute to think about what you're going to say. You can make notes if you wish. Do you understand?"
After the candidate answers the Part 2 cue card, ask one short rounding-off question, then move to Part 3.
- Part 3: ask abstract discussion questions related to the Part 2 theme. Ask one question at a time. After 4-5 candidate answers, say: "Thank you. That is the end of the speaking test."

Current visible part in the app: Part ${opts.part}.`;
}

async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const bytes = base64ToBytes(audioBase64);
  if (bytes.byteLength < 800) return "";

  const fileExt = mimeType.includes("mp4") ? "mp4" : mimeType.includes("mpeg") || mimeType.includes("mp3") ? "mp3" : "webm";
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: mimeType || "audio/webm" }), `answer.${fileExt}`);
  form.append("model", "whisper-1");
  form.append("language", "en");
  form.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) throw new Error(`Transcription failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  return String(data?.text || "").trim();
}

async function nextExaminerLine(opts: { messages: Msg[]; part: number; targetBand: number; topicCategory: string | null; cueCard: string | null }) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: buildSystem(opts) },
        ...opts.messages.slice(-18).map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.45,
      max_tokens: 260,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("AI 请求过于频繁，请稍后再试。");
    if (response.status === 402) throw new Error("AI 额度不足，请在工作区用量中充值。");
    throw new Error(`Examiner AI failed: ${response.status} ${await response.text()}`);
  }
  const data = await response.json();
  return String(data?.choices?.[0]?.message?.content || "").replace(/\[\[[^\]]+\]\]/g, "").trim();
}

async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "fable",
      input: text.slice(0, 3000),
      response_format: "mp3",
      speed: 0.95,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI TTS failed: ${response.status} ${await response.text()}`);
  return response.arrayBuffer();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages as Msg[] : [];
    const part = [1, 2, 3].includes(Number(body.part)) ? Number(body.part) : 1;
    const targetBand = Number(body.targetBand) || 6.5;
    const topicCategory = typeof body.topicCategory === "string" ? body.topicCategory : null;
    const cueCard = typeof body.cueCard === "string" ? body.cueCard : null;

    let userText = "";
    if (!body.startOnly) {
      if (typeof body.audioBase64 !== "string") return json({ error: "audioBase64 is required" }, 400);
      userText = await transcribeAudio(body.audioBase64, String(body.mimeType || "audio/webm"));
      if (!userText) return json({ error: "没有识别到英文回答，请靠近麦克风后重试。" }, 422);
    }

    const chatMessages = userText ? [...messages, { role: "user" as const, content: userText, part }] : messages;
    const assistantText = await nextExaminerLine({ messages: chatMessages, part, targetBand, topicCategory, cueCard });
    if (!assistantText) return json({ error: "考官没有生成回复，请重试。" }, 502);

    const audio = await synthesizeSpeech(assistantText);
    return json({ userText, assistantText, audioContent: base64Encode(audio), mimeType: "audio/mpeg" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("ielts-voice-turn error:", msg);
    return json({ error: msg }, 500);
  }
});