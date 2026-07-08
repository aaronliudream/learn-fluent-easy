import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import BackLink from "@/components/BackLink";

interface Question {
  id: string;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  source?: "original" | "ai_cache" | "ai_realtime";
  used_count?: number;
}

interface QuizBundle {
  kpId: string;
  kpTitle: string;
  questions: Question[];
}

function isEnglishHeavy(text?: string | null) {
  const value = (text || "").trim();
  if (!value) return false;
  const chineseChars = (value.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishChars = (value.match(/[A-Za-z]/g) || []).length;
  return chineseChars < 20 && englishChars > 80 && englishChars > chineseChars * 3;
}

function chineseFallbackExplanation(q: Question, kpTitle: string) {
  const correctOption = q[`option_${q.correct_answer.toLowerCase()}` as keyof Question] as string | undefined;
  return `本题考查「${kpTitle}」。正确答案是 ${q.correct_answer}${correctOption ? `：“${correctOption}”` : ""}。做题时先看句子语境和关键词，再判断名词单复数、固定搭配或语法形式是否一致。你选择的选项不符合这里的语法/语义要求。下面保留原英文解析供对照：\n${q.explanation || ""}`;
}

/**
 * Parse a free-text explanation into a "why correct" lead + per-option bullets.
 * Handles common patterns produced by the AI (e.g. "选项 B，..." / "B. ..." / "B、...").
 */
function parseExplanation(text: string, correct: string) {
  const clean = (text || "").replace(/\s+\n/g, "\n").trim();
  if (!clean) return { lead: "", bullets: [] as { letter: string; body: string }[] };

  // Split by sentence boundaries that introduce an option analysis.
  // Match "选项X" or standalone "X，" / "X." / "X、" at sentence start.
  const re = /(?:^|[。;；\n])\s*(?:选项\s*)?([ABCD])[，、,.．:：]\s*/g;
  const matches: { letter: string; index: number; len: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    matches.push({ letter: m[1], index: m.index + m[0].indexOf(m[1]), len: m[0].length - m[0].indexOf(m[1]) });
  }

  if (matches.length < 2) {
    return { lead: clean, bullets: [] };
  }

  const lead = clean.slice(0, matches[0].index).replace(/[。\s]+$/, "").trim();
  const bullets: { letter: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i].len;
    const end = i + 1 < matches.length ? matches[i + 1].index : clean.length;
    const body = clean.slice(start, end).replace(/^[，、,.．:：\s]+/, "").replace(/[。\s]+$/, "").trim();
    if (body) bullets.push({ letter: matches[i].letter, body });
  }

  // De-dup: keep the longest body per letter.
  const byLetter = new Map<string, string>();
  for (const b of bullets) {
    const prev = byLetter.get(b.letter);
    if (!prev || b.body.length > prev.length) byLetter.set(b.letter, b.body);
  }
  const ordered = ["A", "B", "C", "D"]
    .filter((l) => byLetter.has(l))
    .map((l) => ({ letter: l, body: byLetter.get(l)! }));

  return { lead, bullets: ordered };
}

