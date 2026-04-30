// Workplace dialogue post-lesson training generator + grader.
//
// Modes (POST JSON):
//
//   { mode: "vocab", dialogue: { title, lines: [{speaker,en,cn}] } }
//     → { items: [{ word, pos, meaning_cn, example, example_cn, tip }] }  (6–10)
//
//   { mode: "dictation", dialogue: { title, lines: [...] } }
//     → { items: [{ lineIndex, sentence, blanks: [{ index, answer, hint }] }] }  (4–6)
//        `sentence` is the original english line; blanks are key content words to listen for.
//
//   { mode: "roleplay_seed", dialogue: { title, lines, scenario } }
//     → { setting, userRole, aiRole, openingLine, goals: [string] }
//
//   { mode: "roleplay_grade", history: [{role,content}], userTurn: string,
//     dialogue: { title, lines } }
//     → {
//         reply: string,         // ai's next line in the roleplay
//         feedback: {            // graded on USER's last turn
//           score: number,       // 0..100
//           grammar: string, vocabulary: string, naturalness: string,
//           suggestion: string   // one improved alternative
//         }
//       }
//
// All responses are JSON (no streaming) — they are short and used by a quiz UI.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

type Line = { speaker: string; en: string; cn: string };

const compactDialogue = (lines: Line[], max = 24) => {
  return lines.slice(0, max).map((l, i) => `${i}. ${l.speaker}: ${l.en}`).join("\n");
};

