// Grades a full IELTS speaking session (Part 1 + 2 + 3) using Lovable AI.
// Input: { sessionId, transcript: [{role, text, part}], targetBand, mode }
// Output: { feedback: {...}, overall_band: number }
// Stores result back into ielts_sessions and inserts errors into ielts_errors.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a certified IELTS Speaking examiner with 15+ years of experience and a deep knowledge of the official British Council band descriptors. You also act as a strict but fair coach.

# Hard rules (NEVER violate)
- NEVER use empty praise like "Great!", "Well done!", "Good job!". Be neutral and clinical.
- Use HALF-BANDS only (4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0). No 6.7 or 7.2.
- Justify every band with at least 2 specific quotes from the candidate.
- Identify a MAXIMUM of 5 high-impact errors (the ones blocking band progression). Ignore tiny slips.
- For each error, provide: original quote (verbatim), corrected version, short Chinese explanation, and a Band 7+ "higher_band_version".
- Pronunciation: only score if audio cues are mentioned in transcript metadata; otherwise set band to 0 and comment to "N/A (text-only transcript)".
- Return AT MOST 5 errors and AT MOST 3 missed_opportunities, AT MOST 3 strengths, AT MOST 2 focus_areas, AT MOST 3 suggested_topics.
- Output a SINGLE JSON object via the provided tool. No markdown, no preamble.

# Scoring dimensions (official IELTS)
1. Fluency & Coherence — speech rate, hesitation, discourse markers, logical flow
2. Lexical Resource — range, precision, collocations, paraphrasing, idiomatic language
3. Grammatical Range & Accuracy — sentence variety, complex structures, error frequency
4. Pronunciation — individual sounds, stress, intonation, intelligibility

# Pedagogy (educational psychology)
- Apply the "1-3 high-leverage corrections" rule — too many corrections cause cognitive overload.
- Anchor each correction to a concrete utterance the user said (recall + reconsolidation).
- Suggest ONE focused micro-task for the next session (deliberate practice).
- Use the candidate's own topic as scaffolding for the higher-band version (zone of proximal development).`;

const FEEDBACK_TOOL = {
  type: "function",
  function: {
    name: "submit_ielts_feedback",
    description: "Return the official IELTS speaking evaluation as a single structured object.",
    parameters: {
      type: "object",
      properties: {
        overall_band: { type: "number", description: "Overall IELTS speaking band, half-band only" },
        scores: {
          type: "object",
          properties: {
            fluency_coherence: {
              type: "object",
              properties: {
                band: { type: "number" },
                comment: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
              },
              required: ["band", "comment", "evidence"],
            },
            lexical_resource: {
              type: "object",
              properties: {
                band: { type: "number" },
                comment: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
              },
              required: ["band", "comment", "evidence"],
            },
            grammar: {
              type: "object",
              properties: {
                band: { type: "number" },
                comment: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
              },
              required: ["band", "comment", "evidence"],
            },
            pronunciation: {
              type: "object",
              properties: {
                band: { type: "number", description: "Use 0 if N/A (text-only transcript)" },
                comment: { type: "string" },
                evidence: { type: "array", items: { type: "string" } },
              },
              required: ["band", "comment", "evidence"],
            },
          },
          required: ["fluency_coherence", "lexical_resource", "grammar", "pronunciation"],
        },
        errors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              part: { type: "integer", description: "1, 2, or 3" },
              original: { type: "string" },
              corrected: { type: "string" },
              explanation_zh: { type: "string" },
              higher_band_version: { type: "string" },
              error_type: { type: "string" },
              ielts_dimension: {
                type: "string",
                description: "One of: fluency_coherence, lexical_resource, grammar, pronunciation",
              },
              severity: { type: "integer", description: "1 (low) to 3 (high)" },
            },
            required: ["part", "original", "corrected", "explanation_zh", "higher_band_version", "error_type", "ielts_dimension", "severity"],
          },
        },
        missed_opportunities: {
          type: "array",
          items: {
            type: "object",
            properties: {
              context: { type: "string" },
              what_you_said: { type: "string" },
              higher_band_version: { type: "string" },
              why_better: { type: "string" },
            },
            required: ["context", "what_you_said", "higher_band_version", "why_better"],
          },
        },
        strengths: { type: "array", items: { type: "string" } },
        next_session_plan: {
          type: "object",
          properties: {
            focus_areas: { type: "array", items: { type: "string" } },
            micro_task: { type: "string", description: "One concrete deliberate-practice task for next session" },
            suggested_topics: { type: "array", items: { type: "string" } },
          },
          required: ["focus_areas", "micro_task", "suggested_topics"],
        },
        summary_zh: { type: "string", description: "2-3 句中文总结，给中国学习者看的" },
      },
      required: ["overall_band", "scores", "errors", "missed_opportunities", "strengths", "next_session_plan", "summary_zh"],
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId, transcript, targetBand = 6.5, mode = "training" } = await req.json();
    if (!sessionId || !Array.isArray(transcript) || transcript.length < 2) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const transcriptText = transcript
      .map((m: any) => `[Part ${m.part || "?"}] ${m.role === "user" ? "Candidate" : "Examiner"}: ${m.text}`)
      .join("\n");

    const userPrompt = `Target band: ${targetBand}\nMode: ${mode}\n\n=== Transcript ===\n${transcriptText}\n\n=== Task ===\nEvaluate strictly per official IELTS Speaking band descriptors. Return ONE call to submit_ielts_feedback with the full structured evaluation.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [FEEDBACK_TOOL],
        tool_choice: { type: "function", function: { name: "submit_ielts_feedback" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "AI rate limit. Please retry shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const txt = await aiResp.text();
      console.error("AI gateway error", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("AI did not return tool call");
    const feedback = JSON.parse(toolCall.function.arguments);

    // Persist session
    await supabase.from("ielts_sessions").update({
      feedback,
      overall_band: feedback.overall_band,
      status: "graded",
      completed_at: new Date().toISOString(),
    }).eq("id", sessionId).eq("user_id", user.id);

    // Persist individual errors for spaced review
    if (Array.isArray(feedback.errors) && feedback.errors.length) {
      const rows = feedback.errors.map((e: any) => ({
        user_id: user.id,
        session_id: sessionId,
        part: e.part,
        original: e.original,
        corrected: e.corrected,
        explanation_zh: e.explanation_zh,
        higher_band_version: e.higher_band_version,
        error_type: e.error_type,
        ielts_dimension: e.ielts_dimension,
        severity: e.severity,
      }));
      await supabase.from("ielts_errors").insert(rows);
    }

    // Review mode: advance FSRS interval on user's previously-due errors
    if (mode === "review") {
      const { data: due } = await supabase.from("ielts_errors")
        .select("id, ease_factor, interval_days, review_count")
        .eq("user_id", user.id)
        .eq("is_resolved", false)
        .lte("next_review_at", new Date().toISOString())
        .limit(20);
      if (due?.length) {
        const now = new Date();
        for (const row of due) {
          const ef = Math.max(1.3, Number(row.ease_factor) || 2.5);
          const newInterval = Math.max(1, Math.round((Number(row.interval_days) || 1) * ef));
          const next = new Date(now.getTime() + newInterval * 86400_000);
          await supabase.from("ielts_errors").update({
            review_count: (row.review_count || 0) + 1,
            interval_days: newInterval,
            last_reviewed_at: now.toISOString(),
            next_review_at: next.toISOString(),
          }).eq("id", row.id);
        }
      }
    }

    return new Response(JSON.stringify({ feedback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("grade-ielts-speaking error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});