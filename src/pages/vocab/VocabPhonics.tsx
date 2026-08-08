/**
 * 音标基础(/vocab/phonics)· 48 音标卡 + 听音辨标小测。
 *
 * ⚠️ 卡片骨架与测验引擎**与自然拼读(PR-13)共用** —— 那边是同一个页面的第二个 tab,
 *    走同一套 `SkillCard` / `MiniQuiz`。改这里等于同时改那边,别复制一份出去。
 *
 * ⚠️ 音频先用 **TTS 兜底**(走全站 speak(),UK 音)。
 *    音标本身没法让 TTS 念(念不出孤立音位),所以点音标大字读的是**第一个示例词**。
 *    真人音频列入下一批攒批。
 *
 * ⚠️ 教学内容是 v1 草稿,送审件在 REVIEWAA/vocab-phonics-48/。
 *    审定后直接改 src/data/vocab/phonics48.ts,不涉及数据库。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { FONT_SERIF, SCENE_COLOR } from "@/lib/vocab/theme";
import { speak, stopSpeaking } from "@/lib/speak";
import { PHONICS_48, VOWELS, CONSONANTS, type PhonicsCard } from "@/data/vocab/phonics48";
import { PHONICS_RULES, type SkillCardData } from "@/data/vocab/phonicsRules";

type Tab = "ipa" | "rules";

export default function VocabPhonics() {
  /* 中心页「自然拼读」那张方式卡直接链到 ?tab=rules —— 用户点的是"自然拼读",
     落地却停在音标 tab 上会让人以为点错了。 */
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "rules" ? "rules" : "ipa");
  const [activeId, setActiveId] = useState<string>(PHONICS_48[0].id);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => stopSpeaking(), []);

  const cards: SkillCardData[] = useMemo(
    () => (tab === "ipa" ? PHONICS_48.map(toSkill) : PHONICS_RULES),
    [tab],
  );
  const active = cards.find(c => c.id === activeId) ?? cards[0];

  /* 切 tab 时把选中项复位到该 tab 的第一张,否则会停在另一套的 id 上导致空白 */
  useEffect(() => { setActiveId(cards[0].id); }, [tab, cards]);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="h-[3px] w-full" style={{ background: SCENE_COLOR }} />
      <div className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-3">
        <BackLink to="/vocab" className="mb-2 inline-flex items-center gap-1 text-[13px] text-slate-500">
          ← 词汇中心
        </BackLink>

        <h1 className="text-[24px] font-bold tracking-tight text-slate-900">发音基础</h1>
        <p className="mb-3 text-[13px] text-slate-400">
          {tab === "ipa" ? "48 个音标,先会读再背词" : "42 条拼读规则,看词能读、听音能写"}
        </p>

        {/* 二级 tab:音标 / 自然拼读 */}
        <div className="mb-3 inline-flex rounded-full border border-black/[0.08] bg-white p-0.5">
          {([["ipa", "音标"], ["rules", "自然拼读"]] as const).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setTab(k)}
              className={cn("rounded-full px-4 py-1.5 text-[13px] font-medium",
                tab === k ? "text-white" : "text-slate-500")}
              style={tab === k ? { backgroundColor: SCENE_COLOR } : undefined}>
              {label}
            </button>
          ))}
        </div>

        {/* 顶部横滑导航 */}
        <div ref={navRef} className="-mx-4 mb-4 overflow-x-auto px-4 pb-1">
          <div className="flex gap-1.5">
            {cards.map(c => (
              <button key={c.id} type="button" onClick={() => setActiveId(c.id)}
                className={cn("shrink-0 rounded-lg border px-2.5 py-1.5 text-[14px] font-medium",
                  c.id === active.id ? "border-transparent text-white" : "border-black/[0.06] bg-white text-slate-700")}
                style={c.id === active.id ? { backgroundColor: SCENE_COLOR } : undefined}>
                {c.symbol}
              </button>
            ))}
          </div>
        </div>

        <SkillCard card={active} noteLabel={tab === "ipa" ? "中国学生常见错误" : "例外提示"} />
        <MiniQuiz pool={cards} current={active} />
      </div>
    </div>
  );
}

/** 音标卡 → 通用骨架(自然拼读那边直接就是这个形状)。 */
function toSkill(c: PhonicsCard): SkillCardData {
  return {
    id: c.id,
    symbol: c.ipa,
    title: c.ipa,
    group: c.group,
    tip: c.tip,
    cnError: c.cnError,
    words: c.words,
    focus: c.focus,
    minimalPair: c.minimalPair,
    advanced: c.advanced,
  };
}

/* ── 共用卡片骨架(音标 / 自然拼读同一套)────────────────────── */

/** noteLabel:音标卡是「中国学生常见错误」,拼读卡是「例外提示」——
 *  同一个字段两种语义,标错了内容就变味。 */
