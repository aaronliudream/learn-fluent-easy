// Mints a short-lived ephemeral key the browser uses to open a WebRTC
// connection directly to OpenAI's Realtime API. The real OPENAI_API_KEY
// never leaves the edge function. The key is single-use and expires in
// ~1 minute, so it's safe to send to the browser.
//
// Docs: https://platform.openai.com/docs/guides/realtime#creating-an-ephemeral-token
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Map the user's CEFR level (when known) to an instruction that nudges the
// model toward the right vocabulary range without watering it down.
function levelGuidance(level?: string) {
  switch ((level || "").toUpperCase()) {
    case "A1": return "The learner is a complete beginner. Use very simple, short sentences (5-8 words). Speak slowly and clearly. Use only the most common 1000 English words. Repeat key phrases.";
    case "A2": return "The learner is elementary. Use simple sentences with basic past/future tenses. Speak at 80% normal speed. Avoid idioms and phrasal verbs.";
    case "B1": return "The learner is intermediate. Use natural conversational English at near-normal pace. You can use common idioms and phrasal verbs. Briefly rephrase if they seem confused.";
    case "B2": return "The learner is upper-intermediate. Speak as you would to a native, full speed, full vocabulary including slang. Challenge them with subtle humor and cultural references.";
    case "C1":
    case "C2": return "The learner is advanced. Speak as a native Californian would to another native. Use slang, idioms, cultural references, fast pace. Don't simplify.";
    default:   return "Adapt your level to the learner. Start at natural conversational pace; if they struggle, simplify; if they keep up, ramp up.";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not configured" }, 503);

    const { lessonTitle, levelName, unitTitle, level, voice } = await req.json().catch(() => ({}));

    const safeVoice = ["alloy","ash","ballad","coral","echo","sage","shimmer","verse"]
      .includes(String(voice)) ? String(voice) : "shimmer";

    // Build the system prompt. We constrain the model to:
    //   - Speak ONLY English (the user's request)
    //   - Sound like a friendly Californian in their early 20s
    //   - Use vocabulary calibrated to the learner's CEFR level
    //   - If the call is launched from a specific lesson, weave that topic in
    //     naturally so the conversation is meaningful "applied practice"
    //   - Keep turns short so the learner gets to talk a lot
    const lessonHook = lessonTitle
      ? `The learner just finished a lesson called "${lessonTitle}"${unitTitle ? ` in the unit "${unitTitle}"` : ""}${levelName ? ` (${levelName})` : ""}. Open the conversation by warmly bringing up that topic in a natural way ("Oh nice, I heard you were just learning about...") and steer the chat to give them practice with that topic. Don't lecture — chat like a friend would.`
      : `Open with a friendly, casual hello and ask them what they want to chat about today (suggest 2-3 fun options like weekend plans, food, movies).`;

    const systemPrompt = `You are Alex, a warm, witty, twenty-something native English speaker from California. You're chatting with someone who is learning American English and wants real conversation practice.

ABSOLUTE RULES:
- You ONLY speak English. Never switch to any other language, even if the user does. If they speak another language, gently say in English "Let's try that in English — give it a shot!" and wait.
- Sound like a real American friend, not a teacher. Use natural rhythm, contractions ("I'm", "y'know", "kinda", "gonna"), filler words occasionally ("right?", "for real?", "totally"), and California-style warmth.
- Keep YOUR turns short (1-3 sentences usually). Ask one question, then let them talk. The whole point is for THEM to practice speaking.
- If they make a small mistake, do NOT correct in the moment — keep the flow going. We'll review at the end.
- If they're stuck for >3 seconds, offer a gentle prompt or rephrase the question simpler.
- Never read out lists or long monologues. This is voice chat.

LEVEL CALIBRATION: ${levelGuidance(level)}

CONTEXT: ${lessonHook}`;

    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: safeVoice,
        modalities: ["audio", "text"],
        instructions: systemPrompt,
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: {
          type: "server_vad",
          // Higher threshold = ignores background noise, fan, keyboard, kids, etc.
          threshold: 0.78,
          prefix_padding_ms: 400,
          // Wait longer before deciding the user is done talking. Prevents
          // Alex from cutting in during natural mid-sentence pauses.
          silence_duration_ms: 1400,
          // Don't auto-fire a response the instant VAD ends — we still let
          // it auto-respond, but the longer silence above gives the user
          // breathing room. (create_response stays default true.)
        },
        temperature: 0.8,
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("realtime session error", r.status, t);
      if (r.status === 429) return json({ error: "Rate limit, please try again." }, 429);
      if (r.status === 402) return json({ error: "OpenAI credits exhausted." }, 402);
      return json({ error: "Failed to create realtime session" }, 502);
    }

    const data = await r.json();
    return json({
      client_secret: data.client_secret,
      model: "gpt-4o-realtime-preview-2024-12-17",
    });
  } catch (e) {
    console.error("realtime-token error", e);
    return json({ error: e instanceof Error ? e.message : "unknown" }, 500);
  }
});
