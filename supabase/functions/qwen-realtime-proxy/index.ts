// WebSocket relay between the browser and Alibaba DashScope's Qwen-Omni
// Realtime endpoint.
//
// Why a relay?
//   - The DashScope realtime endpoint is a WebSocket that requires an
//     `Authorization: Bearer <DASHSCOPE_API_KEY>` request header.
//   - Browsers cannot set arbitrary headers on `new WebSocket(url)` calls,
//     so the page can't connect to DashScope directly without leaking the
//     API key into client code.
//   - This function accepts a WebSocket from the browser (via Deno's
//     upgradeWebSocket), then opens a second WebSocket to DashScope using
//     the `npm:ws` package, which supports custom request headers. Frames
//     are pumped in both directions. The API key never leaves this server.
//
// Browser ⇄ this function ⇄ wss://dashscope.aliyuncs.com/api-ws/v1/realtime

import WebSocketClient from "npm:ws@8.18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Beijing endpoint — fastest for users physically inside mainland China.
// (We pick this provider precisely because the user is in mainland.)
const DASHSCOPE_WS = "wss://dashscope.aliyuncs.com/api-ws/v1/realtime";
const DEFAULT_MODEL = "qwen3-omni-flash-realtime";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Only handle WebSocket upgrade requests from this point on.
  const upgrade = req.headers.get("upgrade")?.toLowerCase();
  if (upgrade !== "websocket") {
    return new Response(
      JSON.stringify({ error: "Expected WebSocket upgrade" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const apiKey = Deno.env.get("DASHSCOPE_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "DASHSCOPE_API_KEY not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Optional ?model= override; defaults to qwen3-omni-flash-realtime.
  const url = new URL(req.url);
  const model = url.searchParams.get("model") || DEFAULT_MODEL;

  const { socket: clientWs, response } = Deno.upgradeWebSocket(req);

  // Open the upstream connection right away. We don't wait for the client
  // socket to open first because both handshakes can race; we buffer
  // anything that arrives early.
  const upstream = new WebSocketClient(
    `${DASHSCOPE_WS}?model=${encodeURIComponent(model)}`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  );

  // Frames from the browser that arrive before either side is fully ready.
  const pendingFromClient: (string | ArrayBuffer)[] = [];

  const sendUpstream = (data: string | ArrayBuffer) => {
    if (upstream.readyState === WebSocketClient.OPEN) {
      try { upstream.send(data); } catch (err) { console.error("[qwen-proxy] upstream send err", err); }
    } else {
      pendingFromClient.push(data);
    }
  };

  upstream.on("open", () => {
    console.log(`[qwen-proxy] upstream connected (model=${model})`);
    while (pendingFromClient.length) {
      const f = pendingFromClient.shift()!;
      try { upstream.send(f); } catch (err) { console.error("flush err", err); }
    }
  });

  upstream.on("message", (data: any, isBinary: boolean) => {
    if (clientWs.readyState !== WebSocket.OPEN) return;
    try {
      // ws gives us a Buffer when isBinary; otherwise stringify-able text.
      if (isBinary) {
        clientWs.send(data instanceof ArrayBuffer ? data : new Uint8Array(data).buffer);
      } else {
        clientWs.send(typeof data === "string" ? data : data.toString("utf8"));
      }
    } catch (err) {
      console.error("[qwen-proxy] client send err", err);
    }
  });

  upstream.on("error", (err: Error) => {
    console.error("[qwen-proxy] upstream error", err.message);
    try {
      clientWs.send(JSON.stringify({
        type: "error",
        error: { type: "upstream_error", message: err.message || "Qwen connection error" },
      }));
    } catch { /* noop */ }
  });

  upstream.on("close", (code: number, reason: Buffer) => {
    console.log(`[qwen-proxy] upstream closed code=${code} reason=${reason?.toString()}`);
    try { clientWs.close(code === 1000 ? 1000 : 1011, reason?.toString() || "upstream closed"); } catch { /* noop */ }
  });

  clientWs.onopen = () => { console.log("[qwen-proxy] client connected"); };
  clientWs.onmessage = (e) => { sendUpstream(e.data); };
  clientWs.onerror = (e) => { console.error("[qwen-proxy] client error", (e as ErrorEvent).message || e); };
  clientWs.onclose = () => {
    console.log("[qwen-proxy] client closed, closing upstream");
    try { upstream.close(); } catch { /* noop */ }
  };

  return response;
});