/**
 * 发音基础(/vocab/phonics)· 音标 48 + 自然拼读 42。
 *
 * ── 卡片结构(Aaron 2026-08-09 定版,48 个音**全部同一结构**)──
 *   音标大字 + 🔊常速/慢速 → 动作口令(纯文字) → 示例词 3-5(目标音字母标色·各带🔊)
 *   → 最小对立对(并排,点了对比播放) → 「练一练」
 *
 * ⚠️ **口型 SVG 已整个删除**(原 components/vocab/MouthDiagram.tsx)。不要再加回来。
 * ⚠️ **不再分「完整形态 / 简卡」两档** —— 48 个音走同一个组件、同一套数据形状。
 *    数据丰俭由数据本身决定(有 mistakenAs 就多显示一行,有 minimalPair 就多一种练习),
 *    但**结构不分级**。
 *
 * ⚠️ 「练一练」三种,按数据可用性自动开:
 *    ① 听音辨标 —— 48 个音全有(同组内二选一,不需要额外数据)
 *    ② 最小对立对连辨 —— 有 minimalPair 的 44 个音有。
 *       /ə/ /ʒ/ /ts/ /dz/ 本来就没有像样的真对立对,**没有编**。
 *    ③ 找出目标音 —— **从数据自动生成**:命中项取本音示例词,干扰项取别组示例词。
 *       每个词属于哪个音在数据里是现成的,所以不可能编错,48 个音全有。
 *
 * ⚠️ 音频:走**现有链路**(tts edge,极短文本自动用 gpt-4o-mini-tts)。
 *    Aaron 2026-08-09 撤销了 tts-1-hd —— 那要改并部署 edge(禁区),
 *    而该模型本就为短语优化,音标单读和示例词都只有几个音节,手机上听不出差别。
 *    **慢速版仍要单独烧一份 speed 0.75**(hash 含 speed,天然是另一个文件)。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { FONT_SERIF, SCENE_COLOR } from "@/lib/vocab/theme";
import { speak, stopSpeaking } from "@/lib/speak";
import { HARD_8 } from "@/data/vocab/phonicsHard8";
import { PHONICS_48, VOWELS, CONSONANTS, type PhonicsCard } from "@/data/vocab/phonics48";
import { PHONICS_RULES, type SkillCardData } from "@/data/vocab/phonicsRules";

type Tab = "sounds" | "rules";
const say = (t: string, slow = false) => void speak(t, { accent: "UK", speed: slow ? 0.75 : 1 });

/** 8 个最易错音的补充信息(「你可能读成了 X」+ 动作口令),按 ipa 索引。 */
const HARD_BY_IPA = new Map(HARD_8.map(h => [h.ipa, h]));

export default function VocabPhonics() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "rules" ? "rules" : "sounds");
  const [id, setId] = useState(PHONICS_48[0].id);
  useEffect(() => () => stopSpeaking(), []);

  const card = PHONICS_48.find(c => c.id === id) ?? PHONICS_48[0];

  /* 导航排序:8 个最易错的排最前(用户多半是为它们来的),其余保持原序。 */
  const ordered = useMemo(() => {
    const hard = PHONICS_48.filter(c => HARD_BY_IPA.has(c.ipa));
    const rest = PHONICS_48.filter(c => !HARD_BY_IPA.has(c.ipa));
    return [...hard, ...rest];
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: SCENE_COLOR }} />
      <div className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-3">
        <BackLink to="/vocab" className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500">
          ← 词汇中心
        </BackLink>
        <h1 className="text-[24px] font-bold tracking-tight text-slate-900">发音基础</h1>

        <div className="mb-3 mt-2 inline-flex rounded-full border border-black/[0.08] bg-white p-0.5">
          {([["sounds", "音标"], ["rules", "自然拼读"]] as const).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setTab(k)}
              className={cn("rounded-full px-4 py-1.5 text-[13px] font-medium", tab === k ? "text-white" : "text-slate-500")}
              style={tab === k ? { backgroundColor: SCENE_COLOR } : undefined}>{label}</button>
          ))}
        </div>

        {tab === "rules" ? <RulesTab /> : (
          <>
            <p className="mb-2 text-[13px] text-slate-400">
              {PHONICS_48.length} 个音标 · 标红的 8 个是中国学生最易错的,建议先练
            </p>
            <div className="-mx-4 mb-3 overflow-x-auto px-4 pb-1">
              <div className="flex gap-1.5">
                {ordered.map((c, i) => (
                  <button key={c.id} type="button" onClick={() => setId(c.id)}
                    className={cn("shrink-0 rounded-lg border px-2.5 py-1.5 text-[15px] font-medium",
                      c.id === card.id ? "border-transparent text-white"
                        : i < HARD_8.length ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-black/[0.06] bg-white text-slate-700")}
                    style={{ ...(c.id === card.id ? { backgroundColor: SCENE_COLOR } : {}), fontFamily: FONT_SERIF }}>
                    {c.ipa}
                  </button>
                ))}
              </div>
            </div>

            <SoundCard card={card} />
            <Practice card={card} />
          </>
        )}
      </div>
    </div>
  );
}

