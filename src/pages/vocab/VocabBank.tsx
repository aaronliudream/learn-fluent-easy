/**
 * 词库页(/vocab/:bankCode)· 纯展示,零写入。
 *
 * 掌握度仪表盘 → 复习提醒条 → 主 CTA(**全屏唯一渐变位**)→ 四模式入口 → 词表。
 *
 * 词表结构化:搜索框 + 按学习状态分三组(待学习 / 学习中 / 已掌握)+ 右侧 A-Z 快滚条,
 * 全程窗口化渲染(要扛放量后的 4471 词),不做分页。
 *
 * ⚠️ 窗口化用「顶部占位 + 正常流 + 底部占位」,**不要改回绝对定位**。
 *    绝对定位下每行 top 靠算,展开面板高度只要有一帧不准(例句异步到位、
 *    字体回退换行、窗口变窄重排),下面的行就会被压穿 —— 真机踩过。
 * ⚠️ 未知 bankCode 必须给"词库不存在"不能白屏(smoke 有 /vocab/__BOGUS__ 守这条)。
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, Headphones, Layers, PenLine, Search, Sparkles, Volume2, X } from "lucide-react";
import BackLink from "@/components/BackLink";
import WordCard from "@/components/vocab/WordCard";
import { cn } from "@/lib/utils";
import StatsPanel from "@/components/vocab/StatsPanel";
import { bankColor, CTA_SHADOW, FONT_SERIF, GRAD_CTA } from "@/lib/vocab/theme";
import { needsUnlock } from "@/lib/vocab/paywall";
import { playUrl, subscribePlaying } from "@/lib/vocab/audio";
import {
  getBankByCode, listBankWords, listExamples, getBankProgress, dueCount, getWordStatusMap,
  type VocabBank, type VocabWord, type VocabExample, type WordStatus,
} from "@/lib/vocab/data";

const ROW_H = 68;        // 折叠行高,与样式里的 h-[68px] 必须一致
const HEADER_H = 48;      // 组头(无引导文案),与样式里的 h-[48px] 必须一致
const HEADER_H_HINT = 68; // 带引导文案的组头(文案占第二行),与 h-[68px] 必须一致
const OVERSCAN = 6;

/**
 * 各词库的精简口径定位文案 —— 把词表过滤做成卖点,而不是让用户以为词少。
 * ⚠️ 文案里不写数字(词数只活在 DB 里,写死必然长歪)。
 * ⚠️ 每个库按它自己的过滤逻辑补一条;没有条目就不渲染,不给未过滤的库套不成立的话。
 */
const BANK_POSITIONING: Record<string, string> = {
  toefl: "已剔除中考/高考/四级重复词,只学托福真正的增量词汇",
};

const MODES = [
  { key: "zh_choice", label: "英汉选择", icon: Layers, desc: "看词选义" },
  { key: "match", label: "词汇配对", icon: Sparkles, desc: "翻牌配对" },
  { key: "listen", label: "听音辨义", icon: Headphones, desc: "听音选义" },
  { key: "spell", label: "听写挑战", icon: PenLine, desc: "听音拼写" },
];

const GROUPS: { key: WordStatus; label: string; hint: string }[] = [
  { key: "new", label: "待学习", hint: "从高频词开始,答对自动进入学习中" },
  { key: "learning", label: "学习中", hint: "答对 4 个不同日期、且换过题型才算掌握" },
  { key: "mastered", label: "已掌握", hint: "" },
];

