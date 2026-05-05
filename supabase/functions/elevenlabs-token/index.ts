import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID");
    if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY missing");
    if (!ELEVENLABS_AGENT_ID) throw new Error("ELEVENLABS_AGENT_ID missing");

    const resp = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${ELEVENLABS_AGENT_ID}`,
      { headers: { "xi-api-key": ELEVENLABS_API_KEY } }
    );
    if (!resp.ok) {
      const t = await resp.text();
      console.error("eleven token err", resp.status, t);
      // Try to surface a friendlier message for the most common cause:
      // the API key is missing the `convai_write` scope.
      let friendly = t;
      try {
        const parsed = JSON.parse(t);
        const detail = parsed?.detail;
        const msg = typeof detail === "string" ? detail : detail?.message;
        const status = detail?.status;
        if (status === "missing_permissions" || /convai_write/i.test(t)) {
          friendly =
            "ElevenLabs API Key 缺少 convai_write 权限。请在 ElevenLabs 控制台重新生成一个勾选了 Conversational AI 写权限的 Key，然后更新 ELEVENLABS_API_KEY。";
        } else if (msg) {
          friendly = msg;
        }
      } catch { /* keep raw text */ }
      return new Response(JSON.stringify({ error: friendly, raw: t, status: resp.status }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = await resp.json();
    return new Response(JSON.stringify({ token: data.token, agentId: ELEVENLABS_AGENT_ID }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});