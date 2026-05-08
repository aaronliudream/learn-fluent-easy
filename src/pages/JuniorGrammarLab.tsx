import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Moon, RotateCw, Sparkles, Star, Sun, Trophy, X, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { recordJuniorGrammarAttempt } from "@/lib/juniorGrammarFsrs";
import { TeacherLessonPlayer, type LessonSegment } from "@/components/grammar/TeacherLessonPlayer";
import { fireEmojiConfetti } from "@/lib/feedback";
import { awardForCorrect } from "@/lib/coins";
import ReactMarkdown from "react-markdown";
import { Lock, Lightbulb, Loader2 } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Junior Grammar Lab — generic 6-phase template inspired by
   /grammar-lab/subjunctive-mood.html. One Lab per grammar point.
   Phases:
     0 Briefing → 1 TeacherLesson → 2 Foundation → 3 Reflex
     → 4 Drill → 5 Correction → 6 Exam → 7 Boss → 8 Done
   ────────────────────────────────────────────────────────────── */

type ContrastRow = { lhs: string; rhs: string };
type ReflexCard = { cn: string; en: string; keyword?: string };
type DrillItem = { situation: string; cn: string; en: string; accepted?: string[] };
type CorrectionTask = { wrong: string; model: string; hint: string; why: string };
type BossQ = { stem: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; trap: string; why: string };
type ExamQ = {
  id: string; stem: string;
  option_a?: string | null; option_b?: string | null; option_c?: string | null; option_d?: string | null;
  correct_answer?: string | null; explanation?: string | null;
};

type Pt = {
  id: string;
  title: string;
  cefr: string | null;
  mnemonic: string | null;
  explanation_md: string | null;
  hook_line: string | null;
  hook_line_cn: string | null;
  teacher_script: LessonSegment[] | null;
  contrast_table: ContrastRow[] | null;
  reflex_cards: ReflexCard[] | null;
  situation_drills: DrillItem[] | null;
  correction_tasks: CorrectionTask[] | null;
  boss_questions: BossQ[] | null;
};

type Mistake = { phase: string; stem: string; picked: string; correct: string; why?: string };

type LabState = {
  xp: number;
  streak: number;
  bestStreak: number;
  phasesDone: number[];   // phase indices completed
  achievements: string[];
  mistakes: Mistake[];
};

const PHASES = [
  { id: 0, key: "brief", name: "情境钩子", emoji: "🎬" },
  { id: 1, key: "lesson", name: "老师讲堂", emoji: "👩‍🏫" },
  { id: 2, key: "foundation", name: "核心公式", emoji: "📐" },
  { id: 3, key: "reflex", name: "反射卡", emoji: "⚡" },
  { id: 4, key: "drill", name: "情境翻译", emoji: "✍️" },
  { id: 5, key: "correction", name: "改错挑战", emoji: "🛠️" },
  { id: 6, key: "exam", name: "真题练习", emoji: "📚" },
  { id: 7, key: "boss", name: "Boss 冲刺", emoji: "👑" },
  { id: 8, key: "done", name: "通关庆典", emoji: "🎉" },
];

const ACHIEVEMENTS = [
  { id: "first_step",        icon: "🎯", cn: "迈出第一步",     desc: "完成情境钩子",                xp: 10 },
  { id: "lesson_complete",   icon: "📖", cn: "听完一课",       desc: "听完老师全程",                xp: 30 },
  { id: "reflex_master",     icon: "⚡", cn: "反射大师",       desc: "10 张反射卡全对",             xp: 60 },
  { id: "drill_warrior",     icon: "✍️", cn: "翻译战士",       desc: "情境翻译正确率 ≥ 80%",        xp: 75 },
  { id: "fix_it_pro",        icon: "🛠️", cn: "改错能手",       desc: "5 道改错全对",                xp: 80 },
  { id: "exam_clear",        icon: "📚", cn: "真题闯关",       desc: "完成真题阶段",                xp: 50 },
  { id: "boss_slayer",       icon: "👑", cn: "Boss 终结者",    desc: "击败 Boss 关卡",              xp: 150 },
  { id: "perfect_run",       icon: "💯", cn: "完美通关",       desc: "全程零错通关",                xp: 200 },
  { id: "streak_5",          icon: "🔥", cn: "5 连对",         desc: "答题 5 连对",                 xp: 25 },
  { id: "streak_10",         icon: "🌟", cn: "10 连对",        desc: "答题 10 连对",                xp: 60 },
  { id: "lab_complete",      icon: "🏆", cn: "Lab 通关",       desc: "全部 8 个阶段全部完成",       xp: 100 },
  { id: "comeback",          icon: "💪", cn: "再战归来",       desc: "回头复盘一道错题",            xp: 20 },
];

const XP = { reflex: 5, drill: 10, correction: 15, exam: 12, boss: 25, phase_clear: 20 };

const lvlOf = (xp: number) => Math.floor(Math.sqrt(xp / 50)) + 1;

const storageKey = (id: string) => `junior-lab:v2:${id}`;

const loadState = (id: string): LabState => {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { xp: 0, streak: 0, bestStreak: 0, phasesDone: [], achievements: [], mistakes: [] };
};

const saveState = (id: string, s: LabState) => {
  try { localStorage.setItem(storageKey(id), JSON.stringify(s)); } catch {}
};

