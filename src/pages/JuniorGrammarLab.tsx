import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import { useRevealScroll } from "@/lib/useRevealScroll";
import { recordSkillAttemptsForQuestion } from "@/lib/recordSkillAttempts";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Moon, RotateCw, Sparkles, Star, Sun, Trophy, X, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { loadJuniorGrammarMasteryAll, recordJuniorGrammarAttempt } from "@/lib/juniorGrammarFsrs";
import { juniorGrammarPlayPath, pickNextLabPoint, type JuniorPointNav } from "@/lib/juniorGrammarNav";
import { pointHasKp } from "@/lib/juniorKnowledgePoint";
import { clearRevengeForPoint, enqueueLabMistake } from "@/lib/juniorGrammarRevenge";
import { GrammarRevengeRunner } from "@/components/grammar/GrammarRevengeRunner";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";
import { TeacherLessonPlayer, type LessonSegment } from "@/components/grammar/TeacherLessonPlayer";
import { GrammarQuestionCard, type GrammarQuestion, type AnswerResult } from "@/components/grammar/GrammarQuestionCard";
import { fireEmojiConfetti } from "@/lib/feedback";
import { awardForCorrect } from "@/lib/coins";
import ReactMarkdown from "react-markdown";
import { Lock, Lightbulb, Loader2 } from "lucide-react";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";

/* ──────────────────────────────────────────────────────────────
   Junior Grammar Lab — generic 6-phase template inspired by
   /grammar-lab/subjunctive-mood.html. One Lab per grammar point.
   Phases:
     0 Briefing → 1 TeacherLesson → 2 Foundation → 3 Reflex
     → 4 Drill → 5 Correction → 6 Exam → 7 Boss → 8 Done
   ────────────────────────────────────────────────────────────── */

type ContrastRow = {lhs: string;rhs: string;};
type ReflexCard = {cn: string;en: string;keyword?: string;};
type DrillItem = {situation: string;cn: string;en: string;accepted?: string[];};
type CorrectionTask = {wrong: string;model: string;hint: string;why: string;};
type BossQ = {stem: string;option_a: string;option_b: string;option_c: string;option_d: string;correct_answer: string;trap: string;why: string;};
// Exam questions use the universal GrammarQuestion type so the Lab's exam
// phase can render every question_type (mcq / fill / transform / correction /
// translation) via GrammarQuestionCard — not just MCQ.
type ExamQ = GrammarQuestion;

