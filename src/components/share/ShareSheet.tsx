import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, Share2, Image as ImageIcon, Globe, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { ShareCard } from "./ShareCard";
import type { ShareItem, ShareRegion } from "@/lib/share/types";
import { getRegion, setRegion, localeOf } from "@/lib/share/region";
import { buildShareText, buildShareTitle } from "@/lib/share/templates";
import { channelsFor, nativeShare, copyToClipboard } from "@/lib/share/channels";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ShareSheet({ item, open, onClose }: { item: ShareItem; open: boolean; onClose: () => void }) {
  const [region, setRegionState] = useState<ShareRegion>(() => getRegion());
  const locale = localeOf(region);
  const initialText = useMemo(() => buildShareText(item, locale), [item, locale]);
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const title = useMemo(() => buildShareTitle(item, locale), [item, locale]);

  useEffect(() => { setText(buildShareText(item, locale)); setCardUrl(null); }, [item, locale]);
  useEffect(() => { if (!open) { setCopied(false); setCardUrl(null); } }, [open]);

  if (!open) return null;

  const switchRegion = (r: ShareRegion) => { setRegion(r); setRegionState(r); };

  const handleCopy = async () => {
    if (await copyToClipboard(text)) {
      setCopied(true);
      toast.success(locale === "zh" ? "已复制到剪贴板" : "Copied!");
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error(locale === "zh" ? "复制失败" : "Copy failed");
    }
  };

  const handleNative = async () => {
    const ok = await nativeShare(text, item.url, title);
    if (!ok) handleCopy();
  };

  const generateCard = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 1, useCORS: true, logging: false });
      const url = canvas.toDataURL("image/png");
      setCardUrl(url);
    } catch (e) {
      console.error(e);
      toast.error(locale === "zh" ? "生成失败，请重试" : "Generate failed");
    } finally {
      setGenerating(false);
    }
  };

  const downloadCard = () => {
    if (!cardUrl) return;
    const a = document.createElement("a");
    a.href = cardUrl;
    a.download = `bigmoonenglish_${item.type}_${Date.now()}.png`;
    a.click();
    toast.success(locale === "zh" ? "图片已保存" : "Image saved");
  };

  const channels = channelsFor(region);

  const sheet = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl bg-background p-5 shadow-2xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <Share2 className="size-5 text-primary" />
          <h2 className="text-lg font-extrabold">{locale === "zh" ? "分享" : "Share"}</h2>
          <div className="ml-auto flex items-center gap-1 rounded-full border-2 border-border p-0.5">
            <button
              onClick={() => switchRegion("CN")}
              className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold transition", region === "CN" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >🇨🇳 中国</button>
            <button
              onClick={() => switchRegion("INTL")}
              className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold transition", region === "INTL" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >🌍 Global</button>
          </div>
          <button onClick={onClose} className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="size-5" /></button>
        </div>

        {/* Title preview */}
        <div className="mt-3 truncate text-xs text-muted-foreground">{title}</div>

        {/* Editable text */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="mt-2 w-full resize-none rounded-2xl border-2 border-border bg-card p-3 text-xs leading-relaxed focus:border-primary focus:outline-none"
          placeholder={locale === "zh" ? "可编辑分享文案..." : "Edit share text..."}
        />

        {/* Primary actions */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-3 py-2.5 text-sm font-extrabold transition hover:border-primary"
          >
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            {copied ? (locale === "zh" ? "已复制" : "Copied") : (locale === "zh" ? "复制链接和文案" : "Copy text & link")}
          </button>
          {region === "INTL" ? (
            <button
              onClick={handleNative}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 px-3 py-2.5 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5"
            >
              <Share2 className="size-4" /> {locale === "zh" ? "系统分享" : "System share"}
            </button>
          ) : (
            <button
              onClick={generateCard}
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 px-3 py-2.5 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              <ImageIcon className="size-4" /> {generating ? "生成中…" : "🖼️ 生成卡片图"}
            </button>
          )}
        </div>

        {/* Channels */}
        <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Globe className="mr-1 inline size-3" />
          {region === "CN" ? "国内渠道" : "Channels"}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {channels.map((c) => (
            <button
              key={c.key}
              onClick={async () => {
                const ok = await c.share(text, item.url, title);
                if (ok && c.hint) toast.message(c.label, { description: c.hint, duration: 4500 });
              }}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 border-border bg-card p-2.5 text-[11px] font-bold transition hover:-translate-y-0.5 hover:border-primary"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="truncate w-full text-center">{c.label}</span>
            </button>
          ))}
        </div>

        {/* Card preview area (after generation) */}
        {cardUrl && (
          <div className="mt-4 rounded-2xl border-2 border-amber-400/50 bg-amber-50 p-3 dark:bg-amber-950/20">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
              ✨ {locale === "zh" ? "卡片图已生成 · 长按图片或点下载保存" : "Card ready · long-press or download"}
            </div>
            <img src={cardUrl} alt="share card" className="mt-2 w-full rounded-xl shadow-lg" />
            <button
              onClick={downloadCard}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-1.5 text-xs font-extrabold text-white"
            >
              <Download className="size-3.5" /> {locale === "zh" ? "下载图片" : "Download"}
            </button>
          </div>
        )}

        {region === "INTL" && (
          <button
            onClick={generateCard}
            disabled={generating}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-3 py-2 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
          >
            <ImageIcon className="size-3.5" /> {generating ? "Generating…" : "Generate share card image"}
          </button>
        )}
      </div>

      {/* Hidden card for html2canvas */}
      <div style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }} aria-hidden>
        <ShareCard ref={cardRef} item={item} />
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
