import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { VOCAB_DATA } from "./data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    let inserted = 0;
    for (let i = 0; i < VOCAB_DATA.length; i += 100) {
      const chunk = VOCAB_DATA.slice(i, i + 100);
      const { error } = await supabase.from("gaokao_vocab").upsert(chunk, { onConflict: "word" });
      if (error) throw error;
      inserted += chunk.length;
    }
    return new Response(JSON.stringify({ ok: true, count: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});