export function SkillCard({ card, noteLabel }: { card: SkillCardData; noteLabel: string }) {
  const [openAdv, setOpenAdv] = useState(false);
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3">
        <div className="text-[40px] font-bold leading-none text-slate-900" style={{ fontFamily: FONT_SERIF }}>
          {card.title}
        </div>
        {/* TTS 念不出孤立音位,所以这里读的是第一个示例词 */}
        <button type="button" aria-label="发音" onClick={() => void speak(card.words[0], { accent: "UK" })}
          className="rounded-full p-2 active:bg-slate-100">
          <Volume2 className="h-5 w-5" style={{ color: SCENE_COLOR }} />
        </button>
        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[12px] text-slate-500">{card.group}</span>
      </div>

      <p className="mt-3 text-[14px] leading-relaxed text-slate-700">{card.tip}</p>
      <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] leading-relaxed text-amber-800">
        {noteLabel}:{card.cnError}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.words.map((w, i) => (
          <button key={w + i} type="button" onClick={() => void speak(w, { accent: "UK" })}
            className="rounded-xl border border-black/[0.06] px-3 py-2 text-[16px] active:bg-slate-50"
            style={{ fontFamily: FONT_SERIF }}>
            {highlight(w, card.focus[i])}
          </button>
        ))}
      </div>

      {card.minimalPair && (
        <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3">
          <div className="mb-1.5 text-[12px] text-slate-500">最小对立对 —— 只差这一个音</div>
          <div className="flex items-center gap-2">
            {card.minimalPair.map(w => (
              <button key={w} type="button" onClick={() => void speak(w, { accent: "UK" })}
                className="rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-[15px]"
                style={{ fontFamily: FONT_SERIF }}>{w}</button>
            ))}
          </div>
        </div>
      )}

      {card.advanced && card.advanced.length > 0 && (
        <div className="mt-3">
          <button type="button" onClick={() => setOpenAdv(v => !v)}
            className="flex items-center gap-1 text-[13px] text-slate-500">
            进阶示例(托福词)
            <ChevronDown className={cn("h-4 w-4 transition-transform", openAdv && "rotate-180")} />
          </button>
          {openAdv && (
            <div className="mt-2 flex flex-wrap gap-2">
              {card.advanced.map(w => (
                <button key={w} type="button" onClick={() => void speak(w, { accent: "UK" })}
                  className="rounded-lg border border-black/[0.06] px-2.5 py-1.5 text-[14px] text-slate-600"
                  style={{ fontFamily: FONT_SERIF }}>{w}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** 把示例词里发目标音的字母标色。focus 保证是词里的真实子串(有测试守着)。 */
function highlight(word: string, focus: string) {
  const i = word.toLowerCase().indexOf(focus.toLowerCase());
  if (i < 0) return word;
  return (
    <>
      {word.slice(0, i)}
      <b className="font-bold" style={{ color: SCENE_COLOR }}>{word.slice(i, i + focus.length)}</b>
      {word.slice(i + focus.length)}
    </>
  );
}

/* ── 听音辨标二选一(音标 / 自然拼读共用)──────────────────── */

export function MiniQuiz({ pool, current }: { pool: SkillCardData[]; current: SkillCardData }) {
  const [picked, setPicked] = useState<string | null>(null);

  /* 干扰项:同组里随机挑一个别的 —— 跨组对比太容易,同组才练得到耳朵。
     同组不足两个时才退到全表。 */
  const options = useMemo(() => {
    const sameGroup = pool.filter(c => c.group === current.group && c.id !== current.id);
    const from = sameGroup.length ? sameGroup : pool.filter(c => c.id !== current.id);
    const distractor = from[Math.floor(Math.random() * from.length)];
    const pair = [current, distractor].filter(Boolean) as SkillCardData[];
    return Math.random() < 0.5 ? pair : [...pair].reverse();
  }, [current, pool]);

  useEffect(() => setPicked(null), [current.id]);
  if (options.length < 2) return null;

  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="mb-1 text-[15px] font-semibold text-slate-900">听音辨标</div>
      <p className="mb-3 text-[13px] text-slate-400">听一遍,选出你听到的那个</p>

      <button type="button" onClick={() => void speak(current.words[0], { accent: "UK" })}
        className="mb-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium text-white"
        style={{ backgroundColor: SCENE_COLOR }}>
        <Volume2 className="h-4 w-4" />放一遍
      </button>

      <div className="grid grid-cols-2 gap-3">
        {options.map(o => {
          const right = o.id === current.id;
          const chosen = picked === o.id;
          return (
            <button key={o.id} type="button" disabled={picked !== null} onClick={() => setPicked(o.id)}
              className={cn("rounded-xl border px-3 py-3 text-[18px]",
                picked === null ? "border-black/[0.08] bg-white"
                  : right ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : chosen ? "border-rose-300 bg-rose-50 text-rose-700" : "border-black/[0.06] bg-white opacity-60")}
              style={{ fontFamily: FONT_SERIF }}>
              {o.symbol}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <p className="mt-3 text-[13px] text-slate-500">
          {picked === current.id ? "对了 —— 换一个音标继续。" : `是 ${current.symbol}。${current.cnError}`}
        </p>
      )}
    </div>
  );
}
