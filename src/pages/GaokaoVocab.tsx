import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, X, Volume2, Sparkles, BookOpen, Target, RotateCw, ChevronRight, Brain, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { speak } from "@/lib/speak";
import { bumpMastery, recordAttempt } from "@/lib/gaokaoMastery";
import { cn } from "@/lib/utils";

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
  accent: "UK" | "US" | "BOTH" | null;
};
/* ---------- Accent helpers ---------- */
function speakWord(v: Vocab) {
  // Some words are stored with slashes (e.g. "a/an"); only speak the first form.
  const text = v.word.split("/")[0];
  const acc = v.accent === "UK" || v.accent === "US" ? v.accent : undefined;
  return speak(text, acc ? { accent: acc } : undefined);
}

function speakExample(v: Vocab) {
  if (!v.example_en) return Promise.resolve();
  const acc = v.accent === "UK" || v.accent === "US" ? v.accent : undefined;
  return speak(v.example_en, acc ? { accent: acc } : undefined);
}

function AccentBadge({ accent }: { accent: Vocab["accent"] }) {
  if (accent !== "UK" && accent !== "US") return null;
  const isUS = accent === "US";
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
        isUS
          ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
          : "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
      )}
      title={isUS ? "美式发音" : "英式发音"}
    >
      {isUS ? "🇺🇸 US" : "🇬🇧 UK"}
    </span>
  );
}

const GROUP_SIZE = 20;

type Phase = "flashcard" | "quiz" | "done";
type QuizKind = "en2cn" | "cn2en" | "listen" | "cloze" | "en2en" | "en2word";
type QuizItem = { vocab: Vocab; kind: QuizKind; choices: Vocab[] };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickKind(v: Vocab): QuizKind {
  const kinds: QuizKind[] = ["en2cn", "cn2en"];
  if (v.example_en) kinds.push("listen", "cloze");
  if (v.meaning_en) kinds.push("en2en", "en2word");
  return kinds[Math.floor(Math.random() * kinds.length)];
}