const normalize = (s: string) =>
  s.toLowerCase().replace(/[.,!?;:'"`]/g, "").replace(/\s+/g, " ").trim();

function fuzzyMatch(input: string, target: string, accepted: string[] = []): boolean {
  const n = normalize(input);
  if (!n) return false;
  if (n === normalize(target)) return true;
  for (const a of accepted) if (n === normalize(a)) return true;
  // tolerate small typos via Levenshtein-1 on word level
  const tw = normalize(target).split(" ");
  const iw = n.split(" ");
  if (Math.abs(tw.length - iw.length) > 1) return false;
  let diff = 0;
  for (let k = 0; k < Math.max(tw.length, iw.length); k++) {
    if ((tw[k] || "") !== (iw[k] || "")) diff++;
    if (diff > 1) return false;
  }
  return true;
}

/* ─────────────── Cosmic shell + theme ─────────────── */
function CosmicShell({ children, theme, focus }: { children: React.ReactNode; theme: "dark" | "light"; focus: boolean }) {
  const dark = theme === "dark";
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: dark
          ? "radial-gradient(ellipse at 18% 12%, rgba(125,211,192,.10), transparent 55%), radial-gradient(ellipse at 82% 88%, rgba(232,181,106,.08), transparent 55%), radial-gradient(ellipse at 50% 50%, #1c0e3d 0%, #0a0a1f 75%)"
          : "radial-gradient(ellipse at 18% 12%, rgba(43,169,145,.08), transparent 55%), radial-gradient(ellipse at 82% 88%, rgba(192,138,62,.06), transparent 55%), radial-gradient(ellipse at 50% 50%, #f3eee2 0%, #faf7f1 75%)",
        color: dark ? "#f0ebe0" : "#1a1820",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {!focus && dark && (
        <div className="pointer-events-none fixed inset-0 z-0 opacity-50"
             style={{
               backgroundImage:
                 "radial-gradient(1px 1px at 12% 22%,#fff,transparent),radial-gradient(1px 1px at 67% 14%,#fff,transparent),radial-gradient(1.5px 1.5px at 84% 71%,#fff,transparent),radial-gradient(1px 1px at 33% 78%,#fff,transparent),radial-gradient(1px 1px at 92% 33%,#fff,transparent),radial-gradient(2px 2px at 8% 88%,#fff,transparent),radial-gradient(1px 1px at 48% 48%,#fff,transparent),radial-gradient(1px 1px at 22% 56%,#fff,transparent)",
               backgroundSize: "700px 700px",
               animation: "twinkle 9s ease-in-out infinite",
             }}
        />
      )}
      <style>{`
        @keyframes twinkle { 0%,100%{opacity:.30} 50%{opacity:.65} }
        .glass-card { background: ${dark ? "rgba(255,255,255,.03)" : "rgba(255,255,255,.7)"}; border: 1px solid ${dark ? "rgba(240,235,224,.10)" : "rgba(26,24,32,.10)"}; }
        .glass-card-strong { background: ${dark ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.85)"}; border: 1px solid ${dark ? "rgba(240,235,224,.18)" : "rgba(26,24,32,.18)"}; }
        .ink-dim { color: ${dark ? "#9c9588" : "#5a5469"}; }
        .ink-faint { color: ${dark ? "#5a5469" : "#9c9588"}; }
        .text-mint { color: ${dark ? "#7dd3c0" : "#2ba991"}; }
        .text-amber { color: ${dark ? "#e8b56a" : "#c08a3e"}; }
        .text-rose { color: ${dark ? "#e87a7a" : "#c43d3d"}; }
        .bg-mint-soft { background: ${dark ? "rgba(125,211,192,.12)" : "rgba(43,169,145,.10)"}; }
        .bg-amber-soft { background: ${dark ? "rgba(232,181,106,.12)" : "rgba(192,138,62,.10)"}; }
        .bg-rose-soft { background: ${dark ? "rgba(232,122,122,.12)" : "rgba(196,61,61,.10)"}; }
        .btn-primary { background:${dark?"#7dd3c0":"#2ba991"}; color:${dark?"#0a0a1f":"#faf7f1"}; font-weight:600; padding:.65rem 1.25rem; border-radius:.75rem; transition:transform .2s, box-shadow .2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow:0 12px 30px rgba(125,211,192,.35); }
        .btn-ghost { background:transparent; border:1px solid ${dark?"rgba(240,235,224,.20)":"rgba(26,24,32,.18)"}; color:${dark?"#9c9588":"#5a5469"}; padding:.55rem 1rem; border-radius:.7rem; transition:.2s; }
        .btn-ghost:hover { color:${dark?"#f0ebe0":"#1a1820"}; }
        .lab-input { background:${dark?"rgba(255,255,255,.04)":"rgba(255,255,255,.7)"}; border:1px solid ${dark?"rgba(240,235,224,.18)":"rgba(26,24,32,.15)"}; color:${dark?"#f0ebe0":"#1a1820"}; padding:.7rem 1rem; border-radius:.7rem; width:100%; font-size:1rem; }
        .lab-input:focus { outline: 2px solid ${dark?"#7dd3c0":"#2ba991"}; outline-offset:2px; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing:auto; }
      `}</style>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ─────────────── HUD ─────────────── */
function HUD({ state, theme, focus, onToggleTheme, onToggleFocus, onBack }: any) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-md" style={{ background: theme === "dark" ? "rgba(10,10,31,.65)" : "rgba(250,247,241,.7)", borderBottom: "1px solid rgba(125,211,192,.15)" }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="btn-ghost text-sm flex items-center gap-1"><ArrowLeft size={14} /> 返回</button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-mint-soft rounded-full text-sm">
          <Trophy size={14} className="text-mint" />
          <span className="font-semibold text-mint">Lv {lvlOf(state.xp)}</span>
          <span className="ink-dim">· {state.xp} XP</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-soft rounded-full text-sm">
          <Zap size={14} className="text-amber" />
          <span className="font-semibold text-amber">{state.streak}</span>
          <span className="ink-faint text-xs">连对 · 最佳 {state.bestStreak}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 glass-card rounded-full text-sm">
          <Star size={14} />
          <span>{state.achievements.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={onToggleFocus} className="btn-ghost text-xs flex items-center gap-1" title="专注模式">
            {focus ? <EyeOff size={14} /> : <Eye size={14} />} {focus ? "退出专注" : "专注"}
          </button>
          <button onClick={onToggleTheme} className="btn-ghost text-xs flex items-center gap-1">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Phase progress dots ─────────────── */
function PhaseRail({ active, done, onJump }: { active: number; done: number[]; onJump: (i: number) => void }) {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-4">
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {PHASES.map((p) => {
          const isDone = done.includes(p.id);
          const isActive = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onJump(p.id)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition",
                isActive ? "bg-mint-soft text-mint font-semibold" : isDone ? "text-mint" : "ink-faint",
              )}
            >
              <span>{isDone ? "✓" : p.emoji}</span>
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── Phase: Briefing ─────────────── */
function BriefingScreen({ pt, onStart }: { pt: Pt; onStart: () => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="text-xs uppercase tracking-widest ink-dim">本期主题</div>
        <h1 className="font-display text-5xl md:text-6xl font-semibold">{pt.title}</h1>
        {pt.cefr && <div className="ink-dim text-sm">CEFR · {pt.cefr}</div>}
      </div>

      {(pt.hook_line_cn || pt.hook_line) && (
        <div className="glass-card-strong rounded-2xl p-8 space-y-3">
          <div className="text-xs uppercase tracking-widest text-amber">情境钩子</div>
          {pt.hook_line_cn && <div className="text-2xl font-display leading-relaxed">{pt.hook_line_cn}</div>}
          {pt.hook_line && <div className="ink-dim italic text-lg">"{pt.hook_line}"</div>}
        </div>
      )}

      {pt.mnemonic && (
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-xs uppercase tracking-widest text-mint mb-2">核心口诀</div>
          <div className="font-mono text-2xl">{pt.mnemonic}</div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {PHASES.slice(1, -1).map((p) => (
          <div key={p.id} className="glass-card rounded-xl p-4">
            <div className="text-3xl mb-1">{p.emoji}</div>
            <div className="text-xs ink-dim">{p.name}</div>
          </div>
        ))}
      </div>

      <div className="text-center pt-4">
        <button onClick={onStart} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
          <Sparkles size={18} /> 开始闯关
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Phase: Foundation ─────────────── */
function FoundationScreen({ pt, onContinue }: { pt: Pt; onContinue: () => void }) {
  const rows = pt.contrast_table || [];
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="text-xs uppercase tracking-widest text-mint">核心公式 · Foundation</div>
        <h2 className="font-display text-4xl">{pt.title}</h2>
      </div>
      {pt.mnemonic && (
        <div className="glass-card-strong rounded-2xl p-6 text-center">
          <div className="text-xs ink-dim mb-2">一句话记住</div>
          <div className="font-mono text-2xl text-amber">{pt.mnemonic}</div>
        </div>
      )}
      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="glass-card rounded-xl p-5 grid md:grid-cols-[160px,1fr] gap-3 items-start">
              <div className="font-semibold text-mint">
                <ReactMarkdown>{r.lhs}</ReactMarkdown>
              </div>
              <div className="ink-dim leading-relaxed">
                <ReactMarkdown>{r.rhs}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      ) : pt.explanation_md ? (
        <div className="glass-card rounded-xl p-6 prose prose-sm prose-invert max-w-none">
          <ReactMarkdown>{pt.explanation_md}</ReactMarkdown>
        </div>
      ) : (
        <div className="ink-faint text-center py-6">这个语法点还没有对比表，先去看老师讲堂吧。</div>
      )}
      <div className="text-center">
        <button onClick={onContinue} className="btn-primary inline-flex items-center gap-2">
          继续 <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────── Phase: Reflex Cards ─────────────── */
function ReflexScreen({ cards, onDone }: { cards: ReflexCard[]; onDone: (correct: number) => void }) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [start, setStart] = useState(Date.now());

  if (!cards.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="text-5xl">⚡</div>
        <p className="ink-dim">还没有反射卡数据。</p>
        <button onClick={() => onDone(0)} className="btn-ghost">跳过这一阶段</button>
      </div>
    );
  }
  const card = cards[i];
  const reveal = () => { setRevealed(true); };
  const score = (ok: boolean) => {
    const next = correct + (ok ? 1 : 0);
    setCorrect(next);
    if (i + 1 >= cards.length) onDone(next);
    else { setI(i + 1); setRevealed(false); setStart(Date.now()); }
  };
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-xs ink-dim">
        <span>反射卡 · 看中文 → 秒说英文</span>
        <span>{i + 1} / {cards.length}</span>
      </div>
      <div className="glass-card-strong rounded-3xl p-10 min-h-[280px] flex flex-col items-center justify-center text-center space-y-6">
        <div className="text-xs uppercase tracking-widest text-amber">想一想怎么说</div>
        <div className="font-display text-3xl md:text-4xl leading-snug">{card.cn}</div>
        {!revealed ? (
          <button onClick={reveal} className="btn-primary mt-4">显示答案</button>
        ) : (
          <div className="space-y-4 w-full">
            <div className="font-mono text-2xl text-mint">
              {card.en}
              {card.keyword && <div className="text-xs ink-dim mt-1">关键: <span className="text-amber">{card.keyword}</span></div>}
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => score(false)} className="btn-ghost"><X size={16} className="inline" /> 没反应过来</button>
              <button onClick={() => score(true)} className="btn-primary"><Check size={16} className="inline" /> 我反应对了</button>
            </div>
          </div>
        )}
      </div>
      <div className="ink-faint text-xs text-center">已答对 {correct} / 已答 {revealed ? i + 1 : i}</div>
    </div>
  );
}

/* ─────────────── Phase: Drill (translation input) ─────────────── */
function DrillScreen({ items, onDone, onMistake }: { items: DrillItem[]; onDone: (correct: number, total: number) => void; onMistake: (m: Mistake) => void }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [result, setResult] = useState<null | "ok" | "ng">(null);
  const [correct, setCorrect] = useState(0);

  if (!items.length) {
    return <SkipPhase emoji="✍️" label="情境翻译" onSkip={() => onDone(0, 0)} />;
  }
  const it = items[i];

  const submit = () => {
    if (!val.trim()) return;
    const ok = fuzzyMatch(val, it.en, it.accepted || []);
    setResult(ok ? "ok" : "ng");
    if (ok) setCorrect((c) => c + 1);
    else onMistake({ phase: "drill", stem: it.cn, picked: val, correct: it.en });
  };

  const next = () => {
    if (i + 1 >= items.length) onDone(correct + (result === "ok" ? 0 : 0), items.length);
    else { setI(i + 1); setVal(""); setResult(null); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-xs ink-dim">
        <span>情境翻译 · {it.situation}</span>
        <span>{i + 1} / {items.length}</span>
      </div>
      <div className="glass-card-strong rounded-2xl p-8 space-y-5">
        <div className="font-display text-2xl leading-relaxed">{it.cn}</div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={result !== null}
          placeholder="用今天学的语法点翻译成英文…"
          className="lab-input min-h-[88px] resize-none"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
        />
        {result === "ok" && (
          <div className="bg-mint-soft rounded-xl p-4 text-mint flex items-center gap-2">
            <Check size={16} /> 答得不错！
          </div>
        )}
        {result === "ng" && (
          <div className="bg-rose-soft rounded-xl p-4 space-y-2">
            <div className="text-rose flex items-center gap-2 font-semibold"><X size={16} /> 还差一点</div>
            <div className="font-mono text-mint">{it.en}</div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          {result === null ? (
            <button onClick={submit} className="btn-primary">提交</button>
          ) : (
            <button onClick={next} className="btn-primary">下一题 <ArrowRight size={14} className="inline" /></button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Phase: Correction ─────────────── */
function CorrectionScreen({ tasks, onDone, onMistake }: { tasks: CorrectionTask[]; onDone: (correct: number, total: number) => void; onMistake: (m: Mistake) => void }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<null | "ok" | "ng">(null);
  const [correct, setCorrect] = useState(0);

  if (!tasks.length) return <SkipPhase emoji="🛠️" label="改错" onSkip={() => onDone(0, 0)} />;

  const t = tasks[i];
  const submit = () => {
    if (!val.trim()) return;
    const ok = fuzzyMatch(val, t.model);
    setResult(ok ? "ok" : "ng");
    if (ok) setCorrect((c) => c + 1);
    else onMistake({ phase: "correction", stem: t.wrong, picked: val, correct: t.model, why: t.why });
  };
  const next = () => {
    if (i + 1 >= tasks.length) onDone(correct, tasks.length);
    else { setI(i + 1); setVal(""); setShowHint(false); setResult(null); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-xs ink-dim">
        <span>改错 · 找出错误并改正</span>
        <span>{i + 1} / {tasks.length}</span>
      </div>
      <div className="glass-card-strong rounded-2xl p-8 space-y-5">
        <div className="bg-rose-soft rounded-xl p-4">
          <div className="text-xs ink-dim mb-1">错误句</div>
          <div className="font-mono text-lg line-through text-rose">{t.wrong}</div>
        </div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={result !== null}
          placeholder="把它改正…"
          className="lab-input min-h-[80px] resize-none"
        />
        {showHint && result === null && (
          <div className="bg-amber-soft rounded-xl p-3 text-sm">
            <ReactMarkdown>{t.hint}</ReactMarkdown>
          </div>
        )}
        {result === "ok" && (
          <div className="bg-mint-soft rounded-xl p-4 text-mint flex items-center gap-2"><Check size={16} /> 完美修复！</div>
        )}
        {result === "ng" && (
          <div className="bg-rose-soft rounded-xl p-4 space-y-2">
            <div className="font-mono text-mint">{t.model}</div>
            <div className="text-sm ink-dim"><ReactMarkdown>{t.why}</ReactMarkdown></div>
          </div>
        )}
        <div className="flex justify-between">
          <button onClick={() => setShowHint(true)} className="btn-ghost text-xs" disabled={showHint || result !== null}>💡 提示</button>
          {result === null ? (
            <button onClick={submit} className="btn-primary">提交</button>
          ) : (
            <button onClick={next} className="btn-primary">下一题 <ArrowRight size={14} className="inline" /></button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Phase: MCQ runner (Exam + Boss) ─────────────── */
function MCQRunner({ questions, label, onDone, onMistake, onCorrect }: {
  questions: { stem: string; option_a?: string|null; option_b?: string|null; option_c?: string|null; option_d?: string|null; correct_answer?: string|null; explanation?: string|null; trap?: string; why?: string; }[];
  label: string;
  onDone: (correct: number, total: number) => void;
  onMistake: (m: Mistake) => void;
  onCorrect: () => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);

  if (!questions.length) return <SkipPhase emoji="📚" label={label} onSkip={() => onDone(0, 0)} />;

  const q = questions[i];
  const opts: { k: string; v: string }[] = (
    [["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]] as const
  ).filter(([_, v]) => !!v).map(([k, v]) => ({ k, v: v as string }));

  const ans = (q.correct_answer || "").trim().toUpperCase();
  const pick = (k: string) => {
    if (picked) return;
    setPicked(k);
    if (k === ans) {
      setCorrect((c) => c + 1);
      onCorrect();
    } else {
      const correctText = opts.find((o) => o.k === ans)?.v || ans;
      onMistake({ phase: label, stem: q.stem, picked: opts.find((o) => o.k === k)?.v || k, correct: correctText, why: q.why || q.explanation || "" });
    }
  };
  const next = () => {
    if (i + 1 >= questions.length) onDone(correct, questions.length);
    else { setI(i + 1); setPicked(null); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-xs ink-dim">
        <span>{label}</span>
        <span>{i + 1} / {questions.length}</span>
      </div>
      <div className="glass-card-strong rounded-2xl p-8 space-y-5">
        <div className="font-display text-xl leading-relaxed">{q.stem}</div>
        <div className="space-y-2">
          {opts.map(({ k, v }) => {
            const isCorrect = picked && k === ans;
            const isWrong = picked === k && k !== ans;
            return (
              <button
                key={k}
                disabled={!!picked}
                onClick={() => pick(k)}
                className={cn(
                  "w-full text-left rounded-xl px-4 py-3 transition border",
                  "glass-card",
                  isCorrect && "bg-mint-soft text-mint border-mint",
                  isWrong && "bg-rose-soft text-rose",
                  !picked && "hover:bg-mint-soft",
                )}
              >
                <span className="font-mono text-xs ink-dim mr-2">{k}.</span>{v}
              </button>
            );
          })}
        </div>
        {picked && (
          <div className="space-y-2 pt-2 text-sm">
            {q.trap && <div className="bg-amber-soft rounded-lg p-3"><span className="text-amber font-semibold">陷阱：</span><ReactMarkdown>{q.trap}</ReactMarkdown></div>}
            {(q.why || q.explanation) && <div className="bg-mint-soft rounded-lg p-3"><span className="text-mint font-semibold">解析：</span><ReactMarkdown>{q.why || q.explanation || ""}</ReactMarkdown></div>}
          </div>
        )}
        {picked && (
          <div className="text-right">
            <button onClick={next} className="btn-primary">{i + 1 >= questions.length ? "完成阶段" : "下一题"} <ArrowRight size={14} className="inline" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function SkipPhase({ emoji, label, onSkip }: { emoji: string; label: string; onSkip: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
      <div className="text-6xl">{emoji}</div>
      <h3 className="font-display text-2xl">{label}</h3>
      <p className="ink-dim">这个语法点还没有该阶段的内容，去 /admin/grammar-content 重新生成可以补齐。</p>
      <button onClick={onSkip} className="btn-ghost">跳过</button>
    </div>
  );
}

/* ─────────────── AI Wrong-Answer Explainer ─────────────── */
function WrongAnswerAI({ question, userAnswer, correctAnswer, pointTitle, gradeLabel = "初中", explanation }: {
  question: string; userAnswer: string; correctAnswer: string;
  pointTitle?: string; gradeLabel?: string; explanation?: string;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true); setErr(null); setText("");
        const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;
        const url = `https://${projectId}.supabase.co/functions/v1/explain-wrong-answer`;
        const { data: { session } } = await supabase.auth.getSession();
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({ question, userAnswer, correctAnswer, pointTitle, gradeLabel, explanation }),
        });
        if (!resp.ok || !resp.body) {
          const t = await resp.text();
          if (resp.status === 402) throw new Error("AI 余额已用完，请到工作区充值后重试。");
          if (resp.status === 429) throw new Error("AI 请求过于频繁，请稍后再试。");
          throw new Error(t || `HTTP ${resp.status}`);
        }
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (!aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const s = line.trim();
            if (!s.startsWith("data:")) continue;
            const data = s.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) setText((prev) => prev + delta);
            } catch { /* ignore */ }
          }
        }
      } catch (e: any) {
        if (!aborted) setErr(e?.message || String(e));
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => { aborted = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, userAnswer, correctAnswer]);

  return (
    <div className="rounded-xl border border-amber/40 bg-amber-soft/40 p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber font-semibold text-sm">
        <Lightbulb size={16} /> AI 老师为你专属讲解
      </div>
      {err ? (
        <div className="text-sm text-rose">{err}</div>
      ) : (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{text || (loading ? "正在思考..." : "")}</ReactMarkdown>
          {loading && <Loader2 size={14} className="inline animate-spin ink-dim" />}
        </div>
      )}
    </div>
  );
}

/* ─────────────── Boss Runner — must clear 100% to unlock next ─────────────── */
function BossRunner({ questions, pointTitle, gradeLabel, onCorrect, onMistake, onPassed, onAnyAttempt }: {
  questions: BossQ[];
  pointTitle: string;
  gradeLabel: string;
  onCorrect: () => void;
  onMistake: (m: Mistake) => void;
  onPassed: (totalCorrectFirstTry: number, total: number) => void;
  onAnyAttempt?: () => void;
}) {
  const [queue, setQueue] = useState<BossQ[]>(questions);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [redoList, setRedoList] = useState<BossQ[]>([]);
  const total = questions.length;

  if (!queue.length) return <SkipPhase emoji="👑" label="Boss 冲刺" onSkip={() => onPassed(0, 0)} />;

  const q = queue[i];
  const opts = [["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]]
    .filter(([, v]) => !!v) as [string, string][];
  const ans = (q.correct_answer || "").trim().toUpperCase();

  const pick = (k: string) => {
    if (picked) return;
    setPicked(k);
    onAnyAttempt?.();
    if (k === ans) {
      onCorrect();
      if (round === 1) setFirstTryCorrect((c) => c + 1);
    } else {
      const correctText = opts.find(([kk]) => kk === ans)?.[1] || ans;
      onMistake({ phase: `Boss R${round}`, stem: q.stem, picked: opts.find(([kk]) => kk === k)?.[1] || k, correct: correctText, why: q.why });
      setRedoList((rl) => [...rl, q]);
    }
  };

  const next = () => {
    if (i + 1 < queue.length) {
      setI(i + 1); setPicked(null); return;
    }
    // round done
    if (redoList.length === 0) {
      onPassed(firstTryCorrect, total);
      return;
    }
    // start redo round with only mistakes
    setQueue(redoList);
    setRedoList([]);
    setI(0);
    setPicked(null);
    setRound((r) => r + 1);
  };

  const isLastInRound = i + 1 >= queue.length;
  const isWrong = picked !== null && picked !== ans;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between text-xs ink-dim">
        <span className="font-semibold text-amber">👑 Boss 冲刺 · 必须全部答对才能解锁下一关</span>
        <span>R{round} · {i + 1} / {queue.length}</span>
      </div>
      {round > 1 && (
        <div className="rounded-lg bg-rose-soft text-rose text-xs px-3 py-2 flex items-center gap-2">
          <Lock size={14} /> 上一轮有错题，已收集错题重做。全部改对即通关。
        </div>
      )}
      <div className="glass-card-strong rounded-2xl p-7 space-y-5">
        <div className="font-display text-xl leading-relaxed">{q.stem}</div>
        <div className="space-y-2">
          {opts.map(([k, v]) => {
            const isCorrect = picked && k === ans;
            const wrongPick = picked === k && k !== ans;
            return (
              <button
                key={k}
                disabled={!!picked}
                onClick={() => pick(k)}
                className={cn(
                  "w-full text-left rounded-xl px-4 py-3 transition border glass-card",
                  isCorrect && "bg-mint-soft text-mint border-mint",
                  wrongPick && "bg-rose-soft text-rose",
                  !picked && "hover:bg-mint-soft",
                )}
              >
                <span className="font-mono text-xs ink-dim mr-2">{k}.</span>{v}
              </button>
            );
          })}
        </div>
        {picked && (
          <div className="space-y-3 pt-1 text-sm">
            {q.trap && <div className="bg-amber-soft rounded-lg p-3"><span className="text-amber font-semibold">陷阱：</span><ReactMarkdown>{q.trap}</ReactMarkdown></div>}
            {q.why && <div className="bg-mint-soft rounded-lg p-3"><span className="text-mint font-semibold">解析：</span><ReactMarkdown>{q.why}</ReactMarkdown></div>}
            {isWrong && (
              <WrongAnswerAI
                question={q.stem}
                userAnswer={`${picked}. ${opts.find(([kk]) => kk === picked)?.[1] || ""}`}
                correctAnswer={`${ans}. ${opts.find(([kk]) => kk === ans)?.[1] || ""}`}
                pointTitle={pointTitle}
                gradeLabel={gradeLabel}
                explanation={q.why}
              />
            )}
          </div>
        )}
        {picked && (
          <div className="text-right">
            <button onClick={next} className="btn-primary">
              {isLastInRound ? (redoList.length ? "进入错题重做" : "完成 Boss 关") : "下一题"}
              <ArrowRight size={14} className="inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Phase: Done ─────────────── */
function DoneScreen({ state, mistakes, onReplay, onAskTutor, bossPassed, nextPointId }: {
  state: LabState; mistakes: Mistake[];
  onReplay: () => void; onAskTutor: (m: Mistake) => void;
  bossPassed?: boolean; nextPointId?: string | null;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="text-7xl">🎉</div>
        <h2 className="font-display text-4xl">通关庆典</h2>
        <p className="ink-dim">本次累计 {state.xp} XP · 最佳连对 {state.bestStreak}</p>
        {bossPassed && (
          <div className="inline-flex items-center gap-2 rounded-full bg-mint-soft text-mint px-4 py-2 text-sm font-semibold">
            <Check size={16} /> Boss 100% 通关 · 已解锁下一关
          </div>
        )}
      </div>
      <div className="glass-card-strong rounded-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-amber mb-3">已解锁成就</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const got = state.achievements.includes(a.id);
            return (
              <div key={a.id} className={cn("rounded-lg p-3 flex items-center gap-2 text-sm", got ? "bg-mint-soft" : "glass-card opacity-50")}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-semibold">{a.cn}</div>
                  <div className="text-xs ink-dim">{a.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {mistakes.length > 0 && (
        <div className="glass-card-strong rounded-2xl p-6 space-y-3">
          <div className="text-xs uppercase tracking-widest text-rose mb-2">错题复盘 · {mistakes.length} 道</div>
          {mistakes.map((m, i) => (
            <div key={i} className="bg-rose-soft rounded-xl p-4 space-y-2">
              <div className="text-xs ink-dim">{m.phase}</div>
              <div className="font-display">{m.stem}</div>
              <div className="text-sm"><span className="ink-dim">你的答：</span><span className="text-rose">{m.picked}</span></div>
              <div className="text-sm"><span className="ink-dim">正确：</span><span className="text-mint font-mono">{m.correct}</span></div>
              {m.why && <div className="text-xs ink-dim"><ReactMarkdown>{m.why}</ReactMarkdown></div>}
              <button onClick={() => onAskTutor(m)} className="btn-ghost text-xs">🤖 问 AI 老师</button>
            </div>
          ))}
        </div>
      )}
      <div className="text-center flex flex-wrap gap-3 justify-center">
        <button onClick={onReplay} className="btn-ghost inline-flex items-center gap-2"><RotateCw size={16} /> 再来一次</button>
        {bossPassed && nextPointId && (
          <Link to={`/junior/grammar-lab/${nextPointId}`} className="btn-primary inline-flex items-center gap-2">
            进入下一关 <ArrowRight size={16} />
          </Link>
        )}
        <Link to="/junior/grammar" className="btn-ghost inline-flex items-center gap-2">返回语法地图</Link>
      </div>
    </div>
  );
}

/* ─────────────── Main ─────────────── */
export default function JuniorGrammarLab() {
  const { id } = useParams<{ id: string }>();
  const [pt, setPt] = useState<Pt | null>(null);
  const [examQs, setExamQs] = useState<ExamQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(0);
  const [state, setState] = useState<LabState>({ xp: 0, streak: 0, bestStreak: 0, phasesDone: [], achievements: [], mistakes: [] });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [focus, setFocus] = useState(false);
  const [nextPointId, setNextPointId] = useState<string | null>(null);
  const [bossPassed, setBossPassed] = useState(false);
  const [gradeLabel, setGradeLabel] = useState<string>("初中");
  const initRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    setState(loadState(id));
    (async () => {
      const { data: p } = await supabase.from("junior_grammar_points")
        .select("id,title,cefr,mnemonic,explanation_md,teacher_script,immersion_cards,hook_line,hook_line_cn,contrast_table,reflex_cards,situation_drills,correction_tasks,boss_questions")
        .eq("id", id).maybeSingle();
      if (p) setPt(p as any);
      const { data: qs } = await supabase.from("junior_grammar_questions")
        .select("id,stem,option_a,option_b,option_c,option_d,correct_answer,explanation,question_type,difficulty")
        .eq("point_id", id).eq("question_type", "mcq").order("difficulty").limit(8);
      setExamQs((qs as any) || []);
      // figure out next grammar point in same level by sort order
      const { data: all } = await supabase.from("junior_grammar_points")
        .select("id,sort_order,created_at").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      if (all && id) {
        const idx = all.findIndex((r: any) => r.id === id);
        if (idx >= 0 && idx + 1 < all.length) setNextPointId((all[idx + 1] as any).id);
      }
      // detect grade label from profile if available
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prof } = await supabase.from("profiles").select("grade").eq("id", user.id).maybeSingle();
          const g = (prof as any)?.grade;
          if (g) setGradeLabel(String(g));
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => { if (id && initRef.current) saveState(id, state); else initRef.current = true; }, [id, state]);

  const grant = (delta: Partial<LabState> & { addXp?: number; unlock?: string[] }) => {
    setState((s) => {
      const next = { ...s };
      if (delta.addXp) next.xp += delta.addXp;
      if (delta.unlock) {
        for (const u of delta.unlock) if (!next.achievements.includes(u)) {
          next.achievements = [...next.achievements, u];
          const ach = ACHIEVEMENTS.find((a) => a.id === u);
          if (ach) next.xp += ach.xp;
        }
      }
      return next;
    });
  };

  const onCorrect = () => {
    setState((s) => {
      const streak = s.streak + 1;
      const bestStreak = Math.max(s.bestStreak, streak);
      const ach = [...s.achievements];
      if (streak === 5 && !ach.includes("streak_5")) ach.push("streak_5");
      if (streak === 10 && !ach.includes("streak_10")) ach.push("streak_10");
      return { ...s, streak, bestStreak, achievements: ach };
    });
    awardForCorrect(1, "junior_grammar_lab").catch(() => {});
  };
  const onMistake = (m: Mistake) => {
    setState((s) => ({ ...s, streak: 0, mistakes: [m, ...s.mistakes].slice(0, 50) }));
    if (id) recordJuniorGrammarAttempt({ pointId: id, questionType: "lab", isCorrect: false, errorReason: "rule_unknown" }).catch(() => {});
  };

  const completePhase = (phaseId: number, unlocks: string[] = []) => {
    setState((s) => ({ ...s, phasesDone: Array.from(new Set([...s.phasesDone, phaseId])) }));
    grant({ addXp: XP.phase_clear, unlock: unlocks });
    setPhase((p) => Math.min(p + 1, PHASES.length - 1));
  };

  const persistBossPassed = async (firstTryCorrect: number, total: number) => {
    setBossPassed(true);
    if (!id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const score = total > 0 ? Math.round((firstTryCorrect / total) * 100) : 100;
      await supabase.from("grammar_lab_progress").upsert({
        user_id: user.id,
        point_id: id,
        level: "junior",
        boss_passed: true,
        best_score: score,
        attempts: 1,
        completed_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,point_id,level" });
    } catch (e) {
      console.warn("persist boss progress failed", e);
    }
  };

  if (loading) return <CosmicShell theme={theme} focus={focus}><div className="flex items-center justify-center min-h-screen ink-dim">加载中…</div></CosmicShell>;
  if (!pt) return <CosmicShell theme={theme} focus={focus}><div className="text-center py-20 ink-dim">语法点不存在</div></CosmicShell>;

  return (
    <CosmicShell theme={theme} focus={focus}>
      <HUD state={state} theme={theme} focus={focus} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} onToggleFocus={() => setFocus(!focus)} onBack={() => history.back()} />
      <PhaseRail active={phase} done={state.phasesDone} onJump={(i) => setPhase(i)} />

      {phase === 0 && (
        <BriefingScreen pt={pt} onStart={() => completePhase(0, ["first_step"])} />
      )}
      {phase === 1 && (
        pt.teacher_script && pt.teacher_script.length > 0 ? (
          <div className="max-w-3xl mx-auto px-4 py-6">
            <TeacherLessonPlayer
              segments={pt.teacher_script}
              pointTitle={pt.title}
              onContinue={() => completePhase(1, ["lesson_complete"])}
              onSkip={() => completePhase(1)}
            />
          </div>
        ) : <SkipPhase emoji="👩‍🏫" label="老师讲堂" onSkip={() => completePhase(1)} />
      )}
      {phase === 2 && (
        <FoundationScreen pt={pt as any} onContinue={() => completePhase(2)} />
      )}
      {phase === 3 && (
        <ReflexScreen
          cards={pt.reflex_cards || []}
          onDone={(correct) => {
            grant({ addXp: correct * XP.reflex });
            const unlocks = correct === (pt.reflex_cards?.length || 0) && correct > 0 ? ["reflex_master"] : [];
            completePhase(3, unlocks);
            if (correct > 0) fireEmojiConfetti({ emojis: ["⚡"] });
          }}
        />
      )}
      {phase === 4 && (
        <DrillScreen
          items={pt.situation_drills || []}
          onMistake={onMistake}
          onDone={(correct, total) => {
            grant({ addXp: correct * XP.drill });
            const pct = total ? correct / total : 0;
            const unlocks = pct >= 0.8 ? ["drill_warrior"] : [];
            completePhase(4, unlocks);
          }}
        />
      )}
      {phase === 5 && (
        <CorrectionScreen
          tasks={pt.correction_tasks || []}
          onMistake={onMistake}
          onDone={(correct, total) => {
            grant({ addXp: correct * XP.correction });
            const unlocks = correct === total && total > 0 ? ["fix_it_pro"] : [];
            completePhase(5, unlocks);
          }}
        />
      )}
      {phase === 6 && (
        <MCQRunner
          label="真题练习"
          questions={examQs.slice(0, 5)}
          onCorrect={() => { onCorrect(); grant({ addXp: XP.exam }); }}
          onMistake={onMistake}
          onDone={() => completePhase(6, ["exam_clear"])}
        />
      )}
      {phase === 7 && (
        <BossRunner
          questions={(pt.boss_questions || []) as BossQ[]}
          pointTitle={pt.title}
          gradeLabel={gradeLabel}
          onCorrect={() => { onCorrect(); grant({ addXp: XP.boss }); }}
          onMistake={onMistake}
          onPassed={(firstTry, total) => {
            const unlocks: string[] = ["boss_slayer", "lab_complete"];
            if (firstTry === total && total > 0) unlocks.push("perfect_run");
            persistBossPassed(firstTry, total);
            completePhase(7, unlocks);
            fireEmojiConfetti({ emojis: ["👑", "🏆", "✨"] });
          }}
        />
      )}
      {phase === 8 && (
        <DoneScreen
          state={state}
          mistakes={state.mistakes}
          bossPassed={bossPassed}
          nextPointId={nextPointId}
          onReplay={() => { setPhase(0); setState({ ...state, phasesDone: [], streak: 0, mistakes: [] }); }}
          onAskTutor={(m) => {
            const url = `/junior/grammar-point/${id}?ask=${encodeURIComponent(m.stem + " | " + m.correct)}`;
            window.location.href = url;
          }}
        />
      )}
    </CosmicShell>
  );
}