/* ── 一张音标卡(48 个音共用)──────────────────────────────── */

function SoundCard({ card }: { card: PhonicsCard }) {
  const hard = HARD_BY_IPA.get(card.ipa);
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-[44px] font-bold leading-none text-slate-900" style={{ fontFamily: FONT_SERIF }}>
          {card.ipa}
        </div>
        <button type="button" onClick={() => say(card.words[0])}
          className="inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium text-white"
          style={{ backgroundColor: SCENE_COLOR }}>
          <Volume2 className="h-4 w-4" />常速
        </button>
        <button type="button" onClick={() => say(card.words[0], true)}
          className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] px-3.5 py-2 text-[13px] text-slate-600">
          <Volume2 className="h-4 w-4" />慢速
        </button>
        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[12px] text-slate-500">{card.group}</span>
      </div>

      {/* 8 个最易错音多一行「你可能读成了 X」—— 有数据才显示,不是另一种结构 */}
      {hard && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[14px] font-medium leading-relaxed text-amber-900">
          {hard.mistakenAs}
        </p>
      )}

      {/* 动作口令(纯文字) */}
      <p className="mt-3 text-[15px] leading-relaxed text-slate-800">{hard?.command ?? card.tip}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
        {hard ? `为什么会错:${hard.why}` : `常见错误:${card.cnError}`}
      </p>

      {/* 示例词:目标音字母标色 + 各带喇叭 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {card.words.map((w, i) => (
          <button key={w + i} type="button" onClick={() => say(w)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.06] px-3 py-2 text-[16px] active:bg-slate-50"
            style={{ fontFamily: FONT_SERIF }}>
            {mark(w, card.focus[i])}
            <Volume2 className="h-3.5 w-3.5 text-slate-300" />
          </button>
        ))}
      </div>

      {/* 最小对立对:并排,点了对比播放 */}
      {card.minimalPair && (
        <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3">
          <div className="mb-2 text-[12px] text-slate-500">最小对立对 —— 只差这一个音,听出区别就算过关</div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => say(card.minimalPair![0])}
              className="flex-1 rounded-lg border-2 bg-white px-3 py-2 text-[16px]"
              style={{ borderColor: SCENE_COLOR, color: SCENE_COLOR, fontFamily: FONT_SERIF }}>
              {card.minimalPair[0]}
            </button>
            <span className="text-[12px] text-slate-400">vs</span>
            <button type="button" onClick={() => say(card.minimalPair![1])}
              className="flex-1 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[16px] text-slate-600"
              style={{ fontFamily: FONT_SERIF }}>
              {card.minimalPair[1]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function mark(word: string, focus: string) {
  const i = word.toLowerCase().indexOf(focus.toLowerCase());
  if (i < 0) return <span>{word}</span>;
  return (
    <span>
      {word.slice(0, i)}
      <b className="font-bold" style={{ color: SCENE_COLOR }}>{word.slice(i, i + focus.length)}</b>
      {word.slice(i + focus.length)}
    </span>
  );
}

/* ── 练一练 ─────────────────────────────────────────────────── */

type Drill = "id" | "pair" | "find";

function Practice({ card }: { card: PhonicsCard }) {
  const [open, setOpen] = useState(false);
  const [drill, setDrill] = useState<Drill>("id");
  const tabs = useMemo(() => {
    const t: { k: Drill; label: string }[] = [{ k: "id", label: "听音辨标" }];
    if (card.minimalPair) t.push({ k: "pair", label: "对立对连辨" });
    t.push({ k: "find", label: "找出目标音" });
    return t;
  }, [card]);

  useEffect(() => { if (!tabs.some(t => t.k === drill)) setDrill("id"); }, [tabs, drill]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-white"
        style={{ backgroundColor: SCENE_COLOR }}>
        练一练
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[15px] font-semibold text-slate-900">练一练</span>
        <div className="ml-auto inline-flex flex-wrap rounded-full border border-black/[0.08] p-0.5">
          {tabs.map(t => (
            <button key={t.k} type="button" onClick={() => setDrill(t.k)}
              className={cn("rounded-full px-3 py-1 text-[12px]", drill === t.k ? "text-white" : "text-slate-500")}
              style={drill === t.k ? { backgroundColor: SCENE_COLOR } : undefined}>{t.label}</button>
          ))}
        </div>
      </div>
      {drill === "id" && <IdentifyDrill card={card} />}
      {drill === "pair" && card.minimalPair && <PairDrill card={card} />}
      {drill === "find" && <FindDrill card={card} />}
    </div>
  );
}

/** ① 听音辨标:同组内二选一 —— 48 个音都能玩,不需要额外数据。 */
function IdentifyDrill({ card }: { card: PhonicsCard }) {
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(() => {
    const same = PHONICS_48.filter(c => c.group === card.group && c.id !== card.id);
    const from = same.length ? same : PHONICS_48.filter(c => c.id !== card.id);
    const d = from[Math.floor(Math.random() * from.length)];
    const pair = [card, d];
    return Math.random() < 0.5 ? pair : [...pair].reverse();
  }, [card]);
  useEffect(() => setPicked(null), [card.id]);

  return (
    <div>
      <p className="mb-3 text-[13px] text-slate-400">听一遍,选出你听到的那个音</p>
      <button type="button" onClick={() => say(card.words[0])}
        className="mb-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium text-white"
        style={{ backgroundColor: SCENE_COLOR }}>
        <Volume2 className="h-4 w-4" />放一遍
      </button>
      <div className="grid grid-cols-2 gap-3">
        {options.map(o => {
          const right = o.id === card.id;
          return (
            <button key={o.id} type="button" disabled={picked !== null} onClick={() => setPicked(o.id)}
              className={cn("rounded-xl border px-3 py-3 text-[18px]",
                picked === null ? "border-black/[0.08] bg-white"
                  : right ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : picked === o.id ? "border-rose-300 bg-rose-50 text-rose-700" : "border-black/[0.06] opacity-60")}
              style={{ fontFamily: FONT_SERIF }}>{o.ipa}</button>
          );
        })}
      </div>
      {picked && (
        <p className="mt-3 text-[13px] text-slate-500">
          {picked === card.id ? "对了。" : `是 ${card.ipa} —— ${card.tip}`}
        </p>
      )}
    </div>
  );
}

/** ② 最小对立对连辨:连续 8 组,错 3 次以上跳回动作口令。 */
function PairDrill({ card }: { card: PhonicsCard }) {
  const ROUNDS = 8;
  const pair = card.minimalPair as [string, string];
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [backToTip, setBackToTip] = useState(false);

  const makeRound = useCallback(() => {
    const answer = Math.random() < 0.5 ? pair[0] : pair[1];
    const opts = Math.random() < 0.5 ? [pair[0], pair[1]] : [pair[1], pair[0]];
    return { answer, opts };
  }, [pair]);
  const [round, setRound] = useState(makeRound);

  const restart = useCallback(() => {
    setI(0); setWrong(0); setRight(0); setPicked(null); setBackToTip(false); setRound(makeRound());
  }, [makeRound]);
  useEffect(() => { restart(); }, [card.id, restart]);

  if (backToTip) {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-4">
        <p className="text-[14px] font-medium text-amber-900">错了 3 次 —— 先回去看动作口令</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-amber-800">
          {HARD_BY_IPA.get(card.ipa)?.command ?? card.tip}
        </p>
        <button type="button" onClick={restart}
          className="mt-3 rounded-full px-4 py-2 text-[13px] font-medium text-white"
          style={{ backgroundColor: SCENE_COLOR }}>再来一轮</button>
      </div>
    );
  }

  if (i >= ROUNDS) {
    const rate = Math.round((right / ROUNDS) * 100);
    return (
      <div className="rounded-xl bg-slate-50 px-4 py-4 text-center">
        <p className="text-[15px] font-semibold text-slate-900">正确率 {rate}%</p>
        <p className="mt-1 text-[13px] text-slate-500">
          {rate >= 75 ? "这个音你分得清了,换下一个练。" : "还差点 —— 回看一眼口令再来一轮。"}
        </p>
        <button type="button" onClick={restart}
          className="mt-3 rounded-full border border-black/[0.08] px-4 py-2 text-[13px] text-slate-600">再来一轮</button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px] text-slate-400">
        <span>第 {i + 1} / {ROUNDS} 组</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>对 {right} · 错 {wrong}</span>
      </div>
      <button type="button" onClick={() => say(round.answer)}
        className="mb-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium text-white"
        style={{ backgroundColor: SCENE_COLOR }}>
        <Volume2 className="h-4 w-4" />放一遍
      </button>
      <div className="grid grid-cols-2 gap-3">
        {round.opts.map(w => {
          const isAns = w === round.answer;
          return (
            <button key={w} type="button" disabled={picked !== null}
              onClick={() => {
                setPicked(w);
                if (isAns) setRight(r => r + 1);
                else {
                  const n = wrong + 1; setWrong(n);
                  if (n >= 3) { setBackToTip(true); return; }
                }
                window.setTimeout(() => { setPicked(null); setRound(makeRound()); setI(v => v + 1); }, 700);
              }}
              className={cn("rounded-xl border px-3 py-3 text-[18px]",
                picked === null ? "border-black/[0.08] bg-white"
                  : isAns ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : picked === w ? "border-rose-300 bg-rose-50 text-rose-700" : "border-black/[0.06] opacity-60")}
              style={{ fontFamily: FONT_SERIF }}>{w}</button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ③ 找出目标音:6 个词里选出含目标音的。
 * ⚠️ 词是**从数据自动生成**的:命中项取本音示例词,干扰项取别组示例词。
 *    每个词属于哪个音在数据里是现成的,所以不可能编错,48 个音也全都有。
 */
function FindDrill({ card }: { card: PhonicsCard }) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  useEffect(() => { setSel(new Set()); setChecked(false); }, [card.id]);

  const items = useMemo(() => {
    const hits = card.words.slice(0, 3).map(w => ({ word: w, hit: true }));
    const others = PHONICS_48
      .filter(c => c.group !== card.group && c.kind === card.kind)
      .flatMap(c => c.words)
      .filter(w => !card.words.includes(w));
    const picked: { word: string; hit: boolean }[] = [];
    const seen = new Set(card.words);
    for (let k = 0; picked.length < 3 && k < others.length; k++) {
      const w = others[(k * 7 + card.ipa.length * 3) % others.length];
      if (seen.has(w)) continue;
      seen.add(w); picked.push({ word: w, hit: false });
    }
    // 固定顺序(按 id 派生),避免每次 render 位置乱跳
    return [...hits, ...picked].sort((a, b) => (a.word + card.id).localeCompare(b.word + card.id));
  }, [card]);

  const hits = items.filter(i => i.hit).map(i => i.word);
  const allRight = checked && hits.every(w => sel.has(w)) && [...sel].every(w => hits.includes(w));

  return (
    <div>
      <p className="mb-3 text-[13px] text-slate-500">
        选出所有含 <b style={{ color: SCENE_COLOR, fontFamily: FONT_SERIF }}>{card.ipa}</b> 的词(对完答案后点词可听)
      </p>
      <div className="grid grid-cols-3 gap-2">
        {items.map(it => {
          const on = sel.has(it.word);
          const state = checked ? (it.hit ? "right" : on ? "wrong" : "idle") : on ? "on" : "idle";
          return (
            <button key={it.word} type="button"
              onClick={() => {
                if (checked) { say(it.word); return; }
                setSel(s => {
                  const n = new Set(s);
                  if (n.has(it.word)) n.delete(it.word); else n.add(it.word);
                  return n;
                });
              }}
              className={cn("rounded-xl border px-2 py-2.5 text-[15px]",
                state === "on" && "text-white",
                state === "right" && "border-emerald-300 bg-emerald-50 text-emerald-800",
                state === "wrong" && "border-rose-300 bg-rose-50 text-rose-700",
                state === "idle" && "border-black/[0.08] bg-white text-slate-700")}
              style={{ ...(state === "on" ? { backgroundColor: SCENE_COLOR, borderColor: "transparent" } : {}), fontFamily: FONT_SERIF }}>
              {it.word}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <button type="button" onClick={() => setChecked(true)} disabled={!sel.size}
          className={cn("mt-3 rounded-full px-4 py-2 text-[13px] font-medium text-white", !sel.size && "opacity-40")}
          style={{ backgroundColor: SCENE_COLOR }}>对答案</button>
      ) : (
        <div className="mt-3">
          <p className="text-[13px] text-slate-600">
            {allRight ? "全对 —— 你已经能在词里认出这个音了。" : `正确答案:${hits.join(" / ")}`}
          </p>
          <button type="button" onClick={() => { setSel(new Set()); setChecked(false); }}
            className="mt-2 rounded-full border border-black/[0.08] px-4 py-1.5 text-[13px] text-slate-600">再做一次</button>
        </div>
      )}
    </div>
  );
}

/* ── 自然拼读 tab(PR-13,未改)───────────────────────────────── */

function RulesTab() {
  const [id, setId] = useState(PHONICS_RULES[0].id);
  const card: SkillCardData = PHONICS_RULES.find(r => r.id === id) ?? PHONICS_RULES[0];
  return (
    <>
      <p className="mb-2.5 text-[13px] text-slate-400">
        {PHONICS_RULES.length} 条拼读规则,看词能读、听音能写(音标见「音标」tab:元音 {VOWELS.length} / 辅音 {CONSONANTS.length})
      </p>
      <div className="-mx-4 mb-4 overflow-x-auto px-4 pb-1">
        <div className="flex gap-1.5">
          {PHONICS_RULES.map(r => (
            <button key={r.id} type="button" onClick={() => setId(r.id)}
              className={cn("shrink-0 rounded-lg border px-2.5 py-1.5 text-[14px] font-medium",
                r.id === card.id ? "border-transparent text-white" : "border-black/[0.06] bg-white text-slate-700")}
              style={r.id === card.id ? { backgroundColor: SCENE_COLOR } : undefined}>{r.symbol}</button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="text-[22px] font-bold text-slate-900" style={{ fontFamily: FONT_SERIF }}>{card.title}</div>
        <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[12px] text-slate-500">{card.group}</span>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-700">{card.tip}</p>
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-800">
          例外提示:{card.cnError}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {card.words.map((w, i) => (
            <button key={w + i} type="button" onClick={() => say(w)}
              className="rounded-xl border border-black/[0.06] px-3 py-2 text-[16px] active:bg-slate-50"
              style={{ fontFamily: FONT_SERIF }}>{mark(w, card.focus[i])}</button>
          ))}
        </div>
      </div>
    </>
  );
}