type Pt = {
  id: string;
  title: string;
  cefr: string | null;
  grade: number | null;
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

type Mistake = {phase: string;stem: string;picked: string;correct: string;why?: string;};

type LabState = {
  xp: number;
  streak: number;
  bestStreak: number;
  phasesDone: number[]; // phase indices completed
  achievements: string[];
  mistakes: Mistake[];
};

// Test-focused Lab: removed the 5 "lecture-style" phases (brief / teacher
// lesson / foundation / reflex / drill) per user request. The Lab now opens
// directly into the correction challenge and works through to the final
// celebration. Phase IDs stay the same as before (5..8) so the existing
// render blocks (phase === 5/6/7/8) continue to work unchanged.
const PHASES = [
{ id: 5, key: "correction", name: "改错挑战", emoji: "🛠️" },
{ id: 6, key: "exam", name: "真题练习", emoji: "📚" },
{ id: 7, key: "boss", name: "Boss 冲刺", emoji: "👑" },
{ id: 8, key: "done", name: "通关庆典", emoji: "🎉" }];

const MAX_PHASE = 8;
const INITIAL_PHASE = 5;


const ACHIEVEMENTS = [
{ id: "first_step", icon: "🎯", cn: "迈出第一步", desc: "完成情境钩子", xp: 10 },
{ id: "lesson_complete", icon: "📖", cn: "听完一课", desc: "听完老师全程", xp: 30 },
{ id: "reflex_master", icon: "⚡", cn: "反射大师", desc: "10 张反射卡全对", xp: 60 },
{ id: "drill_warrior", icon: "✍️", cn: "翻译战士", desc: "情境翻译正确率 ≥ 80%", xp: 75 },
{ id: "fix_it_pro", icon: "🛠️", cn: "改错能手", desc: "5 道改错全对", xp: 80 },
{ id: "exam_clear", icon: "📚", cn: "真题闯关", desc: "完成真题阶段", xp: 50 },
{ id: "boss_slayer", icon: "👑", cn: "Boss 终结者", desc: "击败 Boss 关卡", xp: 150 },
{ id: "perfect_run", icon: "💯", cn: "完美通关", desc: "全程零错通关", xp: 200 },
{ id: "streak_5", icon: "🔥", cn: "5 连对", desc: "答题 5 连对", xp: 25 },
{ id: "streak_10", icon: "🌟", cn: "10 连对", desc: "答题 10 连对", xp: 60 },
{ id: "lab_complete", icon: "🏆", cn: "Lab 通关", desc: "全部 8 个阶段全部完成", xp: 100 },
{ id: "comeback", icon: "💪", cn: "再战归来", desc: "回头复盘一道错题", xp: 20 }];


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
  try {localStorage.setItem(storageKey(id), JSON.stringify(s));} catch {}
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
function CosmicShell({ children, theme, focus }: {children: React.ReactNode;theme: "dark" | "light";focus: boolean;}) {
  const dark = theme === "dark";
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: dark ?
        "radial-gradient(ellipse at 18% 12%, rgba(125,211,192,.10), transparent 55%), radial-gradient(ellipse at 82% 88%, rgba(232,181,106,.08), transparent 55%), radial-gradient(ellipse at 50% 50%, #1c0e3d 0%, #0a0a1f 75%)" :
        "radial-gradient(ellipse at 18% 12%, rgba(43,169,145,.08), transparent 55%), radial-gradient(ellipse at 82% 88%, rgba(192,138,62,.06), transparent 55%), radial-gradient(ellipse at 50% 50%, #f3eee2 0%, #faf7f1 75%)",
        color: dark ? "#f0ebe0" : "#1a1820",
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
      
      {!focus && dark &&
      <div className="pointer-events-none fixed inset-0 z-0 opacity-50"
      style={{
        backgroundImage:
        "radial-gradient(1px 1px at 12% 22%,#fff,transparent),radial-gradient(1px 1px at 67% 14%,#fff,transparent),radial-gradient(1.5px 1.5px at 84% 71%,#fff,transparent),radial-gradient(1px 1px at 33% 78%,#fff,transparent),radial-gradient(1px 1px at 92% 33%,#fff,transparent),radial-gradient(2px 2px at 8% 88%,#fff,transparent),radial-gradient(1px 1px at 48% 48%,#fff,transparent),radial-gradient(1px 1px at 22% 56%,#fff,transparent)",
        backgroundSize: "700px 700px",
        animation: "twinkle 9s ease-in-out infinite"
      }} />

      }
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
        .btn-primary { background:${dark ? "#7dd3c0" : "#2ba991"}; color:${dark ? "#0a0a1f" : "#faf7f1"}; font-weight:600; padding:.65rem 1.25rem; border-radius:.75rem; transition:transform .2s, box-shadow .2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow:0 12px 30px rgba(125,211,192,.35); }
        .btn-ghost { background:transparent; border:1px solid ${dark ? "rgba(240,235,224,.20)" : "rgba(26,24,32,.18)"}; color:${dark ? "#9c9588" : "#5a5469"}; padding:.55rem 1rem; border-radius:.7rem; transition:.2s; }
        .btn-ghost:hover { color:${dark ? "#f0ebe0" : "#1a1820"}; }
        .lab-input { background:${dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.7)"}; border:1px solid ${dark ? "rgba(240,235,224,.18)" : "rgba(26,24,32,.15)"}; color:${dark ? "#f0ebe0" : "#1a1820"}; padding:.7rem 1rem; border-radius:.7rem; width:100%; font-size:1rem; }
        .lab-input:focus { outline: 2px solid ${dark ? "#7dd3c0" : "#2ba991"}; outline-offset:2px; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing:auto; }
      `}</style>
      <div className="relative z-10">{children}</div>
    </div>);

}

/* ─────────────── HUD ─────────────── */
function HUD({ state, theme, focus, onToggleTheme, onToggleFocus, onBack }: any) {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-md" style={{ background: theme === "dark" ? "rgba(10,10,31,.65)" : "rgba(250,247,241,.7)", borderBottom: "1px solid rgba(125,211,192,.15)" }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        <button onClick={onBack} className="btn-ghost text-sm flex items-center gap-1"><ArrowLeft size={14} /> <T>返回</T></button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-mint-soft rounded-full text-sm">
          <Trophy size={14} className="text-mint" />
          <span className="font-semibold text-mint">Lv {lvlOf(state.xp)}</span>
          <span className="ink-dim">· {state.xp} XP</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-soft rounded-full text-sm">
          <Zap size={14} className="text-amber" />
          <span className="font-semibold text-amber">{state.streak}</span>
          <span className="ink-faint text-xs"><T>连对 · 最佳</T> {state.bestStreak}</span>
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
    </div>);

}

/* ─────────────── Phase progress dots ─────────────── */
function PhaseRail({ active, done, onJump }: {active: number;done: number[];onJump: (i: number) => void;}) {
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
                isActive ? "bg-mint-soft text-mint font-semibold" : isDone ? "text-mint" : "ink-faint"
              )}>
              
              <span>{isDone ? "✓" : p.emoji}</span>
              <span><T>{p.name}</T></span>
            </button>);

        })}
      </div>
    </div>);

}

/* ─────────────── Phase: Briefing ─────────────── */
function BriefingScreen({ pt, onStart }: {pt: Pt;onStart: () => void;}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="text-xs uppercase tracking-widest ink-dim"><T>本期主题</T></div>
        <h1 className="font-display text-5xl md:text-6xl font-semibold">{pt.title}</h1>
        {pt.cefr && <div className="ink-dim text-sm">CEFR · {pt.cefr}</div>}
      </div>

      {(pt.hook_line_cn || pt.hook_line) &&
      <div className="glass-card-strong rounded-2xl p-8 space-y-3">
          <div className="text-xs uppercase tracking-widest text-amber"><T>情境钩子</T></div>
          {pt.hook_line_cn && <div className="text-2xl font-display leading-relaxed">{pt.hook_line_cn}</div>}
          {pt.hook_line && <div className="ink-dim italic text-lg">"{pt.hook_line}"</div>}
        </div>
      }

      {pt.mnemonic &&
      <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-xs uppercase tracking-widest text-mint mb-2"><T>核心口诀</T></div>
          <div className="font-mono text-2xl">{pt.mnemonic}</div>
        </div>
      }

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {PHASES.slice(1, -1).map((p) =>
        <div key={p.id} className="glass-card rounded-xl p-4">
            <div className="text-3xl mb-1">{p.emoji}</div>
            <div className="text-xs ink-dim"><T>{p.name}</T></div>
          </div>
        )}
      </div>

      <div className="text-center pt-4">
        <button onClick={onStart} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3">
          <Sparkles size={18} /> <T>开始闯关</T>
        </button>
      </div>
    </div>);

}

/* ─────────────── Phase: Foundation ─────────────── */
function FoundationScreen({ pt, onContinue }: {pt: Pt;onContinue: () => void;}) {
  const rows = pt.contrast_table || [];
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="text-xs uppercase tracking-widest text-mint"><T>核心公式 · Foundation</T></div>
        <h2 className="font-display text-4xl">{pt.title}</h2>
      </div>
      {pt.mnemonic &&
      <div className="glass-card-strong rounded-2xl p-6 text-center">
          <div className="text-xs ink-dim mb-2"><T>一句话记住</T></div>
          <div className="font-mono text-2xl text-amber">{pt.mnemonic}</div>
        </div>
      }
      {rows.length > 0 ?
      <div className="space-y-3">
          {rows.map((r, i) =>
        <div key={i} className="glass-card rounded-xl p-5 grid md:grid-cols-[160px,1fr] gap-3 items-start">
              <div className="font-semibold text-mint">
                <ReactMarkdown>{r.lhs}</ReactMarkdown>
              </div>
              <div className="ink-dim leading-relaxed">
                <ReactMarkdown>{r.rhs}</ReactMarkdown>
              </div>
            </div>
        )}
        </div> :
      pt.explanation_md ?
      <div className="glass-card rounded-xl p-6 prose prose-sm prose-invert max-w-none">
          <ReactMarkdown>{pt.explanation_md}</ReactMarkdown>
        </div> :

      <div className="ink-faint text-center py-6"><T>这个语法点还没有对比表，先去看老师讲堂吧。</T></div>
      }
      <div className="text-center">
        <button onClick={onContinue} className="btn-primary inline-flex items-center gap-2">
          <T>继续</T> <ArrowRight size={16} />
        </button>
      </div>
    </div>);

}

/* ─────────────── Phase: Reflex Cards ─────────────── */
function ReflexScreen({ cards, onDone }: {cards: ReflexCard[];onDone: (correct: number) => void;}) {
  const [i, setI] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [start, setStart] = useState(Date.now());

  if (!cards.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="text-5xl">⚡</div>
        <p className="ink-dim"><T>还没有反射卡数据。</T></p>
        <button onClick={() => onDone(0)} className="btn-ghost"><T>跳过这一阶段</T></button>
      </div>);

  }
  const card = cards[i];
  const reveal = () => {setRevealed(true);};
  const score = (ok: boolean) => {
    const next = correct + (ok ? 1 : 0);
    setCorrect(next);
    if (i + 1 >= cards.length) onDone(next);else
    {setI(i + 1);setRevealed(false);setStart(Date.now());}
  };
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-xs ink-dim">
        <span><T>反射卡 · 看中文 → 秒说英文</T></span>
        <span>{i + 1} / {cards.length}</span>
      </div>
      <div className="glass-card-strong rounded-3xl p-10 min-h-[280px] flex flex-col items-center justify-center text-center space-y-6">
        <div className="text-xs uppercase tracking-widest text-amber"><T>想一想怎么说</T></div>
        <div className="font-display text-3xl md:text-4xl leading-snug">{card.cn}</div>
        {!revealed ?
        <button onClick={reveal} className="btn-primary mt-4"><T>显示答案</T></button> :

        <div className="space-y-4 w-full">
            <div className="font-mono text-2xl text-mint">
              {card.en}
              {card.keyword && <div className="text-xs ink-dim mt-1"><T>关键:</T> <span className="text-amber">{card.keyword}</span></div>}
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => score(false)} className="btn-ghost"><X size={16} className="inline" /> <T>没反应过来</T></button>
              <button onClick={() => score(true)} className="btn-primary"><Check size={16} className="inline" /> <T>我反应对了</T></button>
            </div>
          </div>
        }
      </div>
      <div className="ink-faint text-xs text-center"><T>已答对</T> {correct} <T>/ 已答</T> {revealed ? i + 1 : i}</div>
    </div>);

}

/* ─────────────── Phase: Drill (translation input) ─────────────── */
function DrillScreen({ items, pointTitle, mnemonic, onDone, onMistake }: {items: DrillItem[];pointTitle?: string;mnemonic?: string;onDone: (correct: number, total: number) => void;onMistake: (m: Mistake) => void;}) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [result, setResult] = useState<null | "ok" | "ng">(null);
  // 提交后把"下一题"按钮滚进视口(手机上它常在输入区下方屏外)
  const actionRef = useRevealScroll<HTMLDivElement>(result !== null);
  const [correct, setCorrect] = useState(0);
  const [grading, setGrading] = useState(false);
  const [aiFocus, setAiFocus] = useState<string>("");
  const [aiFix, setAiFix] = useState<string>("");

  if (!items.length) {
    return <SkipPhase emoji="✍️" label="情境翻译" onSkip={() => onDone(0, 0)} />;
  }
  const it = items[i];

  const submit = async () => {
    if (!val.trim() || grading || result !== null) return;
    // Quick local pass: if it already matches, no need to spend AI credits.
    if (fuzzyMatch(val, it.en, it.accepted || [])) {
      setResult("ok");setCorrect((c) => c + 1);return;
    }
    setGrading(true);
    try {
      const { data, error } = await supabase.functions.invoke("grade-grammar-translation", {
        body: { pointTitle, mnemonic, cn: it.cn, modelEn: it.en, userEn: val }
      });
      if (error) throw error;
      const pass = !!(data as any)?.pass;
      setAiFocus((data as any)?.focus || "");
      setAiFix((data as any)?.fix || "");
      setResult(pass ? "ok" : "ng");
      if (pass) setCorrect((c) => c + 1);else
      onMistake({ phase: "drill", stem: it.cn, picked: val, correct: it.en });
    } catch {
      // AI unavailable → fall back to fuzzy result (already failed above)
      setResult("ng");
      onMistake({ phase: "drill", stem: it.cn, picked: val, correct: it.en });
    } finally {
      setGrading(false);
    }
  };

  const next = () => {
    if (i + 1 >= items.length) onDone(correct + (result === "ok" ? 0 : 0), items.length);else
    {setI(i + 1);setVal("");setResult(null);setAiFocus("");setAiFix("");}
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-xs ink-dim">
        <span><T>情境翻译 ·</T> {it.situation}</span>
        <span>{i + 1} / {items.length}</span>
      </div>
      <div className="glass-card-strong rounded-2xl p-8 space-y-5">
        <div className="font-display text-2xl leading-relaxed">{it.cn}</div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={result !== null || grading}
          placeholder="用今天学的语法点翻译成英文…"
          className="lab-input min-h-[88px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (result === null) submit();else next();
            }
          }} />
        
        {result === "ok" &&
        <div className="bg-mint-soft rounded-xl p-4 text-mint space-y-1">
            <div className="flex items-center gap-2"><Check size={16} /> <T>语法点用对了！</T></div>
            {aiFocus && <div className="text-xs ink-dim">{aiFocus}</div>}
          </div>
        }
        {result === "ng" &&
        <div className="bg-rose-soft rounded-xl p-4 space-y-2">
            <div className="text-rose flex items-center gap-2 font-semibold"><X size={16} /> <T>语法点还没用对</T></div>
            {aiFocus && <div className="text-sm">{aiFocus}</div>}
            {aiFix && <div className="font-mono text-mint text-sm"><T>建议：</T>{aiFix}</div>}
            <div className="text-xs ink-dim"><T>参考：</T><span className="font-mono">{it.en}</span></div>
          </div>
        }
        <div ref={actionRef} className="flex justify-end gap-2">
          {result === null ?
          <button onClick={submit} disabled={grading} className="btn-primary">
              {grading ? "AI 批改中…" : "提交 (Enter)"}
            </button> :

          <button onClick={next} className="btn-primary"><T>下一题 (Enter)</T> <ArrowRight size={14} className="inline" /></button>
          }
        </div>
      </div>
    </div>);

}

/* ─────────────── Phase: Correction ─────────────── */
function CorrectionScreen({ tasks, onDone, onMistake }: {tasks: CorrectionTask[];onDone: (correct: number, total: number) => void;onMistake: (m: Mistake) => void;}) {
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
    if (ok) setCorrect((c) => c + 1);else
    onMistake({ phase: "correction", stem: t.wrong, picked: val, correct: t.model, why: t.why });
  };
  const next = () => {
    if (i + 1 >= tasks.length) onDone(correct, tasks.length);else
    {setI(i + 1);setVal("");setShowHint(false);setResult(null);}
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-xs ink-dim">
        <span><T>改错 · 找出错误并改正</T></span>
        <span>{i + 1} / {tasks.length}</span>
      </div>
      <div className="glass-card-strong rounded-2xl p-8 space-y-5">
        <div className="bg-rose-soft rounded-xl p-4">
          <div className="text-xs ink-dim mb-1"><T>错误句</T></div>
          <div className="font-mono text-lg line-through text-rose">{t.wrong}</div>
        </div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={result !== null}
          placeholder="把它改正…"
          className="lab-input min-h-[80px] resize-none" />
        
        {showHint && result === null &&
        <div className="bg-amber-soft rounded-xl p-3 text-sm">
            <ReactMarkdown>{t.hint}</ReactMarkdown>
          </div>
        }
        {result === "ok" &&
        <div className="bg-mint-soft rounded-xl p-4 text-mint flex items-center gap-2"><Check size={16} /> <T>完美修复！</T></div>
        }
        {result === "ng" &&
        <div className="bg-rose-soft rounded-xl p-4 space-y-2">
            <div className="font-mono text-mint">{t.model}</div>
            <div className="text-sm ink-dim"><ReactMarkdown>{t.why}</ReactMarkdown></div>
          </div>
        }
        <div className="flex justify-between">
          <button onClick={() => setShowHint(true)} className="btn-ghost text-xs" disabled={showHint || result !== null}><T>💡 提示</T></button>
          {result === null ?
          <button onClick={submit} className="btn-primary"><T>提交</T></button> :

          <button onClick={next} className="btn-primary"><T>下一题</T> <ArrowRight size={14} className="inline" /></button>
          }
        </div>
      </div>
    </div>);

}

/* ─────────────── Phase: Universal exam runner (uses GrammarQuestionCard) ─────────────── */
/**
 * Drives the Lab's 真题练习 (exam) phase using the universal
 * GrammarQuestionCard component, which auto-selects the right UI based on
 * question_type:
 *   - mcq          → 4-button picker
 *   - fill         → typed input matched against accepted_answers
 *   - transform    → typed sentence-rewrite (AI-graded if use_ai_grading)
 *   - correction   → typed correction (AI-graded if use_ai_grading)
 *   - translation  → typed translation (AI-graded if use_ai_grading)
 *
 * Replaces the legacy MCQRunner which only rendered MCQ rows and choked on
 * NULL option columns from older seed data.
 */
function UniversalExamRunner({ questions, label, onDone, onMistake, onCorrect }: {
  questions: GrammarQuestion[];
  label: string;
  onDone: (correct: number, total: number) => void;
  onMistake: (m: Mistake) => void;
  onCorrect: () => void;
}) {
  const [i, setI] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);

  if (!questions.length) return <SkipPhase emoji="📚" label={label} onSkip={() => onDone(0, 0)} />;

  const q = questions[i];

  const handleAnswered = (result: AnswerResult) => {
    if (answered) return;
    setAnswered(true);
    const isOk = result.kind === "correct" || result.kind === "acceptable";
    void recordSkillAttemptsForQuestion(q.id, isOk);
    if (isOk) {
      setCorrectCount((c) => c + 1);
      onCorrect();
    } else {
      onMistake({
        phase: label,
        stem: q.stem,
        picked: "", // GrammarQuestionCard handles its own answer display
        correct: q.correct_answer || (q.accepted_answers?.[0] ?? ""),
        why: q.explanation || "",
      });
    }
  };

  const next = () => {
    if (i + 1 >= questions.length) {
      onDone(correctCount, questions.length);
    } else {
      setI(i + 1);
      setAnswered(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between text-xs ink-dim">
        <span>{label}</span>
        <span>{i + 1} / {questions.length}</span>
      </div>
      <div className="glass-card-strong rounded-2xl p-6">
        {/* key={q.id} forces GrammarQuestionCard to reset its internal state per question */}
        <GrammarQuestionCard
          key={q.id}
          question={q}
          index={i}
          onAnswered={handleAnswered}
        />
      </div>
      {answered &&
        <div className="text-right">
          <button onClick={next} className="btn-primary">
            {i + 1 >= questions.length ? "完成阶段" : "下一题"} <ArrowRight size={14} className="inline" />
          </button>
        </div>
      }
    </div>);
}

/* ─────────────── Phase: MCQ runner (Boss only — legacy kept for backward compat) ─────────────── */
function MCQRunner({ questions, label, onDone, onMistake, onCorrect





}: {questions: {stem: string;option_a?: string | null;option_b?: string | null;option_c?: string | null;option_d?: string | null;correct_answer?: string | null;explanation?: string | null;trap?: string;why?: string;}[];label: string;onDone: (correct: number, total: number) => void;onMistake: (m: Mistake) => void;onCorrect: () => void;}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);

  if (!questions.length) return <SkipPhase emoji="📚" label={label} onSkip={() => onDone(0, 0)} />;

  const q = questions[i];
  const opts: {k: string;v: string;}[] = (
  [["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]] as const).
  filter(([_, v]) => !!v).map(([k, v]) => ({ k, v: v as string }));

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
    if (i + 1 >= questions.length) onDone(correct, questions.length);else
    {setI(i + 1);setPicked(null);}
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
                  !picked && "hover:bg-mint-soft"
                )}>
                
                <span className="font-mono text-xs ink-dim mr-2">{k}.</span>{v}
              </button>);

          })}
        </div>
        {picked &&
        <div className="space-y-2 pt-2 text-sm">
            {q.trap && <div className="bg-amber-soft rounded-lg p-3"><span className="text-amber font-semibold"><T>陷阱：</T></span><ReactMarkdown>{q.trap}</ReactMarkdown></div>}
            {(q.why || q.explanation) && <div className="bg-mint-soft rounded-lg p-3"><span className="text-mint font-semibold"><T>解析：</T></span><ReactMarkdown>{q.why || q.explanation || ""}</ReactMarkdown></div>}
          </div>
        }
        {picked &&
        <div className="text-right">
            <button onClick={next} className="btn-primary">{i + 1 >= questions.length ? "完成阶段" : "下一题"} <ArrowRight size={14} className="inline" /></button>
          </div>
        }
      </div>
    </div>);

}

function SkipPhase({ emoji, label, onSkip }: {emoji: string;label: string;onSkip: () => void;}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
      <div className="text-6xl">{emoji}</div>
      <h3 className="font-display text-2xl">{label}</h3>
      <p className="ink-dim"><T>这个语法点还没有该阶段的内容，去 /admin/grammar-content 重新生成可以补齐。</T></p>
      <button onClick={onSkip} className="btn-ghost"><T>跳过</T></button>
    </div>);

}

/* ─────────────── AI Wrong-Answer Explainer ─────────────── */
function WrongAnswerAI({ question, userAnswer, correctAnswer, pointTitle, gradeLabel = "初中", explanation


}: {question: string;userAnswer: string;correctAnswer: string;pointTitle?: string;gradeLabel?: string;explanation?: string;}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);setErr(null);setText("");
        const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID;
        const url = `https://${projectId}.supabase.co/functions/v1/explain-wrong-answer`;
        const { data: { session } } = await supabase.auth.getSession();
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
          },
          body: JSON.stringify({ question, userAnswer, correctAnswer, pointTitle, gradeLabel, explanation })
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
            } catch {/* ignore */}
          }
        }
      } catch (e: any) {
        if (!aborted) setErr(e?.message || String(e));
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {aborted = true;};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, userAnswer, correctAnswer]);

  return (
    <div className="rounded-xl border border-amber/40 bg-amber-soft/40 p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber font-semibold text-sm">
        <Lightbulb size={16} /> <T>AI 老师为你专属讲解</T>
      </div>
      {err ?
      <div className="text-sm text-rose">{err}</div> :

      <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{text || (loading ? "正在思考..." : "")}</ReactMarkdown>
          {loading && <Loader2 size={14} className="inline animate-spin ink-dim" />}
        </div>
      }
    </div>);

}

