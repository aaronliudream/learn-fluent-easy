import { useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Volume2, Check, X, Loader2, Sparkles, Trophy, RotateCw, Zap, Brain, Headphones, Music, Keyboard, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { bumpVocabMastery, recordAttempt } from "@/lib/gaokaoMastery";
import { awardCoins, notifyWrong } from "@/lib/coins";
import { cn } from "@/lib/utils";
import WordBento from "@/components/WordBento";
import WordQuest from "@/components/WordQuest";
import WordDuel from "@/components/WordDuel";
import MemoryMatch from "@/components/MemoryMatch";

type Vocab = {
  id: string;
  word: string;
  phonetic: string | null;
  pos: string | null;
  meaning_cn: string;
  meaning_en: string | null;
  example_en: string | null;
  example_cn: string | null;
  star_level: number | null;
  theme: string | null;
  freq_rank: number | null;
};

type Mode = null | "classic" | "bento" | "quest" | "duel" | "match" | "dict";
const GROUP_SIZE = 20;

export default function JuniorVocab() {
  const [params, setParams] = useSearchParams();
  const grade = params.get("grade") ?? "1";
  const mode = (params.get("mode") as Mode) ?? null;
  const groupParam = Number(params.get("group") ?? "0");

  const [words, setWords] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // 入口可能传 1/2/3（初一/二/三 序号）或 7/8/9（Grade 7/8/9），统一映射到 7/8/9。
    const raw = Number(grade);
    const gradeNum = raw <= 3 ? raw + 6 : raw;
    // Grade 7 (初一) 使用专门导入的 junior_vocab 词库；其他年级暂时回退到 gaokao_vocab(stage=junior)
    const loader = gradeNum === 7
      ? supabase
          .from("junior_vocab")
          .select("id,word,phonetic,pos,meaning_cn,meaning_en,example_en,example_cn,star_level,theme,freq_rank")
          .eq("grade", 7)
          .order("freq_rank", { ascending: true, nullsFirst: false })
          .limit(2000)
      : supabase
          .from("gaokao_vocab")
          .select("id,word,phonetic,pos,meaning_cn,meaning_en,example_en,example_cn,star_level,theme,freq_rank")
          .eq("stage", "junior")
          .order("freq_rank", { ascending: true, nullsFirst: false })
          .limit(500);
    loader.then(({ data }) => {
      setWords((data ?? []) as Vocab[]);
      setLoading(false);
    });
  }, [grade]);

  const rawGrade = Number(grade);
  const displayGrade = rawGrade <= 3 ? rawGrade : rawGrade - 6;
  const groups = useMemo(() => {
    const out: Vocab[][] = [];
    for (let i = 0; i < words.length; i += GROUP_SIZE) out.push(words.slice(i, i + GROUP_SIZE));
    return out;
  }, [words]);
  const groupIdx = Number.isFinite(groupParam) ? groupParam - 1 : -1;
  const activePool = groupIdx >= 0 && groupIdx < groups.length ? groups[groupIdx] : words;

  const exit = () => {
    const np = new URLSearchParams(params);
    np.delete("mode");
    setParams(np);
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> 加载中…
        </div>
      </main>
    );
  }

  if (mode === "bento") return <WordBento pool={activePool} onExit={exit} />;
  if (mode === "quest") return <WordQuest pool={activePool} onExit={exit} />;
  if (mode === "duel") return <WordDuel pool={activePool} onExit={exit} />;
  if (mode === "match") return <MemoryMatchWrapper pool={activePool} onExit={exit} />;
  if (mode === "dict") return <DictationSession pool={activePool} onExit={exit} />;
  if (mode === "classic") return <ClassicQuiz pool={activePool} onExit={exit} />;

  if (groupIdx >= 0 && groupIdx < groups.length) {
    return <JuniorWordGroup group={groups[groupIdx]} groupNumber={groupIdx + 1} grade={displayGrade} onExit={() => setParams({ grade })} onPractice={(m) => { const np = new URLSearchParams(params); np.set("mode", m); setParams(np); }} />;
  }

  return <JuniorVocabHub words={words} groups={groups} grade={displayGrade} onPick={(m) => { const np = new URLSearchParams(params); np.set("mode", m); setParams(np); }} onPickGroup={(i) => setParams({ grade, group: String(i + 1) })} />;
}

