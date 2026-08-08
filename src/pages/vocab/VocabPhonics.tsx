/**
 * 发音基础(/vocab/phonics)· PR-10 重做版。
 *
 * ── 为什么推翻上一版 ──
 * 上一版是**电子版音标表**:48 张卡按符号排开,看得见符号、看不见口型,
 * 听的是浏览器 TTS,做完不知道自己对不对。Aaron 的原话是"不教发音"。
 *
 * 这一版的判据变成:**没学过音标的学生打开 /θ/ 那张卡,30 秒内能否
 * 知道舌头放哪、听出与 /s/ 的区别、做对 5 道辨音题**。围绕这条改了四件事:
 *   ① 口腔侧剖 SVG 当主视觉(MouthDiagram,48 音共用底图只换舌形+高亮)
 *   ② 入口从**错误**出发:顶部「最易错的 8 个音」,每个先说「你可能读成了 X」
 *   ③ 核心是**三种练习**不是看卡片:听音辨标 / 最小对立对连辨 / 找出目标音
 *   ④ 完整 48 表降级成折叠区 —— 它是查阅用的,不是入口
 *
 * ⚠️ 本轮只做 8 个最易错音的完整形态(Aaron 要求先验形态再铺全 48)。
 *    折叠区里的其余音仍是上一版的简卡,**没有口型图** —— 这是有意的中间态,
 *    不是漏做;铺全 48 时给 MOUTH 补 40 条配置即可,页面不用动。
 * ⚠️ 自然拼读(PR-13)那个 tab 一行没动。
 * ⚠️ 音频仍是 TTS 兜底;规格里 tts-1-hd 那 300 条要等 Aaron 说「开烧」。
 */
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Volume2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { FONT_SERIF, SCENE_COLOR } from "@/lib/vocab/theme";
import { speak, stopSpeaking } from "@/lib/speak";
import MouthDiagram, { MOUTH, PART_LABEL, type MouthPart } from "@/components/vocab/MouthDiagram";
import { HARD_8, type Hard8 } from "@/data/vocab/phonicsHard8";
import { PHONICS_48, VOWELS, CONSONANTS } from "@/data/vocab/phonics48";
import { PHONICS_RULES, type SkillCardData } from "@/data/vocab/phonicsRules";

type Tab = "sounds" | "rules";
const say = (t: string, slow = false) => void speak(t, { accent: "UK", speed: slow ? 0.75 : 1 });

export default function VocabPhonics() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "rules" ? "rules" : "sounds");
  const [activeKey, setActiveKey] = useState(HARD_8[0].key);
  useEffect(() => () => stopSpeaking(), []);

  const active = HARD_8.find(h => h.key === activeKey) ?? HARD_8[0];

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
            {/* ── 入口:从错误出发 ── */}
            <h2 className="mb-1 text-[16px] font-semibold text-slate-900">中国学生最易错的 8 个音</h2>
            <p className="mb-2.5 text-[13px] text-slate-400">先解决这 8 个,口音立刻不一样</p>
            <div className="-mx-4 mb-3 overflow-x-auto px-4 pb-1">
              <div className="flex gap-1.5">
                {HARD_8.map(h => (
                  <button key={h.key} type="button" onClick={() => setActiveKey(h.key)}
                    className={cn("shrink-0 rounded-lg border px-3 py-1.5 text-[16px] font-medium",
                      h.key === active.key ? "border-transparent text-white" : "border-black/[0.06] bg-white text-slate-700")}
                    style={{ ...(h.key === active.key ? { backgroundColor: SCENE_COLOR } : {}), fontFamily: FONT_SERIF }}>
                    {h.ipa}
                  </button>
                ))}
              </div>
            </div>

            <SoundCard sound={active} />
            <Practice sound={active} />

            {/* ── 完整表降级成折叠区 ── */}
            <FullTable />
          </>
        )}
      </div>
    </div>
  );
}

/* ── 一个音的完整卡片 ─────────────────────────────────────────── */