/* ─────────────── Boss Runner — must clear 100% to unlock next ─────────────── */
function BossRunner({ questions, pointTitle, gradeLabel, onCorrect, onMistake, onPassed, onAnyAttempt







}: {questions: BossQ[];pointTitle: string;gradeLabel: string;onCorrect: () => void;onMistake: (m: Mistake) => void;onPassed: (totalCorrectFirstTry: number, total: number) => void;onAnyAttempt?: () => void;}) {
  const [queue, setQueue] = useState<BossQ[]>(questions);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [redoList, setRedoList] = useState<BossQ[]>([]);
  const total = questions.length;

  if (!queue.length) return <SkipPhase emoji="👑" label="Boss 冲刺" onSkip={() => onPassed(0, 0)} />;

  const q = queue[i];
  const opts = [["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d]].
  filter(([, v]) => !!v) as [string, string][];
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
      setI(i + 1);setPicked(null);return;
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
        <span className="font-semibold text-amber"><T>👑 Boss 冲刺 · 必须全部答对才能解锁下一关</T></span>
        <span>R{round} · {i + 1} / {queue.length}</span>
      </div>
      {round > 1 &&
      <div className="rounded-lg bg-rose-soft text-rose text-xs px-3 py-2 flex items-center gap-2">
          <Lock size={14} /> <T>上一轮有错题，已收集错题重做。全部改对即通关。</T>
        </div>
      }
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
                  !picked && "hover:bg-mint-soft"
                )}>
                
                <span className="font-mono text-xs ink-dim mr-2">{k}.</span>{v}
              </button>);

          })}
        </div>
        {picked &&
        <div className="space-y-3 pt-1 text-sm">
            {q.trap && <div className="bg-amber-soft rounded-lg p-3"><span className="text-amber font-semibold"><T>陷阱：</T></span><ReactMarkdown>{q.trap}</ReactMarkdown></div>}
            {q.why && <div className="bg-mint-soft rounded-lg p-3"><span className="text-mint font-semibold"><T>解析：</T></span><ReactMarkdown>{q.why}</ReactMarkdown></div>}
            {isWrong &&
          <WrongAnswerAI
            question={q.stem}
            userAnswer={`${picked}. ${opts.find(([kk]) => kk === picked)?.[1] || ""}`}
            correctAnswer={`${ans}. ${opts.find(([kk]) => kk === ans)?.[1] || ""}`}
            pointTitle={pointTitle}
            gradeLabel={gradeLabel}
            explanation={q.why} />

          }
          </div>
        }
        {picked &&
        <div className="text-right">
            <button onClick={next} className="btn-primary">
              {isLastInRound ? redoList.length ? "进入错题重做" : "完成 Boss 关" : "下一题"}
              <ArrowRight size={14} className="inline ml-1" />
            </button>
          </div>
        }
      </div>
    </div>);

}