function FormattedExplanation({ text, correct }: { text: string; correct: string }) {
  const { lead, bullets } = parseExplanation(text, correct);
  if (bullets.length === 0) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{text}</p>;
  }
  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
      {lead && <p>{lead}。</p>}
      <ul className="space-y-2">
        {bullets.map((b) => {
          const isCorrect = b.letter === correct;
          return (
            <li key={b.letter} className="flex gap-2">
              <span
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCorrect
                    ? "bg-green-500/15 text-green-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {b.letter}
              </span>
              <span className={isCorrect ? "text-foreground" : "text-foreground/80"}>{b.body}。</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

async function withChineseFriendlyExplanations(questions: Question[], kpTitle: string): Promise<Question[]> {
  const needTranslation = questions.filter((q) => isEnglishHeavy(q.explanation));
  if (needTranslation.length === 0) return questions;

  try {
    const { data, error } = await supabase.functions.invoke("translate", {
      body: {
        sourceLanguage: "English",
        targetLanguage: "Simplified Chinese for Chinese Gaokao students; keep English words/phrases in quotes",
        items: needTranslation.map((q) => ({ key: q.id, text: q.explanation })),
      },
    });
    if (error) throw error;
    const translations = (data?.translations || {}) as Record<string, string>;
    return questions.map((q) => {
      if (!isEnglishHeavy(q.explanation)) return q;
      const translated = translations[q.id];
      return { ...q, explanation: translated && !isEnglishHeavy(translated) ? translated : chineseFallbackExplanation(q, kpTitle) };
    });
  } catch (e) {
    console.error("Chinese explanation normalization failed:", e);
    return questions.map((q) => isEnglishHeavy(q.explanation) ? { ...q, explanation: chineseFallbackExplanation(q, kpTitle) } : q);
  }
}

export default function GaokaoGrammarQuiz() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startTsRef = useRef<number>(Date.now());

  useEffect(() => {
    startTsRef.current = Date.now();
  }, [currentIdx]);

  const { data: bundle, isLoading, error, refetch } = useQuery<QuizBundle>({
    queryKey: ["grammar-quiz", slug],
    enabled: !!slug,
    queryFn: async () => {
      if (!slug) throw new Error("NO_SLUG");

      const { data: kpData, error: kpErr } = await supabase
        .from("gaokao_grammar_points")
        .select("id, title")
        .eq("slug", slug)
        .maybeSingle();

      if (kpErr || !kpData) {
        throw new Error("KP_NOT_FOUND");
      }

      const kpId = kpData.id;
      const kpTitle = kpData.title;

      const { data: originalRaw } = await supabase
        .from("gaokao_grammar_questions")
        .select("id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation")
        .eq("point_id", kpId);

      const original: Question[] = (originalRaw || []).map((q) => ({
        id: q.id,
        stem: q.stem,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        source: "original" as const,
      }));

      const { data: cachedRaw } = await supabase
        .from("ai_generated_questions")
        .select("id, stem, option_a, option_b, option_c, option_d, correct_answer, explanation, used_count")
        .eq("kp_id", kpId)
        .lt("used_count", 5)
        .limit(5);

      const cached: Question[] = (cachedRaw || []).map((q) => ({
        id: q.id,
        stem: q.stem,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        source: "ai_cache" as const,
        used_count: q.used_count ?? 0,
      }));

      const combined = [...original, ...cached];

      const usedKeywords = combined
        .map((q) => {
          const letter = (q.correct_answer || "").toLowerCase();
          if (!letter) return "";
          const opt = q[`option_${letter}` as "option_a" | "option_b" | "option_c" | "option_d"];
          return (opt || "").toString().trim();
        })
        .filter(Boolean);

      if (combined.length >= 1) {
        if (combined.length < 5) {
          supabase.functions
            .invoke("generate-question-for-kp", {
              body: {
                kp_id: kpId,
                count: 5 - combined.length,
                exclude_keywords: usedKeywords,
              },
            })
            .catch((e) => console.error("generate-question-for-kp prewarm failed:", e));
        }

        return { kpId, kpTitle, questions: await withChineseFriendlyExplanations(combined, kpTitle) };
      }

      const { data: gen, error: genErr } = await supabase.functions.invoke("generate-question-for-kp", {
        body: { kp_id: kpId, count: 3, exclude_keywords: usedKeywords },
      });

      if (genErr) throw new Error("AI_GENERATE_FAILED: " + genErr.message);

      const generated: Question[] = (gen?.questions || (gen?.question ? [gen.question] : [])).map((q: any) => ({
        id: q.id,
        stem: q.stem,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        source: "ai_realtime" as const,
        used_count: q.used_count ?? 0,
      }));

      if (generated.length === 0) throw new Error("AI_RETURNED_EMPTY");

      return { kpId, kpTitle, questions: await withChineseFriendlyExplanations(generated, kpTitle) };
    },
    retry: false,
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-5 py-8 text-center">
        <div className="text-5xl animate-pulse">🤖</div>
        <div>
          <h1 className="text-xl font-bold text-foreground">AI 正在为你出题…</h1>
          <p className="mt-2 text-sm text-muted-foreground">通常 5-10 秒</p>
        </div>
        <Progress value={62} className="h-2 max-w-xs" />
      </main>
    );
  }

  if (error) {
    const msg = (error as Error).message;
    let userFacing = "AI 出题失败，请重试";
    if (msg.includes("KP_NOT_FOUND")) userFacing = "考点不存在";
    if (msg.includes("AI_RETURNED_EMPTY")) userFacing = "AI 暂时无法为这个考点出题";

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-8">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-foreground">{userFacing}</h1>
          <p className="mt-2 break-words text-sm text-muted-foreground">{msg}</p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button onClick={() => refetch()}>重试</Button>
            <Button variant="outline" onClick={() => navigate("/gaokao/grammar")}>返回语法地图</Button>
          </div>
        </Card>
      </main>
    );
  }

  if (!bundle || !bundle.questions || bundle.questions.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-5 py-8">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-foreground">无可用题目</h1>
          <Button className="mt-6" onClick={() => navigate("/gaokao/grammar")}>返回语法地图</Button>
        </Card>
      </main>
    );
  }

  const q = bundle.questions[currentIdx];
  const isCorrect = selectedAnswer === q.correct_answer;
  const aiBadge = q.source === "ai_realtime" || q.source === "ai_cache";

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-5 pb-24 sm:px-5 sm:py-8">
      <BackLink to="/gaokao/grammar" className="mb-4 inline-flex text-sm text-muted-foreground hover:text-foreground">
        返回语法地图
      </BackLink>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-foreground">{bundle.kpTitle}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            第 {currentIdx + 1} / {bundle.questions.length} 题
          </p>
        </div>
        {aiBadge && (
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            🤖 AI 实时生成
          </span>
        )}
      </div>

      <Progress value={((currentIdx + 1) / bundle.questions.length) * 100} className="mb-5 h-2" />

      <Card className="p-5 sm:p-6">
        <p className="mb-5 whitespace-pre-wrap text-base font-medium leading-relaxed text-foreground sm:text-lg">{q.stem}</p>

        <div className="space-y-3">
          {(["a", "b", "c", "d"] as const).map((letter) => {
            const upper = letter.toUpperCase();
            const text = q[`option_${letter}` as keyof Question] as string;
            const isSelected = selectedAnswer === upper;
            const isRevealed = showExplanation;
            const isThisCorrect = q.correct_answer === upper;

            let className = "w-full rounded-lg border p-3 text-left text-sm transition-colors sm:text-base ";
            if (isRevealed) {
              if (isThisCorrect) className += "border-green-500 bg-green-50 text-green-950";
              else if (isSelected) className += "border-red-500 bg-red-50 text-red-950";
              else className += "border-border text-foreground opacity-70";
            } else {
              className += isSelected ? "border-primary bg-primary/5 text-foreground" : "border-border text-foreground hover:bg-muted/50";
            }

            return (
              <button
                key={upper}
                className={className}
                onClick={() => !showExplanation && setSelectedAnswer(upper)}
                disabled={showExplanation}
              >
                <span className="mr-2 font-bold">{upper}.</span>
                {text}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-5 rounded-lg border border-border bg-muted/40 p-4">
            <div className={`mb-2 font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
              {isCorrect ? "✓ 答对了" : `✗ 正确答案是 ${q.correct_answer}`}
            </div>
            <FormattedExplanation text={q.explanation} correct={q.correct_answer} />
          </div>
        )}
      </Card>

      <div className="mt-5 flex items-center justify-end gap-2">
        {!showExplanation ? (
          <Button
            disabled={!selectedAnswer || submitting}
            onClick={async () => {
              if (!selectedAnswer || !q || !bundle) return;
              setSubmitting(true);
              setShowExplanation(true);
              const correct = selectedAnswer === q.correct_answer;
              const timeSpent = Math.max(1, Math.round((Date.now() - startTsRef.current) / 1000));

              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  console.warn("Not logged in — skipping persistence");
                  return;
                }
                const kpId = bundle.kpId;

                // 1. attempt
                const { data: attempt, error: attemptErr } = await supabase
                  .from("gaokao_user_attempts")
                  .insert({
                    user_id: user.id,
                    question_type: "grammar",
                    question_id: q.id,
                    user_answer: selectedAnswer,
                    is_correct: correct,
                    time_spent_seconds: timeSpent,
                  })
                  .select()
                  .single();
                if (attemptErr) console.error("attempt insert failed:", attemptErr);

                // 2. mistake row (only on wrong)
                if (!correct) {
                  const { error: mistakeErr } = await supabase.from("user_mistakes").insert({
                    user_id: user.id,
                    module: "gaokao_grammar",
                    source_key: `grammar:${kpId}:${q.id}`,
                    source_label: bundle.kpTitle,
                    question: q.stem,
                    user_answer: selectedAnswer,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation,
                    snapshot: {
                      kp_id: kpId,
                      kp_title: bundle.kpTitle,
                      item_id: q.id,
                      item_source: q.source || "original",
                      options: {
                        A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d,
                      },
                    },
                  });
                  if (mistakeErr) console.error("mistake insert failed:", mistakeErr);

                  // also write to gaokao_user_mistakes (the table 我的错题本 reads)
                  const { data: existingMistake } = await supabase
                    .from("gaokao_user_mistakes")
                    .select("wrong_count")
                    .eq("user_id", user.id)
                    .eq("module", "grammar")
                    .eq("item_id", q.id)
                    .maybeSingle();
                  const now = new Date().toISOString();
                  const { error: gMistakeErr } = await supabase.from("gaokao_user_mistakes").upsert({
                    user_id: user.id,
                    module: "grammar",
                    item_id: q.id,
                    parent_id: null,
                    parent_label: bundle.kpTitle,
                    user_answer: selectedAnswer,
                    correct_answer: q.correct_answer,
                    wrong_count: (existingMistake?.wrong_count || 0) + 1,
                    snapshot: {
                      kp_id: kpId,
                      kp_title: bundle.kpTitle,
                      stem: q.stem,
                      question: q.stem,
                      option_a: q.option_a,
                      option_b: q.option_b,
                      option_c: q.option_c,
                      option_d: q.option_d,
                      general_explanation: q.explanation,
                      explanation: q.explanation,
                      item_source: q.source || "original",
                      options: {
                        A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d,
                      },
                    },
                    last_wrong_at: now,
                    next_review_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                    is_resolved: false,
                  }, { onConflict: "user_id,module,item_id" });
                  if (gMistakeErr) console.error("gaokao_user_mistakes upsert failed:", gMistakeErr);
                } else {
                  // 重做做对 → 移出该题错题(两张表)。比照词汇经 edge 的自动移出。
                  // 只动自己该题、is_resolved=false;失败仅 warn,不阻断做题。
                  const { error: umErr } = await supabase.from("user_mistakes")
                    .update({ is_resolved: true, updated_at: new Date().toISOString() })
                    .eq("user_id", user.id)
                    .eq("source_key", `grammar:${kpId}:${q.id}`)
                    .eq("is_resolved", false);
                  if (umErr) console.warn("[gaokao grammar resolve user_mistakes]", umErr);
                  const { error: gumErr } = await supabase.from("gaokao_user_mistakes")
                    .update({ is_resolved: true, updated_at: new Date().toISOString() })
                    .eq("user_id", user.id)
                    .eq("module", "grammar")
                    .eq("item_id", q.id)
                    .eq("is_resolved", false);
                  if (gumErr) console.warn("[gaokao grammar resolve gaokao_user_mistakes]", gumErr);
                }

                // 3. classify-mistake-cause (fire-and-forget) on wrong
                if (!correct && attempt?.id) {
                  supabase.functions
                    .invoke("classify-mistake-cause", {
                      body: {
                        attempt_id: attempt.id,
                        question_text: q.stem,
                        correct_answer: q.correct_answer,
                        user_answer: selectedAnswer,
                        time_spent_seconds: timeSpent,
                        kp_id: kpId,
                        skill_area: "grammar",
                      },
                    })
                    .catch((e) => console.error("classify-mistake-cause failed:", e));
                }

                // 4. mastery upsert (item_type=grammar_kp, item_id=kpId)
                const { data: existing } = await supabase
                  .from("gaokao_user_mastery")
                  .select("correct_count, wrong_count, mastery_level")
                  .eq("user_id", user.id)
                  .eq("item_type", "grammar_kp")
                  .eq("item_id", kpId)
                  .maybeSingle();

                const cc = (existing?.correct_count || 0) + (correct ? 1 : 0);
                const wc = (existing?.wrong_count || 0) + (correct ? 0 : 1);
                const oldLevel = existing?.mastery_level ?? 0;
                const newLevel = Math.max(0, Math.min(100, oldLevel + (correct ? 5 : -3)));

                const { error: masteryErr } = await supabase
                  .from("gaokao_user_mastery")
                  .upsert(
                    {
                      user_id: user.id,
                      item_type: "grammar_kp",
                      item_id: kpId,
                      correct_count: cc,
                      wrong_count: wc,
                      last_result: correct ? "correct" : "wrong",
                      last_seen_at: new Date().toISOString(),
                      mastery_level: newLevel,
                    },
                    { onConflict: "user_id,item_type,item_id" },
                  );
                if (masteryErr) console.error("mastery upsert failed:", masteryErr);

                // 5. bump used_count on AI question
                if (q.source === "ai_cache" || q.source === "ai_realtime") {
                  await supabase
                    .from("ai_generated_questions")
                    .update({ used_count: (q.used_count || 0) + 1 })
                    .eq("id", q.id);
                }
              } catch (e) {
                console.error("submit persistence error:", e);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            提交答案
          </Button>
        ) : currentIdx < bundle.questions.length - 1 ? (
          <Button
            onClick={() => {
              setCurrentIdx(currentIdx + 1);
              setSelectedAnswer(null);
              setShowExplanation(false);
            }}
          >
            下一题 →
          </Button>
        ) : (
          <Button onClick={() => navigate("/gaokao/grammar")}>返回考点地图</Button>
        )}
      </div>
    </main>
  );
}
