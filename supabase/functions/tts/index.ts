import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map our existing voice IDs to high-quality ElevenLabs voices.
// These IDs come from the ElevenLabs default voice library.
const VOICE_MAP: Record<string, string> = {
  alloy:   "EXAVITQu4vr4xnSDxMaL", // Sarah  - warm clear female
  shimmer: "Xb7hH8MSUJpSbSDYk0k2", // Alice  - bright soft female
  nova:    "cgSgspJ2msm6clMCkdW9", // Jessica - youthful energetic female
  echo:    "JBFqnCBsd6RMkjVDRZzb", // George - warm magnetic male
  onyx:    "nPczCjzI2devNBz1zQrb", // Brian  - deep mature male
  fable:   "onwK4e9ZLuTAKqWW03F9", // Daniel - elegant british male
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

    const safeSpeed = Math.min(1.2, Math.max(0.7, Number(speed) || 1.0));
    const elevenVoice = VOICE_MAP[voiceId] || VOICE_MAP.alloy;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
            speed: safeSpeed,
          },
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
      if (response.status === 401 || response.status === 402) {
        return new Response(
          JSON.stringify({ error: "TTS credits exhausted or unauthorized." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`TTS failed ${response.status}: ${err}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioContent = base64Encode(new Uint8Array(audioBuffer));

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