export default function VocabBank() {
  const { bankCode = "" } = useParams();
  const [bank, setBank] = useState<VocabBank | null>(null);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [statuses, setStatuses] = useState<Record<string, WordStatus>>({});
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
        const ws = await listBankWords(b.id);
        if (!alive) return;
        setWords(ws);
        const [pg, d, st] = await Promise.all([
          getBankProgress(b.id, b.total_words).catch(() => ({ mastered: 0, learning: 0, untouched: ws.length, total: ws.length })),
          dueCount().catch(() => 0),
          getWordStatusMap(ws.map(w => w.id)).catch(() => ({} as Record<string, WordStatus>)),
        ]);
        if (!alive) return;
        setProgress(pg); setDue(d); setStatuses(st);
        setState("ok");
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => { alive = false; };
  }, [bankCode]);

  const color = bankColor(bankCode);
  const locked = bank ? needsUnlock(bank) : false;

  if (state === "missing") {
    return (
      <Shell>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center">
          <p className="text-[16px] font-medium text-slate-800">词库不存在</p>
          <p className="mt-1 text-[14px] text-slate-500">这个词库可能还没上线,或者链接不对。</p>
          <BackLink to="/vocab" className="mt-4 inline-block rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">
            回词汇中心
          </BackLink>
        </div>
      </Shell>
    );
  }

  return (
    <Shell color={color}>
      <BackLink to="/vocab" className="mb-3 inline-flex items-center gap-1 text-[14px] text-slate-500">
        ← 词汇中心
      </BackLink>

      <h1 className="mb-1 text-[26px] font-bold tracking-tight text-slate-900">
        {bank?.name_zh ?? (state === "loading" ? "加载中" : "词库")}
      </h1>
      <p className="text-[14px] text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
        {state === "ok" ? `${words.length} 词可学` : " "}
      </p>
      {/* 定位文案:次要信息,更浅的灰,不与词数、主数字抢视线 */}
      {state === "ok" && BANK_POSITIONING[bankCode] ? (
        <p className="mb-5 mt-1 text-[13px] leading-relaxed text-slate-400">{BANK_POSITIONING[bankCode]}</p>
      ) : (
        <div className="mb-5" />
      )}

      {state === "error" ? (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center">
          <p className="text-[15px] text-slate-600">加载失败</p>
          <button onClick={() => window.location.reload()} className="mt-3 rounded-full border border-black/[0.08] px-4 py-1.5 text-[14px] text-slate-700">重试</button>
        </div>
      ) : (
        <>
          <StatsPanel
            mastered={progress.mastered}
            learning={progress.learning}
            untouched={progress.untouched}
            color={color}
            growthWordIds={words.map(w => w.id)}
            emptyHint="还没开始学这个词库。下面可以先浏览词表,点喇叭听发音。"
          />

          {due > 0 && (
            <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white px-4 py-3.5">
              <span className="text-[14px] text-slate-600">
                有 <b className="text-slate-900" style={{ fontVariantNumeric: "tabular-nums" }}>{due}</b> 个词到复习时间
              </span>
            </div>
          )}

          {/* ★ 全屏唯一渐变位 ★ 其它任何按钮都不许用渐变 */}
          <button
            type="button"
            onClick={() => document.getElementById("vocab-wordlist")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="mt-4 w-full rounded-2xl px-5 py-4 text-center text-[17px] font-semibold text-white"
            style={{ backgroundImage: GRAD_CTA, boxShadow: CTA_SHADOW }}
          >
            {locked ? "激活码解锁" : "开始学习"}
          </button>
          {/* PR-2 把这个按钮接到 5 步通关流程;现在先滚到词表,不做假入口。 */}

          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* 未上线的模式卡:降透明 + 禁点,与可用卡明确区分,避免反复点无响应的卡。
                PR-2/PR-3 点亮时去掉 opacity/pointer-events 即可。 */}
            {MODES.map(m => (
              <div key={m.key} aria-disabled="true"
                className="pointer-events-none cursor-not-allowed select-none rounded-2xl border border-black/[0.06] bg-white px-4 py-4 opacity-60">
                <div className="flex items-center gap-1.5 text-[15px] font-medium text-slate-800">
                  <m.icon className="h-[18px] w-[18px] text-slate-400" />{m.label}
                </div>
                <div className="mt-0.5 text-[13px] text-slate-400">{m.desc}</div>
                <div className="mt-2 text-[12px] font-medium text-slate-400">即将开放</div>
              </div>
            ))}
          </div>

          <h2 id="vocab-wordlist" className="mb-3 mt-7 scroll-mt-4 text-[16px] font-semibold text-slate-900">词表</h2>
          {state === "loading" ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map(i => <div key={i} className="h-[68px] animate-pulse rounded-xl border border-black/[0.06] bg-white" />)}
            </div>
          ) : words.length === 0 ? (
            <div className="rounded-2xl border border-black/[0.06] bg-white p-6 text-center text-[14px] text-slate-500">
              这个词库还没有内容
            </div>
          ) : (
            <WordList words={words} statuses={statuses} color={color} />
          )}
        </>
      )}
    </Shell>
  );
}

