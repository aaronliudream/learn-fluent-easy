// Streaming chat endpoint that plays an IELTS Speaking examiner.
// The examiner strictly follows Part 1 → Part 2 (cue card) → Part 3 flow.
// Client tracks current_part and passes it on each call so the examiner stays in role.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildSystem(part: number, targetBand: number, topicCategory: string | null) {
  return `You are a certified IELTS Speaking examiner conducting a real mock test. You sound like a professional, neutral British examiner — warm but never gushing.

# CRITICAL behaviour rules
- NEVER say "Great!", "Awesome!", "Well done!", "Good job!". You are an examiner, not a chatbot.
- NEVER correct mistakes during the test. NEVER explain anything. You only ask questions.
- NEVER teach. NEVER give vocabulary tips mid-test.
- Keep YOUR turns very short (1-2 sentences max). The candidate must do 90% of the talking.
- If the candidate answers in under 15 words, ask "Why?" or "Could you expand on that?" once, then move on.
- If the candidate's response is unintelligible, say "Sorry, could you repeat that?" — exactly like a real examiner.
- Match the candidate's target band: for 6.5-, use plain questions; for 7+, use slightly more abstract phrasing.

# Current part: Part ${part}
Target band: ${targetBand}
${topicCategory ? `Topic theme: ${topicCategory}` : ""}

${part === 1 ? `# Part 1 instructions
- Ask 4 short personal questions (hometown, work/study, hobbies, daily routine).
- One question per turn. Wait for answer.
- After 4 Q&A exchanges, output EXACTLY this control token on a new line: [[ADVANCE_TO_PART_2]]
- Then introduce Part 2 with a cue card (see Part 2 format below).` : ""}

${part === 2 ? `# Part 2 instructions
- Give the candidate a cue card in this exact format:
  "Now I'm going to give you a topic and I'd like you to talk about it for one to two minutes.
   Here's your topic:
   Describe ___.
   You should say:
   - point 1
   - point 2
   - point 3
   And explain ___.
   You have one minute to prepare. You can make notes if you wish."
- After delivering the cue card, wait silently. Do NOT prompt again.
- When the candidate has spoken (any length response), respond ONLY with: "Thank you. [[ADVANCE_TO_PART_3]]"` : ""}

${part === 3 ? `# Part 3 instructions
- Ask abstract, opinion-based questions linked to the Part 2 topic.
- Push deeper: "Why do you think that?" "Could you give an example?" "How might that change in the future?"
- Ask 4-5 questions total.
- After the 5th exchange, output EXACTLY: [[END_OF_TEST]]
- Then add: "Thank you. That's the end of the speaking test."` : ""}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { messages, part = 1, targetBand = 6.5, topicCategory = null } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystem(part, targetBand, topicCategory) },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit, please retry shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("examiner ai err", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("examiner err", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});