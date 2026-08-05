/**
 * 词库页(/vocab/:bankCode)· PR-1 纯展示,零写入。
 *
 * 掌握度仪表盘 → 复习提醒条 → 主 CTA(**全屏唯一渐变位**)→ 四模式入口 → 词表浏览。
 *
 * ⚠️ 词表要能扛 4471 词(放量后)。这里做了窗口化渲染:
 *    只渲染可视区那几十行,不是把 4471 个 DOM 节点全塞进去。
 *    展开做成手风琴(同时只展开一行),这样总高度算得出来,窗口偏移不会错位。
 * ⚠️ 未知 bankCode(用户手打错/点旧收藏)必须给"词库不存在",不能白屏 ——
 *    smoke 清单里专门有一条 /vocab/__BOGUS__ 守这条路径。
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, Headphones, Layers, PenLine, Sparkles, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import WordCard from "@/components/vocab/WordCard";
import { cn } from "@/lib/utils";
import StatsPanel from "@/components/vocab/StatsPanel";
import { bankColor, CTA_SHADOW, FONT_SERIF, GRAD_CTA } from "@/lib/vocab/theme";
import { needsUnlock } from "@/lib/vocab/paywall";
import { playUrl, subscribePlaying } from "@/lib/vocab/audio";
import {
  getBankByCode, listBankWords, listExamples, getBankProgress, dueCount,
  type VocabBank, type VocabWord, type VocabExample,
} from "@/lib/vocab/data";

const ROW_H = 68;        // 折叠行高(px),与下面样式里的 h-[68px] 必须一致
const OVERSCAN = 6;      // 视口上下各多渲染几行,滚动时不露白

const MODES = [
  { key: "zh_choice", label: "英汉选择", icon: Layers, desc: "看词选义" },
  { key: "match", label: "词汇配对", icon: Sparkles, desc: "翻牌配对" },
  { key: "listen", label: "听音辨义", icon: Headphones, desc: "听音选义" },
  { key: "spell", label: "听写挑战", icon: PenLine, desc: "听音拼写" },
];

export default function VocabBank() {
  const { bankCode = "" } = useParams();
  const [bank, setBank] = useState<VocabBank | null>(null);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [progress, setProgress] = useState({ mastered: 0, learning: 0, untouched: 0, total: 0 });
  const [due, setDue] = useState(0);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");

  useEffect(() => {
    let alive = true;
    setState("loading");
    (async () => {
      try {
        const b = await getBankByCode(bankCode);
        if (!alive) return;
        if (!b) { setState("missing"); return; }
        setBank(b);
        const [ws, pg, d] = await Promise.all([
          listBankWords(b.id),
          getBankProgress(b.id, b.total_words).catch(() => ({ mastered: 0, learning: 0, untouched: b.total_words, total: b.total_words })),
          dueCount().catch(() => 0),
        ]);
        if (!alive) return;
        setWords(ws);
        setProgress(pg);
        setDue(d);
        setState("ok");
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => { alive = false; };
  }, [bankCode]);

  if (state === "missing") {
    return (
      <Shell>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-8 text-center">
          <p className="text-[15px] font-medium text-slate-800">词库不存在</p>
          <p className="mt-1 text-[13px] text-slate-500">这个词库可能还没上线,或者链接不对。</p>
          <BackLink to="/vocab" className="mt-4 inline-block rounded-full border border-black/[0.08] px-4 py-1.5 text-[13px] text-slate-700">
            回词汇中心
          </BackLink>
        </div>
      </Shell>
    );
  }

  const color = bankColor(bankCode);
  const locked = bank ? needsUnlock(bank) : false;

  return (
    <Shell color={color}>
      <BackLink to="/vocab" className="mb-3 inline-flex items-center gap-1 text-[13px] text-slate-500">
        ← 词汇中心
      </BackLink>

      <h1 className="mb-1 text-[22px] font-bold text-slate-900">
        {bank?.name_zh ?? (state === "loading" ? "加载中" : "词库")}
      </h1>
      <p className="mb-5 text-[13px] text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
        {state === "ok" ? `${words.length} 词可学` : " "}
      </p>

      {state === "error" ? (
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 text-center">
          <p className="text-[14px] text-slate-600">加载失败</p>
          <button onClick={() => window.location.reload()} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[13px] text-slate-700">重试</button>
        </div>
      ) : (
        <>
          <StatsPanel
            mastered={progress.mastered}
            learning={progress.learning}
            untouched={progress.untouched}
            color={color}
            emptyHint="还没开始学这个词库。下面可以先浏览词表,点喇叭听发音。"
          />

          {due > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-black/[0.08] bg-white px-4 py-3">
              <span className="text-[13px] text-slate-600">
                有 <b className="text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>{due}</b> 个词到复习时间
              </span>
            </div>
          )}

          {/* ★ 全屏唯一渐变位 ★ 其它任何按钮都不许用渐变 */}
          <button
            type="button"
            onClick={() => document.getElementById("vocab-wordlist")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="mt-4 w-full rounded-2xl px-5 py-4 text-center text-[16px] font-semibold text-white"
            style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}
          >
            {locked ? "激活码解锁" : "开始学习"}
          </button>
          {/* PR-2 把这个按钮接到 5 步通关流程;本 PR 先滚到词表,不做假入口。 */}

          <div className="mt-4 grid grid-cols-2 gap-3">
            {MODES.map(m => (
              <div key={m.key} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5">
                <div className="flex items-center gap-1.5 text-[14px] font-medium text-slate-800">
                  <m.icon className="h-4 w-4 text-slate-400" />
                  {m.label}
                </div>
                <div className="mt-0.5 text-[12px] text-slate-400">{m.desc}</div>
                <div className="mt-2 text-[11px] text-slate-300">准备中</div>
              </div>
            ))}
          </div>

          <h2 id="vocab-wordlist" className="mb-3 mt-7 scroll-mt-4 text-[15px] font-semibold text-slate-900">词表</h2>
          {state === "loading" ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map(i => <div key={i} className="h-[68px] animate-pulse rounded-xl border border-black/[0.08] bg-white" />)}
            </div>
          ) : words.length === 0 ? (
            <div className="rounded-2xl border border-black/[0.08] bg-white p-6 text-center text-[13px] text-slate-500">
              这个词库还没有内容
            </div>
          ) : (
            <WordList words={words} color={color} />
          )}
        </>
      )}
    </Shell>
  );
}

