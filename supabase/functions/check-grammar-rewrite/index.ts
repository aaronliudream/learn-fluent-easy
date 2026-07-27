// Supabase Edge Function · check-grammar-rewrite
// AI-powered three-layer grammar feedback for any rewrite/translation task.
//
// Replaces rigid string matching with three-layer judgment:
//   1. grammarOk     — is the structure correct?
//   2. meaningOk     — does it match what the prompt asks?
//   3. naturalness   — would a native speaker say it this way?
//
// Uses the same Lovable AI gateway pattern as check-writing/index.ts.
// Costs almost nothing per call (Gemini Flash).

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  studentAnswer: string;       // What the student wrote
  modelAnswer: string;         // The reference correct answer
  grammarTopic: string;        // e.g. "mixed conditional", "If I were you", "现在完成时"
  promptCN?: string;           // Original Chinese situation/prompt
  promptEN?: string;           // Original English reality statement (if any)
  acceptedAnswers?: string[];  // Optional: list of also-acceptable answers (legacy)
  feedbackLanguage?: string;   // Default Chinese
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ReqBody = await req.json();
    const { studentAnswer, modelAnswer, grammarTopic, promptCN, promptEN, acceptedAnswers } = body;

    if (!studentAnswer?.trim()) {
      return new Response(JSON.stringify({ error: "Empty studentAnswer" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!modelAnswer || !grammarTopic) {
      return new Response(
        JSON.stringify({ error: "modelAnswer and grammarTopic are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fbLang = body.feedbackLanguage || "Chinese";

    const system = `You are a precise English grammar teacher for Chinese middle/high-school students. Your judgment must distinguish three layers:

1. **Grammar correctness** — is the sentence's structure correct for the requested grammar topic?
2. **Meaning match** — does it express what the original prompt asked, with logically consistent reasoning?
3. **Naturalness** — would a native speaker actually say it this way?

Critical rule: a student who got the GRAMMAR right but used a less idiomatic verb/phrasing should NOT be marked as wrong. Mark grammarOk=true, meaningOk=true, but naturalness="awkward" or "ok", and explain in feedback that the structure is correct but a different phrasing would be more natural. Examples:
  - "would play" vs "would know how to play" — same grammar, different naturalness
  - "would afford" vs "could afford" — afford is an ability verb, prefers could

Only mark grammarOk=false if the structure is genuinely broken (wrong verb form, missing required words, wrong tense pattern).

Give all feedback in ${fbLang}, warm and encouraging, but specific. Use **bold** markdown for key terms. Keep feedback to 2–4 sentences max.`;

    const acceptedNote = acceptedAnswers && acceptedAnswers.length > 0
      ? `\nOther fully-acceptable phrasings (any of these = correct): ${acceptedAnswers.map((a) => `"${a}"`).join(", ")}`
      : "";

    const userMsg = `Grammar topic being tested: ${grammarTopic}
Original prompt (situation): ${promptEN || "(not provided)"}
${promptCN ? `Chinese context: ${promptCN}` : ""}
Reference correct answer: "${modelAnswer}"${acceptedNote}
Student wrote: "${studentAnswer}"

Judge the student's sentence on the three layers. Be lenient on naturalness (warn but don't mark wrong), strict on grammar.`;

    const tool = {
      type: "function",
      function: {
        name: "grammar_feedback",
        description: "Three-layer judgment of a student's grammar rewrite",
        parameters: {
          type: "object",
          properties: {
            grammarOk: {
              type: "boolean",
              description: "True if the structure is correctly formed (right verb forms, tense pattern, required auxiliaries).",
            },
            meaningOk: {
              type: "boolean",
              description: "True if the sentence expresses the meaning the prompt asks for, with consistent counterfactual/temporal logic.",
            },
            naturalness: {
              type: "string",
              enum: ["native", "ok", "awkward"],
              description: "How natural a native speaker would find this. 'native' = idiomatic; 'ok' = grammatical but not most common; 'awkward' = grammatical but unusual phrasing.",
            },
            feedback: {
              type: "string",
              description: `Specific, encouraging feedback in ${fbLang}, 2–4 sentences. If grammar is right but phrasing is awkward, explicitly say so — don't penalize. Use **bold** for key terms.`,
            },
            betterPhrasing: {
              type: "string",
              description: "If naturalness is 'ok' or 'awkward', provide one more natural alternative. Otherwise empty string.",
            },
            mainIssue: {
              type: "string",
              enum: [
                "none",
                "tense_error",
                "missing_auxiliary",
                "wrong_modal",
                "subject_logic",
                "naturalness",
                "meaning_mismatch",
                "vocab",
                "spelling",
                "other",
              ],
              description: "Primary issue category for analytics. 'none' if everything is correct.",
            },
            // Convenience: which of the 5 mastery error reasons this maps to
            errorReason: {
              type: "string",
              enum: ["rule_unknown", "confusion", "careless", "vocab", "speed", "none"],
              description: "Which mastery error category this falls under (for FSRS aggregation).",
            },
          },
          required: ["grammarOk", "meaningOk", "naturalness", "feedback", "mainIssue", "errorReason"],
          additionalProperties: false,
        },
      },
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "grammar_feedback" } },
        temperature: 0.2,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Malformed AI response", raw: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON from AI", raw: toolCall.function.arguments }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: "Internal error", detail: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