/* ─────────────── Revenge: retry session mistakes only ─────────────── */
function RevengeScreen({
  mistakes,
  onDone,
  onCorrect,
}: {
  mistakes: Mistake[];
  onDone: (correct: number, total: number) => void;
  onCorrect: () => void;
}) {
  const queue = useMemo(() => {
    const seen = new Set<string>();
    return mistakes.filter((m) => {
      const key = `${m.phase}|${m.stem}|${m.correct}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [mistakes]);

  const [i, setI] = useState(0);
  const [val, setVal] = useState("");
  const [result, setResult] = useState<null | "ok" | "ng">(null);
  const [correct, setCorrect] = useState(0);

  if (!queue.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="ink-dim"><T>没有可复仇的错题</T></p>
        <button type="button" onClick={() => onDone(0, 0)} className="btn-ghost mt-4"><T>返回</T></button>
      </div>
    );
  }

  const m = queue[i];
  const submit = () => {
    if (!val.trim() || result !== null) return;
    const ok = fuzzyMatch(val, m.correct);
    setResult(ok ? "ok" : "ng");
    if (ok) {
      setCorrect((c) => c + 1);
      onCorrect();
    }
  };
  const next = () => {
    if (i + 1 >= queue.length) onDone(correct + (result === "ok" ? 0 : 0), queue.length);
    else {
      setI(i + 1);
      setVal("");
      setResult(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="text-5xl">⚔️</div>
        <h2 className="font-display text-3xl"><T>复仇模式</T></h2>
        <p className="text-sm ink-dim"><T>只刷本关错题 · 全部改对解锁「再战归来」</T></p>
      </div>
      <div className="flex items-center justify-between text-xs ink-dim">
        <span className="rounded-full bg-rose-soft text-rose px-2 py-0.5 font-bold">{m.phase}</span>
        <span>{i + 1} / {queue.length}</span>
      </div>
      <div className="glass-card-strong rounded-2xl p-8 space-y-5">
        <div className="font-display text-xl leading-relaxed">{m.stem}</div>
        <div className="text-xs ink-dim"><T>上次你的答法：</T> <span className="text-rose line-through">{m.picked}</span></div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          disabled={result !== null}
          placeholder="这次写对…"
          className="lab-input min-h-[80px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (result === null) submit();
              else next();
            }
          }}
        />
        {result === "ok" &&
        <div className="bg-mint-soft rounded-xl p-4 text-mint flex items-center gap-2"><Check size={16} /> <T>复仇成功！</T></div>
        }
        {result === "ng" &&
        <div className="bg-rose-soft rounded-xl p-4 space-y-2">
          <div className="text-rose font-semibold"><T>还没对，参考：</T></div>
          <div className="font-mono text-mint">{m.correct}</div>
          {m.why && <div className="text-xs ink-dim"><ReactMarkdown>{m.why}</ReactMarkdown></div>}
        </div>
        }
        <div className="flex justify-end">
          {result === null ?
          <button type="button" onClick={submit} className="btn-primary bg-gradient-to-r from-rose-600 to-amber-600"><T>提交复仇</T></button> :
          <button type="button" onClick={next} className="btn-primary">
            {i + 1 >= queue.length ? <T>完成复仇</T> : <T>下一题</T>}
            <ArrowRight size={14} className="inline ml-1" />
          </button>
          }
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Phase: Done ─────────────── */
function DoneScreen({ state, mistakes, onReplay, onRevenge, onAskTutor, bossPassed, nextPointId, nextPointTitle, grammarHref



}: {state: LabState;mistakes: Mistake[];onReplay: () => void;onRevenge?: () => void;onAskTutor: (m: Mistake) => void;bossPassed?: boolean;nextPointId?: string | null;nextPointTitle?: string | null;grammarHref?: string;}) {
  // 下一关考点若已拆知识点 → 进详情页(而非旧整考点 mastery)。
  const [nextHasKp, setNextHasKp] = useState(false);
  useEffect(() => {
    if (!nextPointId) return;
    let cancelled = false;
    pointHasKp(nextPointId).then((v) => { if (!cancelled) setNextHasKp(v); });
    return () => { cancelled = true; };
  }, [nextPointId]);
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="text-7xl">🎉</div>
        <h2 className="font-display text-4xl"><T>通关庆典</T></h2>
        <p className="ink-dim"><T>本次累计</T> {state.xp} <T>XP · 最佳连对</T> {state.bestStreak}</p>
        {bossPassed &&
        <div className="inline-flex items-center gap-2 rounded-full bg-mint-soft text-mint px-4 py-2 text-sm font-semibold">
            <Check size={16} /> <T>Boss 100% 通关 · 已解锁下一关</T>
          </div>
        }
      </div>
      <div className="glass-card-strong rounded-2xl p-6">
        <div className="text-xs uppercase tracking-widest text-amber mb-3"><T>已解锁成就</T></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const got = state.achievements.includes(a.id);
            return (
              <div key={a.id} className={cn("rounded-lg p-3 flex items-center gap-2 text-sm", got ? "bg-mint-soft" : "glass-card opacity-50")}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-semibold">{a.cn}</div>
                  <div className="text-xs ink-dim"><T>{a.desc}</T></div>
                </div>
              </div>);

          })}
        </div>
      </div>
      {mistakes.length > 0 &&
      <div className="glass-card-strong rounded-2xl p-6 space-y-3">
          <div className="text-xs uppercase tracking-widest text-rose mb-2"><T>错题复盘 ·</T> {mistakes.length} <T>道</T></div>
          {mistakes.map((m, i) =>
        <div key={i} className="bg-rose-soft rounded-xl p-4 space-y-2">
              <div className="text-xs ink-dim">{m.phase}</div>
              <div className="font-display">{m.stem}</div>
              <div className="text-sm"><span className="ink-dim"><T>你的答：</T></span><span className="text-rose">{m.picked}</span></div>
              <div className="text-sm"><span className="ink-dim"><T>正确：</T></span><span className="text-mint font-mono">{m.correct}</span></div>
              {m.why && <div className="text-xs ink-dim"><ReactMarkdown>{m.why}</ReactMarkdown></div>}
            </div>
        )}
        </div>
      }
      <div className="text-center flex flex-wrap gap-3 justify-center">
        {mistakes.length > 0 && onRevenge &&
        <button
          type="button"
          onClick={onRevenge}
          className="btn-primary inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-orange-600">
          <Zap size={16} /> <T>复仇模式</T> ({mistakes.length})
        </button>
        }
        <button type="button" onClick={onReplay} className="btn-ghost inline-flex items-center gap-2"><RotateCw size={16} /> <T>再来一次</T></button>
        {bossPassed && nextPointId &&
        <Link to={juniorGrammarPlayPath(nextPointId, { id: nextPointId, title: nextPointTitle ?? "", content_depth: 1 }, { hasKp: nextHasKp })} className="btn-primary inline-flex items-center gap-2">
            <T>下一关</T>{nextPointTitle ? ` · ${nextPointTitle}` : ""}
            <ArrowRight size={16} />
          </Link>
        }
        <Link to={grammarHref ?? "/junior/grammar"} className="btn-ghost inline-flex items-center gap-2"><T>返回语法地图</T></Link>
      </div>
    </div>);

}

/* ─────────────── Main ─────────────── */
export default function JuniorGrammarLab() {
  const { id } = useParams<{id: string;}>();
  const [searchParams] = useSearchParams();
  const wantRevenge = searchParams.get("revenge") === "1";
  // 测试模式 (?quick=1): redirect to JuniorGrammarPoint, which uses the universal
  // GrammarQuestionCard renderer (handles all 5 question types — mcq/fill/transform/
  // correction/translation). Lab's exam phase is MCQ-only (limit 8, NULL options
  // render as "nan") so we'd lose 8 of the 12 gold-standard questions here.
  const isQuick = searchParams.get("quick") === "1";
  // ?legacy=1 lets power users opt back into the classic Lab flow.
  const wantLegacy = searchParams.get("legacy") === "1";
  const nav = useNavigate();
  // Redirect to the new adaptive 5-level mastery test by default. The Lab's
  // legacy multi-phase flow is still available via ?legacy=1 for compat.
  // ?quick=1 also lands on the mastery test (it's already test-focused).
  useEffect(() => {
    if (!id || wantLegacy) return;
    nav(`/junior/grammar/${id}/mastery`, { replace: true });
  }, [id, wantLegacy, nav]);
  const [pt, setPt] = useState<Pt | null>(null);
  const [examQs, setExamQs] = useState<ExamQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(INITIAL_PHASE);
  const [state, setState] = useState<LabState>({ xp: 0, streak: 0, bestStreak: 0, phasesDone: [], achievements: [], mistakes: [] });
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [focus, setFocus] = useState(false);
  const [nextPointId, setNextPointId] = useState<string | null>(null);
  const [nextPointTitle, setNextPointTitle] = useState<string | null>(null);
  const [bossPassed, setBossPassed] = useState(false);
  const REVENGE_PHASE = 99;
  const [gradeLabel, setGradeLabel] = useState<string>("初中");
  const initRef = useRef(false);

  // Free-mode AI helper for this grammar point.
  // The system prompt forbids leaking specific test answers; users can ask conceptual questions anytime.
  useRegisterAssistant(
    pt ?
    {
      context: "junior_grammar_lab",
      ref: pt.id,
      topic: `初中语法 · ${pt.title}`,
      mode: "free",
      unlocked: true,
      pageTitle: "💬 小月 · 语法答疑"
    } :
    null
  );

  useEffect(() => {
    if (!id) return;
    setState(loadState(id));
    (async () => {
      const { data: p } = await supabase.from("junior_grammar_points").
      select("id,title,cefr,grade,mnemonic,explanation_md,teacher_script,immersion_cards,hook_line,hook_line_cn,contrast_table,reflex_cards,situation_drills,correction_tasks,boss_questions").
      eq("id", id).maybeSingle();
      if (p) setPt(p as any);
      // Gold-standard questions only (sort_order 9000-9099). We pull ALL types
      // (mcq / fill / transform / correction / translation) and render them
      // through GrammarQuestionCard, which auto-selects the right UI per type.
      // Old seed rows in sort_order 1-99 are skipped — they have NULL columns
      // that previously rendered as "nan" inside MCQRunner.
      const { data: qs } = await supabase.from("junior_grammar_questions").
      select("id,stem,option_a,option_b,option_c,option_d,correct_answer,accepted_answers,explanation,question_type,distractors,natural_note,grammar_topic,use_ai_grading,sort_order").
      eq("point_id", id).
      gte("sort_order", 9000).
      lte("sort_order", 9099).
      order("sort_order").
      limit(12);
      setExamQs(qs as any || []);
      const [{ data: allPts }, masteryRows] = await Promise.all([
        supabase
          .from("junior_grammar_points")
          .select("id,title,grade,content_depth,sort_order,category_id")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        loadJuniorGrammarMasteryAll(),
      ]);
      if (allPts && id) {
        const masteryMap: Record<string, { due_at?: string | null; mastery_level?: number }> = {};
        for (const r of masteryRows) {
          masteryMap[r.item_id] = { due_at: r.due_at, mastery_level: r.mastery_level };
        }
        const current = (p as Pt & { grade?: number | null }) ?? null;
        const next = pickNextLabPoint(id, allPts as JuniorPointNav[], masteryMap, {
          grade: current?.grade ?? null,
        });
        if (next) {
          setNextPointId(next.id);
          setNextPointTitle(next.title);
        } else {
          setNextPointId(null);
          setNextPointTitle(null);
        }
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

  useEffect(() => {if (id && initRef.current) saveState(id, state);else initRef.current = true;}, [id, state]);

  useEffect(() => {
    if (!loading && wantRevenge && state.mistakes.length > 0) {
      setPhase(REVENGE_PHASE);
    }
  }, [loading, wantRevenge, state.mistakes.length]);

  const grant = (delta: Partial<LabState> & {addXp?: number;unlock?: string[];}) => {
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
    if (id) recordUnifiedAttempt({
      stage: "junior", grade: 7, module: "grammar",
      item_type: "lab", item_id: id, is_correct: true
    }).catch(() => {});
  };
  const onMistake = (m: Mistake) => {
    setState((s) => ({ ...s, streak: 0, mistakes: [m, ...s.mistakes].slice(0, 50) }));
    if (id && pt) enqueueLabMistake(id, pt.title, m);
    if (id) recordJuniorGrammarAttempt({ pointId: id, questionType: "lab", isCorrect: false, errorReason: "rule_unknown" }).catch(() => {});
    if (id) recordUnifiedAttempt({
      stage: "junior", grade: 7, module: "grammar",
      item_type: "lab", item_id: id, is_correct: false,
      context: { mistake: m as any }
    }).catch(() => {});
  };

  const completePhase = (phaseId: number, unlocks: string[] = []) => {
    setState((s) => ({ ...s, phasesDone: Array.from(new Set([...s.phasesDone, phaseId])) }));
    grant({ addXp: XP.phase_clear, unlock: unlocks });
    // Cap on the highest phase id (8 = done), not PHASES.length - 1 — the
    // PHASES array now has only 4 visible entries (5..8) so length-1 would be 3.
    setPhase((p) => Math.min(p + 1, MAX_PHASE));
  };

  const persistBossPassed = async (firstTryCorrect: number, total: number) => {
    setBossPassed(true);
    if (!id) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const score = total > 0 ? Math.round(firstTryCorrect / total * 100) : 100;
      await supabase.from("grammar_lab_progress").upsert({
        user_id: user.id,
        point_id: id,
        level: "junior",
        boss_passed: true,
        best_score: score,
        attempts: 1,
        completed_at: new Date().toISOString()
      } as any, { onConflict: "user_id,point_id,level" });
    } catch (e) {
      console.warn("persist boss progress failed", e);
    }
  };

  if (loading) return <CosmicShell theme={theme} focus={focus}><div className="flex items-center justify-center min-h-screen ink-dim"><T>加载中…</T></div></CosmicShell>;
  if (!pt) return <CosmicShell theme={theme} focus={focus}><div className="text-center py-20 ink-dim"><T>语法点不存在</T></div></CosmicShell>;

  return (
    <CosmicShell theme={theme} focus={focus}>
      <HUD state={state} theme={theme} focus={focus} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} onToggleFocus={() => setFocus(!focus)} onBack={() => { const g = pt?.grade; const fb = g ? `/junior/grammar?grade=${g}` : "/junior/grammar"; nav(fb, { replace: true }); }} />
      {phase !== REVENGE_PHASE &&
      <PhaseRail active={phase} done={state.phasesDone} onJump={(i) => setPhase(i)} />
      }

      {phase === REVENGE_PHASE &&
      <GrammarRevengeRunner
        items={state.mistakes}
        onCorrect={() => { onCorrect(); grant({ addXp: 8 }); }}
        onDone={(correct, total) => {
          const perfect = total > 0 && correct === total;
          grant({ addXp: correct * 8, unlock: perfect ? ["comeback"] : [] });
          if (perfect) {
            fireEmojiConfetti({ emojis: ["⚔️", "💪"] });
            if (id) clearRevengeForPoint(id);
          }
          setPhase(8);
        }} />
      }

      {phase === 0 &&
      <BriefingScreen pt={pt} onStart={() => completePhase(0, ["first_step"])} />
      }
      {phase === 1 && (
      pt.teacher_script && pt.teacher_script.length > 0 ?
      <div className="max-w-3xl mx-auto px-4 py-6">
            <TeacherLessonPlayer
          segments={pt.teacher_script}
          pointTitle={pt.title}
          onContinue={() => completePhase(1, ["lesson_complete"])}
          onSkip={() => completePhase(1)} />
        
          </div> :
      <SkipPhase emoji="👩‍🏫" label="老师讲堂" onSkip={() => completePhase(1)} />)
      }
      {phase === 2 &&
      <FoundationScreen pt={pt as any} onContinue={() => completePhase(2)} />
      }
      {phase === 3 &&
      <ReflexScreen
        cards={pt.reflex_cards || []}
        onDone={(correct) => {
          grant({ addXp: correct * XP.reflex });
          const unlocks = correct === (pt.reflex_cards?.length || 0) && correct > 0 ? ["reflex_master"] : [];
          completePhase(3, unlocks);
          if (correct > 0) fireEmojiConfetti({ emojis: ["⚡"] });
        }} />

      }
      {phase === 4 &&
      <DrillScreen
        items={pt.situation_drills || []}
        pointTitle={pt.title}
        mnemonic={pt.mnemonic ?? undefined}
        onMistake={onMistake}
        onDone={(correct, total) => {
          grant({ addXp: correct * XP.drill });
          const pct = total ? correct / total : 0;
          const unlocks = pct >= 0.8 ? ["drill_warrior"] : [];
          completePhase(4, unlocks);
        }} />

      }
      {phase === 5 &&
      <CorrectionScreen
        tasks={pt.correction_tasks || []}
        onMistake={onMistake}
        onDone={(correct, total) => {
          grant({ addXp: correct * XP.correction });
          const unlocks = correct === total && total > 0 ? ["fix_it_pro"] : [];
          completePhase(5, unlocks);
        }} />

      }
      {phase === 6 &&
      <UniversalExamRunner
        label="真题练习"
        questions={examQs}
        onCorrect={() => {onCorrect();grant({ addXp: XP.exam });}}
        onMistake={onMistake}
        onDone={() => completePhase(6, ["exam_clear"])} />

      }
      {phase === 7 &&
      <BossRunner
        questions={(pt.boss_questions || []) as BossQ[]}
        pointTitle={pt.title}
        gradeLabel={gradeLabel}
        onCorrect={() => {onCorrect();grant({ addXp: XP.boss });}}
        onMistake={onMistake}
        onPassed={(firstTry, total) => {
          const unlocks: string[] = ["boss_slayer", "lab_complete"];
          if (firstTry === total && total > 0) unlocks.push("perfect_run");
          persistBossPassed(firstTry, total);
          completePhase(7, unlocks);
          fireEmojiConfetti({ emojis: ["👑", "🏆", "✨"] });
        }} />

      }
      {phase === 8 &&
      <DoneScreen
        state={state}
        mistakes={state.mistakes}
        bossPassed={bossPassed}
        nextPointId={nextPointId}
        nextPointTitle={nextPointTitle}
        grammarHref={pt?.grade ? `/junior/grammar?grade=${pt.grade}` : "/junior/grammar"}
        onRevenge={() => setPhase(REVENGE_PHASE)}
        onReplay={() => {setPhase(INITIAL_PHASE);setState({ ...state, phasesDone: [], streak: 0, mistakes: [] });}}
        onAskTutor={(m) => {
          const url = `/junior/grammar/${id}?ask=${encodeURIComponent(m.stem + " | " + m.correct)}`;
          window.location.href = url;
        }} />

      }
    </CosmicShell>);

}