async function callTool(systemPrompt: string, userPrompt: string, tool: any) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("AI gateway not configured");

  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } },
    }),
  });

  if (!resp.ok) {
    if (resp.status === 429) throw new Error("Rate limited, please try again in a minute");
    if (resp.status === 402) throw new Error("AI credits exhausted");
    const t = await resp.text();
    throw new Error(`AI gateway ${resp.status}: ${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  const call = data?.choices?.[0]?.message?.tool_calls?.[0];
  const argStr = call?.function?.arguments;
  if (!argStr) throw new Error("AI returned no tool call");
  return JSON.parse(argStr);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const mode = String(body?.mode ?? "");
    const dialogue = body?.dialogue ?? {};
    const title = String(dialogue?.title ?? "Workplace dialogue");
    const lines: Line[] = Array.isArray(dialogue?.lines) ? dialogue.lines : [];
    const transcript = compactDialogue(lines);

    if (mode === "vocab") {
      const out = await callTool(
        "You are a TOEFL/IELTS-grade ESL coach who teaches American workplace English to Chinese learners. Extract the most useful, transferable vocabulary and collocations from the dialogue — prefer business idioms, phrasal verbs, and natural workplace phrases over basic words. Return Chinese explanations.",
        `Dialogue title: ${title}\n\nTranscript:\n${transcript}\n\nReturn 6–10 items.`,
        {
          type: "function",
          function: {
            name: "return_vocab",
            description: "Return key vocabulary cards.",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      word: { type: "string", description: "Word or phrase exactly as it appears" },
                      pos: { type: "string", description: "Part of speech, e.g. n., v., phr., idiom" },
                      meaning_cn: { type: "string", description: "Chinese meaning, concise" },
                      example: { type: "string", description: "A short natural workplace example sentence (different from dialogue)" },
                      example_cn: { type: "string", description: "Chinese translation of example" },
                      tip: { type: "string", description: "Usage tip or common pitfall, in Chinese (<=30 chars)" },
                    },
                    required: ["word", "pos", "meaning_cn", "example", "example_cn"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
          },
        },
      );
      return json(out);
    }

    if (mode === "dictation") {
      const out = await callTool(
        "You design listening dictation drills. Pick 4–6 of the most pedagogically useful sentences from the dialogue (varied speakers, varied difficulty). For each sentence, blank out 1–2 KEY content words (nouns, verbs, idioms — never articles or auxiliaries). The 'sentence' field MUST be the unmodified original English line.",
        `Dialogue title: ${title}\n\nTranscript (with line indexes):\n${transcript}`,
        {
          type: "function",
          function: {
            name: "return_dictation",
            description: "Return dictation items.",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      lineIndex: { type: "number" },
                      sentence: { type: "string", description: "The exact original English line" },
                      blanks: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            answer: { type: "string", description: "The exact word/phrase to type (lowercase OK, will be matched case-insensitively)" },
                            hint: { type: "string", description: "Short Chinese hint about meaning or part of speech" },
                          },
                          required: ["answer", "hint"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["lineIndex", "sentence", "blanks"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
          },
        },
      );
      return json(out);
    }

    if (mode === "roleplay_seed") {
      const out = await callTool(
        "You set up workplace English role-play scenarios. Based on the dialogue, define a fresh related scenario where the learner practices with you. Pick the more challenging speaking role for the learner (e.g. they should drive the conversation, ask questions, or push back) — the AI plays the other party. Keep openingLine natural, < 25 words.",
        `Dialogue title: ${title}\n\nReference dialogue:\n${transcript}`,
        {
          type: "function",
          function: {
            name: "return_seed",
            description: "Return role-play setup.",
            parameters: {
              type: "object",
              properties: {
                setting: { type: "string", description: "Scenario in Chinese (1 sentence)" },
                userRole: { type: "string", description: "Learner's role + name in English (e.g. 'You are Alex, a senior engineer.')" },
                aiRole: { type: "string", description: "AI's role + name in English" },
                openingLine: { type: "string", description: "AI's first line in English to start the conversation" },
                goals: {
                  type: "array",
                  items: { type: "string", description: "Learner objective in Chinese" },
                },
              },
              required: ["setting", "userRole", "aiRole", "openingLine", "goals"],
              additionalProperties: false,
            },
          },
        },
      );
      return json(out);
    }

    if (mode === "roleplay_grade") {
      const history = Array.isArray(body?.history) ? body.history : [];
      const userTurn = String(body?.userTurn ?? "");
      const seed = body?.seed ?? {};
      const histText = history
        .map((m: any) => `${m.role === "user" ? "Learner" : "Partner"}: ${m.content}`)
        .join("\n");
      const out = await callTool(
        `You are an English-speaking workplace partner in a role-play. ALWAYS reply in natural American business English in 1–2 sentences as the partner, advancing the conversation. SEPARATELY, grade the LEARNER'S latest English turn for grammar / vocabulary / naturalness, and give one improved version. Feedback fields MUST be in Chinese (except the suggestion, which is English). Score 0–100 (be honest, not lenient).`,
        `Scenario: ${seed?.setting ?? ""}\nLearner role: ${seed?.userRole ?? ""}\nYour role: ${seed?.aiRole ?? ""}\n\nConversation so far:\n${histText}\n\nLearner just said: "${userTurn}"\n\nReply as the partner AND grade the learner's turn.`,
        {
          type: "function",
          function: {
            name: "return_turn",
            description: "Return AI reply and learner feedback.",
            parameters: {
              type: "object",
              properties: {
                reply: { type: "string", description: "Your next line in English (1–2 sentences)" },
                feedback: {
                  type: "object",
                  properties: {
                    score: { type: "number", description: "0–100" },
                    grammar: { type: "string", description: "中文：语法点评" },
                    vocabulary: { type: "string", description: "中文：词汇点评" },
                    naturalness: { type: "string", description: "中文：是否地道" },
                    suggestion: { type: "string", description: "English: a more natural way to say it" },
                  },
                  required: ["score", "grammar", "vocabulary", "naturalness", "suggestion"],
                  additionalProperties: false,
                },
              },
              required: ["reply", "feedback"],
              additionalProperties: false,
            },
          },
        },
      );
      return json(out);
    }

    return json({ error: `Unknown mode: ${mode}` }, 400);
  } catch (e) {
    console.error("workplace-practice error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});