function Shell({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {color && <div className="h-[3px] w-full" style={{ background: color }} />}
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-4">{children}</div>
    </div>
  );
}

/**
 * 窗口化词表。同时只展开一行(手风琴),因此总高度 = N*ROW_H + 展开行额外高度,
 * 偏移量可以直接算,不需要逐行测量缓存。
 */
function WordList({ words, color }: { words: VocabWord[]; color: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [openH, setOpenH] = useState(0);
  /* 只用来在滚动时触发重渲染;真正的位置从 listTop 现算(见下面注释)。 */
  const [, bumpTick] = useState(0);
  const [viewH, setViewH] = useState(600);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => bumpTick(t => t + 1);
    const onResize = () => setViewH(window.innerHeight);
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, []);

  // 展开区渲染完再量高度,拿到真实值后总高度才准
  useLayoutEffect(() => {
    if (openIdx === null) { setOpenH(0); return; }
    const h = panelRef.current?.offsetHeight ?? 0;
    setOpenH(h);
  }, [openIdx, words]);

  const listRef = useRef<HTMLDivElement | null>(null);
  /* listTop 是列表相对**视口**的 top。往下滚 listTop 变负,
   * 其绝对值就是"已经滚过列表多少像素" —— 正是窗口起始索引要的量。 */
  const listTop = listRef.current?.getBoundingClientRect().top ?? 0;
  const relTop = Math.max(0, -listTop);

  const offsetFor = useCallback(
    (i: number) => i * ROW_H + (openIdx !== null && i > openIdx ? openH : 0),
    [openIdx, openH],
  );

  const total = words.length * ROW_H + openH;
  const startRaw = openIdx !== null && relTop > offsetFor(openIdx + 1)
    ? Math.floor((relTop - openH) / ROW_H)
    : Math.floor(relTop / ROW_H);
  const start = Math.max(0, startRaw - OVERSCAN);
  const end = Math.min(words.length, start + Math.ceil(viewH / ROW_H) + OVERSCAN * 2);
  const slice = words.slice(start, end);

  return (
    <div ref={listRef} className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white">
      <div style={{ height: total, position: "relative" }}>
        {slice.map((w, k) => {
          const i = start + k;
          const isOpen = openIdx === i;
          return (
            <div key={w.id} style={{ position: "absolute", top: offsetFor(i), left: 0, right: 0 }}>
              <Row
                word={w}
                open={isOpen}
                first={i === 0}
                color={color}
                onToggle={() => setOpenIdx(isOpen ? null : i)}
              />
              {isOpen && (
                <div ref={panelRef}>
                  <ExamplePanel word={w} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ word, open, first, color, onToggle }: { word: VocabWord; open: boolean; first: boolean; color: string; onToggle: () => void }) {
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => subscribePlaying(setPlaying), []);
  const key = `w:${word.id}`;
  return (
    <div className={cn("flex h-[68px] items-center gap-3 px-4", !first && "border-t border-black/[0.06]")}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); playUrl(word.audio_url, key); }}
        disabled={!word.audio_url}
        aria-label={`朗读 ${word.headword}`}
        className="shrink-0 rounded-full p-1.5"
      >
        <Volume2 className={cn("h-4 w-4", playing === key ? "text-slate-900" : word.audio_url ? "text-slate-300" : "text-slate-200")} />
      </button>
      <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] text-slate-900" style={{ fontFamily: FONT_SERIF, fontWeight: 600 }}>
            {word.headword}
          </span>
          <span className="block truncate text-[12px] text-slate-500">{word.def_zh}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-300", open && "rotate-180")} style={{ color: open ? color : undefined }} />
      </button>
    </div>
  );
}

/**
 * 行内展开:按需拉三条例句(不预取全库 —— 4471 词时预取会把首屏拖死)。
 * 例句版式**复用 WordCard 的 inline 变体**,不在这里另写一份,
 * 否则词卡改了版式、词表这边还是老样子。
 */
function ExamplePanel({ word }: { word: VocabWord }) {
  const [rows, setRows] = useState<VocabExample[] | null>(null);
  useEffect(() => {
    let alive = true;
    listExamples(word.id).then(r => { if (alive) setRows(r); }).catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, [word.id]);

  if (rows === null) return <div className="bg-slate-50/60 px-4 pb-4 pt-2 text-[12px] text-slate-400">加载例句…</div>;
  if (!rows.length) return <div className="bg-slate-50/60 px-4 pb-4 pt-2 text-[12px] text-slate-400">暂无例句</div>;

  return (
    <div className="bg-slate-50/60 pt-1">
      <WordCard word={word} examples={rows} variant="inline" />
    </div>
  );
}