function SoundCard({ sound }: { sound: Hard8 }) {
  const cfg = MOUTH[sound.key];
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-4">
        <div>
          <div className="text-[44px] font-bold leading-none text-slate-900" style={{ fontFamily: FONT_SERIF }}>
            {sound.ipa}
          </div>
          <div className="mt-2 flex gap-1.5">
            <button type="button" onClick={() => say(sound.words[0])}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-white"
              style={{ backgroundColor: SCENE_COLOR }}>
              <Volume2 className="h-3.5 w-3.5" />常速
            </button>
            <button type="button" onClick={() => say(sound.words[0], true)}
              className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] px-3 py-1.5 text-[12px] text-slate-600">
              <Volume2 className="h-3.5 w-3.5" />慢速
            </button>
          </div>
        </div>
        {/* 口型图是主视觉,占卡片上半的右侧大块 */}
        <div className="min-w-0 flex-1">
          {cfg ? <MouthDiagram config={cfg} /> : <div className="text-[12px] text-slate-400">(口型图待补)</div>}
        </div>
      </div>

      {cfg && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {cfg.highlight.map((p: MouthPart) => (
            <span key={p} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">
              关键:{PART_LABEL[p]}
            </span>
          ))}
        </div>
      )}

      {/* 「你可能读成了 X」—— 卡片的第一句话 */}
      <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[14px] font-medium leading-relaxed text-amber-900">
        {sound.mistakenAs}
      </p>
      {/* 动作口令:一句祈使句,照着做就行 */}
      <p className="mt-2.5 text-[15px] leading-relaxed text-slate-800">{sound.command}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">为什么会错:{sound.why}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {sound.words.map((w, i) => (
          <button key={w} type="button" onClick={() => say(w)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/[0.06] px-3 py-2 text-[16px] active:bg-slate-50"
            style={{ fontFamily: FONT_SERIF }}>
            {mark(w, sound.focus[i])}
            <Volume2 className="h-3.5 w-3.5 text-slate-300" />
          </button>
        ))}
      </div>

      {/* 最小对立对:并排,点了对比播放 */}
      <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3">
        <div className="mb-2 text-[12px] text-slate-500">
          最小对立对 —— 只差这一个音,听出区别就算过关
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => say(sound.pair.target)}
            className="flex-1 rounded-lg border-2 bg-white px-3 py-2 text-[16px]"
            style={{ borderColor: SCENE_COLOR, color: SCENE_COLOR, fontFamily: FONT_SERIF }}>
            {sound.pair.target}<span className="ml-1 text-[11px]">{sound.ipa}</span>
          </button>
          <span className="text-[12px] text-slate-400">vs</span>
          <button type="button" onClick={() => say(sound.pair.confuse)}
            className="flex-1 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[16px] text-slate-600"
            style={{ fontFamily: FONT_SERIF }}>
            {sound.pair.confuse}<span className="ml-1 text-[11px]">{sound.pair.confuseIpa}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function mark(word: string, focus: string) {
  const i = word.toLowerCase().indexOf(focus.toLowerCase());
  if (i < 0) return word;
  return (
    <span>
      {word.slice(0, i)}
      <b className="font-bold" style={{ color: SCENE_COLOR }}>{word.slice(i, i + focus.length)}</b>
      {word.slice(i + focus.length)}
    </span>
  );
}

/* ── 三种练习(核心)──────────────────────────────────────────── */

type Ex = "pair" | "find";

function Practice({ sound }: { sound: Hard8 }) {
  const [ex, setEx] = useState<Ex>("pair");
  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[15px] font-semibold text-slate-900">练一练</span>
        <div className="ml-auto inline-flex rounded-full border border-black/[0.08] p-0.5">
          {([["pair", "对立对连辨"], ["find", "找出目标音"]] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setEx(k)}
              className={cn("rounded-full px-3 py-1 text-[12px]", ex === k ? "text-white" : "text-slate-500")}
              style={ex === k ? { backgroundColor: SCENE_COLOR } : undefined}>{l}</button>
          ))}
        </div>
      </div>
      {ex === "pair" ? <PairDrill sound={sound} /> : <FindDrill sound={sound} />}
    </div>
  );
}

