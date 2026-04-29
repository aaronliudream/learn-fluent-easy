import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map our existing voice IDs to Gemini TTS prebuilt voices.
// Gemini natural-sounding voices: https://ai.google.dev/gemini-api/docs/speech-generation
const VOICE_MAP: Record<string, string> = {
  alloy:   "Kore",     // warm clear female
  shimmer: "Aoede",    // bright soft female
  nova:    "Leda",     // youthful energetic female
  echo:    "Puck",     // warm magnetic male
  onyx:    "Charon",   // deep mature male
  fable:   "Fenrir",   // distinctive male
};

// Convert raw 24kHz PCM (signed 16-bit little-endian, mono) to a WAV file
// so the browser <audio> element can play it directly.
const pcmToWav = (pcm: Uint8Array, sampleRate = 24000): Uint8Array => {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);          // PCM chunk size
  view.setUint16(20, 1, true);           // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);
  new Uint8Array(buffer, 44).set(pcm);
  return new Uint8Array(buffer);
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

    const geminiVoice = VOICE_MAP[voiceId] || VOICE_MAP.alloy;

    // Gemini TTS via Lovable AI Gateway (OpenAI-compatible chat completions endpoint
    // with audio modality). Returns base64-encoded PCM audio (24kHz, 16-bit, mono).
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview-tts",
        modalities: ["audio"],
        audio: { voice: geminiVoice, format: "pcm16" },
        messages: [
          { role: "user", content: text },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini TTS error:", response.status, err);
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

    const data = await response.json();
    const b64Pcm: string | undefined =
      data?.choices?.[0]?.message?.audio?.data ??
      data?.choices?.[0]?.message?.audio ??
      data?.audio?.data;

    if (!b64Pcm) {
      console.error("No audio in response:", JSON.stringify(data).slice(0, 500));
      throw new Error("No audio returned from Gemini TTS");
    }

    // Decode PCM, wrap in a WAV header so browsers can play it.
    const pcmBytes = Uint8Array.from(atob(b64Pcm), (c) => c.charCodeAt(0));
    const wavBytes = pcmToWav(pcmBytes, 24000);
    const audioContent = base64Encode(wavBytes);

    return new Response(JSON.stringify({ audioContent, mimeType: "audio/wav" }), {
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
