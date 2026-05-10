import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, Loader2, Trophy, Sparkles, Play, ChevronRight, Star, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak, prefetchTTSBatch, stopSpeaking } from "@/lib/speak";
import { awardForCorrect, awardCoins, notifyWrong } from "@/lib/coins";
import { cn } from "@/lib/utils";
import { celebrateScore } from "@/lib/feedback";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { recordUnifiedAttempt } from "@/hooks/useRecordAttempt";

type Sentence = { en: string; cn: string };
type Warm = { w: string; cn: string };
type Question = { q: string; q_cn?: string; options: string[]; options_cn?: string[]; answer: number };
type Treasure =
  | { type: "build"; sentence: string; words: string[] }
  | { type: "order"; sentences: string[] }
  | { type: "match"; pairs: { en: string; cn: string }[] };

type Article = {
  id: string;
  grade: number;
  title_cn: string;
  title_en: string;
  emoji: string | null;
  cover_gradient: string | null;
  warmup: Warm[];
  sentences: Sentence[];
  questions: Question[];
  treasure: Treasure;
  parent_tip: string | null;
};

const STEPS = [
  { key: "warmup", title: "词卡热身", emoji: "🌈", color: "from-rose-400 to-pink-500" },
  { key: "listen", title: "句子朗读", emoji: "👀", color: "from-sky-400 to-cyan-500" },
  { key: "read", title: "跟我读", emoji: "📣", color: "from-emerald-400 to-teal-500" },
  { key: "think", title: "理解小问", emoji: "🤔", color: "from-violet-400 to-fuchsia-500" },
  { key: "treasure", title: "宝藏关", emoji: "🎁", color: "from-amber-400 to-orange-500" },
] as const;