/** ② 最小对立对连辨:连续 8 组,错 3 次以上自动跳回口型讲解。 */
function PairDrill({ sound }: { sound: Hard8 }) {
  const ROUNDS = 8;
  const [i, setI] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [backToTip, setBackToTip] = useState(false);

  /* 每轮随机决定"这次放的是目标音还是干扰音",并随机左右次序 —— 不然位置能被记住。
     ⚠️ 存进 state 并在推进时显式重算,**不要**写成 useMemo(..., [i]) 靠一个
        函数体里根本没用到的依赖去触发重算 —— 那是 hack,eslint 也会报。 */
  const makeRound = useCallback(() => {
    const answer = Math.random() < 0.5 ? sound.pair.target : sound.pair.confuse;
    const opts = Math.random() < 0.5
      ? [sound.pair.target, sound.pair.confuse]
      : [sound.pair.confuse, sound.pair.target];
    return { answer, opts };
  }, [sound]);
  const [round, setRound] = useState(makeRound);

  const restart = useCallback(() => {
    setI(0); setWrong(0); setRight(0); setPicked(null); setBackToTip(false); setRound(makeRound());
  }, [makeRound]);

  useEffect(() => { restart(); }, [sound.key, restart]);

  if (backToTip) {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-4">
        <p className="text-[14px] font-medium text-amber-900">错了 3 次 —— 先回去看口型</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-amber-800">{sound.command}</p>
        <button type="button"
          onClick={restart}
          className="mt-3 rounded-full px-4 py-2 text-[13px] font-medium text-white"
          style={{ backgroundColor: SCENE_COLOR }}>
          再来一轮
        </button>
      </div>
    );
  }

  if (i >= ROUNDS) {
    const rate = Math.round((right / ROUNDS) * 100);
    return (
      <div className="rounded-xl bg-slate-50 px-4 py-4 text-center">
        <p className="text-[15px] font-semibold text-slate-900">正确率 {rate}%</p>
        <p className="mt-1 text-[13px] text-slate-500">
          {rate >= 75 ? "这个音你分得清了,换下一个音练。" : "还差点 —— 回看一眼口型再来一轮。"}
        </p>
        <button type="button" onClick={restart}
          className="mt-3 rounded-full border border-black/[0.08] px-4 py-2 text-[13px] text-slate-600">
          再来一轮
        </button>
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
          const chosen = picked === w;
          return (
            <button key={w} type="button" disabled={picked !== null}
              onClick={() => {
                setPicked(w);
                if (isAns) setRight(r => r + 1);
                else {
                  const n = wrong + 1;
                  setWrong(n);
                  if (n >= 3) { setBackToTip(true); return; }
                }
                window.setTimeout(() => { setPicked(null); setRound(makeRound()); setI(v => v + 1); }, 700);
              }}
              className={cn("rounded-xl border px-3 py-3 text-[18px]",
                picked === null ? "border-black/[0.08] bg-white"
                  : isAns ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : chosen ? "border-rose-300 bg-rose-50 text-rose-700" : "border-black/[0.06] opacity-60")}
              style={{ fontFamily: FONT_SERIF }}>
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** ③ 找出目标音:6 个词里选出含目标音的那几个。 */
function FindDrill({ sound }: { sound: Hard8 }) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  useEffect(() => { setSel(new Set()); setChecked(false); }, [sound.key]);

  const hits = sound.findSet.filter(w => w.hit).map(w => w.word);
  const allRight = checked
    && hits.every(w => sel.has(w))
    && [...sel].every(w => hits.includes(w));

  return (
    <div>
      <p className="mb-3 text-[13px] text-slate-500">
        选出所有含 <b style={{ color: SCENE_COLOR, fontFamily: FONT_SERIF }}>{sound.ipa}</b> 的词(点词可听)
      </p>
      <div className="grid grid-cols-3 gap-2">
        {sound.findSet.map(w => {
          const on = sel.has(w.word);
          const state = checked ? (w.hit ? "right" : on ? "wrong" : "idle") : on ? "on" : "idle";
          return (
            <button key={w.word} type="button"
              onClick={() => {
                if (checked) { say(w.word); return; }
                setSel(s => {
                  const n = new Set(s);
                  if (n.has(w.word)) n.delete(w.word); else n.add(w.word);
                  return n;
                });
              }}
              className={cn("rounded-xl border px-2 py-2.5 text-[15px]",
                state === "on" && "text-white",
                state === "right" && "border-emerald-300 bg-emerald-50 text-emerald-800",
                state === "wrong" && "border-rose-300 bg-rose-50 text-rose-700",
                state === "idle" && "border-black/[0.08] bg-white text-slate-700")}
              style={{ ...(state === "on" ? { backgroundColor: SCENE_COLOR, borderColor: "transparent" } : {}), fontFamily: FONT_SERIF }}>
              {w.word}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <button type="button" onClick={() => setChecked(true)} disabled={!sel.size}
          className={cn("mt-3 rounded-full px-4 py-2 text-[13px] font-medium text-white", !sel.size && "opacity-40")}
          style={{ backgroundColor: SCENE_COLOR }}>
          对答案
        </button>
      ) : (
        <div className="mt-3">
          <p className="text-[13px] text-slate-600">
            {allRight ? "全对 —— 你已经能在词里认出这个音了。" : `正确答案:${hits.join(" / ")}`}
          </p>
          <button type="button" onClick={() => { setSel(new Set()); setChecked(false); }}
            className="mt-2 rounded-full border border-black/[0.08] px-4 py-1.5 text-[13px] text-slate-600">
            再做一次
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 完整 48 表(折叠)────────────────────────────────────────── */

function FullTable() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="flex w-full items-center gap-2 text-left">
        <span className="text-[15px] font-semibold text-slate-900">完整 48 音标表</span>
        <span className="text-[12px] text-slate-400">元音 {VOWELS.length} · 辅音 {CONSONANTS.length}</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 text-slate-300 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <p className="mt-2 text-[12px] text-slate-400">
            查阅用。这 48 个里还没配口型图的,点开只有要领和示例词。
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PHONICS_48.map(c => (
              <button key={c.id} type="button" onClick={() => say(c.words[0])}
                className="rounded-lg border border-black/[0.06] px-2.5 py-1.5 text-[14px] text-slate-700"
                style={{ fontFamily: FONT_SERIF }} title={c.tip}>
                {c.ipa}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── 自然拼读 tab(PR-13,本轮未改)────────────────────────────── */

function RulesTab() {
  const [id, setId] = useState(PHONICS_RULES[0].id);
  const card: SkillCardData = PHONICS_RULES.find(r => r.id === id) ?? PHONICS_RULES[0];
  return (
    <>
      <p className="mb-2.5 text-[13px] text-slate-400">42 条拼读规则,看词能读、听音能写</p>
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
              style={{ fontFamily: FONT_SERIF }}>
              {mark(w, card.focus[i])}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
