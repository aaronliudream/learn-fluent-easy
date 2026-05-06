import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import type { ShareItem } from "@/lib/share/types";

/** Off-screen renderable card for html2canvas. 1080x1350 (4:5 朋友圈/小红书友好). */
export const ShareCard = forwardRef<HTMLDivElement, { item: ShareItem }>(({ item }, ref) => {
  const [qr, setQr] = useState<string>("");
  useEffect(() => {
    QRCode.toDataURL(item.url, { width: 220, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [item.url]);

  const accent = pickAccent(item.type);

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        background: accent.bg,
        color: "#fff",
        fontFamily: "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Moon glow */}
      <div style={{
        position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(253,224,71,0.55), rgba(253,224,71,0))", filter: "blur(20px)",
      }} />
      <div style={{
        position: "absolute", bottom: -250, left: -150, width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.5), rgba(99,102,241,0))", filter: "blur(30px)",
      }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 60, left: 80, right: 80, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "linear-gradient(135deg, #fde047, #f59e0b)",
          display: "grid", placeItems: "center", fontSize: 36,
        }}>🌕</div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 1 }}>大月亮英语</div>
          <div style={{ fontSize: 16, opacity: 0.7, letterSpacing: 2 }}>Big Moon English</div>
        </div>
        <div style={{ marginLeft: "auto", padding: "8px 18px", borderRadius: 999, background: "rgba(255,255,255,0.15)", fontSize: 18, fontWeight: 700 }}>
          {accent.tag}
        </div>
      </div>

      {/* Body */}
      <div style={{ position: "absolute", top: 220, left: 80, right: 80, bottom: 340 }}>
        <CardBody item={item} accent={accent} />
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: 60, left: 80, right: 80,
        display: "flex", alignItems: "center", gap: 24,
        padding: 28, borderRadius: 28,
        background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}>
        {qr && <img src={qr} alt="qr" style={{ width: 160, height: 160, borderRadius: 16, background: "#fff", padding: 10 }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>扫码即学 · Scan to learn</div>
          <div style={{ fontSize: 18, opacity: 0.85, marginTop: 6 }}>bigmoonenglish.com</div>
          <div style={{ fontSize: 16, opacity: 0.7, marginTop: 4 }}>AI 个性化英语学习 · 初中 · 高考</div>
        </div>
      </div>
    </div>
  );
});
ShareCard.displayName = "ShareCard";

function CardBody({ item, accent }: { item: ShareItem; accent: ReturnType<typeof pickAccent> }) {
  if (item.type === "word") {
    return (
      <div>
        <div style={{ fontSize: 28, opacity: 0.8 }}>📚 今日单词 · Word of the day</div>
        <div style={{ fontSize: 140, fontWeight: 900, marginTop: 30, lineHeight: 1.1, wordBreak: "break-word" }}>{item.word}</div>
        {item.phonetic && <div style={{ fontSize: 32, opacity: 0.75, marginTop: 4 }}>{item.phonetic}</div>}
        <div style={{ fontSize: 44, marginTop: 30, fontWeight: 600 }}>{item.meaning}</div>
        {item.example && (
          <div style={{ fontSize: 28, marginTop: 30, padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.15)", lineHeight: 1.5 }}>
            "{item.example}"
          </div>
        )}
      </div>
    );
  }
  if (item.type === "score") {
    return (
      <div style={{ textAlign: "center", paddingTop: 40 }}>
        <div style={{ fontSize: 36 }}>🏆 {item.module}</div>
        <div style={{ fontSize: 280, fontWeight: 900, lineHeight: 1, marginTop: 10 }}>{item.score}</div>
        <div style={{ fontSize: 28, opacity: 0.8, marginTop: 6 }}>分 / Score</div>
        {item.rank && <div style={{ marginTop: 40, display: "inline-block", padding: "16px 40px", borderRadius: 999, background: "rgba(255,255,255,0.18)", fontSize: 32, fontWeight: 700 }}>🥇 全站前 {item.rank}%</div>}
      </div>
    );
  }
  if (item.type === "achievement") {
    return (
      <div style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 200 }}>🏅</div>
        <div style={{ fontSize: 60, fontWeight: 900, marginTop: 20 }}>{item.name}</div>
        <div style={{ fontSize: 32, opacity: 0.85, marginTop: 30 }}>{item.desc}</div>
      </div>
    );
  }
  // listening / reading / cloze / grammar / app — text-led
  const title =
    item.type === "grammar" ? item.point :
    item.type === "app" ? "学英语用大月亮" :
    (item as any).title;
  const sub = subtitle(item);
  return (
    <div>
      <div style={{ fontSize: 32, opacity: 0.85 }}>{accent.kicker}</div>
      <div style={{ fontSize: 84, fontWeight: 900, marginTop: 20, lineHeight: 1.15 }}>{title}</div>
      {sub && <div style={{ fontSize: 30, marginTop: 32, opacity: 0.85, lineHeight: 1.5 }}>{sub}</div>}
      <div style={{ marginTop: 50, display: "flex", gap: 14, flexWrap: "wrap" }}>
        {accent.badges.map((b, i) => (
          <span key={i} style={{ padding: "12px 24px", borderRadius: 999, background: "rgba(255,255,255,0.18)", fontSize: 24, fontWeight: 700 }}>{b}</span>
        ))}
      </div>
    </div>
  );
}

