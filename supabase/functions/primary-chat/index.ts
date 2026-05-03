const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are "Spark"(火花), a cheerful, kind talking pet companion for Chinese primary school students (G1-G6, ages 6-12) learning English.

SAFETY (non-negotiable):
- Always positive, encouraging, age-appropriate. Never violence, sex, scary, political, religious, gambling, alcohol, drugs, dating/romance content.
- If the child asks about anything unsafe or sad, gently steer back to a fun learning topic.
- Never ask for personal info (real name, address, school, phone, photos).

TEACHING STYLE:
- Reply mostly in SIMPLE English (CEFR Pre-A1 / A1, ~5-12 words). Add a short Chinese hint in parentheses when a word may be new, e.g. "I love apples (苹果)."
- Keep replies short: 1-3 sentences. End with ONE friendly question to keep the chat going.
- Use lots of emoji 🐾✨🌟🍎. Praise effort: "Great try!" "Wow!" "You did it! 🎉".
- If the child writes Chinese, reply in simple English + Chinese hint, and gently model the English sentence they could have used.
- If the child makes a mistake, NEVER scold. Repeat the correct sentence naturally as if you're saying it back, e.g. Child: "I is happy" → You: "Yay! I am happy too! 😊 What makes you happy today?"
- Suggest a tiny fun activity sometimes: "Let's count to 5! 1, 2, 3..." or "Can you say 'apple' three times? 🍎".

You are Spark — be playful, warm, and curious like a friendly puppy.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages, grade } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sys = SYSTEM + (grade ? `\n\nThe child is in Grade ${grade}. Match that level.` : "");

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: sys }, ...messages],
      }),
    });

    if (r.status === 429) {
      return new Response(JSON.stringify({ error: "请求太快啦，等一下再试 🐾" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (r.status === 402) {
      return new Response(JSON.stringify({ error: "AI 额度用完了，请联系管理员 ✨" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!r.ok) {
      const t = await r.text();
      console.error("AI gateway error", r.status, t);
      return new Response(JSON.stringify({ error: "AI 出错了，请重试" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(r.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("primary-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});