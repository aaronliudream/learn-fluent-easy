import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Volume2, Eye, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { speak, prefetchTTS, prefetchTTSBatch } from "@/lib/speak";
import { T } from "@/i18n/T";
import {
  fetchDueReviews,
  gradeReview,
  type Grade,
  type ReviewCard,
} from "@/lib/srs";
import { supabase } from "@/integrations/supabase/client";
import { fireEmojiConfetti } from "@/lib/feedback";
import { toast } from "sonner";

/**
 * Daily spaced-repetition review. The learner sees a Chinese cue plus a
 * blanked-out source line, taps to hear the English, taps to reveal the
 * answer, then taps one of three buttons to grade themselves.
 * No typing — every interaction is a tap.
 */
const Review = () => {
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      const due = await fetchDueReviews(20);
      if (cancelled) return;
      setCards(due);
      setLoading(false);
      // Warm the CDN/localStorage cache for the WHOLE review queue up
      // front. Most phrases will resolve from a known CDN URL in
      // <200ms (or 0ms if seen before). By the time the user reaches
      // card #5, its mp3 is already in the browser's HTTP cache.
      prefetchTTSBatch(due.map((c) => c.phrase));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = cards[idx];

  // Pre-warm OpenAI TTS for the current card AND the next one as soon as
  // the card changes. By the time the user taps "听一下答案", the MP3 is
  // already cached, so playback is effectively instant — no 2–5 s wait
  // for OpenAI cold start, and no fallback to the browser's robotic
  // speech synthesis (which is what triggers the iOS Dynamic Island
  // "now playing" indicator).
  useEffect(() => {
    if (current?.phrase) prefetchTTS(current.phrase);
    const nextCard = cards[idx + 1];
    if (nextCard?.phrase) prefetchTTS(nextCard.phrase);
  }, [idx, cards, current?.phrase]);

  const grade = async (g: Grade) => {
    if (!current) return;
    await gradeReview(current, g);
    // 复习挂钩：Good +1, Easy +2 (Hard/Again 不发币但触发宠物失落)
    try {
      const m = await import("@/lib/coins");
      if (g === "easy") await m.awardCoins(2, "review_easy");
      else if (g === "good") await m.awardCoins(1, "review_good");
      else m.notifyWrong();
    } catch { /* noop */ }
    setDoneCount((c) => c + 1);
    setRevealed(false);
    if (idx + 1 < cards.length) {
      setIdx(idx + 1);
    } else {
      setSessionDone(true);
      fireEmojiConfetti({ count: 36 });
      toast.success("复习完成 🎉", { description: `今天又巩固了 ${cards.length} 个表达，明天见！` });
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={`✨ 复习时间`}
        subtitle="每天 5 分钟,复习这阵子学到的地道表达"
        back
      />

      {loading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />{" "}
          <T>正在准备今天的复习卡…</T>
        </div>
      )}

      {!loading && signedIn === false && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="text-sm text-muted-foreground">
            <T>登录后才能保存你的学习进度,系统会按遗忘曲线帮你复习。</T>
          </div>
          <Link
            to="/auth"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            <T>去登录</T>
          </Link>
        </div>
      )}

      {!loading && signedIn && cards.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            <CheckCircle2 className="size-7" />
          </div>
          <div className="text-base font-semibold text-foreground">
            <T>今天没有要复习的内容啦!</T>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            <T>去学几节新课,系统会自动帮你把重点表达加进复习队列。</T>
          </div>
        </div>
      )}

      {!loading && signedIn && sessionDone && (
        <div className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center">
          <div className="text-3xl font-extrabold text-primary">
            🎉 {doneCount}
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">
            <T>张卡片复习完成!</T>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            <T>明天再来挑战下一批。</T>
          </div>
        </div>
      )}

      {!loading && signedIn && !sessionDone && current && (
        <ReviewCardView
          key={current.id}
          card={current}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          onGrade={grade}
          progress={`${idx + 1} / ${cards.length}`}
        />
      )}
    </main>
  );
};

function blankSourceLine(line: string, phrase: string): string {
  const i = line.toLowerCase().indexOf(phrase.toLowerCase());
  if (i < 0) return line;
  return line.slice(0, i) + "____" + line.slice(i + phrase.length);
}

function ReviewCardView({
  card,
  revealed,
  onReveal,
  onGrade,
  progress,
}: {
  card: ReviewCard;
  revealed: boolean;
  onReveal: () => void;
  onGrade: (g: Grade) => void;
  progress: string;
}) {
  const sourceLine = card.source_line_en
    ? blankSourceLine(card.source_line_en, card.phrase)
    : null;

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span><T>今日复习</T></span>
        <span className="font-mono">{progress}</span>
      </div>

      {/* CN cue — the side a real human translator would start from. */}
      <div className="rounded-xl bg-primary/5 p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
          <T>这句中文里的关键表达,英文怎么说?</T>
        </div>
        {card.source_line_cn ? (
          <div className="mt-2 text-base font-semibold leading-relaxed text-foreground md:text-lg">
            {card.source_line_cn}
          </div>
        ) : null}
        {card.phrase_cn ? (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
            🔑 {card.phrase_cn}
          </div>
        ) : null}
      </div>

      {sourceLine ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-secondary/40 p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <T>英文原句(空格部分就是要回想的表达)</T>
          </div>
          <div className="mt-1.5 text-base leading-relaxed text-foreground md:text-lg">
            {sourceLine.split("____").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 ? (
                  <span className="mx-1 inline-block min-w-[80px] rounded-md border-b-2 border-primary/60 bg-primary/5 px-2 align-middle font-bold text-primary">
                    {revealed ? card.phrase : "____"}
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {revealed && (
        <div className="mt-4 rounded-xl border border-emerald-300/60 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {card.phrase}
            </div>
            <button
              onClick={() => speak(card.phrase)}
              className="grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300"
              aria-label="play"
            >
              <Volume2 className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="mt-5">
        {!revealed ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => speak(card.phrase)}
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-primary/15 hover:text-primary"
            >
              <Volume2 className="size-4" /> <T>听一下答案</T>
            </button>
            <button
              onClick={onReveal}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              <Eye className="size-4" /> <T>看答案</T>
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <T>诚实评估一下,你刚才反应得怎么样?</T>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <GradeBtn
                onClick={() => onGrade("again")}
                emoji="😵"
                label="不会"
                hint="过几分钟再来"
                tone="rose"
              />
              <GradeBtn
                onClick={() => onGrade("good")}
                emoji="😊"
                label="还行"
                hint="过几天再来"
                tone="primary"
              />
              <GradeBtn
                onClick={() => onGrade("easy")}
                emoji="🚀"
                label="简单"
                hint="拉长间隔"
                tone="emerald"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function GradeBtn({
  onClick,
  emoji,
  label,
  hint,
  tone,
}: {
  onClick: () => void;
  emoji: string;
  label: string;
  hint: string;
  tone: "rose" | "primary" | "emerald";
}) {
  const tones: Record<string, string> = {
    rose:
      "border-rose-300/60 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    primary:
      "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
    emerald:
      "border-emerald-300/60 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 rounded-xl border px-3 py-3 text-center font-bold transition ${tones[tone]}`}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="text-sm">
        <T>{label}</T>
      </span>
      <span className="text-[10px] font-medium opacity-70">
        <T>{hint}</T>
      </span>
    </button>
  );
}

export default Review;