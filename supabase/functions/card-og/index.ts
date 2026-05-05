// Public edge function: returns HTML with proper OG tags for crawlers (WeChat, Twitter, Facebook),
// and redirects real users to the SPA route /q/:slug.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { pickI18n } from "../_shared/card-i18n.ts";

const SITE = "https://bigmoonenglish.com";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function isCrawler(ua: string) {
  return /MicroMessenger|QQ\/|Weibo|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|WhatsApp|Discordbot|Googlebot|bingbot|Baiduspider|YisouSpider|Bytespider|Sogou|360Spider|Embedly|Pinterest|redditbot/i.test(ua);
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  // path: /card-og/:slug   (or query ?slug=)
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = url.searchParams.get("slug") || parts[parts.length - 1];
  const ua = req.headers.get("user-agent") || "";
  const ref = url.searchParams.get("ref");
  const refQuery = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const target = `${SITE}/q/${slug}${refQuery}`;

  if (!slug || slug === "card-og") {
    return new Response("Missing slug", { status: 400 });
  }

  // IMPORTANT: do NOT 302 redirect real users here.
  // WeChat treats "URL → 302 → another URL" as a high-risk redirect page
  // and will refuse to render share previews / block sharing entirely.
  // Instead, always return a stable 200 HTML with full OG tags.
  // Real users get a silent JS redirect (after OG is parsed by crawlers).
  const _ = isCrawler(ua); // kept for potential future analytics; do not branch on it

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const { data: card } = await supabase
    .from("knowledge_cards")
    .select("question, short_answer, explanation, tags, language")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const t = pickI18n(card?.language);
  const title = card ? `${card.question}${t.titleSuffix}` : t.fallbackTitle;
  const desc = card ? (card.short_answer || card.explanation || "").slice(0, 150) : t.fallbackDesc;
  const projectRef = Deno.env.get("SUPABASE_URL")!.match(/https:\/\/([^.]+)/)![1];
  const image = card
    ? `https://${projectRef}.supabase.co/functions/v1/card-og-image/${slug}`
    : `${SITE}/og-cover.jpg`;
  const isRtl = ["ar", "he", "fa"].includes(t.htmlLang);

  const html = `<!doctype html><html lang="${t.htmlLang}"${isRtl ? ' dir="rtl"' : ""}><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}"/>
<link rel="canonical" href="${target}"/>
<meta property="og:type" content="article"/>
<meta property="og:title" content="${escapeHtml(title)}"/>
<meta property="og:description" content="${escapeHtml(desc)}"/>
<meta property="og:url" content="${target}"/>
<meta property="og:image" content="${image}"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:locale" content="${t.locale}"/>
<meta property="og:site_name" content="Big Moon English"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escapeHtml(title)}"/>
<meta name="twitter:description" content="${escapeHtml(desc)}"/>
<meta name="twitter:image" content="${image}"/>
</head><body>
<h1>${escapeHtml(card?.question || "Knowledge Card")}</h1>
<p>${escapeHtml(desc)}</p>
<p><a href="${target}">${escapeHtml(t.scanCta)} →</a></p>
<script>
  // Silent client-side redirect for real users only.
  // Crawlers (WeChat / Twitter / Facebook / etc.) don't execute JS,
  // so they see the stable OG HTML above without any redirect.
  (function () {
    var ua = navigator.userAgent || "";
    var isBot = /MicroMessenger|QQ\/|Weibo|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|WhatsApp|Discordbot|Googlebot|bingbot|Baiduspider|YisouSpider|Bytespider|Sogou|360Spider|Embedly|Pinterest|redditbot/i.test(ua);
    if (isBot) return;
    // Use replace so back button doesn't return to this shim page.
    window.location.replace(${JSON.stringify(target)});
  })();
</script>
</body></html>`;

  const headers = new Headers();
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", "public, max-age=300, s-maxage=600");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(html, { status: 200, headers });
});