function buildClozeBlank(sentence: string, word: string): { masked: string; answer: string } {
  // Match the word ignoring case, prefer whole word
  const re = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\w*)\\b`, "i");
  const m = sentence.match(re);
  const answer = m ? m[1] : word;
  const masked = sentence.replace(re, "_____");
  return { masked, answer };
}

export default function GaokaoVocab() {
  const [params, setParams] = useSearchParams();
  const groupParam = params.get("group");
  const mode = params.get("mode"); // "srs" for smart review
  const groupIdx = groupParam ? parseInt(groupParam, 10) - 1 : -1;

  const [allVocab, setAllVocab] = useState<Vocab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("gaokao_vocab")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("word", { ascending: true });
      setAllVocab((data ?? []) as Vocab[]);
      setLoading(false);
    })();
  }, []);

  const groups = useMemo(() => {
    const out: Vocab[][] = [];
    for (let i = 0; i < allVocab.length; i += GROUP_SIZE) out.push(allVocab.slice(i, i + GROUP_SIZE));
    return out;
  }, [allVocab]);

  if (loading) return <p className="p-8 text-sm text-muted-foreground">加载中...</p>;

  if (mode === "srs") {
    return <SrsReviewSession pool={allVocab} onExit={() => setParams({})} />;
  }

  if (groupIdx < 0 || groupIdx >= groups.length) {
    return (
      <GroupList
        groups={groups}
        pool={allVocab}
        onPick={(i) => setParams({ group: String(i + 1) })}
        onStartSrs={() => setParams({ mode: "srs" })}
      />
    );
  }

  return (
    <GroupSession
      group={groups[groupIdx]}
      groupNumber={groupIdx + 1}
      pool={allVocab}
      onExit={() => setParams({})}
    />
  );
}

/* ---------- Group list ---------- */
function GroupList({
  groups,
  pool,
  onPick,
  onStartSrs,
}: {
  groups: Vocab[][];
  pool: Vocab[];
  onPick: (i: number) => void;
  onStartSrs: () => void;
}) {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [studiedCount, setStudiedCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDueCount(0);
        return;
      }
      const nowIso = new Date().toISOString();
      const { data: due } = await supabase
        .from("gaokao_user_mastery")
        .select("item_id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("item_type", "vocab")
        .lte("next_review_at", nowIso);
      setDueCount(due?.length ?? 0);
      const { data: studied } = await supabase
        .from("gaokao_user_mastery")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("item_type", "vocab");
      setStudiedCount(studied?.length ?? 0);
    })();
  }, [pool.length]);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <Link to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回高考英语
      </Link>
      <PageHeader
        title="高考词汇 3500"
        subtitle={`共 ${groups.length} 组 · 每组 ${GROUP_SIZE} 词 · 闪卡 + 测试 + SRS 复习`}
      />

      {/* SRS Smart Review Card — top priority entry */}
      <button
        onClick={onStartSrs}
        disabled={dueCount === 0}
        className={cn(
          "mt-6 group block w-full rounded-3xl border-2 p-5 text-left shadow-tile transition",
          dueCount && dueCount > 0
            ? "border-primary bg-gradient-to-br from-primary/15 via-primary/5 to-transparent hover:border-primary hover:shadow-md"
            : "border-border bg-muted/30 opacity-70 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex size-14 shrink-0 items-center justify-center rounded-2xl",
            dueCount && dueCount > 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            <Brain className="size-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold">🧠 智能复习</span>
              {dueCount !== null && dueCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                  <Flame className="size-3" /> 今日 {dueCount} 词待复习
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {dueCount === null
                ? "加载中…"
                : dueCount === 0
                ? studiedCount === 0
                  ? "先学一组单词，系统会按艾宾浩斯曲线安排复习"
                  : `已学 ${studiedCount} 词 · 今日没有到期单词，明天再来`
                : `已学 ${studiedCount} 词 · Anki SM-2 算法 · 答错重学，答对延后`}
            </div>
          </div>
          {dueCount && dueCount > 0 ? (
            <ChevronRight className="size-5 text-primary" />
          ) : null}
        </div>
      </button>

      <div className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        所有词组
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {groups.map((g, i) => (
          <button
            key={i}
            onClick={() => onPick(i)}
            className="group rounded-2xl border bg-card p-4 text-left shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">第 {i + 1} 组</div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="mt-2 truncate text-sm font-bold">{g[0]?.word}</div>
            <div className="truncate text-xs text-muted-foreground">→ {g[g.length - 1]?.word}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">{g.length} 词</div>
          </button>
        ))}
      </div>
    </main>
  );
}

/* ---------- Single group session ---------- */
function GroupSession({
  group,
  groupNumber,
  pool,
  onExit,
}: {
  group: Vocab[];
  groupNumber: number;
  pool: Vocab[];
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("flashcard");
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回组列表
      </button>

      <div className="mb-4 flex items-center gap-2 text-xs">
        <PhaseChip active={phase === "flashcard"} icon={<BookOpen className="size-3" />} label="闪卡" />
        <ChevronRight className="size-3 text-muted-foreground" />
        <PhaseChip active={phase === "quiz"} icon={<Target className="size-3" />} label="测试" />
        <ChevronRight className="size-3 text-muted-foreground" />
        <PhaseChip active={phase === "done"} icon={<Sparkles className="size-3" />} label="复习" />
      </div>

      <PageHeader title={`第 ${groupNumber} 组 · ${group.length} 词`} subtitle={phaseSubtitle(phase)} />

      {phase === "flashcard" && (
        <FlashcardPhase group={group} onDone={() => setPhase("quiz")} />
      )}
      {phase === "quiz" && (
        <QuizPhase
          group={group}
          pool={pool}
          onDone={(s) => {
            setStats(s);
            setPhase("done");
          }}
        />
      )}
      {phase === "done" && (
        <DonePanel stats={stats} onExit={onExit} onRetry={() => setPhase("flashcard")} />
      )}
    </main>
  );
}

function phaseSubtitle(p: Phase) {
  if (p === "flashcard") return "阶段 1：先认识单词，点单词可朗读";
  if (p === "quiz") return "阶段 2：多种题型测试，答错的会重复出现";
  return "阶段 3：本组完成，已加入 SRS 复习队列";
}

function PhaseChip({ active, icon, label }: { active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs",
        active ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border text-muted-foreground"
      )}
    >
      {icon} {label}
    </span>
  );
}

/* ---------- Phase 1: Flashcards ---------- */
function FlashcardPhase({ group, onDone }: { group: Vocab[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const v = group[idx];

  useEffect(() => {
    if (v) speakWord(v);
    setFlipped(false);
  }, [idx, v?.id]);

  if (!v) return null;

  const next = () => {
    if (idx + 1 >= group.length) onDone();
    else setIdx(idx + 1);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{idx + 1} / {group.length}</span>
        <button onClick={onDone} className="hover:text-foreground">跳过 →</button>
      </div>
      <div
        className="min-h-[280px] cursor-pointer rounded-3xl border bg-card p-8 text-center shadow-tile transition hover:shadow-md"
        onClick={() => setFlipped((f) => !f)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); speakWord(v); }}
          className="mx-auto inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight"
        >
          {v.word} <Volume2 className="size-5 text-primary" />
        </button>
        {v.phonetic && (
          <div className="mt-1 inline-flex items-center text-sm text-muted-foreground">
            {v.phonetic}
            <AccentBadge accent={v.accent} />
          </div>
        )}
        {v.pos && <div className="mt-1 text-xs text-muted-foreground">{v.pos}</div>}

        {flipped ? (
          <div className="mt-6 space-y-3 text-left">
            <div className="rounded-xl bg-muted/50 p-3 text-base font-medium">{v.meaning_cn}</div>
            {v.example_en && (
              <button
                onClick={(e) => { e.stopPropagation(); speakExample(v); }}
                className="block w-full rounded-xl border p-3 text-left text-sm hover:bg-accent/30"
              >
                <div className="flex items-start gap-2">
                  <Volume2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <div>{v.example_en}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{v.example_cn}</div>
                  </div>
                </div>
              </button>
            )}
          </div>
        ) : (
          <div className="mt-10 text-xs text-muted-foreground">点卡片翻面查看释义和例句</div>
        )}
      </div>
      <Button className="mt-4 w-full" size="lg" onClick={next}>
        {idx + 1 >= group.length ? "开始测试 →" : "下一个 →"}
      </Button>
    </div>
  );
}

/* ---------- Phase 2: Quiz ---------- */
function QuizPhase({
  group,
  pool,
  onDone,
}: {
  group: Vocab[];
  pool: Vocab[];
  onDone: (s: { correct: number; total: number }) => void;
}) {
  // Build initial queue: each word once, random kind
  const [queue, setQueue] = useState<QuizItem[]>(() => buildInitialQueue(group, pool));
  const [pos, setPos] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const item = queue[pos];

  if (!item) {
    // shouldn't happen mid-flight; finish
    onDone(stats);
    return null;
  }

  const handleResult = async (isCorrect: boolean) => {
    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    await recordAttempt({ questionType: "vocab", questionId: item.vocab.id, isCorrect });
    await bumpMastery({ itemType: "vocab", itemId: item.vocab.id, isCorrect });

    let nextQueue = queue;
    if (!isCorrect) {
      // re-insert a different kind of the same word ~3 ahead
      const newKind = pickKind(item.vocab);
      const reinsertIdx = Math.min(queue.length, pos + 3);
      nextQueue = [...queue];
      nextQueue.splice(reinsertIdx, 0, {
        vocab: item.vocab,
        kind: newKind,
        choices: buildChoices(item.vocab, pool),
      });
      setQueue(nextQueue);
    }

    if (pos + 1 >= nextQueue.length) {
      onDone({
        correct: stats.correct + (isCorrect ? 1 : 0),
        total: stats.total + 1,
      });
    } else {
      setPos(pos + 1);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{pos + 1} / {queue.length}</span>
        <span>✓ {stats.correct} / {stats.total}</span>
      </div>
      <QuizQuestion key={`${item.vocab.id}-${pos}`} item={item} onResult={handleResult} />
    </div>
  );
}

function buildChoices(target: Vocab, pool: Vocab[]): Vocab[] {
  const distractors = shuffle(pool.filter((p) => p.id !== target.id)).slice(0, 3);
  return shuffle([target, ...distractors]);
}

function buildInitialQueue(group: Vocab[], pool: Vocab[]): QuizItem[] {
  return shuffle(group).map((v) => ({
    vocab: v,
    kind: pickKind(v),
    choices: buildChoices(v, pool),
  }));
}

/* ---------- Quiz question renderer ---------- */
function QuizQuestion({ item, onResult }: { item: QuizItem; onResult: (ok: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [clozeInput, setClozeInput] = useState("");
  const [clozeChecked, setClozeChecked] = useState<null | boolean>(null);
  const v = item.vocab;

  // Auto-play audio for "listen" type
  useEffect(() => {
    if (item.kind === "listen" && v.example_en) {
      const t = setTimeout(() => speakExample(v), 200);
      return () => clearTimeout(t);
    }
    // Auto-play the word for English→Chinese & cloze questions so the
    // student hears the pronunciation as soon as the question appears.
    if (item.kind === "en2cn" || item.kind === "cloze") {
      const t = setTimeout(() => speakWord(v), 200);
      return () => clearTimeout(t);
    }
  }, [item.kind, v.id]);

  if (item.kind === "cloze" && v.example_en) {
    const { masked, answer } = buildClozeBlank(v.example_en, v.word);
    const onCheck = () => {
      const ok = clozeInput.trim().toLowerCase() === answer.toLowerCase();
      setClozeChecked(ok);
      if (ok) {
        // ✅ User-required: speak full sentence on correct
        speakExample(v);
      }
    };
    return (
      <div className="rounded-3xl border bg-card p-6 shadow-tile">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">例句填空</div>
          <button onClick={() => speakWord(v)} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            <Volume2 className="size-3" /> 听单词
            <AccentBadge accent={v.accent} />
          </button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">{v.meaning_cn} · {v.pos}</div>
        <div className="mt-4 rounded-xl bg-muted/40 p-4 text-base leading-relaxed">{masked}</div>
        <input
          type="text"
          autoFocus
          value={clozeInput}
          onChange={(e) => setClozeInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && clozeChecked === null) onCheck(); }}
          disabled={clozeChecked !== null}
          placeholder="输入单词"
          className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-base focus:border-primary focus:outline-none disabled:opacity-70"
        />
        {clozeChecked === null ? (
          <Button className="mt-4 w-full" size="lg" onClick={onCheck} disabled={!clozeInput.trim()}>
            检查
          </Button>
        ) : (
          <div className="mt-4 space-y-3">
            <div
              className={cn(
                "rounded-xl p-3 text-sm",
                clozeChecked ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"
              )}
            >
              {clozeChecked ? "✓ 正确！正在朗读完整例句…" : `✗ 正确答案：${answer}`}
            </div>
            <button
              onClick={() => speakExample(v)}
              className="flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm hover:bg-accent/30"
            >
              <Volume2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <div>{v.example_en}</div>
                <div className="mt-1 text-xs text-muted-foreground">{v.example_cn}</div>
              </div>
            </button>
            <Button className="w-full" size="lg" onClick={() => onResult(clozeChecked)}>
              继续 →
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Choice-based questions
  const renderPrompt = () => {
    if (item.kind === "en2cn") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">选择中文释义</div>
          <button
            onClick={() => speakWord(v)}
            className="mt-2 inline-flex items-center gap-2 text-3xl font-extrabold"
          >
            {v.word} <Volume2 className="size-5 text-primary" />
          </button>
          {v.phonetic && (
            <div className="mt-1 inline-flex items-center text-sm text-muted-foreground">
              {v.phonetic}
              <AccentBadge accent={v.accent} />
            </div>
          )}
        </>
      );
    }
    if (item.kind === "cn2en") {
      return (
        <>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">选择英文单词</div>
          <div className="mt-3 text-2xl font-bold">{v.meaning_cn}</div>
          {v.pos && <div className="mt-1 text-xs text-muted-foreground">{v.pos}</div>}
        </>
      );
    }
    // listen
    return (
      <>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">听例句选单词</div>
        <button
          onClick={() => speakExample(v)}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-3 text-primary"
        >
          <Volume2 className="size-5" /> 再听一次
        </button>
        <div className="mt-3 text-xs text-muted-foreground">{v.meaning_cn}</div>
      </>
    );
  };

  const renderChoiceLabel = (c: Vocab) => {
    if (item.kind === "en2cn") return c.meaning_cn;
    return c.word;
  };

  const onPick = (c: Vocab) => {
    if (picked) return;
    setPicked(c.id);
    const ok = c.id === v.id;
    if (ok && item.kind === "cn2en") speakWord(v);
    setTimeout(() => onResult(ok), 900);
  };

  return (
    <div className="rounded-3xl border bg-card p-6 text-center shadow-tile">
      {renderPrompt()}
      <div className="mt-6 grid grid-cols-1 gap-2">
        {item.choices.map((c) => {
          const isPicked = picked === c.id;
          const isCorrect = c.id === v.id;
          const showState = picked !== null;
          return (
            <button
              key={c.id}
              onClick={() => onPick(c)}
              disabled={picked !== null}
              className={cn(
                "rounded-xl border bg-background px-4 py-3 text-left text-sm transition",
                !showState && "hover:border-primary hover:bg-accent/30",
                showState && isCorrect && "border-green-500 bg-green-500/10",
                showState && isPicked && !isCorrect && "border-red-500 bg-red-500/10",
                showState && !isPicked && !isCorrect && "opacity-60"
              )}
            >
              <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {String.fromCharCode(65 + item.choices.indexOf(c))}
              </span>
              {renderChoiceLabel(c)}
              {showState && isCorrect && <Check className="ml-2 inline size-4 text-green-600" />}
              {showState && isPicked && !isCorrect && <X className="ml-2 inline size-4 text-red-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Done panel ---------- */
function DonePanel({
  stats,
  onExit,
  onRetry,
}: {
  stats: { correct: number; total: number };
  onExit: () => void;
  onRetry: () => void;
}) {
  const pct = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
  return (
    <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
      <Sparkles className="mx-auto size-10 text-primary" />
      <div className="mt-3 text-xl font-extrabold">本组完成 🎉</div>
      <div className="mt-2 text-sm text-muted-foreground">
        正确率 <span className="font-bold text-foreground">{pct}%</span> · {stats.correct} / {stats.total}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">答错的词已加入复习队列，将按艾宾浩斯曲线自动安排复习</div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onRetry}>
          <RotateCw className="mr-1 size-4" /> 再练一遍
        </Button>
        <Button onClick={onExit}>选下一组 →</Button>
      </div>
    </div>
  );
}

/* ---------- SRS Smart Review Session ---------- */
function SrsReviewSession({ pool, onExit }: { pool: Vocab[]; onExit: () => void }) {
  const [loading, setLoading] = useState(true);
  const [dueWords, setDueWords] = useState<Vocab[]>([]);
  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [pos, setPos] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || pool.length === 0) {
        setLoading(false);
        return;
      }
      const nowIso = new Date().toISOString();
      const { data: dueRows } = await supabase
        .from("gaokao_user_mastery")
        .select("item_id, wrong_count")
        .eq("user_id", user.id)
        .eq("item_type", "vocab")
        .lte("next_review_at", nowIso)
        .order("wrong_count", { ascending: false })
        .limit(30);
      const idSet = new Set((dueRows ?? []).map((r) => r.item_id as string));
      const words = pool.filter((v) => idSet.has(v.id));
      const shuffled = shuffle(words);
      setDueWords(shuffled);
      setQueue(
        shuffled.map((v) => ({
          vocab: v,
          kind: pickKind(v),
          choices: buildChoices(v, pool),
        }))
      );
      setLoading(false);
    })();
  }, [pool]);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <p className="text-sm text-muted-foreground">加载复习队列…</p>
      </main>
    );
  }

  if (dueWords.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </button>
        <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
          <Sparkles className="mx-auto size-10 text-primary" />
          <div className="mt-3 text-xl font-extrabold">今日无待复习 🎉</div>
          <div className="mt-2 text-sm text-muted-foreground">回去学习新的词组吧</div>
          <Button className="mt-6" onClick={onExit}>选词组学习 →</Button>
        </div>
      </main>
    );
  }

  const item = queue[pos];

  if (done || !item) {
    const pct = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
        <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> 返回
        </button>
        <div className="rounded-3xl border bg-card p-8 text-center shadow-tile">
          <Brain className="mx-auto size-10 text-primary" />
          <div className="mt-3 text-xl font-extrabold">复习完成 🧠✨</div>
          <div className="mt-2 text-sm text-muted-foreground">
            正确率 <span className="font-bold text-foreground">{pct}%</span> · {stats.correct} / {stats.total}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">下次复习时间已自动调整</div>
          <Button className="mt-6 w-full" onClick={onExit}>返回</Button>
        </div>
      </main>
    );
  }

  const handleResult = async (isCorrect: boolean) => {
    setStats((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    await recordAttempt({ questionType: "vocab", questionId: item.vocab.id, isCorrect });
    await bumpMastery({ itemType: "vocab", itemId: item.vocab.id, isCorrect });

    let nextQueue = queue;
    if (!isCorrect) {
      const newKind = pickKind(item.vocab);
      const reinsertIdx = Math.min(queue.length, pos + 3);
      nextQueue = [...queue];
      nextQueue.splice(reinsertIdx, 0, {
        vocab: item.vocab,
        kind: newKind,
        choices: buildChoices(item.vocab, pool),
      });
      setQueue(nextQueue);
    }

    if (pos + 1 >= nextQueue.length) {
      setDone(true);
    } else {
      setPos(pos + 1);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <button onClick={onExit} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 退出复习
      </button>
      <div className="mb-4 flex items-center gap-2">
        <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Brain className="size-3" /> 智能复习
        </div>
        <div className="text-xs text-muted-foreground">SM-2 间隔重复</div>
      </div>
      <PageHeader title="今日复习队列" subtitle="答对延后下次复习，答错明天再来" />
      <div className="mb-3 mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{pos + 1} / {queue.length}</span>
        <span>✓ {stats.correct} / {stats.total}</span>
      </div>
      <QuizQuestion key={`${item.vocab.id}-${pos}`} item={item} onResult={handleResult} />
    </main>
  );
}