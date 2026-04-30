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

// Map our existing app voice IDs to ElevenLabs' natural voices.
const VOICE_MAP: Record<string, string> = {
  alloy: "JBFqnCBsd6RMkjVDRZzb",   // George — clear, warm male
  shimmer: "EXAVITQu4vr4xnSDxMaL", // Sarah — natural female
  nova: "FGY2WhTYpPnrIDTdsKH5",    // Laura — bright female
  echo: "TX3LPaxmHKxFdv7VOQHJ",    // Liam — conversational male
  onyx: "onwK4e9ZLuTAKqWW03F9",    // Daniel — deep male
  fable: "pFZP5JQG7iQjIQuC4Bku",   // Lily — storyteller female
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, voiceId, speed } = await req.json();
    if (!text) {
      return json({ error: "text is required" }, 400);
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) return json({ error: "TTS provider is not configured" }, 503);

    const selectedVoiceId = VOICE_MAP[voiceId] || VOICE_MAP.alloy;
    const safeSpeed = Math.min(1.15, Math.max(0.82, Number(speed) || 0.95));
    const safeText = String(text).slice(0, 4800);

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: safeText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.42,
          similarity_boost: 0.78,
          style: 0.35,
          use_speaker_boost: true,
          speed: safeSpeed,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs TTS error:", response.status, err);
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