export default function PrimaryReadingPlay() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [a, setA] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const thinkStartRef = useRef<number>(Date.now());

  // Free-mode AI helper for primary reading lessons (multi-step kids module).
  // The strict prompt prevents leaking specific quiz answers.
  useRegisterAssistant(
    a
      ? {
          context: "primary_reading",
          ref: a.id,
          topic: `小学阅读 · ${a.title_cn}`,
          mode: "free",
          unlocked: true,
          pageTitle: "💬 小月 · 小学阅读答疑",
        }
      : null,
  );

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("primary_reading_articles")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setA(data as any);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (a) {
      prefetchTTSBatch([...a.warmup.map(w=>w.w), ...a.sentences.map(s=>s.en)]);
    }
    return () => { stopSpeaking(); };
  }, [a]);

  const finished = step >= STEPS.length;
  const accuracy = useMemo(() => {
    const total = (a?.questions.length ?? 0) + 1; // +treasure
    return Math.min(1, score / Math.max(1, total));
  }, [a, score]);

  const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.6 ? 2 : 1;

  useEffect(() => {
    if (!finished || !a) return;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      await supabase.from("primary_reading_progress").upsert({
        user_id: u.user.id,
        article_id: a.id,
        stars,
        score: Math.round(accuracy * 100),
        best_step: STEPS.length,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,article_id" });
      await awardCoins(stars * 5, "primary_reading");
    })();
    celebrateScore(Math.round(accuracy * 100));
  }, [finished, a, stars, accuracy]);

  if (loading) return <main className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></main>;
  if (!a) return <main className="mx-auto max-w-3xl p-6"><p className="text-muted-foreground">课文不存在</p><BackLink to="/primary" className="text-sm text-primary">返回</BackLink></main>;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 pb-24">
      <BackLink
        to={`/primary/reading/grade/${a.grade}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 返回阅读列表
      </BackLink>

      <div className={`mb-4 rounded-3xl bg-gradient-to-br ${a.cover_gradient ?? "from-rose-400 to-amber-400"} p-5 text-white shadow-tile`}>
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-white/25 text-3xl">{a.emoji ?? "📖"}</div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">G{a.grade} · READING</div>
            <div className="text-lg font-extrabold">{a.title_cn}</div>
            <div className="text-xs opacity-90">{a.title_en}</div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-5 flex items-center gap-1">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step && !finished;
          return (
            <div key={s.key} className="flex flex-1 items-center gap-1">
              <div className={cn(
                "flex h-8 flex-1 items-center justify-center gap-1 rounded-full text-[11px] font-extrabold transition",
                done && "bg-emerald-500 text-white",
                active && `bg-gradient-to-r ${s.color} text-white shadow`,
                !done && !active && "bg-muted text-muted-foreground"
              )}>
                <span>{s.emoji}</span>
                <span className="hidden sm:inline">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="size-3 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      {!finished && (
        <div className="rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
          {step === 0 && <WarmupStep warm={a.warmup} onDone={() => setStep(1)} />}
          {step === 1 && <ListenStep sentences={a.sentences} onDone={() => setStep(2)} />}
          {step === 2 && <ReadStep sentences={a.sentences} onDone={() => setStep(3)} />}
          {step === 3 && (
            <ThinkStep
              questions={a.questions}
              onDone={(c) => { setScore(s => s + c); setStep(4); }}
              onCorrect={(qIdx?: number) => { setStreak(n => n + 1); awardForCorrect(streak + 1, "primary_reading", `${a.id}:think:${qIdx ?? 0}`, "primary_reading", Date.now() - thinkStartRef.current); thinkStartRef.current = Date.now(); }}
              onWrong={(qSnap) => {
                setStreak(0); notifyWrong();
                logMistake(a, qSnap);
              }}
              onAnswer={(q, isCorrect, pickedIdx) => {
                recordUnifiedAttempt({
                  stage: "primary", grade: a.grade, module: "reading",
                  item_type: "comprehension", item_id: `${a.id}:${q.q.slice(0,40)}`, item_label: a.title_cn,
                  is_correct: isCorrect,
                  user_answer: q.options[pickedIdx],
                  correct_answer: q.options[q.answer],
                  context: { article_id: a.id },
                }).catch(() => {});
              }}
            />
          )}
          {step === 4 && (
            <TreasureStep
              treasure={a.treasure}
              onDone={(ok) => { if (ok) setScore(s => s + 1); setStep(5); }}
              onCorrect={() => { setStreak(n => n + 1); awardForCorrect(streak + 1, "primary_reading", `${a.id}:treasure`, "primary_reading"); }}
            />
          )}
        </div>
      )}

      {finished && (
        <FinishCard a={a} stars={stars} accuracy={accuracy} onRetry={() => { setStep(0); setScore(0); setStreak(0); }} />
      )}

      {a.parent_tip && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <span className="font-bold">💡 亲子提示：</span>{a.parent_tip}
        </div>
      )}
    </main>
  );
}

async function logMistake(a: Article, q: Question) {
  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    await supabase.from("user_mistakes").upsert({
      user_id: u.user.id,
      module: "primary_reading",
      source_key: `${a.id}:${q.q.slice(0,40)}`,
      question: q.q_cn ?? q.q,
      correct_answer: (q.options_cn ?? q.options)[q.answer],
      snapshot: { article_id: a.id, title_cn: a.title_cn, q, grade: a.grade } as any,
    } as any, { onConflict: "user_id,module,source_key" });
  } catch {}
}

// ---------- Step 1: Warmup ----------
function WarmupStep({ warm, onDone }: { warm: Warm[]; onDone: () => void }) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const allDone = tapped.size >= warm.length;
  return (
    <div>
      <h3 className="text-base font-extrabold">🌈 词卡热身</h3>
      <p className="mt-1 text-xs text-muted-foreground">点一点每张卡片，听一听，再继续。</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {warm.map((w, i) => (
          <button
            key={i}
            onClick={() => { speak(w.w); setTapped(s => new Set(s).add(i)); }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border-2 p-4 text-center transition hover:-translate-y-0.5",
              tapped.has(i) ? "border-emerald-400 bg-emerald-50" : "border-border bg-background"
            )}
          >
            <Volume2 className="absolute right-2 top-2 size-3.5 text-muted-foreground" />
            <div className="text-lg font-extrabold">{w.w}</div>
            <div className="text-xs text-muted-foreground">{w.cn}</div>
          </button>
        ))}
      </div>
      <button
        onClick={onDone}
        disabled={!allDone}
        className={cn(
          "mt-5 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-sm font-extrabold text-white shadow-tile",
          !allDone && "opacity-50"
        )}
      >
        {allDone ? "下一步 →" : `先点完所有词（${tapped.size}/${warm.length}）`}
      </button>
    </div>
  );
}

// ---------- Step 2: Listen full ----------
function ListenStep({ sentences, onDone }: { sentences: Sentence[]; onDone: () => void }) {
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const cancelRef = useRef(false);

  async function playAll() {
    cancelRef.current = false;
    setPlaying(true);
    for (let i = 0; i < sentences.length; i++) {
      if (cancelRef.current) break;
      setActive(i);
      try { await speak(sentences[i].en); } catch {}
      await new Promise(r => setTimeout(r, 220));
    }
    setPlaying(false);
    setActive(-1);
    if (!cancelRef.current) setHasPlayed(true);
  }

  useEffect(() => () => { cancelRef.current = true; stopSpeaking(); }, []);

  return (
    <div>
      <h3 className="text-base font-extrabold">👀 句子朗读</h3>
      <p className="mt-1 text-xs text-muted-foreground">点 ▶︎ 自动播放整篇，跟着高亮的句子听。</p>
      <div className="mt-3 flex justify-center">
        <button
          onClick={playAll}
          disabled={playing}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2 text-sm font-extrabold text-white shadow"
        >
          <Play className="size-4 fill-white" /> {playing ? "播放中…" : "▶︎ 播放全篇"}
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {sentences.map((s, i) => (
          <button
            key={i}
            onClick={() => speak(s.en)}
            className={cn(
              "w-full rounded-2xl border-2 p-3 text-left transition",
              active === i ? "border-sky-400 bg-sky-50" : "border-border bg-background hover:border-sky-300"
            )}
          >
            <div className="flex items-start gap-2">
              <Volume2 className="mt-0.5 size-4 shrink-0 text-sky-500" />
              <div className="flex-1">
                <div className="text-sm font-bold">{s.en}</div>
                <div className="text-xs text-muted-foreground">{s.cn}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onDone}
        disabled={playing || !hasPlayed}
        className={cn(
          "mt-5 w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-3 text-sm font-extrabold text-white shadow-tile",
          (playing || !hasPlayed) && "opacity-50 cursor-not-allowed"
        )}
      >
        {playing ? "正在播放… 请听完整篇" : hasPlayed ? "下一步 →" : "请先点 ▶︎ 播放全篇"}
      </button>
    </div>
  );
}

// ---------- Step 3: Read along ----------
function ReadStep({ sentences, onDone }: { sentences: Sentence[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [readSet, setReadSet] = useState<Set<number>>(new Set());
  const cur = sentences[idx];
  const allRead = readSet.size >= sentences.length;

  // Mark as read immediately on click (user intent), then play TTS.
  // Keeping the speak() call synchronous in the gesture chain (no await
  // before it) ensures iOS Safari and Chrome autoplay policies allow it,
  // and TTS failures never block progress.
  const playAndMark = () => {
    setReadSet(s => {
      const next = new Set(s); next.add(idx); return next;
    });
    // Auto-advance to next sentence after a brief moment so user keeps flowing
    const isLast = idx >= sentences.length - 1;
    try { speak(cur.en); } catch {}
    if (!isLast) {
      window.setTimeout(() => setIdx(i => Math.min(sentences.length - 1, i + 1)), 800);
    }
  };

  return (
    <div>
      <h3 className="text-base font-extrabold">📣 跟我读</h3>
      <p className="mt-1 text-xs text-muted-foreground">先听一遍，再大声跟读。读过的会变成 ✓。</p>
      <div className="mt-4 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-center">
        <div className="text-xl font-extrabold sm:text-2xl">{cur.en}</div>
        <div className="mt-1 text-sm text-muted-foreground">{cur.cn}</div>
        <button
          onClick={playAndMark}
          className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-extrabold text-white shadow"
        >
          <Volume2 className="size-4" /> 听并标记已读
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx===0}
          className="rounded-full border px-4 py-2 text-xs font-bold disabled:opacity-40">← 上一句</button>
        <div className="text-xs text-muted-foreground">{idx+1} / {sentences.length} · 已读 {readSet.size}</div>
        <button onClick={() => setIdx(i => Math.min(sentences.length-1, i+1))} disabled={idx===sentences.length-1}
          className="rounded-full border px-4 py-2 text-xs font-bold disabled:opacity-40">下一句 →</button>
      </div>
      <button
        onClick={onDone}
        disabled={!allRead}
        className={cn(
          "mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-extrabold text-white shadow-tile",
          !allRead && "opacity-50"
        )}
      >
        {allRead ? "下一步 →" : `把每一句都读一遍（${readSet.size}/${sentences.length}）`}
      </button>
    </div>
  );
}

// ---------- Step 4: Think (questions) ----------
function ThinkStep({
  questions, onDone, onCorrect, onWrong, onAnswer,
}: { questions: Question[]; onDone: (correct: number) => void; onCorrect: (qIdx?: number) => void; onWrong: (q: Question) => void; onAnswer?: (q: Question, isCorrect: boolean, pickedIdx: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const q = questions[idx];

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const isC = i === q.answer;
    onAnswer?.(q, isC, i);
    if (isC) { setCorrect(c => c + 1); onCorrect(idx); }
    else { onWrong(q); }
    setTimeout(() => {
      if (idx + 1 >= questions.length) onDone(correct + (i === q.answer ? 1 : 0));
      else { setIdx(idx + 1); setPicked(null); }
    }, 900);
  };

  return (
    <div>
      <h3 className="text-base font-extrabold">🤔 理解小问 ({idx+1}/{questions.length})</h3>
      <div className="mt-3 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4">
        <div className="text-base font-extrabold">{q.q}</div>
        {q.q_cn && <div className="mt-1 text-xs text-muted-foreground">{q.q_cn}</div>}
      </div>
      <div className="mt-4 grid gap-2">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isAns = i === q.answer;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={picked !== null}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 p-3 text-left text-sm font-bold transition",
                picked === null && "border-border bg-background hover:border-violet-300",
                picked !== null && isAns && "border-emerald-400 bg-emerald-50",
                picked !== null && isPicked && !isAns && "border-rose-400 bg-rose-50",
                picked !== null && !isPicked && !isAns && "opacity-50"
              )}
            >
              <span>
                {opt}
                {q.options_cn && <span className="ml-2 text-xs text-muted-foreground">({q.options_cn[i]})</span>}
              </span>
              {picked !== null && isAns && <Check className="size-4 text-emerald-600" />}
              {picked !== null && isPicked && !isAns && <X className="size-4 text-rose-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Step 5: Treasure ----------
function TreasureStep({
  treasure, onDone, onCorrect,
}: { treasure: Treasure; onDone: (ok: boolean) => void; onCorrect: () => void }) {
  if (treasure.type === "build") return <BuildGame t={treasure} onDone={onDone} onCorrect={onCorrect} />;
  if (treasure.type === "order") return <OrderGame t={treasure} onDone={onDone} onCorrect={onCorrect} />;
  return <MatchGame t={treasure} onDone={onDone} onCorrect={onCorrect} />;
}

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function BuildGame({ t, onDone, onCorrect }: { t: Extract<Treasure, {type:"build"}>; onDone: (ok:boolean)=>void; onCorrect:()=>void }) {
  const pool = useMemo(() => shuffle(t.words), [t]);
  const [picked, setPicked] = useState<number[]>([]);
  const [done, setDone] = useState<null | boolean>(null);
  const built = picked.map(i => pool[i]).join(" ");
  const ok = built === t.sentence;

  const submit = () => {
    if (ok) onCorrect();
    setDone(ok);
    setTimeout(() => onDone(ok), 1200);
  };

  return (
    <div>
      <h3 className="text-base font-extrabold">🎁 宝藏关 · 拼一拼</h3>
      <p className="mt-1 text-xs text-muted-foreground">按正确顺序点击单词，组成一句话。</p>
      <div className={cn(
        "mt-3 min-h-[60px] rounded-2xl border-2 border-dashed p-3 text-center text-base font-bold",
        done === true && "border-emerald-400 bg-emerald-50 text-emerald-700",
        done === false && "border-rose-400 bg-rose-50 text-rose-700",
      )}>
        {built || <span className="text-muted-foreground">点下方单词…</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {pool.map((w, i) => {
          const used = picked.includes(i);
          return (
            <button
              key={i}
              disabled={used || done !== null}
              onClick={() => setPicked(p => [...p, i])}
              className={cn(
                "rounded-2xl border-2 px-4 py-2 text-sm font-extrabold transition",
                used ? "border-muted bg-muted text-muted-foreground opacity-40"
                     : "border-amber-300 bg-amber-50 hover:border-amber-500"
              )}
            >
              {w}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => setPicked([])} disabled={done !== null}
          className="flex-1 rounded-2xl border-2 border-border px-4 py-2 text-xs font-bold">清空</button>
        <button onClick={submit} disabled={picked.length !== pool.length || done !== null}
          className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-extrabold text-white disabled:opacity-50">提交</button>
      </div>
    </div>
  );
}

function OrderGame({ t, onDone, onCorrect }: { t: Extract<Treasure, {type:"order"}>; onDone: (ok:boolean)=>void; onCorrect:()=>void }) {
  const orig = t.sentences;
  const [pool, setPool] = useState(() => shuffle(orig));
  const [done, setDone] = useState<null | boolean>(null);
  const move = (from: number, to: number) => {
    const next = [...pool]; const [s] = next.splice(from, 1); next.splice(to, 0, s); setPool(next);
  };
  const submit = () => {
    const ok = pool.every((s, i) => s === orig[i]);
    if (ok) onCorrect();
    setDone(ok);
    setTimeout(() => onDone(ok), 1200);
  };
  return (
    <div>
      <h3 className="text-base font-extrabold">🎁 宝藏关 · 排一排</h3>
      <p className="mt-1 text-xs text-muted-foreground">按故事顺序整理这些句子。</p>
      <div className="mt-3 space-y-2">
        {pool.map((s, i) => (
          <div key={s} className={cn(
            "flex items-center gap-2 rounded-2xl border-2 bg-background p-3 text-sm font-bold",
            done === true && "border-emerald-400 bg-emerald-50",
            done === false && "border-rose-400 bg-rose-50",
            done === null && "border-border"
          )}>
            <span className="grid size-6 place-items-center rounded-full bg-amber-100 text-xs font-extrabold text-amber-700">{i+1}</span>
            <span className="flex-1">{s}</span>
            <button onClick={() => move(i, i-1)} disabled={i===0||done!==null} className="rounded border px-2 text-xs disabled:opacity-30">↑</button>
            <button onClick={() => move(i, i+1)} disabled={i===pool.length-1||done!==null} className="rounded border px-2 text-xs disabled:opacity-30">↓</button>
          </div>
        ))}
      </div>
      <button onClick={submit} disabled={done !== null}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50">提交</button>
    </div>
  );
}

function MatchGame({ t, onDone, onCorrect }: { t: Extract<Treasure, {type:"match"}>; onDone: (ok:boolean)=>void; onCorrect:()=>void }) {
  const lefts = t.pairs.map(p => p.en);
  const rights = useMemo(() => shuffle(t.pairs.map(p => p.cn)), [t]);
  const [pickedL, setPickedL] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string | null>(null);

  const onLeft = (en: string) => { if (matched[en]) return; setPickedL(en); };
  const onRight = (rcn: string) => {
    if (!pickedL) return;
    const correct = t.pairs.find(p => p.en === pickedL)?.cn === rcn;
    if (correct) {
      setMatched(m => ({ ...m, [pickedL]: rcn }));
      setPickedL(null);
      speak(pickedL);
    } else {
      setWrong(rcn); setTimeout(() => setWrong(null), 500);
    }
  };
  const allDone = Object.keys(matched).length === t.pairs.length;
  useEffect(() => { if (allDone) { onCorrect(); setTimeout(() => onDone(true), 900); } }, [allDone]);

  return (
    <div>
      <h3 className="text-base font-extrabold">🎁 宝藏关 · 配一配</h3>
      <p className="mt-1 text-xs text-muted-foreground">点左边英文，再点右边中文，配成一对。</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {lefts.map(en => (
            <button key={en} onClick={() => onLeft(en)}
              className={cn(
                "w-full rounded-xl border-2 p-3 text-left text-sm font-extrabold transition",
                matched[en] ? "border-emerald-400 bg-emerald-50 text-emerald-700" :
                pickedL === en ? "border-amber-500 bg-amber-50" : "border-border bg-background hover:border-amber-300"
              )}>
              {en}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rights.map(rcn => {
            const isMatched = Object.values(matched).includes(rcn);
            return (
              <button key={rcn} onClick={() => onRight(rcn)} disabled={isMatched}
                className={cn(
                  "w-full rounded-xl border-2 p-3 text-left text-sm font-bold transition",
                  isMatched ? "border-emerald-400 bg-emerald-50 text-emerald-700 opacity-60" :
                  wrong === rcn ? "border-rose-400 bg-rose-50 animate-pulse" :
                  "border-border bg-background hover:border-amber-300"
                )}>
                {rcn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Finish ----------
function FinishCard({ a, stars, accuracy, onRetry }: { a: Article; stars: number; accuracy: number; onRetry: () => void }) {
  return (
    <div className="rounded-3xl border-2 border-border bg-card p-6 text-center shadow-tile">
      <Trophy className="mx-auto size-14 text-amber-500" />
      <h3 className="mt-2 text-2xl font-extrabold">
        {stars === 3 ? "🌟 完美通关！" : stars === 2 ? "👍 很棒！" : "💪 再来一次！"}
      </h3>
      <div className="mt-2 text-3xl">
        {Array.from({length:3}).map((_,i)=>(<span key={i}>{i<stars?"⭐":"☆"}</span>))}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        准确率 {Math.round(accuracy*100)}% · 获得 +{stars*5} 星币
      </p>
      <button onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 text-sm font-extrabold text-white shadow">
        <RotateCw className="size-4" /> 再读一遍
      </button>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <BackLink to={`/primary/reading/grade/${a.grade}`}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-300 bg-white px-5 py-2 text-sm font-extrabold text-rose-600">
          <ArrowLeft className="size-4" /> 返回阅读列表
        </BackLink>
        <Link to={`/primary/grade/${a.grade}`}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-white px-5 py-2 text-sm font-extrabold text-amber-700">
          🏠 年级首页
        </Link>
        <Link to="/pets"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-purple-300 bg-white px-5 py-2 text-sm font-extrabold text-purple-600">
          🐾 我的宠物
        </Link>
      </div>
    </div>
  );
}
