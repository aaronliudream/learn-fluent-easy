import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceId, speed } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const safeSpeed = Math.min(1.2, Math.max(0.7, Number(speed) || 1.0));
    const voice = voiceId || "alloy";

    // Add a light pacing instruction so the model adapts speed naturally.
    const speedHint =
      safeSpeed < 0.95
        ? "Speak slowly and clearly, like an English teacher for learners."
        : safeSpeed > 1.05
        ? "Speak at a brisk, lively pace."
        : "Speak at a natural, clear conversational pace.";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-preview-tts",
          modalities: ["audio"],
          audio: { voice, format: "mp3" },
          messages: [
            {
              role: "user",
              content: `${speedHint}\n\n${text}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`TTS failed ${response.status}: ${err}`);
    }

    const data = await response.json();
    const audioContent =
      data?.choices?.[0]?.message?.audio?.data ||
      data?.choices?.[0]?.message?.audio?.audio ||
      null;

    if (!audioContent) {
      console.error("Unexpected TTS response shape:", JSON.stringify(data).slice(0, 500));
      throw new Error("No audio returned from AI gateway");
    }

    return new Response(JSON.stringify({ audioContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("tts error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});