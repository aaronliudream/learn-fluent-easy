import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY is not configured");

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
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`TTS failed ${response.status}: ${err}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioContent = base64Encode(audioBuffer);

    return new Response(JSON.stringify({ audioContent, mimeType: "audio/mpeg" }), {
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
