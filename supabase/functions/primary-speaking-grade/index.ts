import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "@supabase/supabase-js";

// Grade a child's spoken attempt at a target English sentence.
// Pipeline: audio (base64) -> ElevenLabs STT -> Lovable AI evaluation
// Output: scores, gentle correction, kid-friendly encouragement, 3 scenario replacements.

const ELEVEN_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function transcribe(audioB64: string, mime: string): Promise<string> {
  if (!ELEVEN_KEY) throw new Error("ELEVENLABS_API_KEY missing");
  const bytes = b64ToBytes(audioB64);
  const blob = new Blob([bytes], { type: mime || "audio/webm" });
  const fd = new FormData();
  fd.append("file", blob, "speech.webm");
  fd.append("model_id", "scribe_v2");
  fd.append("language_code", "eng");
  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": ELEVEN_KEY },
    body: fd,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`STT failed ${r.status}: ${t}`);
  }
  const j = await r.json();
  return (j.text || "").trim();
}

async function evaluate(target: string, transcript: string, grade: number, scenario: string) {
  if (!LOVABLE_KEY) throw new Error("LOVABLE_API_KEY missing");
  const sys = `You are a warm, encouraging English teacher for Chinese primary school students (G1-G6).
CRITICAL RULES:
- Always be positive and gentle. Never shame the child.
- All content must be safe, age-appropriate, uplifting (no violence/sex/politics/scary themes).
- Use simple words a Chinese kid would understand. Encouragement is in Chinese; sentences are in English.
- Be tolerant of child voice / minor pronunciation slips. If the core meaning is right, score high.
- Replacement sentences must reuse the SAME pattern as target, fit the scenario, and feel meaningful (not random word swaps).`;

  const user = `Target sentence: "${target}"
What the child said (auto-transcribed, may have STT errors): "${transcript || "(silence)"}"
Grade level: G${grade || 3}
Scenario / pet context: ${scenario || "Pet Spark and the child are playing together"}

Score 0-100 generously (kid voice tolerant):
- pronunciation_score: phoneme accuracy
- fluency_score: smoothness, pace
- completeness_score: did they say all the key words
- overall_score: weighted average

Then return: encouragement (Chinese, warm, 1 short sentence), corrections (array of {word, tip_cn} for at most 2 trickiest sounds, empty if perfect), replacements (3 English sentences using the same pattern, scenario-driven & meaningful for a kid + pet).`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      tools: [{
        type: "function",
        function: {
          name: "grade_speech",
          description: "Return a kid-friendly speech grading result.",
          parameters: {
            type: "object",
            properties: {
              overall_score: { type: "integer" },
              pronunciation_score: { type: "integer" },
              fluency_score: { type: "integer" },
              completeness_score: { type: "integer" },
              encouragement: { type: "string" },
              corrections: {
                type: "array",
                items: {
                  type: "object",
                  properties: { word: { type: "string" }, tip_cn: { type: "string" } },
                  required: ["word", "tip_cn"],
                },
              },
              replacements: { type: "array", items: { type: "string" } },
            },
            required: ["overall_score", "pronunciation_score", "fluency_score", "completeness_score", "encouragement", "corrections", "replacements"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "grade_speech" } },
    }),
  });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (r.status === 402) throw new Error("PAYMENT_REQUIRED");
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`AI eval failed ${r.status}: ${t}`);
  }
  const j = await r.json();
  const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("AI returned no tool call");
  return JSON.parse(args);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { target, audio_base64, mime, grade, scenario, audio_duration_ms } = await req.json();
    if (!target || !audio_base64) {
      return new Response(JSON.stringify({ error: "target and audio_base64 required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcript = await transcribe(audio_base64, mime || "audio/webm");
    const result = await evaluate(target, transcript, grade ?? 3, scenario ?? "");

    // Save attempt (best-effort) if user is authenticated
    try {
      const authHeader = req.headers.get("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      if (token) {
        const sb = createClient(SUPABASE_URL, SERVICE_KEY);
        const { data: u } = await sb.auth.getUser(token);
        const uid = u?.user?.id;
        if (uid) {
          await sb.from("primary_speaking_attempts").insert({
            user_id: uid, grade: grade ?? null, target_sentence: target,
            transcript, overall_score: result.overall_score,
            pronunciation_score: result.pronunciation_score,
            fluency_score: result.fluency_score,
            completeness_score: result.completeness_score,
            encouragement: result.encouragement,
            corrections: result.corrections, replacements: result.replacements,
            scenario: scenario ?? null, audio_duration_ms: audio_duration_ms ?? null,
          });
        }
      }
    } catch (e) { console.error("save attempt skipped", e); }

    return new Response(JSON.stringify({ transcript, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    const msg = e?.message || "unknown";
    const status = msg === "RATE_LIMIT" ? 429 : msg === "PAYMENT_REQUIRED" ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});