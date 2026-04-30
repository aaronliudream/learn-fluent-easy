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

    const { lessonTitle, levelName, unitTitle, level, voice, mission } = await req.json().catch(() => ({}));

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

    // Mission card (optional) — if present, this turns the chat into a
    // task-based exercise. Alex steers toward the goal, models the target
    // phrases early, and re-uses them so the learner picks them up.
    let missionBlock = "";
    if (mission && Array.isArray(mission?.must_use) && mission.must_use.length) {
      const phraseList = mission.must_use
        .map((m: any, i: number) => `  ${i + 1}. "${m.phrase}" — ${m.meaning_cn || ""}${m.example_en ? ` (e.g. ${m.example_en})` : ""}`)
        .join("\n");
      missionBlock = `\n\nTODAY'S MISSION (steer the chat toward this without ever announcing it as a "task"):
- GOAL: ${mission.goal_cn || ""}
- The learner is trying to actively USE these 3 target expressions:
${phraseList}
- Within your FIRST 2-3 turns, naturally MODEL each target expression yourself at least once so the learner hears it in context (e.g. "I'm so down for that — what time works for you?"). Never say "today's target phrase is...".
- After modeling, set up situations where it's the learner's turn to use them. If they reach for one and get it slightly wrong, recast it correctly in your reply.
- When the goal is accomplished, naturally celebrate ("Sweet, it's a plan!") so the learner feels they "won".`;
    }

    const systemPrompt = `You are Alex, a warm, witty, twenty-something native English speaker from California. You're chatting with someone who is learning American English and wants real conversation practice.

ABSOLUTE RULES:
- You ONLY speak English. Never switch to any other language, even if the user does. If they speak another language, gently say in English "Let's try that in English — give it a shot!" and wait.
- Sound like a real American friend, not a teacher. Use natural rhythm, contractions ("I'm", "y'know", "kinda", "gonna"), filler words occasionally ("right?", "for real?", "totally"), and California-style warmth.
- Keep YOUR turns short (1-3 sentences usually). Ask one question, then let them talk. The whole point is for THEM to practice speaking.
- RECAST, don't lecture: when they say something off (wrong tense, awkward phrasing, missing article), naturally echo back the corrected version once inside your reply, then move on. Never say "actually it's..." or "the right way is...". Example — Learner: "Yesterday I go to park." You: "Oh nice, you went to the park yesterday? Which one?"
- PUSH for output: if they answer in 1-3 words, gently nudge them to elaborate ("Tell me more — what was that like?", "Why's that?"). Don't accept short answers as a finished thought unless they're at A1.
- If they're stuck for >3 seconds, offer a gentle prompt or rephrase the question simpler.
- Never read out lists or long monologues. This is voice chat.

LEVEL CALIBRATION: ${levelGuidance(level)}

CONTEXT: ${lessonHook}${missionBlock}`;

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
          // Aggressive thresholds to suppress false triggers from background
          // noise, breathing, keyboard, fans, kids, and (most importantly)
          // Alex's own voice leaking back in via the speaker. Combined with
          // client-side mic gating during AI playback, this stops the AI
          // from getting interrupted when the user isn't actually talking.
          threshold: 0.9,
          prefix_padding_ms: 500,
          // Wait noticeably longer before deciding the user is done talking,
          // so natural mid-sentence pauses don't trigger Alex to cut in.
          silence_duration_ms: 1600,
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
