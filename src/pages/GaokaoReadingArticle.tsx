import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Send, CheckCircle2, XCircle, Sparkles, BookOpen, FileText, Target, ChevronDown, ChevronUp, Eye, Gauge, Brain, HelpCircle, ThumbsUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import NoCopyGuard from "@/components/NoCopyGuard";
import ReadingWatermark from "@/components/ReadingWatermark";
import { recordMastery } from "@/lib/masteryProgress";

type Article = {
  id: string;
  title: string;
  body: string;
  word_count: number;
  recommended_minutes: number;
  difficulty: number;
  cefr_level: string | null;
  genre_label: string | null;
  sub_band: string | null;
  specific_topic: string;
  topic_group: string;
  paragraph_structure: string | null;
  writing_techniques: string | null;
  core_question_types: string | null;
  exam_strategies: string | null;
  topic_connection: string | null;
  useful_sentences: { en: string; cn: string }[] | null;
  argumentation_logic: string | null;
};

type Question = {
  id: string;
  sort_order: number;
  stem: string;
  question_type: string;
  question_type_cn: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation_a: string | null;
  explanation_b: string | null;
  explanation_c: string | null;
  explanation_d: string | null;
  general_explanation: string | null;
  locate_paragraph: number | null;
  key_sentence: string | null;
  difficulty: number;
};

type VocabItem = {
  id: string;
  word: string;
  phonetic: string | null;
  pos: string | null;
  meaning_cn: string;
  category: string;
  importance: number;
};

type Stage = "read" | "test" | "result" | "review";