function Shell({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {color && <div className="h-[3px] w-full" style={{ background: color }} />}
      <div className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-4">{children}</div>
    </div>
  );
}

/* ── 词表 ───────────────────────────────────────────────────────── */

type Item =
  | { type: "header"; group: WordStatus; label: string; count: number; hint: string }
  | { type: "row"; word: VocabWord; first: boolean };

function WordList({ words, statuses, color }: { words: VocabWord[]; statuses: Record<string, WordStatus>; color: string }) {
  const [query, setQuery] = useState("");
  // 已掌握默认折叠 —— 它只会越来越长,展开会把待学习顶出视野
  const [collapsed, setCollapsed] = useState<Record<WordStatus, boolean>>({ new: false, learning: false, mastered: true });
  const [openId, setOpenId] = useState<string | null>(null);
  const [, bump] = useState(0);
  const [viewH, setViewH] = useState(800);
  const listRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [openH, setOpenH] = useState(0);

  useEffect(() => {
    const onScroll = () => bump(t => t + 1);
    const onResize = () => setViewH(window.innerHeight);
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
  }, []);

  useLayoutEffect(() => {
    if (!openId) { setOpenH(0); return; }
    const el = panelRef.current;
    if (!el) return;
    const measure = () => setOpenH(el.offsetHeight);
    measure();
    let ro: ResizeObserver | null = null;
    try { ro = new ResizeObserver(measure); ro.observe(el); }
    catch { const t = window.setTimeout(measure, 300); return () => window.clearTimeout(t); }
    return () => ro?.disconnect();
  }, [openId]);

  /** 前缀匹配 headword(不是模糊包含 —— 词表检索按字母序找词,前缀才符合直觉)。 */
  const q = query.trim().toLowerCase();
  const items: Item[] = useMemo(() => {
    const filtered = q ? words.filter(w => w.headword.toLowerCase().startsWith(q)) : words;
    const byGroup: Record<WordStatus, VocabWord[]> = { new: [], learning: [], mastered: [] };
    for (const w of filtered) byGroup[statuses[w.id] ?? "new"].push(w);

    const out: Item[] = [];
    for (const g of GROUPS) {
      const arr = byGroup[g.key];
      if (!arr.length) continue;
      out.push({ type: "header", group: g.key, label: g.label, count: arr.length, hint: g.hint });
      if (collapsed[g.key]) continue;
      arr.forEach((w, i) => out.push({ type: "row", word: w, first: i === 0 }));
    }
    return out;
  }, [words, statuses, q, collapsed]);

  /** 每项高度的前缀和 —— 组头和词行高度不同,不能用 index*ROW_H 算偏移。 */
  const offsets = useMemo(() => {
    const arr = new Array(items.length + 1).fill(0);
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      // 组头高度随"有无引导文案"变 —— 算错会让窗口偏移和字母跳转都不准
      const h = it.type === "header" ? (it.hint && !collapsed[it.group] ? HEADER_H_HINT : HEADER_H) : ROW_H;
      arr[i + 1] = arr[i] + h;
    }
    return arr;
  }, [items, collapsed]);
  const totalH = offsets[items.length] ?? 0;

  const listTop = listRef.current?.getBoundingClientRect().top ?? 0;
  const relTop = Math.max(0, -listTop);

  // 二分找起始项
  let startRaw = 0;
  { let lo = 0, hi = items.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (offsets[mid + 1] <= relTop) lo = mid + 1; else hi = mid; } startRaw = lo; }
  const start = Math.max(0, startRaw - OVERSCAN);
  let end = start;
  { const limit = relTop + viewH + openH; while (end < items.length && offsets[end] < limit) end++; end = Math.min(items.length, end + OVERSCAN); }
  const slice = items.slice(start, end);

  /** A-Z 快滚条:只列词表里真实出现的首字母。 */
  const letterIndex = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((it, i) => {
      if (it.type !== "row") return;
      const L = it.word.headword[0]?.toUpperCase();
      if (L && /[A-Z]/.test(L) && !m.has(L)) m.set(L, i);
    });
    return m;
  }, [items]);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const jumpTo = (L: string) => {
    const idx = letterIndex.get(L);
    if (idx === undefined || !listRef.current) return;
    const docTop = listRef.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: docTop + offsets[idx] - 8, behavior: "auto" });
  };
  const railRef = useRef<HTMLDivElement | null>(null);
  const onRailTouch = (e: React.TouchEvent) => {
    const rail = railRef.current;
    const t = e.touches[0];
    if (!rail || !t) return;
    const r = rail.getBoundingClientRect();
    const i = Math.floor(((t.clientY - r.top) / r.height) * letters.length);
    const L = letters[Math.max(0, Math.min(letters.length - 1, i))];
    if (letterIndex.has(L)) jumpTo(L);
  };

  return (
    <div className="relative">
      {/* 搜索框 */}
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索单词(按开头字母)"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-300"
          autoCapitalize="none" autoCorrect="off" spellCheck={false}
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="清空搜索" className="shrink-0 text-slate-300">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-1.5">
        <div ref={listRef} className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-[14px] text-slate-400">没有以「{query}」开头的词</div>
          ) : (
            <>
              <div style={{ height: offsets[start] }} aria-hidden />
              {slice.map((it, k) => {
                const i = start + k;
                if (it.type === "header") {
                  return (
                    <GroupHeader
                      key={`h-${it.group}`}
                      label={it.label} count={it.count} hint={it.hint}
                      collapsed={collapsed[it.group]} color={color}
                      onToggle={() => setCollapsed(c => ({ ...c, [it.group]: !c[it.group] }))}
                    />
                  );
                }
                const w = it.word;
                const isOpen = openId === w.id;
                return (
                  <div key={w.id}>
                    <Row word={w} open={isOpen} first={it.first} color={color}
                      onToggle={() => setOpenId(isOpen ? null : w.id)} />
                    {isOpen && <div ref={panelRef}><ExamplePanel word={w} /></div>}
                  </div>
                );
              })}
              <div style={{ height: Math.max(0, totalH - offsets[Math.min(end, items.length)]) }} aria-hidden />
            </>
          )}
        </div>

        {/* A-Z 快滚条:移动端可长按拖动 */}
        <div
          ref={railRef}
          onTouchStart={onRailTouch}
          onTouchMove={onRailTouch}
          className="sticky top-16 flex h-[70vh] w-6 shrink-0 select-none flex-col items-center justify-center py-1 touch-none"
          aria-label="字母快速定位"
        >
          {letters.map(L => {
            const has = letterIndex.has(L);
            return (
              <button
                key={L} type="button" disabled={!has} onClick={() => jumpTo(L)}
                className={cn("w-full text-center text-[10px] leading-[1.15] font-semibold",
                  has ? "text-slate-500" : "text-slate-200")}
                style={has ? { color } : undefined}
              >
                {L}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GroupHeader({ label, count, hint, collapsed, color, onToggle }: {
  label: string; count: number; hint: string; collapsed: boolean; color: string; onToggle: () => void;
}) {
  const showHint = !!hint && !collapsed;
  return (
    <button type="button" onClick={onToggle}
      className={cn("flex w-full flex-col justify-center gap-0.5 border-b border-black/[0.06] bg-slate-50/70 px-4 text-left",
        showHint ? "h-[68px]" : "h-[48px]")}>
      <span className="flex items-center gap-2">
        {/* label / count 都 shrink-0 + nowrap:否则窄屏下"待学习"会被挤成两行 */}
        <span className="h-4 w-[3px] shrink-0 rounded-full" style={{ background: color }} />
        <span className="shrink-0 whitespace-nowrap text-[14px] font-semibold text-slate-800">{label}</span>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[12px] font-semibold text-slate-500"
          style={{ fontVariantNumeric: "tabular-nums" }}>{count}</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 text-slate-300", !collapsed && "rotate-180")} />
      </span>
      {/* 引导文案单独一行 —— 手机上也要看得到,不能靠 sm: 隐掉 */}
      {showHint && <span className="truncate pl-[11px] text-[12px] text-slate-400">{hint}</span>}
    </button>
  );
}

function Row({ word, open, first, color, onToggle }: { word: VocabWord; open: boolean; first: boolean; color: string; onToggle: () => void }) {
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => subscribePlaying(setPlaying), []);
  const key = `w:${word.id}`;
  /* 行内只显示**第一个义项**(分号前)。完整释义在展开区的词卡里。
     行宽有限,两个义项挤一行会被 CSS 截断成半截词,不如主动只给主义项。 */
  const firstSense = (word.def_zh || "").split("；")[0];
  const hasMore = (word.def_zh || "").includes("；");
  return (
    <div className={cn("flex h-[68px] items-center gap-3 px-4", !first && "border-t border-black/[0.06]")}>
      <button type="button" onClick={e => { e.stopPropagation(); playUrl(word.audio_url, key); }}
        disabled={!word.audio_url} aria-label={`朗读 ${word.headword}`} className="shrink-0 rounded-full p-1.5">
        <Volume2 className={cn("h-[18px] w-[18px]", playing === key ? "text-slate-900" : word.audio_url ? "text-slate-300" : "text-slate-200")} />
      </button>
      <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[18px] text-slate-900" style={{ fontFamily: FONT_SERIF, fontWeight: 600 }}>
            {word.headword}
          </span>
          <span className="block truncate text-[13px] text-slate-500">
            {firstSense}{hasMore && <span className="text-slate-300"> …</span>}
          </span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-300", open && "rotate-180")} style={{ color: open ? color : undefined }} />
      </button>
    </div>
  );
}

/**
 * 行内展开:按需拉三条例句(不预取全库 —— 放量后预取会把首屏拖死)。
 * 例句版式复用 WordCard 的 inline 变体,不在这里另写一份,
 * 否则词卡改了版式、词表这边还是老样子。
 */
function ExamplePanel({ word }: { word: VocabWord }) {
  const [rows, setRows] = useState<VocabExample[] | null>(null);
  useEffect(() => {
    let alive = true;
    listExamples(word.id).then(r => { if (alive) setRows(r); }).catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, [word.id]);

  if (rows === null) return <div className="bg-slate-50/60 px-4 pb-4 pt-2 text-[13px] text-slate-400">加载例句…</div>;
  if (!rows.length) return <div className="bg-slate-50/60 px-4 pb-4 pt-2 text-[13px] text-slate-400">暂无例句</div>;
  return (
    <div className="bg-slate-50/60 pt-1">
      {/* 完整释义(含第二义项)在这里给全 */}
      <div className="px-4 pt-2 text-[14px] font-medium text-slate-700">{word.def_zh}</div>
      <WordCard word={word} examples={rows} variant="inline" />
    </div>
  );
}
