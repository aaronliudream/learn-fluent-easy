// Supabase Edge Function · generate-grammar-content
// AI-powered content draft generator for grammar lesson points.
//
// Given a grammar point (title + brief explanation), this function returns
// drafts of:
//   - teacher_script    (paced lesson narration)
//   - immersion_cards   (situation/sentence pairs)
//   - questions         (mix of mcq + rewrite + AI-graded)
//
// The user (or Lovable) reviews/edits the draft and inserts into:
//   - junior_grammar_points (teacher_script, immersion_cards, mnemonic)
//   - junior_grammar_questions (rows for each question)
//
// This is the "force multiplier" that makes 60+ grammar points feasible —
// AI does 80% of the writing, human reviewer polishes the last 20%.

import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  pointTitle: string;          // e.g. "现在完成时 (have done)"
  pointSummary?: string;       // brief existing summary
  cefr?: string;               // CEFR level (A1/A2/B1/B2)
  grade?: number;              // 7/8/9 for Junior
  // What to generate. Default: everything.
  parts?: (
    | "teacher_script"
    | "immersion_cards"
    | "questions"
    | "mnemonic"
    | "hook"
    | "contrast_table"
    | "reflex_cards"
    | "situation_drills"
    | "correction_tasks"
    | "boss_questions"
  )[];
  // For "questions" generation: how many of each type
  numQuestions?: { mcq?: number; fill?: number; transform?: number; translation?: number; correction?: number };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ReqBody = await req.json();
    const { pointTitle, pointSummary, cefr, grade } = body;
    const parts = body.parts || [
      "teacher_script",
      "immersion_cards",
      "questions",
      "mnemonic",
      "hook",
      "contrast_table",
      "reflex_cards",
      "situation_drills",
      "correction_tasks",
      "boss_questions",
    ];
    const numQ = {
      mcq: body.numQuestions?.mcq ?? 3,
      fill: body.numQuestions?.fill ?? 1,
      transform: body.numQuestions?.transform ?? 1,
      translation: body.numQuestions?.translation ?? 0,
      correction: body.numQuestions?.correction ?? 1,
    };

    if (!pointTitle?.trim()) {
      return new Response(JSON.stringify({ error: "pointTitle is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You are an expert Chinese English-grammar curriculum designer for middle/high-school students. Generate lesson content drafts that are:
- Pedagogically sound (build from concrete to abstract; address Chinese-learner Top-N mistakes explicitly)
- Authentic English (no Chinglish; use natural collocations; native speakers would actually say this)
- CEFR-appropriate (vocabulary and complexity match the requested level)
- Exam-relevant (中国 中考/高考 high-frequency points and traps)

All Chinese explanations should use **bold markdown** for key terms. All English examples must be grammatical and natural.

CRITICAL — for question distractors: each wrong choice must encode a specific, common Chinese-student mistake (not random gibberish). The msg field must teach the student why their pick was wrong, in Chinese, 1–2 sentences max, using **bold** for the key error term.`;

    const userMsg = `Grammar point: ${pointTitle}
${pointSummary ? `Existing summary: ${pointSummary}` : ""}
CEFR: ${cefr || "A2"}
Grade: ${grade ? `初${grade - 6}` : "中考"}

Generate the following parts: ${parts.join(", ")}
Question counts wanted: mcq=${numQ.mcq}, fill=${numQ.fill}, transform=${numQ.transform}, translation=${numQ.translation}, correction=${numQ.correction}

Return only the JSON via the function call. No prose.`;

    // Build the function-call schema based on requested parts.
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    if (parts.includes("teacher_script")) {
      properties.teacher_script = {
        type: "array",
        description: "Paced lesson narration. 8–10 segments.",
        items: {
          type: "object",
          properties: {
            text: { type: "string", description: "Chinese explanation, 25–55 chars, **bold** for key terms" },
            show: { type: "string", description: "Formula or example sentence shown on the 'blackboard'" },
            highlight: { type: "string", description: "Optional: substring of `show` to highlight in mint color. Empty if none." },
            duration: { type: "number", description: "Reading + comprehension time in seconds. Use formula: max(text_chars/3.5, 5) + 2, clamped to [7, 18]." },
          },
          required: ["text", "show", "duration"],
          additionalProperties: false,
        },
      };
      required.push("teacher_script");
    }

    if (parts.includes("immersion_cards")) {
      properties.immersion_cards = {
        type: "array",
        description: "Situation cards. 6–8 items showing typical use cases.",
        items: {
          type: "object",
          properties: {
            situation: { type: "string", description: "Brief Chinese situation, 6–14 chars." },
            cn: { type: "string", description: "Chinese sentence to express." },
            en: { type: "string", description: "Natural English sentence using the target grammar." },
          },
          required: ["situation", "cn", "en"],
          additionalProperties: false,
        },
      };
      required.push("immersion_cards");
    }

    if (parts.includes("mnemonic")) {
      properties.mnemonic = {
        type: "string",
        description: "1-line memorable formula/mnemonic, ≤25 chars. e.g. 'wish 后过去式·be 都用 were'",
      };
      required.push("mnemonic");
    }

    if (parts.includes("questions")) {
      properties.questions = {
        type: "array",
        description: `Mixed practice questions. Counts requested — mcq:${numQ.mcq}, fill:${numQ.fill}, transform:${numQ.transform}, translation:${numQ.translation}, correction:${numQ.correction}.`,
        items: {
          type: "object",
          properties: {
            question_type: { type: "string", enum: ["mcq", "fill", "transform", "translation", "correction"] },
            stem: { type: "string", description: "Question prompt. For mcq: an English sentence with a blank or English question. For fill: sentence with ___. For transform: 'Rewrite this: ...' For translation: '翻译: 中文'. For correction: an English sentence with errors." },
            // mcq-specific
            option_a: { type: "string", description: "For mcq only. Empty string for other types." },
            option_b: { type: "string" },
            option_c: { type: "string" },
            option_d: { type: "string" },
            correct_answer: { type: "string", description: "For mcq: 'A'/'B'/'C'/'D'. For other types: the canonical correct answer string." },
            accepted_answers: { type: "array", items: { type: "string" }, description: "For non-mcq: list of equivalent acceptable answers (lowercase, normalized). Empty array if mcq." },
            explanation: { type: "string", description: "Chinese explanation of why the correct answer is right + key teaching point. 1–3 sentences. **bold** for key terms." },
            grammar_topic: { type: "string", description: "Short topic label for AI grading, e.g. 'present perfect tense'." },
            difficulty: { type: "integer", description: "1=easy, 2=medium, 3=hard." },
            // For rewrite questions: 3 distractors that encode typical mistakes
            distractors: {
              type: "array",
              description: "Only for transform/correction (not mcq/fill/translation). 3 wrong-sentence options with 教学反馈. Empty array for mcq/fill/translation.",
              items: {
                type: "object",
                properties: {
                  text: { type: "string", description: "A wrong English sentence variant." },
                  msg: { type: "string", description: "Chinese explanation of why this is wrong, 1–2 sentences with **bold** key terms." },
                },
                required: ["text", "msg"],
                additionalProperties: false,
              },
            },
            natural_note: { type: "string", description: "Optional: 地道度 hint if the correct answer has a more natural variant. Empty string if not applicable." },
          },
          required: ["question_type", "stem", "correct_answer", "explanation", "grammar_topic", "difficulty", "accepted_answers", "distractors"],
          additionalProperties: false,
        },
      };
      required.push("questions");
    }

    if (parts.includes("hook")) {
      properties.hook_line = {
        type: "string",
        description: "One-line English scene-setting hook for the lesson opening, ≤90 chars. Vivid, relatable to a Chinese teen.",
      };
      properties.hook_line_cn = {
        type: "string",
        description: "Chinese version of the hook line, ≤45 chars. Should provoke a 'I want to know how to say this' feeling.",
      };
      required.push("hook_line", "hook_line_cn");
    }

    if (parts.includes("contrast_table")) {
      properties.contrast_table = {
        type: "array",
        description: "Foundation comparison table (e.g. 真实 vs 虚拟, 现在 vs 过去, 主动 vs 被动). 3–5 rows.",
        items: {
          type: "object",
          properties: {
            lhs: { type: "string", description: "Left side label, Chinese, ≤14 chars. Use **bold** for the key term." },
            rhs: { type: "string", description: "Right side: rule + example. May contain **bold** key parts." },
          },
          required: ["lhs", "rhs"],
          additionalProperties: false,
        },
      };
      required.push("contrast_table");
    }

    if (parts.includes("reflex_cards")) {
      properties.reflex_cards = {
        type: "array",
        description: "Reflex cards: see a Chinese situation, instantly produce the English target. 10 items, increasing length.",
        items: {
          type: "object",
          properties: {
            cn: { type: "string", description: "Chinese situation prompt, 4–14 chars." },
            en: { type: "string", description: "Target English sentence using the grammar point. 4–12 words." },
            keyword: { type: "string", description: "The single English keyword that proves the grammar point is used (e.g. 'were', 'had eaten'). Empty string if not applicable." },
          },
          required: ["cn", "en", "keyword"],
          additionalProperties: false,
        },
      };
      required.push("reflex_cards");
    }

    if (parts.includes("situation_drills")) {
      properties.situation_drills = {
        type: "array",
        description: "Situation drills: a real-life Chinese scene + Chinese sentence to translate into English. 12 items spanning study, travel, friendship, weather, shopping, health.",
        items: {
          type: "object",
          properties: {
            situation: { type: "string", description: "Brief Chinese scene, 6–18 chars." },
            cn: { type: "string", description: "Chinese sentence to translate." },
            en: { type: "string", description: "Model English answer using the grammar point. Natural, native-sounding." },
            accepted: {
              type: "array",
              description: "0–4 alternative acceptable English answers (lowercase, normalized punctuation).",
              items: { type: "string" },
            },
          },
          required: ["situation", "cn", "en", "accepted"],
          additionalProperties: false,
        },
      };
      required.push("situation_drills");
    }

    if (parts.includes("correction_tasks")) {
      properties.correction_tasks = {
        type: "array",
        description: "Find-and-fix tasks: each is a wrong English sentence that a Chinese student would actually write, plus the model fix. 5 items targeting top mistakes for this point.",
        items: {
          type: "object",
          properties: {
            wrong: { type: "string", description: "The wrong sentence as-typed by a typical learner." },
            model: { type: "string", description: "The corrected sentence." },
            hint: { type: "string", description: "1-sentence Chinese hint (no answer reveal). **bold** for the error type." },
            why: { type: "string", description: "1–2 sentence Chinese explanation of the error and rule." },
          },
          required: ["wrong", "model", "hint", "why"],
          additionalProperties: false,
        },
      };
      required.push("correction_tasks");
    }

    if (parts.includes("boss_questions")) {
      properties.boss_questions = {
        type: "array",
        description: "Boss-level mixed-form exam questions (中考/高考 style) testing the grammar point under pressure. 5 items, harder than regular questions.",
        items: {
          type: "object",
          properties: {
            stem: { type: "string", description: "English sentence with one blank, or a complete English question." },
            option_a: { type: "string" },
            option_b: { type: "string" },
            option_c: { type: "string" },
            option_d: { type: "string" },
            correct_answer: { type: "string", description: "'A' / 'B' / 'C' / 'D'." },
            trap: { type: "string", description: "Chinese explanation of the most tempting wrong choice and why it traps Chinese students." },
            why: { type: "string", description: "Chinese explanation of why the correct answer is right." },
          },
          required: ["stem", "option_a", "option_b", "option_c", "option_d", "correct_answer", "trap", "why"],
          additionalProperties: false,
        },
      };
      required.push("boss_questions");
    }

    const tool = {
      type: "function",
      function: {
        name: "grammar_content",
        description: "Drafts of teacher_script / immersion_cards / questions / mnemonic for a grammar point",
        parameters: {
          type: "object",
          properties,
          required,
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
        // Use a stronger model for content generation — quality matters here
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "grammar_content" } },
        temperature: 0.4, // a touch more creativity for varied examples
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

    // Compute content_depth automatically from what was generated.
    let depth = 0;
    if (parsed.teacher_script?.length > 0) depth = Math.max(depth, 1);
    if (parsed.immersion_cards?.length > 0) depth = Math.max(depth, 2);
    if (parsed.questions?.length > 0 && parsed.immersion_cards?.length > 0 && parsed.teacher_script?.length > 0) depth = 3;
    parsed._suggested_content_depth = depth;

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