function subtitle(item: ShareItem): string {
  switch (item.type) {
    case "listening": return [item.topic, item.duration ? `${Math.round(item.duration)} 秒` : "", item.grade].filter(Boolean).join(" · ");
    case "reading":   return [item.difficulty, item.wordCount ? `${item.wordCount} 词` : ""].filter(Boolean).join(" · ");
    case "cloze":     return item.difficulty ?? "";
    case "grammar":   return item.summary ?? "";
    case "app":       return "AI 个性化英语学习 · 初中 · 高考";
    default:          return "";
  }
}

function pickAccent(type: ShareItem["type"]) {
  switch (type) {
    case "listening":
      return { bg: "linear-gradient(135deg, #0c1e3d 0%, #1e3a8a 50%, #0ea5e9 100%)", tag: "🎧 听力", kicker: "🎧 听力推荐 · Listening", badges: ["扫码听原音", "AI 解析"] };
    case "reading":
      return { bg: "linear-gradient(135deg, #1f1006 0%, #7c2d12 50%, #f59e0b 100%)", tag: "📖 阅读", kicker: "📖 阅读推荐 · Reading", badges: ["扫码读原文", "中英对照"] };
    case "word":
      return { bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #6366f1 100%)", tag: "📚 单词", kicker: "", badges: ["真人发音", "FSRS 间隔记忆"] };
    case "cloze":
      return { bg: "linear-gradient(135deg, #1a0b2e 0%, #4c1d95 50%, #a855f7 100%)", tag: "🧠 完形", kicker: "🧠 完形推荐 · Cloze", badges: ["逐空精解"] };
    case "grammar":
      return { bg: "linear-gradient(135deg, #0c1e3d 0%, #064e3b 50%, #10b981 100%)", tag: "🧩 语法", kicker: "🧩 语法点 · Grammar", badges: ["AI 例题"] };
    case "score":
      return { bg: "linear-gradient(135deg, #1a0b2e 0%, #be123c 50%, #fbbf24 100%)", tag: "🏆 成绩", kicker: "", badges: ["来挑战我"] };
    case "achievement":
      return { bg: "linear-gradient(135deg, #1a0b2e 0%, #92400e 50%, #fbbf24 100%)", tag: "🏅 成就", kicker: "", badges: ["持续打卡"] };
    case "app":
      return { bg: "linear-gradient(135deg, #0f172a 0%, #312e81 50%, #fde047 100%)", tag: "🌕 推荐", kicker: "🌕 推荐你用", badges: ["免费开始", "AI 个性化"] };
  }
}
