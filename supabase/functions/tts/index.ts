import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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

// OpenAI TTS voice IDs we expose. Our app already uses these names, so this
// is a 1:1 mapping — every voice produces highly natural English speech on
// every browser/device because the audio is synthesized server-side and
// delivered as MP3.
const OPENAI_VOICES = new Set([
  "alloy", "shimmer", "nova", "echo", "onyx", "fable",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, voiceId, speed } = await req.json();
    if (!text) {
      return json({ error: "text is required" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "TTS provider is not configured" }, 503);

    const requestedVoice = typeof voiceId === "string" ? voiceId : "alloy";
    const selectedVoice = OPENAI_VOICES.has(requestedVoice) ? requestedVoice : "alloy";
    // OpenAI TTS supports speed 0.25 – 4.0; we clamp to a friendly learning range.
    const safeSpeed = Math.min(1.2, Math.max(0.75, Number(speed) || 0.95));
    const safeText = String(text).slice(0, 4000);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/tts-1-hd",
        voice: selectedVoice,
        input: safeText,
        speed: safeSpeed,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI TTS via Lovable AI error:", response.status, err);
      if (response.status === 429) {
        return json({ error: "Rate limit exceeded, please try again later.", retryable: true }, 429);
      }
      if (response.status === 402) {
        return json({ error: "TTS provider credits are exhausted" }, 402);
      }
      if (response.status === 401 || response.status === 403) {
        return json({ error: "TTS provider rejected the configured key" }, 503);
      }
      return json({ error: "TTS provider error", retryable: response.status >= 500 }, 502);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioContent = base64Encode(audioBuffer);

    return json({ audioContent, mimeType: "audio/mpeg" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("tts error:", msg);
    return json({ error: "TTS service error" }, 500);
  }
});