const TYPE_COLOR: Record<string, string> = {
  main_idea: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  detail: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  inference: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  vocabulary: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  attitude: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  purpose: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  data_interp: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  viewpoint: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

function cleanArticleBody(body: string) {
  const normalized = body.replace(/\r\n/g, "\n").trim();

  // 1) 优先抽取「一、文章正文」到「二、测试题目」之间的英文正文 (GMAT 风格 — 只要纯文章)
  const startMarkers = [/\*\*一、\s*文章正文\*\*/, /【\s*一[、.]?\s*文章正文\s*】/, /^一、\s*文章正文/m];
  const endMarkers = [/\*\*二、/, /【\s*二[、.]/, /^二、/m, /测试题目/, /答案与解析/, /文章分析/, /生词与重点表达/];

  let body1 = normalized;
  for (const re of startMarkers) {
    const m = normalized.match(re);
    if (m && m.index !== undefined) { body1 = normalized.slice(m.index + m[0].length); break; }
  }
  for (const re of endMarkers) {
    const m = body1.match(re);
    if (m && m.index !== undefined) { body1 = body1.slice(0, m.index); break; }
  }
  let result = body1.trim();

  // 2) 填空标记：\\_1\\、___1___ 等 → ①②③
  const circled = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
  const toCircled = (n: string) => {
    const i = parseInt(n, 10);
    return i >= 1 && i <= 10 ? circled[i - 1] : `(${n})`;
  };
  result = result.replace(/\\+_*\s*(\d{1,2})\s*_*\\+/g, (_, n) => ` ${toCircled(n)} `);
  result = result.replace(/_{2,}\s*(\d{1,2})\s*_{2,}/g, (_, n) => ` ${toCircled(n)} `);

  // 3) 去 markdown / 反斜杠 / 转义
  result = result
    .replace(/\*\*+/g, "")
    .replace(/(^|\s)#{1,6}\s+/g, "$1")
    .replace(/\\([|*_#\-\\])/g, "$1") // 去掉转义反斜杠 (\| → |)
    .replace(/\\+/g, "")
    .replace(/[ \t]{2,}/g, " ");

  // 4) 逐行过滤掉中文 metadata / 标签行 (GMAT 风格只留英文段落 + 标题)
  const cnMetaPatterns = [
    /^【.*】/,                      // 【主题语境】... / 【题型】...
    /^\s*[一二三四五六七八九十][、.\s]/, // 一、二、三、...
    /主题语境|话题群|具体话题|题型|字数|建议用时|文章正文|测试题目|答案与解析|文章分析|生词与重点表达/,
  ];
  result = result
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (!t) return true; // keep blank lines for paragraph breaks
      if (t.replace(/[\s\*_#\-|·]/g, "").length === 0) return false; // 残余装饰行
      if (cnMetaPatterns.some((re) => re.test(t))) return false;
      return true;
    })
    .join("\n");

  // 5) 折叠 3+ 空行 → 双空行 (段落分隔)
  result = result.replace(/\n{3,}/g, "\n\n");
  return result.trim();
}

function extractSection(body: string, startMarker: string, endMarkers: string[]) {
  const start = body.indexOf(startMarker);
  if (start < 0) return "";
  const fromStart = body.slice(start + startMarker.length);
  const end = endMarkers.reduce((min, marker) => {
    const idx = fromStart.indexOf(marker);
    return idx >= 0 ? Math.min(min, idx) : min;
  }, fromStart.length);
  return fromStart.slice(0, end).trim();
}

function parseEmbeddedQuestions(body: string, articleId: string): Question[] {
  const questionSection = extractSection(body.replace(/\r\n/g, "\n"), "**二、测试题目**", ["**三、答案与解析**", "**三、答案", "**四、文章分析**"]);
  if (!questionSection) return [];

  const answerSection = extractSection(body.replace(/\r\n/g, "\n"), "**三、答案与解析**", ["**四、文章分析**", "**五、生词与重点表达**"]);
  const answers = new Map<number, { correct: "A" | "B" | "C" | "D"; explanations: Partial<Record<"A" | "B" | "C" | "D", string>>; general: string | null }>();

  for (const block of answerSection.split(/(?=\n?\*\*\d+\.\s*【[A-D]】\*\*)/).filter(Boolean)) {
    const head = block.match(/\*\*(\d+)\.\s*【([A-D])】\*\*/);
    if (!head) continue;
    const sortOrder = Number(head[1]);
    const correct = head[2] as "A" | "B" | "C" | "D";
    const explanations: Partial<Record<"A" | "B" | "C" | "D", string>> = {};
    (["A", "B", "C", "D"] as const).forEach((opt) => {
      const match = block.match(new RegExp(`\\*\\*${opt} 项 [✓✗]\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n\\*\\*[A-D] 项 [✓✗]\\*\\*|\\n\\n\\*\\*▸|$)`));
      if (match) explanations[opt] = match[1].replace(/-{2,}/g, "——").trim();
    });
    const general = block.replace(head[0], "").split("\n\n**A 项")[0]?.trim() || null;
    answers.set(sortOrder, { correct, explanations, general });
  }

  return questionSection
    .split(/(?=\n?\*\*\d+\.\*\*)/)
    .filter((block) => /^\s*\*\*\d+\.\*\*/.test(block))
    .map((block, index) => {
      const stemMatch = block.match(/^\s*\*\*(\d+)\.\*\*\s*([\s\S]*?)(?=\n\s*A\.\s)/);
      const sortOrder = stemMatch ? Number(stemMatch[1]) : index + 1;
      const parsed = answers.get(sortOrder);
      const optionText = (opt: "A" | "B" | "C" | "D") => {
        const next = opt === "A" ? "B" : opt === "B" ? "C" : opt === "C" ? "D" : null;
        const pattern = next
          ? new RegExp(`\\n\\s*${opt}\\.\\s*([\\s\\S]*?)(?=\\n\\s*${next}\\.\\s)`, "m")
          : new RegExp(`\\n\\s*${opt}\\.\\s*([\\s\\S]*?)$`, "m");
        return block.match(pattern)?.[1]?.trim() ?? "";
      };
      return {
        id: `embedded-${articleId}-${sortOrder}`,
        sort_order: sortOrder,
        stem: stemMatch?.[2]?.trim() ?? "",
        question_type: "reading",
        question_type_cn: "阅读理解",
        option_a: optionText("A"),
        option_b: optionText("B"),
        option_c: optionText("C"),
        option_d: optionText("D"),
        correct_answer: parsed?.correct ?? "A",
        explanation_a: parsed?.explanations.A ?? null,
        explanation_b: parsed?.explanations.B ?? null,
        explanation_c: parsed?.explanations.C ?? null,
        explanation_d: parsed?.explanations.D ?? null,
        general_explanation: parsed?.general,
        locate_paragraph: null,
        key_sentence: null,
        difficulty: 3,
      };
    });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function GaokaoReadingArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [stage, setStage] = useState<Stage>("test");
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  // 信心度: 1=猜的, 2=比较确定, 3=非常确定 (PISA 元认知金标准)
  const [confidences, setConfidences] = useState<Record<string, 1 | 2 | 3>>({});
  const [startTime] = useState(() => Date.now());
  // 阅读阶段计时: 用户首次点击任意选项前都算"在阅读"
  const [readingEndAt, setReadingEndAt] = useState<number | null>(null);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [fontScale, setFontScale] = useState(1);
  const [userEmail, setUserEmail] = useState<string>("user");
  const [minReadSec, setMinReadSec] = useState<number>(60);
  const [readSecLeft, setReadSecLeft] = useState<number>(60);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserEmail(data.user.email ?? data.user.id.slice(0, 8));
    });
  }, []);

  useEffect(() => {
    if (!article) return;
    // 最短阅读时长：单词数 / 3.3 词每秒（≈200词/分钟），最少60秒
    const m = Math.max(60, Math.round(article.word_count / 3.3));
    setMinReadSec(m);
    setReadSecLeft(m);
  }, [article]);

  useEffect(() => {
    if (stage !== "test") return;
    const t = setInterval(() => setReadSecLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [stage]);

  // Load
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [a, q, v] = await Promise.all([
        supabase.from("gaokao_reading_articles").select("*").eq("id", id).maybeSingle(),
        supabase.from("gaokao_reading_article_questions").select("*").eq("article_id", id).order("sort_order"),
        supabase.from("gaokao_reading_article_vocab").select("*").eq("article_id", id).order("sort_order"),
      ]);
      const loadedArticle = a.data as unknown as Article | null;
      const loadedQuestions = (q.data ?? []) as Question[];
      setArticle(loadedArticle);
      setQuestions(loadedQuestions.length > 0 ? loadedQuestions : loadedArticle ? parseEmbeddedQuestions(loadedArticle.body, loadedArticle.id) : []);
      setVocab((v.data ?? []) as VocabItem[]);
      if (a.data) setSecondsLeft((a.data.recommended_minutes ?? 8) * 60);
      setLoading(false);
    })();
  }, [id]);

  // Timer (test stage only)
  useEffect(() => {
    if (stage !== "test" || !article) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, article]);

  const answeredCount = Object.keys(answers).length;
  const totalQ = questions.length;
  const displayBody = useMemo(() => cleanArticleBody(article?.body ?? ""), [article?.body]);

  const correctCount = useMemo(() => {
    return questions.filter((q) => answers[q.id] === q.correct_answer).length;
  }, [questions, answers]);

  const typeBreakdown = useMemo(() => {
    const m: Record<string, { correct: number; total: number; cn: string }> = {};
    for (const q of questions) {
      if (!m[q.question_type]) m[q.question_type] = { correct: 0, total: 0, cn: q.question_type_cn ?? q.question_type };
      m[q.question_type].total++;
      if (answers[q.id] === q.correct_answer) m[q.question_type].correct++;
    }
    return m;
  }, [questions, answers]);

  async function handleSubmit(timeUp = false) {
    if (!article) return;
    if (answeredCount < totalQ) {
      toast.warning(timeUp ? "时间到，请补完所有题目后再查看答案和解析" : "请先完成所有题目，再查看答案和解析");
      return;
    }
    if (!timeUp && readSecLeft > 0) {
      toast.warning(`请认真阅读，还需 ${readSecLeft} 秒才能交卷`);
      return;
    }

    const now = Date.now();
    setSubmittedAt(now);
    const duration = Math.floor((now - startTime) / 1000);
    // 阅读用时 = 首次答题前的时间; 若用户没点过选项, 用总时长
    const readingSec = Math.max(
      30,
      Math.floor(((readingEndAt ?? now) - startTime) / 1000)
    );
    const wpm = Math.round((article.word_count / Math.max(readingSec, 1)) * 60);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const answerLog = questions.map((q) => ({
          question_id: q.id,
          user_answer: answers[q.id] ?? null,
          is_correct: answers[q.id] === q.correct_answer,
          question_type: q.question_type,
          confidence: confidences[q.id] ?? null,
        }));
        await supabase.from("gaokao_reading_sessions").insert({
          user_id: user.id,
          article_id: article.id,
          status: "submitted",
          answers: answerLog,
          total_questions: totalQ,
          correct_count: correctCount,
          score_pct: totalQ > 0 ? (correctCount / totalQ) * 100 : 0,
          submitted_at: new Date(now).toISOString(),
          duration_seconds: duration,
          type_breakdown: typeBreakdown,
        });
        // 写入诊断明细 (每题一条) — 驱动 5 维雷达图
        const diagnostics = questions.filter((q) => isUuid(q.id)).map((q) => ({
          user_id: user.id,
          article_id: article.id,
          question_id: q.id,
          question_type: q.question_type,
          user_answer: answers[q.id] ?? null,
          correct_answer: q.correct_answer,
          is_correct: answers[q.id] === q.correct_answer,
          confidence: confidences[q.id] ?? null,
          reading_wpm: wpm,
          reading_seconds: readingSec,
          time_spent_seconds: Math.floor(duration / Math.max(totalQ, 1)),
        }));
        if (diagnostics.length) {
          await supabase.from("gaokao_reading_diagnostics").insert(diagnostics);
        }
        // 写入统一掌握度（5星 + 遗忘曲线）
        const pct = totalQ > 0 ? (correctCount / totalQ) * 100 : 0;
        await recordMastery({ module: "gaokao_reading", itemId: article.id, pct });
      }
    } catch (err) {
      console.error("save session error", err);
    }

    if (timeUp) toast.warning("时间到，已自动交卷");
    setStage("review");
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-5 py-8">
        <p className="text-sm text-muted-foreground">加载中...</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-5 py-8">
        <BackLink to="/gaokao/reading" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" /> 返回阅读列表
        </BackLink>
        <p className="mt-8 text-center text-muted-foreground">文章不存在</p>
      </main>
    );
  }

  // ============ STAGE 1: READ + TEST (同屏) ============
  if (stage === "test") {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    const lowTime = secondsLeft < 60;

    return (
      <main className="min-h-screen bg-muted/30 pb-32">
        <NoCopyGuard />
        {/* Sticky top bar */}
        <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Link to="/gaokao/reading" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">{article.sub_band} · {article.genre_label}</div>
              <div className="text-sm font-semibold truncate">{article.title}</div>
            </div>
            <div className={cn(
              "hidden sm:flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-bold tabular-nums",
              readSecLeft > 0 ? "border-amber-400 text-amber-600" : "border-emerald-400 text-emerald-600"
            )} title="最短阅读时长">
              📖 {readSecLeft > 0 ? `${readSecLeft}s` : "可交卷"}
            </div>
            <div className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono font-bold tabular-nums text-sm",
              lowTime ? "bg-rose-500/15 text-rose-600 animate-pulse" : "bg-primary/10 text-primary"
            )}>
              <Clock className="size-4" />
              {mm}:{ss}
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{answeredCount}</span>/{totalQ}
            </div>
            <Button size="sm" onClick={() => handleSubmit(false)} className="gap-1.5">
              <Send className="size-3.5" /> 交卷
            </Button>
          </div>
          {/* progress bar */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(answeredCount / Math.max(totalQ, 1)) * 100}%` }}
            />
          </div>
        </header>

        {/* Questions only */}
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1.1fr_1fr]">
          {/* 文章 — 左侧 (移动端在上方) */}
          <article className="relative rounded-2xl border bg-card p-5 lg:p-7 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <ReadingWatermark text={`${userEmail} · ${new Date().toLocaleDateString()}`} />
            <div className="mb-3 flex items-center justify-between border-b pb-2">
              <div className="text-xs text-muted-foreground">
                {article.word_count} 词 · {article.sub_band} · {article.genre_label}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFontScale((s) => Math.max(0.85, s - 0.1))}
                  className="size-7 rounded-md border bg-background text-xs font-bold hover:bg-muted"
                >A-</button>
                <button
                  onClick={() => setFontScale((s) => Math.min(1.4, s + 0.1))}
                  className="size-7 rounded-md border bg-background text-xs font-bold hover:bg-muted"
                >A+</button>
              </div>
            </div>
            <h1 className="mb-3 text-lg font-bold leading-snug">{article.title}</h1>
            <div
              className="prose prose-slate max-w-none space-y-3 leading-[1.85] text-foreground select-text"
              style={{ fontSize: `${fontScale}rem` }}
            >
              {displayBody.split("\n\n").map((p, i) => (
                <p key={i} className="text-justify">
                  <span className="mr-2 font-mono text-xs text-muted-foreground/40 select-none">{i + 1}</span>
                  {p}
                </p>
              ))}
            </div>
          </article>

          {/* 题目 — 右侧 */}
          <section className="space-y-4">
            <div className="rounded-xl border bg-primary/5 border-primary/20 p-3 flex gap-2 text-xs text-primary">
              <Target className="size-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">边读边答</div>
                <div className="opacity-80 mt-0.5">读完文章作答，全部完成并交卷后才会显示正确答案与解析。</div>
              </div>
            </div>

            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-2 mb-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm leading-snug font-medium">{q.stem}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {(["A", "B", "C", "D"] as const).map((opt) => {
                    const text = q[`option_${opt.toLowerCase()}` as "option_a"];
                    const selected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setAnswers((prev) => ({ ...prev, [q.id]: opt }));
                          // 标记阅读阶段结束于首次答题
                          if (readingEndAt === null) setReadingEndAt(Date.now());
                        }}
                        className={cn(
                          "w-full flex gap-3 items-start rounded-xl border p-3 text-left text-sm transition",
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <span className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold",
                          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                          {opt}
                        </span>
                        <span className="flex-1 leading-snug">{text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 信心度评分 — 元认知训练 (PISA 金标准) */}
                {answers[q.id] && (
                  <div className="mt-3 pt-3 border-t border-dashed">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="size-3.5 text-violet-500" />
                      <span className="text-xs font-medium text-muted-foreground">
                        你对这个答案的把握？
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([
                        { v: 1, label: "猜的", icon: HelpCircle, color: "rose" },
                        { v: 2, label: "比较确定", icon: ThumbsUp, color: "amber" },
                        { v: 3, label: "非常确定", icon: Zap, color: "emerald" },
                      ] as const).map(({ v, label, icon: Icon, color }) => {
                        const active = confidences[q.id] === v;
                        return (
                          <button
                            key={v}
                            onClick={() =>
                              setConfidences((p) => ({ ...p, [q.id]: v }))
                            }
                            className={cn(
                              "flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition",
                              active
                                ? color === "rose"
                                  ? "bg-rose-500/15 border-rose-500/40 text-rose-600"
                                  : color === "amber"
                                  ? "bg-amber-500/15 border-amber-500/40 text-amber-600"
                                  : "bg-emerald-500/15 border-emerald-500/40 text-emerald-600"
                                : "border-border text-muted-foreground hover:border-primary/30"
                            )}
                          >
                            <Icon className="size-3" />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Button
              size="lg"
              onClick={() => handleSubmit(false)}
              className="w-full gap-2 h-12"
            >
              <Send className="size-4" />
              提交并查看成绩 ({answeredCount}/{totalQ})
            </Button>
          </section>
        </div>
      </main>
    );
  }

  // ============ STAGE 2: RESULT ============
  if (stage === "result") {
    const pct = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    const usedSec = submittedAt ? Math.floor((submittedAt - startTime) / 1000) : 0;
    const usedMM = String(Math.floor(usedSec / 60)).padStart(2, "0");
    const usedSS = String(usedSec % 60).padStart(2, "0");

    // 阅读速度 WPM
    const readingSec = Math.max(
      30,
      Math.floor(((readingEndAt ?? submittedAt ?? Date.now()) - startTime) / 1000)
    );
    const wpm = Math.round((article.word_count / Math.max(readingSec, 1)) * 60);
    const efficiency = Math.round(wpm * (correctCount / Math.max(totalQ, 1)));

    // 元认知诊断
    const confEntries = questions
      .map((q) => ({ c: confidences[q.id], ok: answers[q.id] === q.correct_answer }))
      .filter((x) => x.c !== undefined);
    const metacogN = confEntries.length;
    const metacogOk = confEntries.filter(
      (x) => (x.c! >= 2 && x.ok) || (x.c === 1 && !x.ok)
    ).length;
    const metacogPct = metacogN > 0 ? Math.round((metacogOk / metacogN) * 100) : 0;
    // 高信心答错 — 最危险的"认知偏差"
    const dangerCount = confEntries.filter((x) => x.c === 3 && !x.ok).length;
    // 低信心答对 — 蒙对的, 复习重点
    const luckyCount = confEntries.filter((x) => x.c === 1 && x.ok).length;

    const wpmTier =
      wpm >= 90 ? { label: "🚀 极速", color: "text-emerald-600" }
      : wpm >= 70 ? { label: "✅ 高考达标", color: "text-emerald-600" }
      : wpm >= 50 ? { label: "⚠️ 接近达标", color: "text-amber-600" }
      : { label: "🐢 需提速", color: "text-rose-600" };
    const effTier =
      efficiency >= 70 ? { label: "🏆 优秀", color: "text-emerald-600" }
      : efficiency >= 52 ? { label: "✅ 达标", color: "text-emerald-600" }
      : efficiency >= 35 ? { label: "⚠️ 接近", color: "text-amber-600" }
      : { label: "🔴 加练", color: "text-rose-600" };

    let feedback = { emoji: "🎉", title: "出色！", desc: "继续保持，向顶尖水平冲刺。", color: "text-emerald-600" };
    if (pct < 50) feedback = { emoji: "💪", title: "还需加强", desc: "别灰心，精读复盘比做对更重要。", color: "text-rose-600" };
    else if (pct < 75) feedback = { emoji: "👍", title: "有潜力", desc: "稳扎稳打，看看每题的解析。", color: "text-amber-600" };

    return (
      <main className="mx-auto max-w-3xl px-5 py-8 min-h-screen">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{feedback.emoji}</div>
          <h1 className={cn("text-2xl font-bold", feedback.color)}>{feedback.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{feedback.desc}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">{correctCount}<span className="text-sm text-muted-foreground">/{totalQ}</span></div>
            <div className="text-xs text-muted-foreground mt-1">答对题数</div>
          </div>
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className={cn("text-2xl font-bold tabular-nums", feedback.color)}>{pct}%</div>
            <div className="text-xs text-muted-foreground mt-1">正确率</div>
          </div>
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">{usedMM}:{usedSS}</div>
            <div className="text-xs text-muted-foreground mt-1">用时 / 限{article.recommended_minutes}分</div>
          </div>
        </div>

        {/* 🚀 全球标准诊断: 阅读速度 + 效率指数 + 元认知 */}
        <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 p-5 mb-6">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> 全球标准诊断
            <span className="text-[10px] font-normal text-muted-foreground border rounded px-1.5 py-0.5">
              对标 PISA / Cambridge
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-card border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Gauge className="size-3.5" /> 阅读速度
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-bold tabular-nums", wpmTier.color)}>{wpm}</span>
                <span className="text-xs text-muted-foreground">WPM</span>
              </div>
              <div className={cn("text-[10px] mt-0.5 font-medium", wpmTier.color)}>{wpmTier.label}</div>
            </div>
            <div className="rounded-xl bg-card border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Zap className="size-3.5" /> 效率指数
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-bold tabular-nums", effTier.color)}>{efficiency}</span>
              </div>
              <div className={cn("text-[10px] mt-0.5 font-medium", effTier.color)}>{effTier.label}</div>
            </div>
            <div className="rounded-xl bg-card border p-3 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Brain className="size-3.5" /> 元认知准确度
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">
                  {metacogN > 0 ? `${metacogPct}%` : "—"}
                </span>
              </div>
              <div className="text-[10px] mt-0.5 text-muted-foreground">
                {metacogN > 0 ? `${metacogOk}/${metacogN} 自评准确` : "未评估信心度"}
              </div>
            </div>
          </div>

          {/* 危险/侥幸提示 */}
          {(dangerCount > 0 || luckyCount > 0) && (
            <div className="mt-3 grid sm:grid-cols-2 gap-2">
              {dangerCount > 0 && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs">
                  <div className="font-bold text-rose-600 flex items-center gap-1">
                    🚨 认知偏差 {dangerCount} 题
                  </div>
                  <div className="text-rose-600/80 mt-0.5">
                    「非常确定」却答错 — 是最危险的盲点，必须重点复盘
                  </div>
                </div>
              )}
              {luckyCount > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs">
                  <div className="font-bold text-amber-600 flex items-center gap-1">
                    🍀 蒙对 {luckyCount} 题
                  </div>
                  <div className="text-amber-600/80 mt-0.5">
                    「猜的」却答对 — 不是真掌握，建议刻意重做
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
            💡 <b>效率指数 = WPM × 正确率</b>。高考阅读要求 ≥ 70 WPM × 75% = <b>52</b> 为达标线。
            <br />
            🧠 <b>元认知</b>: 你对自己掌握程度的判断是否准确（高信心+答对、低信心+答错都算"自评准确"）。
          </div>
        </div>

        {/* 题型诊断 */}
        <div className="rounded-2xl border bg-card p-5 mb-6">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <Target className="size-4 text-primary" /> 题型诊断
          </h2>
          <div className="space-y-2">
            {Object.entries(typeBreakdown).map(([type, v]) => {
              const p = (v.correct / v.total) * 100;
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={cn("rounded px-1.5 py-0.5 border", TYPE_COLOR[type] ?? "bg-muted")}>
                      {v.cn}
                    </span>
                    <span className="font-mono tabular-nums text-muted-foreground">{v.correct}/{v.total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        p === 100 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 题目对错速览 */}
        <div className="rounded-2xl border bg-card p-5 mb-6">
          <h2 className="font-bold mb-3">题目速览</h2>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {questions.map((q, i) => {
              const ok = answers[q.id] === q.correct_answer;
              return (
                <div
                  key={q.id}
                  className={cn(
                    "aspect-square rounded-lg border flex items-center justify-center text-sm font-bold",
                    ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                       : "bg-rose-500/10 border-rose-500/30 text-rose-600"
                  )}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-12 gap-2"
          onClick={() => setStage("review")}
        >
          <Eye className="size-4" />
          开始精读复盘 (查看答案 + 解析 + 文章分析)
        </Button>

        <button
          onClick={() => navigate("/gaokao/reading")}
          className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground py-2"
        >
          先返回，稍后复盘
        </button>
      </main>
    );
  }

  // ============ STAGE 3: REVIEW ============
  return <ReviewStage article={article} questions={questions} answers={answers} vocab={vocab} />;
}

// ============================================================
// REVIEW STAGE COMPONENT
// ============================================================
function ReviewStage({
  article,
  questions,
  answers,
  vocab,
}: {
  article: Article;
  questions: Question[];
  answers: Record<string, "A" | "B" | "C" | "D">;
  vocab: VocabItem[];
}) {
  const [tab, setTab] = useState<"questions" | "analysis" | "vocab">("questions");

  return (
    <main className="min-h-screen pb-12">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Link to="/gaokao/reading" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">📖 精读复盘</div>
            <div className="text-sm font-semibold truncate">{article.title}</div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 flex gap-1 -mb-px overflow-x-auto">
          {[
            { id: "questions", label: "题目解析", icon: Target },
            { id: "analysis", label: "文章分析", icon: FileText },
            { id: "vocab", label: "生词与表达", icon: BookOpen },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 inline-flex items-center gap-1.5 transition shrink-0",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {tab === "questions" && (
          <div className="space-y-5">
            {questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct_answer;
              return (
                <div key={q.id} className="rounded-2xl border bg-card p-5 shadow-sm">
                  {/* 题干 */}
                  <div className="flex items-start gap-2 mb-3">
                    <span className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-lg text-sm font-bold",
                      isCorrect ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    )}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className={cn("text-[10px] rounded px-1.5 py-0.5 border font-semibold", TYPE_COLOR[q.question_type])}>
                          {q.question_type_cn}
                        </span>
                        {q.locate_paragraph && (
                          <span className="text-[10px] rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                            定位 第{q.locate_paragraph}段
                          </span>
                        )}
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircle2 className="size-3" /> 答对
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold">
                            <XCircle className="size-3" /> 答错
                          </span>
                        )}
                      </div>
                      <p className="text-sm leading-snug font-medium">{q.stem}</p>
                    </div>
                  </div>

                  {/* 4 个选项 + 逐一解析 */}
                  <div className="space-y-2">
                    {(["A", "B", "C", "D"] as const).map((opt) => {
                      const text = q[`option_${opt.toLowerCase()}` as "option_a"];
                      const exp = q[`explanation_${opt.toLowerCase()}` as "explanation_a"];
                      const isCorrectOpt = q.correct_answer === opt;
                      const isUserOpt = userAnswer === opt;
                      return (
                        <div
                          key={opt}
                          className={cn(
                            "rounded-xl border p-3",
                            isCorrectOpt
                              ? "border-emerald-500/40 bg-emerald-500/5"
                              : isUserOpt
                              ? "border-rose-500/40 bg-rose-500/5"
                              : "border-border bg-muted/20"
                          )}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className={cn(
                              "grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold",
                              isCorrectOpt
                                ? "bg-emerald-500 text-white"
                                : isUserOpt
                                ? "bg-rose-500 text-white"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {opt}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm font-medium">{text}</span>
                                {isCorrectOpt && <span className="text-[10px] font-bold text-emerald-600">✓ 正确答案</span>}
                                {isUserOpt && !isCorrectOpt && <span className="text-[10px] font-bold text-rose-600">你的选择</span>}
                              </div>
                              {exp && (
                                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                  <span className={cn("font-semibold mr-1", isCorrectOpt ? "text-emerald-600" : "text-rose-600")}>
                                    {isCorrectOpt ? "✓" : "✗"}
                                  </span>
                                  {exp}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 总解析 + 关键句 */}
                  {(q.general_explanation || q.key_sentence) && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {q.general_explanation && (
                        <div className="text-xs">
                          <span className="font-semibold text-primary">📌 解题思路：</span>
                          <span className="text-muted-foreground">{q.general_explanation}</span>
                        </div>
                      )}
                      {q.key_sentence && (
                        <div className="text-xs rounded-lg bg-primary/5 border border-primary/15 p-2.5">
                          <div className="font-semibold text-primary mb-1">🔑 原文关键句</div>
                          <div className="italic text-foreground/80">"{q.key_sentence}"</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "analysis" && (
          <div className="space-y-4">
            <AnalysisBlock title="📐 段落结构 · 文章如何展开" content={article.paragraph_structure} />
            <AnalysisBlock title="✍️ 写作手法 · 议论文常用技巧" content={article.writing_techniques} />
            <AnalysisBlock title="🎯 核心考点 · 这篇训练哪些题型" content={article.core_question_types} />
            <AnalysisBlock title="💡 应试技巧 · 怎么读·怎么答" content={article.exam_strategies} />
            <AnalysisBlock title="🔗 主题关联 · 为高考写作积累素材" content={article.topic_connection} />

            {article.useful_sentences && article.useful_sentences.length > 0 && (
              <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-500" /> 写作可借用句型
                </h3>
                <ul className="space-y-3">
                  {article.useful_sentences.map((s, i) => (
                    <li key={i} className="rounded-xl bg-muted/30 p-3 border-l-4 border-amber-500">
                      <div className="text-sm font-medium leading-relaxed">{s.en}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.cn}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {article.argumentation_logic && (
              <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-bold mb-2">🧠 论证逻辑</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{article.argumentation_logic}</p>
              </div>
            )}
          </div>
        )}

        {tab === "vocab" && (
          <div className="space-y-4">
            {(["word", "phrase", "collocation"] as const).map((cat) => {
              const items = vocab.filter((v) => v.category === cat);
              if (items.length === 0) return null;
              const titleMap = { word: "📚 生词注释", phrase: "🔤 重点表达", collocation: "🎯 高频搭配" };
              return (
                <div key={cat} className="rounded-2xl border bg-card p-5">
                  <h3 className="font-bold mb-3">{titleMap[cat]}</h3>
                  <ul className="divide-y">
                    {items.map((v) => (
                      <li key={v.id} className="py-2.5 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-bold">{v.word}</span>
                            {v.phonetic && v.phonetic !== "-" && (
                              <span className="text-xs text-muted-foreground">{v.phonetic}</span>
                            )}
                            {v.pos && <span className="text-[10px] text-primary font-mono">{v.pos}</span>}
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">{v.meaning_cn}</div>
                        </div>
                        <div className="text-xs text-amber-500">{"★".repeat(v.importance)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function AnalysisBlock({ title, content }: { title: string; content: string | null }) {
  const [open, setOpen] = useState(true);
  if (!content) return null;
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition"
      >
        <h3 className="font-bold text-left">{title}</h3>
        {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground whitespace-pre-line border-t pt-3">
          {content}
        </div>
      )}
    </div>
  );
}
