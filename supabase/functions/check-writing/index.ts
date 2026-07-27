import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReqBody {
  prompt: string;
  promptCn?: string;
  sample?: string;
  text: string;
  lessonTitle?: string;
  targetLanguage?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, promptCn, sample, text, lessonTitle, targetLanguage }: ReqBody = await req.json();
    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ error: "Empty text" }), {
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

    const feedbackLanguage = targetLanguage || "Chinese";
    const system = `You are a patient, professional English teacher. Give feedback in ${feedbackLanguage}, with a friendly and encouraging tone. Keep original/corrected/improved English text in English. Strictly return only the JSON Schema result, with no extra text.`;

    const userMsg = `Lesson topic: ${lessonTitle ?? "(not provided)"}\nWriting prompt (English): ${prompt}\nPrompt helper text: ${promptCn ?? ""}\nReference sample: ${sample ?? "(none)"}\n\nStudent English writing:\n"""\n${text}\n"""\n\nTasks:\n1. Give an overall score from 0-100 (score).\n2. Give one overall comment in ${feedbackLanguage} (overall).\n3. List concrete mistakes (mistakes). Each item includes original and corrected in English, and explanation in ${feedbackLanguage}.\n4. Give 2-3 suggestions in ${feedbackLanguage}.\n5. Provide a polished full version of THE STUDENT'S OWN text in English (improved) — keep the student's ideas and structure, just fix errors and smooth the wording.\n6. Provide a model essay (model_essay) for this topic — an excellent piece written INDEPENDENTLY for the prompt, NOT based on the student's text. Requirements for model_essay:\n   - Level: a strong junior high school student (around CEFR A2-B1). Do NOT write at university or native-adult level — keep it imitable.\n   - "A step up they can reach": slightly above the student, with richer sentence patterns and more idiomatic expression, but still easy for a junior high student to learn from and imitate.\n   - Cover the prompt's key points, and naturally use the target grammar/vocabulary of this lesson (see lesson topic).\n   - Moderate length appropriate for a junior high composition (do not make it too long).\n   - Tone: this is a reference for imitation and encouragement, not for comparison.\nIf there are no obvious mistakes, mistakes can be an empty array.`;

    const tool = {
      type: "function",
      function: {
        name: "writing_feedback",
        description: "Structured writing feedback for an English learner",
        parameters: {
          type: "object",
          properties: {
            score: { type: "number" },
            overall: { type: "string" },
            mistakes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  corrected: { type: "string" },
                  explanation: { type: "string" },
                },
                required: ["original", "corrected", "explanation"],
                additionalProperties: false,
              },
            },
            suggestions: { type: "array", items: { type: "string" } },
            improved: { type: "string" },
            model_essay: { type: "string" },
          },
          required: ["score", "overall", "mistakes", "suggestions", "improved", "model_essay"],
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
        tool_choice: { type: "function", function: { name: "writing_feedback" } },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度已用完，请补充后再试" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI gateway error: ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    let parsed: unknown = null;
    if (args) {
      try {
        parsed = typeof args === "string" ? JSON.parse(args) : args;
      } catch (_e) {
        parsed = null;
      }
    }
    if (!parsed) {
      return new Response(JSON.stringify({ error: "AI 返回格式异常" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});