/* -------------------- HUB -------------------- */
function JuniorVocabHub({ words, groups, grade, onPick, onPickGroup }: { words: Vocab[]; groups: Vocab[][]; grade: number; onPick: (m: Exclude<Mode, null>) => void; onPickGroup: (i: number) => void }) {
  const [studiedCount, setStudiedCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const games: { mode: Exclude<Mode, null>; icon: any; title: string; desc: string; gradient: string; badge?: string }[] = [
    { mode: "classic", icon: Brain, title: "智能选义", desc: "听音辨义 · 自动接入复习曲线", gradient: "from-emerald-500 to-teal-500", badge: "推荐" },
    { mode: "bento", icon: Sparkles, title: "单词便当", desc: "6×4 翻牌速配 · 训练反应力", gradient: "from-rose-500 to-orange-500" },
    { mode: "quest", icon: Trophy, title: "单词任务", desc: "每日 3 词 · 多关卡彻底掌握一个词", gradient: "from-amber-500 to-yellow-500" },
    { mode: "duel", icon: Zap, title: "单词对决", desc: "60 秒高速答题 · 拼连击拿高分", gradient: "from-fuchsia-500 to-pink-500" },
    { mode: "match", icon: Music, title: "记忆翻牌", desc: "图音中英匹配 · 经典训练法", gradient: "from-sky-500 to-blue-500" },
    { mode: "dict", icon: Keyboard, title: "听写挑战", desc: "听音拼词 · 锁定拼写细节", gradient: "from-violet-500 to-indigo-500" },
  ];

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || words.length === 0) return;
      const ids = words.map((w) => w.id);
      const { data: studied } = await supabase
        .from("gaokao_user_mastery")
        .select("item_id,due_at,next_review_at")
        .eq("user_id", user.id)
        .eq("item_type", "vocab")
        .in("item_id", ids);
      const now = Date.now();
      setStudiedCount(studied?.length ?? 0);
      setDueCount((studied ?? []).filter((m: any) => {
        const due = m.due_at ?? m.next_review_at;
        return due && new Date(due).getTime() <= now;
      }).length);
    })();
  }, [words]);

  const pct = Math.round((studiedCount / Math.max(1, words.length)) * 100);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to={`/junior/g/${grade}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回初{grade}
      </BackLink>

      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">CORE VOCABULARY · 初{grade}</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">初中核心词汇 · 游戏中心</h1>
        <p className="mt-1 text-xs text-muted-foreground">中考新课标 · 共 {words.length} 词 · 6 种游戏化训练，彻底掌握每个单词</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.mode}
              onClick={() => onPick(g.mode)}
              className={cn(
                "relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5",
                g.gradient,
              )}
            >
              <span className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-5" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold">{g.title}</span>
                  {g.badge && (
                    <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">{g.badge}</span>
                  )}
                </div>
                <div className="mt-0.5 text-xs opacity-90">{g.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border/60 bg-card p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <BarChart3 className="size-4 text-primary" /> 全部游戏数据自动接入智能复习
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>答对：金币 +2，宠物经验自动累计</li>
          <li>答错：自动进错题本，下次优先复习</li>
          <li>每天通过任意 3 个游戏即可深度记住一组单词</li>
        </ul>
      </div>
    </main>
  );
}

/* -------------------- CLASSIC QUIZ -------------------- */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ClassicQuiz({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const queue = useMemo(() => shuffle(pool).slice(0, 20), [pool]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const cur = queue[idx];

  const options = useMemo(() => {
    if (!cur) return [];
    const distractors = shuffle(pool.filter((w) => w.id !== cur.id))
      .slice(0, 3)
      .map((w) => w.meaning_cn);
    return shuffle([cur.meaning_cn, ...distractors]);
  }, [cur, pool]);

  if (!cur) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </button>
        <p className="text-sm text-muted-foreground">暂无可用单词</p>
      </main>
    );
  }

  if (idx >= queue.length) {
    const pct = Math.round((score.correct / Math.max(1, score.total)) * 100);
    if (typeof window !== "undefined" && !(queue as any).__rewarded) {
      (queue as any).__rewarded = true;
      const bonus = pct === 100 ? 20 : 5;
      awardCoins(bonus, "junior_vocab_finish").catch(() => {});
    }
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold">{pct >= 90 ? "🌟 太棒了！" : pct >= 70 ? "👍 不错！" : "💪 继续加油！"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">答对 {score.correct} / {score.total}（{pct}%）</p>
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={onExit} className="rounded-full border border-border px-5 py-2 text-sm font-bold">返回中心</button>
            <button
              onClick={() => { (queue as any).__rewarded = false; setIdx(0); setPicked(null); setScore({ correct: 0, total: 0 }); }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
            >
              <RotateCw className="size-4" /> 再来一组
            </button>
          </div>
        </div>
      </main>
    );
  }

  const onPickAns = async (m: string) => {
    if (picked) return;
    setPicked(m);
    const correct = m === cur.meaning_cn;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    speak(cur.word);
    if (correct) awardCoins(2, "junior_vocab_correct").catch(() => {});
    else notifyWrong();
    await Promise.all([
      bumpVocabMastery({ vocabId: cur.id, isCorrect: correct, kind: "en2cn" }).catch(() => {}),
      recordAttempt({ questionType: "vocab", questionId: cur.id, userAnswer: m, isCorrect: correct }).catch(() => {}),
    ]);
    setTimeout(() => { setPicked(null); setIdx((i) => i + 1); }, 900);
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回游戏中心
      </button>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>第 {idx + 1} / {queue.length} 题</span>
          <span className="font-bold">✅ {score.correct} / {score.total}</span>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">请选择正确的中文意思</div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-3xl font-black md:text-4xl">{cur.word}</span>
            <button onClick={() => speak(cur.word)} className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
              <Volume2 className="size-5" />
            </button>
          </div>
          {cur.phonetic && <div className="mt-1 font-mono text-sm text-muted-foreground">{cur.phonetic}</div>}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((m) => {
            const isCorrect = m === cur.meaning_cn;
            const showRight = picked && isCorrect;
            const showWrong = picked === m && !isCorrect;
            return (
              <button
                key={m}
                onClick={() => onPickAns(m)}
                disabled={!!picked}
                className={cn(
                  "flex items-center justify-between rounded-2xl border-2 p-4 text-left text-sm font-bold transition",
                  showRight && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
                  showWrong && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40",
                  !picked && "border-border bg-card hover:border-primary/40",
                  picked && !showRight && !showWrong && "opacity-60",
                )}
              >
                <span>{m}</span>
                {showRight && <Check className="size-5" />}
                {showWrong && <X className="size-5" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="size-3" /> 答题数据已自动接入智能复习系统
        </div>
      </div>
    </main>
  );
}

/* -------------------- MEMORY MATCH WRAPPER --------------------
   MemoryMatch 组件签名可能不同；用一个简化的本地实现保证可用 */
function MemoryMatchWrapper({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const PAIRS = 8;
  const initial = useMemo(() => {
    const sample = shuffle(pool.filter((v) => v.word && v.meaning_cn)).slice(0, PAIRS);
    const cards = sample.flatMap((v, i) => [
      { key: `${i}-en`, pairId: v.id, side: "en" as const, text: v.word },
      { key: `${i}-cn`, pairId: v.id, side: "cn" as const, text: v.meaning_cn },
    ]);
    return shuffle(cards);
  }, [pool]);

  const [cards] = useState(initial);
  const [opened, setOpened] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);

  const onClick = (key: string, pairId: string) => {
    if (lock.current || matched.has(pairId) || opened.includes(key)) return;
    const next = [...opened, key];
    setOpened(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((k) => cards.find((c) => c.key === k)!);
      if (a.pairId === b.pairId) {
        setMatched((s) => new Set(s).add(a.pairId));
        setOpened([]);
        speak(cards.find((c) => c.pairId === a.pairId && c.side === "en")!.text);
        awardCoins(3, "junior_match").catch(() => {});
      } else {
        lock.current = true;
        setTimeout(() => { setOpened([]); lock.current = false; }, 700);
      }
    }
    if (cards.find((c) => c.key === key)?.side === "en") {
      speak(cards.find((c) => c.key === key)!.text);
    }
  };

  const done = matched.size === PAIRS;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回游戏中心
      </button>
      <h2 className="text-xl font-extrabold">🃏 记忆翻牌</h2>
      <p className="mt-1 text-xs text-muted-foreground">配对 {PAIRS} 对单词与中文 · 已配对 {matched.size}/{PAIRS} · 步数 {moves}</p>

      {done ? (
        <div className="mt-6 rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Trophy className="mx-auto size-12 text-amber-500" />
          <h3 className="mt-2 text-xl font-extrabold">完美通关！</h3>
          <p className="mt-1 text-sm text-muted-foreground">用了 {moves} 步</p>
          <button onClick={onExit} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">返回</button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {cards.map((c) => {
            const isOpen = opened.includes(c.key) || matched.has(c.pairId);
            return (
              <button
                key={c.key}
                onClick={() => onClick(c.key, c.pairId)}
                className={cn(
                  "aspect-[3/4] rounded-xl border-2 p-2 text-center text-xs font-bold transition",
                  matched.has(c.pairId) ? "border-emerald-400 bg-emerald-50 text-emerald-700 opacity-70 dark:bg-emerald-950/40"
                    : isOpen ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-gradient-to-br from-violet-500 to-indigo-600 text-transparent hover:from-violet-400 hover:to-indigo-500",
                )}
              >
                {isOpen ? c.text : "?"}
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}

/* -------------------- DICTATION -------------------- */
function DictationSession({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const queue = useMemo(() => shuffle(pool.filter((v) => v.word && !/[\/\s]/.test(v.word))).slice(0, 15), [pool]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"" | "right" | "wrong">("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const cur = queue[idx];

  useEffect(() => { if (cur) speak(cur.word); }, [cur?.id]);

  if (!cur) return <main className="p-8"><p className="text-sm text-muted-foreground">暂无可用单词</p></main>;

  if (idx >= queue.length) {
    const pct = Math.round((score.correct / Math.max(1, score.total)) * 100);
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-10">
        <div className="rounded-3xl border border-border/60 bg-card p-8 text-center">
          <Headphones className="mx-auto size-12 text-primary" />
          <h3 className="mt-2 text-xl font-extrabold">听写完成</h3>
          <p className="mt-1 text-sm text-muted-foreground">{score.correct} / {score.total}（{pct}%）</p>
          <button onClick={onExit} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">返回中心</button>
        </div>
      </main>
    );
  }

  const submit = async () => {
    if (feedback) return;
    const ok = input.trim().toLowerCase() === cur.word.trim().toLowerCase();
    setFeedback(ok ? "right" : "wrong");
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) awardCoins(3, "junior_vocab_dict").catch(() => {});
    else notifyWrong();
    await Promise.all([
      bumpVocabMastery({ vocabId: cur.id, isCorrect: ok, kind: "spell" }).catch(() => {}),
      recordAttempt({ questionType: "vocab", questionId: cur.id, userAnswer: input, isCorrect: ok }).catch(() => {}),
    ]);
    setTimeout(() => { setInput(""); setFeedback(""); setIdx((i) => i + 1); }, 1200);
  };

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回游戏中心
      </button>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>第 {idx + 1} / {queue.length}</span>
          <span className="font-bold">✅ {score.correct} / {score.total}</span>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
          <button onClick={() => speak(cur.word)} className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-primary-foreground">
            <Volume2 className="size-7" />
          </button>
          <p className="mt-3 text-sm text-muted-foreground">中文：{cur.meaning_cn}</p>
        </div>
        <div className="space-y-2">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            disabled={!!feedback}
            placeholder="拼写单词后回车"
            className={cn(
              "w-full rounded-2xl border-2 px-4 py-3 text-center text-lg font-extrabold tracking-wide outline-none transition",
              feedback === "right" && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40",
              feedback === "wrong" && "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40",
              !feedback && "border-border bg-card focus:border-primary",
            )}
          />
          {feedback === "wrong" && (
            <p className="text-center text-xs font-bold text-rose-600">正确拼写：{cur.word}</p>
          )}
          <button onClick={submit} disabled={!!feedback || !input.trim()} className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
            提交
          </button>
        </div>
      </div>
    </main>
  );
}
