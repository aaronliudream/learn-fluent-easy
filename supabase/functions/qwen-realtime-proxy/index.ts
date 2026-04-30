// WebSocket relay between the browser and Alibaba DashScope's Qwen-Omni
// Realtime endpoint.
//
// Why a relay?
//   - The DashScope realtime endpoint is a WebSocket that requires an
//     `Authorization: Bearer <DASHSCOPE_API_KEY>` request header.
//   - Browsers cannot set arbitrary headers on `new WebSocket(url)` calls,
//     so the page can't connect to DashScope directly without leaking the
//     API key into client code.
//   - This function accepts a WebSocket from the browser, opens a second
//     WebSocket to DashScope with the proper auth header, and pumps frames
//     in both directions. The API key never leaves this server.
//
// Browser ⇄ this function ⇄ wss://dashscope.aliyuncs.com/api-ws/v1/realtime

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

  // Upgrade the browser connection.
  const { socket: clientWs, response } = Deno.upgradeWebSocket(req);

  // Open a server-side WebSocket to DashScope. Deno supports passing
  // headers to the WebSocket constructor via the second argument
  // (non-standard but supported in Deno's std WebSocket implementation
  // by way of the `headers` option in `Deno.upgradeWebSocket` consumers).
  // For outbound connections we use the underlying fetch-based handshake.
  let upstream: WebSocket | null = null;

  // Buffer client frames that arrive before upstream is open.
  const pendingFromClient: (string | ArrayBuffer)[] = [];

  const connectUpstream = () => {
    // Deno.upgradeWebSocket is for incoming. For outgoing with headers we
    // need to use the WebSocketStream API or the WebSocket constructor.
    // Deno's WebSocket constructor does NOT accept custom headers, so we
    // use the protocol parameter trick that DashScope supports? It doesn't.
    // The clean solution in Deno is `new WebSocket(url, { headers })`
    // which is a Deno-specific extension. Use it.
    upstream = new WebSocket(`${DASHSCOPE_WS}?model=${encodeURIComponent(model)}`, {
      // @ts-ignore - Deno extension to the WebSocket constructor that
      // accepts a `headers` field for the opening handshake.
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    upstream.binaryType = "arraybuffer";

    upstream.onopen = () => {
      console.log(`[qwen-proxy] upstream connected (model=${model})`);
      // Flush anything the browser sent while we were still connecting.
      for (const frame of pendingFromClient) {
        try { upstream!.send(frame); } catch (e) { console.error("flush error", e); }
      }
      pendingFromClient.length = 0;
    };

    upstream.onmessage = (e) => {
      // Forward verbatim to the browser.
      if (clientWs.readyState === WebSocket.OPEN) {
        try { clientWs.send(e.data); } catch (err) { console.error("client send err", err); }
      }
    };

    upstream.onerror = (e) => {
      console.error("[qwen-proxy] upstream error", e);
      try {
        clientWs.send(JSON.stringify({
          type: "error",
          error: { type: "upstream_error", message: "Lost connection to Qwen" },
        }));
      } catch { /* noop */ }
    };

    upstream.onclose = (e) => {
      console.log(`[qwen-proxy] upstream closed code=${e.code} reason=${e.reason}`);
      try { clientWs.close(e.code === 1000 ? 1000 : 1011, e.reason || "upstream closed"); } catch { /* noop */ }
    };
  };

  clientWs.onopen = () => {
    console.log("[qwen-proxy] client connected, opening upstream");
    try { connectUpstream(); } catch (e) {
      console.error("upstream connect failed", e);
      try { clientWs.close(1011, "upstream connect failed"); } catch { /* noop */ }
    }
  };

  clientWs.onmessage = (e) => {
    if (!upstream || upstream.readyState !== WebSocket.OPEN) {
      pendingFromClient.push(e.data);
      return;
    }
    try { upstream.send(e.data); } catch (err) { console.error("upstream send err", err); }
  };

  clientWs.onerror = (e) => { console.error("[qwen-proxy] client error", e); };
  clientWs.onclose = () => {
    console.log("[qwen-proxy] client closed, closing upstream");
    try { upstream?.close(); } catch { /* noop */ }
  };

  return response;
});