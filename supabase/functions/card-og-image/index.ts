// Generates a 1200x630 PNG OG image per knowledge card.
// First request renders SVG -> PNG via resvg-wasm and caches it in `card-og` storage bucket.
// Subsequent requests are served from public storage CDN (via 302 redirect).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";
import QRCode from "https://esm.sh/qrcode@1.5.3";

let wasmReady: Promise<void> | null = null;
function ensureWasm() {
  if (!wasmReady) {
    wasmReady = fetch("https://esm.sh/@resvg/resvg-wasm@2.6.2/index_bg.wasm")
      .then((r) => r.arrayBuffer())
      .then((buf) => initWasm(buf));
  }
  return wasmReady;
}

function escapeXml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]!));
}

// Wrap text into lines by character count (works fine for CJK + Latin mix).
function wrap(text: string, perLine: number, maxLines: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const ch of text) {
    cur += ch;
    // crude width: CJK ~1, Latin ~0.5
    const width = [...cur].reduce((w, c) => w + (/[\u4e00-\u9fff\u3000-\u30ff]/.test(c) ? 1 : 0.55), 0);
    if (width >= perLine) {
      out.push(cur);
      cur = "";
      if (out.length === maxLines) break;
    }
  }
  if (cur && out.length < maxLines) out.push(cur);
  if (out.length === maxLines && cur) {
    out[maxLines - 1] = out[maxLines - 1].replace(/.$/, "…");
  }
  return out;
}

const SITE = "https://bigmoonenglish.com";

async function buildQrSvg(text: string, size: number): Promise<string> {
  // Returns just the inner <path> elements positioned at (x,y)=(0,0); we wrap with <g transform>.
  const svgStr: string = await QRCode.toString(text, {
    type: "svg",
    margin: 0,
    color: { dark: "#1B2440", light: "#FFFFFF" },
    width: size,
    errorCorrectionLevel: "M",
  });
  // Strip outer <svg ...>..</svg>, keep inner content.
  const inner = svgStr.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return inner;
}

async function buildSvg(slug: string, question: string, answer: string) {
  // Left text column ~720px wide, right reserved ~360px for QR.
  // Question 52px, ~13 CJK chars per line; answer 28px, ~22 CJK chars.
  const qLines = wrap(question, 13, 4);
  const aLines = wrap(answer || "", 22, 2);
  const qFont = 52;
  const qLineH = 64;
  const qY = 230;
  const aY = qY + qLines.length * qLineH + 40;

  const qrSize = 200;
  const qrX = 1120 - qrSize;
  const qrY = 320;
  const shareUrl = `${SITE}/q/${slug}`;
  const qrInner = await buildQrSvg(shareUrl, qrSize);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1B2440"/>
      <stop offset="100%" stop-color="#2B1B4A"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0%" stop-color="#F5C66B" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#F5C66B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <circle cx="1020" cy="120" r="70" fill="#F5C66B" opacity="0.95"/>
  <circle cx="990" cy="105" r="62" fill="#1B2440"/>

  <text x="80" y="120" font-family="'Noto Serif SC','Songti SC',serif" font-weight="700" font-size="34" fill="#F5C66B">Big Moon English</text>
  <text x="80" y="160" font-family="ui-sans-serif,system-ui,sans-serif" font-size="22" fill="#A9B1C9" letter-spacing="2">KNOWLEDGE CARD · 知识卡片</text>

  ${qLines
    .map(
      (l, i) =>
        `<text x="80" y="${qY + i * qLineH}" font-family="'Noto Serif SC','Songti SC',serif" font-weight="700" font-size="${qFont}" fill="#FFFFFF">${escapeXml(l)}</text>`,
    )
    .join("")}

  ${aLines
    .map(
      (l, i) =>
        `<text x="80" y="${aY + i * 38}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="28" fill="#D8DEEE">${escapeXml(l)}</text>`,
    )
    .join("")}

  <!-- QR code with white rounded card -->
  <g transform="translate(${qrX - 16}, ${qrY - 16})">
    <rect width="${qrSize + 32}" height="${qrSize + 32}" rx="14" fill="#FFFFFF"/>
  </g>
  <g transform="translate(${qrX}, ${qrY})">${qrInner}</g>
  <text x="${qrX + qrSize / 2}" y="${qrY + qrSize + 38}" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="20" fill="#A9B1C9">扫码做这道题</text>

  <line x1="80" y1="540" x2="1120" y2="540" stroke="#3A4366" stroke-width="1"/>
  <text x="80" y="585" font-family="ui-sans-serif,system-ui,sans-serif" font-size="24" fill="#A9B1C9">答对解锁全部解析 · 5 分钟搞懂一个考点</text>
  <text x="1120" y="585" text-anchor="end" font-family="ui-sans-serif,system-ui,sans-serif" font-size="24" fill="#F5C66B">bigmoonenglish.com</text>
</svg>`;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = url.searchParams.get("slug") || parts[parts.length - 1];
  if (!slug || slug === "card-og-image") return new Response("Missing slug", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const cachePath = `${slug}.png`;
  const publicUrl = supabase.storage.from("card-og").getPublicUrl(cachePath).data.publicUrl;

  // If already cached, redirect.
  const head = await fetch(publicUrl, { method: "HEAD" });
  if (head.ok) return Response.redirect(publicUrl, 302);

  // Fetch card
  const { data: card } = await supabase
    .from("knowledge_cards")
    .select("question, short_answer")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!card) return new Response("Not found", { status: 404 });

  await ensureWasm();
  const svg = await buildSvg(slug, card.question, card.short_answer || "");
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();

  const { error: upErr } = await supabase.storage
    .from("card-og")
    .upload(cachePath, png, { contentType: "image/png", upsert: true });

  if (upErr) {
    // fall back to returning PNG inline
    return new Response(png, { headers: { "content-type": "image/png", "cache-control": "public, max-age=300" } });
  }

  return new Response(png, {
    headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" },
  });
});