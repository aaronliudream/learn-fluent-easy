import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Send, CheckCircle2, XCircle, Sparkles, BookOpen, FileText, Target, ChevronDown, ChevronUp, Eye, Gauge, Brain, HelpCircle, ThumbsUp, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getReadingArticleById } from "@/lib/gaokaoContent";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import NoCopyGuard from "@/components/NoCopyGuard";
import { recordMastery } from "@/lib/masteryProgress";
import { celebrateScore } from "@/lib/feedback";
import { ShareButton } from "@/components/share/ShareButton";
import { ExamPaper, ExamContainer, ExamCard, ExamOption, ExamProgress } from "@/components/exam/ExamPaper";
import { ExamStepper, type ExamStep } from "@/components/exam/ExamStepper";
import { InlineTutorChat } from "@/components/exam/InlineTutorChat";
import { QuestionExamBadge } from "@/components/exam/QuestionExamBadge";
import { PracticeBooster } from "@/components/exam/PracticeBooster";
import {
  DiagnosisTable,
  MistakeBookCallout,
  NextStepCards,
  inferTrap,
  buildNextStepsFromResult,
  type DiagnosisRow,
} from "@/components/exam/DiagnosisExtras";

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
  useful_sentences: {en: string;cn: string;}[] | null;
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

type Stage = "read" | "test" | "diagnosis" | "dialogue" | "review";

const TYPE_COLOR: Record<string, string> = {
  main_idea: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  detail: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  inference: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  vocabulary: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  attitude: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  purpose: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  data_interp: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  viewpoint: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
};

function cleanArticleBody(body: string) {
  const normalized = body.replace(/\r\n/g, "\n").trim();

  // 1) 优先抽取「一、文章正文」到「二、测试题目」之间的英文正文 (GMAT 风格 — 只要纯文章)
  const startMarkers = [/\*\*一、\s*文章正文\*\*/, /【\s*一[、.]?\s*文章正文\s*】/, /^一、\s*文章正文/m];
  const endMarkers = [/\*\*二、/, /【\s*二[、.]/, /^二、/m, /测试题目/, /答案与解析/, /文章分析/, /生词与重点表达/];

  let body1 = normalized;
  for (const re of startMarkers) {
    const m = normalized.match(re);
    if (m && m.index !== undefined) {body1 = normalized.slice(m.index + m[0].length);break;}
  }
  for (const re of endMarkers) {
    const m = body1.match(re);
    if (m && m.index !== undefined) {body1 = body1.slice(0, m.index);break;}
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
  result = result.
  replace(/\*\*+/g, "").
  replace(/(^|\s)#{1,6}\s+/g, "$1").
  replace(/\\([|*_#\-\\])/g, "$1") // 去掉转义反斜杠 (\| → |)
  .replace(/\\+/g, "").
  replace(/[ \t]{2,}/g, " ");

  // 4) 逐行过滤掉中文 metadata / 标签行 (GMAT 风格只留英文段落 + 标题)
  const cnMetaPatterns = [
  /^【.*】/, // 【主题语境】... / 【题型】...
  /^\s*[一二三四五六七八九十][、.\s]/, // 一、二、三、...
  /主题语境|话题群|具体话题|题型|字数|建议用时|文章正文|测试题目|答案与解析|文章分析|生词与重点表达/];

  result = result.
  split("\n").
  filter((line) => {
    const t = line.trim();
    if (!t) return true; // keep blank lines for paragraph breaks
    if (t.replace(/[\s\*_#\-|·]/g, "").length === 0) return false; // 残余装饰行
    if (cnMetaPatterns.some((re) => re.test(t))) return false;
    return true;
  }).
  join("\n");

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
  const answers = new Map<number, {correct: "A" | "B" | "C" | "D";explanations: Partial<Record<"A" | "B" | "C" | "D", string>>;general: string | null;}>();

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

  return questionSection.
  split(/(?=\n?\*\*\d+\.\*\*)/).
  filter((block) => /^\s*\*\*\d+\.\*\*/.test(block)).
  map((block, index) => {
    const stemMatch = block.match(/^\s*\*\*(\d+)\.\*\*\s*([\s\S]*?)(?=\n\s*A\.\s)/);
    const sortOrder = stemMatch ? Number(stemMatch[1]) : index + 1;
    const parsed = answers.get(sortOrder);
    const optionText = (opt: "A" | "B" | "C" | "D") => {
      const next = opt === "A" ? "B" : opt === "B" ? "C" : opt === "C" ? "D" : null;
      const pattern = next ?
      new RegExp(`\\n\\s*${opt}\\.\\s*([\\s\\S]*?)(?=\\n\\s*${next}\\.\\s)`, "m") :
      new RegExp(`\\n\\s*${opt}\\.\\s*([\\s\\S]*?)$`, "m");
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
      difficulty: 3
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
  // 累计掌握度: 按 question_type 聚合该用户历史正确率
  const [typeMastery, setTypeMastery] = useState<Record<string, number>>({});
  // ④ 对话阶段的预填问题（从错题"和 AI 详谈"按钮带入）
  const [tutorPrefill, setTutorPrefill] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserEmail(data.user.email ?? data.user.id.slice(0, 8));
    });
  }, []);

  // 进入诊断阶段时，加载该用户每个考点 (question_type) 的累计掌握度
  useEffect(() => {
    if (stage !== "diagnosis") return;
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const types = Array.from(new Set(questions.map((q) => q.question_type))).filter(Boolean);
        if (types.length === 0) return;
        const { data } = await supabase
          .from("gaokao_reading_diagnostics")
          .select("question_type,is_correct")
          .eq("user_id", user.id)
          .in("question_type", types)
          .limit(1000);
        if (cancelled || !data) return;
        const acc: Record<string, { ok: number; total: number }> = {};
        for (const row of data as { question_type: string; is_correct: boolean }[]) {
          const k = row.question_type ?? "reading";
          acc[k] = acc[k] || { ok: 0, total: 0 };
          acc[k].total += 1;
          if (row.is_correct) acc[k].ok += 1;
        }
        const m: Record<string, number> = {};
        for (const [k, v] of Object.entries(acc)) {
          m[k] = v.total > 0 ? Math.round((v.ok / v.total) * 100) : 0;
        }
        setTypeMastery(m);
      } catch (e) {
        console.warn("load typeMastery", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stage, questions]);

  // Load
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const pep = getReadingArticleById(id);
      if (pep) {
        const loadedArticle: Article = {
          id: pep.id,
          title: pep.title,
          body: pep.body,
          word_count: pep.word_count,
          recommended_minutes: pep.recommended_minutes,
          difficulty: pep.difficulty,
          cefr_level: pep.cefr_level,
          genre_label: pep.genre_label,
          sub_band: pep.sub_band,
          specific_topic: pep.specific_topic,
          topic_group: pep.topic_group,
          paragraph_structure: pep.paragraph_structure,
          writing_techniques: pep.writing_techniques,
          core_question_types: pep.core_question_types,
          exam_strategies: pep.exam_strategies,
          topic_connection: pep.topic_connection,
          useful_sentences: pep.useful_sentences,
          argumentation_logic: pep.argumentation_logic,
        };
        const loadedQuestions: Question[] = pep.questions.map((q) => ({
          id: q.id,
          sort_order: q.sort_order,
          stem: q.stem,
          question_type: q.question_type,
          question_type_cn: q.question_type_cn,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_answer: q.correct_answer,
          explanation_a: q.explanation_a,
          explanation_b: q.explanation_b,
          explanation_c: q.explanation_c,
          explanation_d: q.explanation_d,
          general_explanation: q.general_explanation,
          locate_paragraph: q.locate_paragraph,
          key_sentence: q.key_sentence,
          difficulty: q.difficulty,
        }));
        setArticle(loadedArticle);
        setQuestions(loadedQuestions);
        setVocab([]);
        setSecondsLeft((pep.recommended_minutes ?? 8) * 60);
        setLoading(false);
        return;
      }
      const [a, q, v] = await Promise.all([
        supabase.from("gaokao_reading_articles").select("*").eq("id", id).maybeSingle(),
        supabase.from("gaokao_reading_article_questions").select("*").eq("article_id", id).order("sort_order"),
        supabase.from("gaokao_reading_article_vocab").select("*").eq("article_id", id).order("sort_order"),
      ]);
      const loadedArticle = a.data as unknown as Article | null;
      const loadedQuestions = (q.data ?? []) as Question[];
      setArticle(loadedArticle);
      setQuestions(
        loadedQuestions.length > 0
          ? loadedQuestions
          : loadedArticle
            ? parseEmbeddedQuestions(loadedArticle.body, loadedArticle.id)
            : [],
      );
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
    const m: Record<string, {correct: number;total: number;cn: string;}> = {};
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

    const now = Date.now();
    setSubmittedAt(now);
    const duration = Math.floor((now - startTime) / 1000);
    // 阅读用时 = 首次答题前的时间; 若用户没点过选项, 用总时长
    const readingSec = Math.max(
      30,
      Math.floor(((readingEndAt ?? now) - startTime) / 1000)
    );
    const wpm = Math.round(article.word_count / Math.max(readingSec, 1) * 60);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const answerLog = questions.map((q) => ({
          question_id: q.id,
          user_answer: answers[q.id] ?? null,
          is_correct: answers[q.id] === q.correct_answer,
          question_type: q.question_type,
          confidence: confidences[q.id] ?? null
        }));
        await supabase.from("gaokao_reading_sessions").insert({
          user_id: user.id,
          article_id: article.id,
          status: "submitted",
          answers: answerLog,
          total_questions: totalQ,
          correct_count: correctCount,
          score_pct: totalQ > 0 ? correctCount / totalQ * 100 : 0,
          submitted_at: new Date(now).toISOString(),
          duration_seconds: duration,
          type_breakdown: typeBreakdown
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
          time_spent_seconds: Math.floor(duration / Math.max(totalQ, 1))
        }));
        if (diagnostics.length) {
          await supabase.from("gaokao_reading_diagnostics").insert(diagnostics);
        }
        // 写入统一掌握度（5星 + 遗忘曲线）
        const pct = totalQ > 0 ? correctCount / totalQ * 100 : 0;
        await recordMastery({ module: "gaokao_reading", itemId: article.id, pct });
        // 统一答题路由 — 每题一条
        try {
          const { recordUnifiedAttempt } = await import("@/hooks/useRecordAttempt");
          await Promise.all(questions.map((q) =>
          recordUnifiedAttempt({
            stage: "senior", grade: 10, module: "reading",
            item_type: q.question_type || "mcq",
            item_id: q.id,
            item_label: ((article as any).title_en || (article as any).title || article.id).slice(0, 40),
            is_correct: answers[q.id] === q.correct_answer,
            user_answer: answers[q.id] ?? "",
            correct_answer: q.correct_answer ?? "",
            context: { article_id: article.id }
          }).catch(() => {})
          ));
        } catch {}

        // 块③-A:错题本「整篇完整快照」——高中智能诊断阅读此前只经 recordUnifiedAttempt 写薄行
        // (无 snapshot、题干空,被 /mistakes 的阅读薄行过滤隐藏)。这里照 GaokaoReadingPlay 那套
        // 额外直写一条自包含整篇行(题干+全选项+每题对错+原文),让阅读错题在错题本整篇下钻。
        // 纯新增,不碰上面 recordUnifiedAttempt/诊断表/掌握度;失败仅告警,绝不阻断。source_key 一篇一条覆盖。
        try {
          const wrongCount = questions.filter((q) => answers[q.id] !== q.correct_answer).length;
          if (wrongCount > 0) {
            const explOf = (q: Question) => {
              const m: Record<string, string | null> = {
                A: q.explanation_a, B: q.explanation_b, C: q.explanation_c, D: q.explanation_d,
              };
              return m[q.correct_answer] ?? q.general_explanation ?? null;
            };
            const snapshot = {
              source: "reading",
              title: article.title,
              body: cleanArticleBody(article.body),
              questions: questions.map((q, i) => ({
                no: i + 1,
                stem: q.stem,
                options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
                correct_answer: q.correct_answer,
                user_answer: answers[q.id] ?? null,
                is_correct: answers[q.id] === q.correct_answer,
                explanation: explOf(q),
              })),
              wrong_count: wrongCount,
            };
            const { error: snapErr } = await supabase.from("user_mistakes").upsert({
              user_id: user.id,
              module: "reading",
              source_key: `gaokao_reading_passage_${article.id}`,
              source_label: article.title,
              question: article.title ?? "",
              snapshot,
              wrong_count: wrongCount,
              is_resolved: false,
              last_wrong_at: new Date().toISOString(),
            }, { onConflict: "user_id,module,source_key" });
            if (snapErr) console.warn("[gaokao article reading mistake snapshot] upsert failed", snapErr);
          }
        } catch (e) {
          console.warn("[gaokao article reading mistake snapshot] error", e);
        }
      }
    } catch (err) {
      console.error("save session error", err);
    }

    if (timeUp) toast.warning("时间到，已自动交卷");
    const finalPct = totalQ > 0 ? Math.round(correctCount / totalQ * 100) : 0;
    celebrateScore(finalPct);
    setStage("diagnosis");
  }

  if (loading) {
    return (
      <ExamPaper>
        <ExamContainer max="5xl">
          <p className="exam-mute text-sm"><T>加载中...</T></p>
        </ExamContainer>
      </ExamPaper>);

  }

  if (!article) {
    return (
      <ExamPaper>
        <ExamContainer max="5xl">
          <BackLink to="/gaokao/reading" className="inline-flex items-center gap-1 text-sm exam-soft">
            <ArrowLeft className="size-4" /> <T>返回阅读列表</T>
          </BackLink>
          <p className="mt-8 text-center exam-mute"><T>文章不存在</T></p>
        </ExamContainer>
      </ExamPaper>);

  }

  // ============ STAGE 1: READ + TEST (同屏) ============
  if (stage === "test") {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    const lowTime = secondsLeft < 60;
    const progressStates = questions.map((q) => answers[q.id] ? ("answered" as const) : ("todo" as const));

    return (
      <ExamPaper className="pb-32">
        <NoCopyGuard />
        {/* Sticky top bar */}
        <header className="sticky top-0 z-30 border-b exam-divider" style={{ background: "hsl(var(--exam-paper) / 0.95)", backdropFilter: "blur(8px)" }}>
          <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
            <Link to="/gaokao/reading" className="exam-soft hover:text-[hsl(var(--exam-ink))]">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="exam-eyebrow">{article.sub_band} · {article.genre_label}</div>
              <div className="exam-display text-[16px] truncate"><T>{article.title}</T></div>
            </div>
            <div className={cn("flex items-center gap-1.5 px-3 py-1 exam-timer", lowTime && "animate-pulse")} style={lowTime ? { color: "hsl(var(--exam-accent))" } : undefined}>
              <Clock className="size-4" />
              {mm}:{ss}
            </div>
            <div className="hidden sm:flex">
              <ExamProgress states={progressStates} label={`${answeredCount}/${totalQ}`} />
            </div>
            <ShareButton
              variant="icon"
              item={{
                type: "reading",
                title: article.title,
                wordCount: article.word_count,
                difficulty: article.sub_band ?? undefined,
                url: typeof window !== "undefined" ? window.location.href : ""
              }} />
            
            <button onClick={() => handleSubmit(false)} className="exam-btn exam-btn-primary !py-2 !px-4 !text-[13px]">
              <Send className="size-3.5" /> <T>交卷</T>
            </button>
          </div>
          {/* progress bar */}
          <div className="h-[3px]" style={{ background: "hsl(var(--exam-rule))" }}>
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${answeredCount / Math.max(totalQ, 1) * 100}%`, background: "hsl(var(--exam-ink))" }} />
          </div>
        </header>

        {/* Questions only */}
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 py-8 lg:grid-cols-[1.3fr_1fr]">
          {/* 文章 — 左侧 (移动端在上方) */}
          <article className="relative exam-card p-6 sm:p-9 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto exam-passage-scroll">
            <div className="mb-3 flex items-center justify-between border-b exam-divider pb-2">
              <div className="exam-eyebrow">
                {article.word_count} <T>词 ·</T> {article.sub_band} · {article.genre_label}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFontScale((s) => Math.max(0.85, s - 0.1))}
                  className="size-7 rounded border exam-divider exam-soft text-xs font-bold hover:bg-[hsl(var(--exam-paper-soft))]">
                  A-</button>
                <button
                  onClick={() => setFontScale((s) => Math.min(1.4, s + 0.1))}
                  className="size-7 rounded border exam-divider exam-soft text-xs font-bold hover:bg-[hsl(var(--exam-paper-soft))]">
                  A+</button>
              </div>
            </div>
            <h1 className="exam-passage-title"><T>{article.title}</T></h1>
            <div
              className="exam-passage select-text"
              style={{ fontSize: `${fontScale * 15.5}px` }}>
              {displayBody.split("\n\n").map((p, i) =>
              <p key={i} className="text-justify">
                  <span className="exam-para-num">{i + 1}</span>
                  {p}
                </p>
              )}
            </div>
          </article>

          {/* 题目 — 右侧 */}
          <section className="space-y-5">
            <div className="exam-card p-4 flex gap-2 text-xs" style={{ background: "hsl(var(--exam-gold-soft))", borderColor: "hsl(var(--exam-gold) / 0.3)" }}>
              <Target className="size-4 shrink-0 mt-0.5" style={{ color: "hsl(var(--exam-gold))" }} />
              <div>
                <div className="exam-display text-[14px]" style={{ color: "hsl(var(--exam-gold))" }}><T>边读边答</T></div>
                <div className="exam-mute mt-0.5"><T>读完文章作答，全部完成并交卷后才会显示正确答案与解析。</T></div>
              </div>
            </div>

            {questions.map((q, idx) =>
            <ExamCard key={q.id}>
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                  <span className="exam-q-num">No. {String(idx + 1).padStart(2, "0")}</span>
                  {q.question_type_cn && <span className="exam-skill-tag">{q.question_type_cn}</span>}
                </div>
                <p className="exam-stem mb-4">{q.stem}</p>

                <div className="flex flex-col gap-2.5">
                  {(["A", "B", "C", "D"] as const).map((opt) => {
                  const text = q[`option_${opt.toLowerCase()}` as "option_a"];
                  const selected = answers[q.id] === opt;
                  return (
                    <ExamOption
                      key={opt}
                      letter={opt}
                      text={text}
                      state={selected ? "selected" : "idle"}
                      onClick={() => {
                        setAnswers((prev) => ({ ...prev, [q.id]: opt }));
                        if (readingEndAt === null) setReadingEndAt(Date.now());
                      }}
                    />);
                })}
                </div>

                {/* 信心度评分 — 元认知训练 (PISA 金标准) */}
                {answers[q.id] &&
              <div className="mt-4 pt-3 border-t exam-divider">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="size-3.5" style={{ color: "hsl(var(--exam-gold))" }} />
                      <span className="exam-eyebrow">
                        <T>你对这个答案的把握？</T>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([
                  { v: 1, label: "猜的", icon: HelpCircle, color: "rose" },
                  { v: 2, label: "比较确定", icon: ThumbsUp, color: "amber" },
                  { v: 3, label: "非常确定", icon: Zap, color: "emerald" }] as
                  const).map(({ v, label, icon: Icon, color }) => {
                    const active = confidences[q.id] === v;
                    return (
                      <button
                        key={v}
                        onClick={() =>
                        setConfidences((p) => ({ ...p, [q.id]: v }))
                        }
                        className={cn(
                          "flex items-center justify-center gap-1 rounded border px-2 py-1.5 text-xs font-medium transition exam-ui",
                          active ?
                          color === "rose" ?
                          "border-[hsl(var(--exam-accent))] bg-[hsl(var(--exam-accent-soft))] text-[hsl(var(--exam-accent))]" :
                          color === "amber" ?
                          "border-[hsl(var(--exam-gold))] bg-[hsl(var(--exam-gold-soft))] text-[hsl(var(--exam-gold))]" :
                          "border-[hsl(var(--exam-green))] bg-[hsl(var(--exam-green-soft))] text-[hsl(var(--exam-green))]" :
                          "exam-divider exam-mute hover:border-[hsl(var(--exam-ink))]"
                        )}>
                        
                            <Icon className="size-3" />
                            {label}
                          </button>);

                  })}
                    </div>
                  </div>
              }
              </ExamCard>
            )}

            <button
              onClick={() => handleSubmit(false)}
              className="exam-btn exam-btn-primary w-full h-12">
              <Send className="size-4" />
              <T>提交并查看成绩 (</T>{answeredCount}/{totalQ})
            </button>
          </section>
        </div>
        <ExamStepper
          current="test"
          reachable={["test"]}
        />
      </ExamPaper>);

  }

  // ============ STAGE 2: DIAGNOSIS (③) ============
  if (stage === "diagnosis") {
    const pct = totalQ > 0 ? Math.round(correctCount / totalQ * 100) : 0;
    const usedSec = submittedAt ? Math.floor((submittedAt - startTime) / 1000) : 0;
    const usedMM = String(Math.floor(usedSec / 60)).padStart(2, "0");
    const usedSS = String(usedSec % 60).padStart(2, "0");

    // 阅读速度 WPM
    const readingSec = Math.max(
      30,
      Math.floor(((readingEndAt ?? submittedAt ?? Date.now()) - startTime) / 1000)
    );
    const wpm = Math.round(article.word_count / Math.max(readingSec, 1) * 60);
    const efficiency = Math.round(wpm * (correctCount / Math.max(totalQ, 1)));

    // 元认知诊断
    const confEntries = questions.
    map((q) => ({ c: confidences[q.id], ok: answers[q.id] === q.correct_answer })).
    filter((x) => x.c !== undefined);
    const metacogN = confEntries.length;
    const metacogOk = confEntries.filter(
      (x) => x.c! >= 2 && x.ok || x.c === 1 && !x.ok
    ).length;
    const metacogPct = metacogN > 0 ? Math.round(metacogOk / metacogN * 100) : 0;
    // 高信心答错 — 最危险的"认知偏差"
    const dangerCount = confEntries.filter((x) => x.c === 3 && !x.ok).length;
    // 低信心答对 — 蒙对的, 复习重点
    const luckyCount = confEntries.filter((x) => x.c === 1 && x.ok).length;

    const wpmTier =
    wpm >= 90 ? { label: "🚀 极速", color: "text-emerald-600" } :
    wpm >= 70 ? { label: "✅ 高考达标", color: "text-emerald-600" } :
    wpm >= 50 ? { label: "⚠️ 接近达标", color: "text-amber-600" } :
    { label: "🐢 需提速", color: "text-rose-600" };
    const effTier =
    efficiency >= 70 ? { label: "🏆 优秀", color: "text-emerald-600" } :
    efficiency >= 52 ? { label: "✅ 达标", color: "text-emerald-600" } :
    efficiency >= 35 ? { label: "⚠️ 接近", color: "text-amber-600" } :
    { label: "🔴 加练", color: "text-rose-600" };

    let feedback = { emoji: "🎉", title: "出色！", desc: "继续保持，向顶尖水平冲刺。", color: "text-emerald-600" };
    if (pct < 50) feedback = { emoji: "💪", title: "还需加强", desc: "别灰心，精读复盘比做对更重要。", color: "text-rose-600" };else
    if (pct < 75) feedback = { emoji: "👍", title: "有潜力", desc: "稳扎稳打，看看每题的解析。", color: "text-amber-600" };

    return (
      <ExamPaper>
        <ExamContainer max="3xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">{feedback.emoji}</div>
          <h1 className={cn("exam-display text-[36px]", feedback.color)}><T>{feedback.title}</T></h1>
          <p className="exam-body-italic text-[15px] exam-mute mt-2"><T>{feedback.desc}</T></p>
          <div className="mt-3 flex justify-center">
            <ShareButton
              variant="cta"
              label="📤 晒成绩 / 分享文章"
              item={{
                type: "score",
                module: `高考阅读 · ${article.title}`,
                score: pct,
                url: typeof window !== "undefined" ? window.location.href : ""
              }} />
            
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">{correctCount}<span className="text-sm text-muted-foreground">/{totalQ}</span></div>
            <div className="text-xs text-muted-foreground mt-1"><T>答对题数</T></div>
          </div>
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className={cn("text-2xl font-bold tabular-nums", feedback.color)}>{pct}%</div>
            <div className="text-xs text-muted-foreground mt-1"><T>正确率</T></div>
          </div>
          <div className="rounded-2xl border bg-card p-4 text-center">
            <div className="text-2xl font-bold tabular-nums">{usedMM}:{usedSS}</div>
            <div className="text-xs text-muted-foreground mt-1"><T>用时 / 限</T>{article.recommended_minutes}<T>分</T></div>
          </div>
        </div>

        {/* 🚀 全球标准诊断: 阅读速度 + 效率指数 + 元认知 */}
        <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 p-5 mb-6">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> <T>全球标准诊断</T>
            <span className="text-[10px] font-normal text-muted-foreground border rounded px-1.5 py-0.5">
              <T>对标 PISA / Cambridge</T>
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-card border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Gauge className="size-3.5" /> <T>阅读速度</T>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-bold tabular-nums", wpmTier.color)}>{wpm}</span>
                <span className="text-xs text-muted-foreground">WPM</span>
              </div>
              <div className={cn("text-[10px] mt-0.5 font-medium", wpmTier.color)}><T>{wpmTier.label}</T></div>
            </div>
            <div className="rounded-xl bg-card border p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Zap className="size-3.5" /> <T>效率指数</T>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-bold tabular-nums", effTier.color)}>{efficiency}</span>
              </div>
              <div className={cn("text-[10px] mt-0.5 font-medium", effTier.color)}><T>{effTier.label}</T></div>
            </div>
            <div className="rounded-xl bg-card border p-3 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Brain className="size-3.5" /> <T>元认知准确度</T>
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
          {(dangerCount > 0 || luckyCount > 0) &&
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
              {dangerCount > 0 &&
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs">
                  <div className="font-bold text-rose-600 flex items-center gap-1">
                    <T>🚨 认知偏差</T> {dangerCount} <T>题</T>
                  </div>
                  <div className="text-rose-600/80 mt-0.5">
                    <T>「非常确定」却答错 — 是最危险的盲点，必须重点复盘</T>
                  </div>
                </div>
            }
              {luckyCount > 0 &&
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs">
                  <div className="font-bold text-amber-600 flex items-center gap-1">
                    <T>🍀 蒙对</T> {luckyCount} <T>题</T>
                  </div>
                  <div className="text-amber-600/80 mt-0.5">
                    <T>「猜的」却答对 — 不是真掌握，建议刻意重做</T>
                  </div>
                </div>
            }
            </div>
          }

          <div className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
            💡 <b><T>效率指数 = WPM × 正确率</T></b><T>。高考阅读要求 ≥ 70 WPM × 75% =</T> <b>52</b> <T>为达标线。</T>
            <br />
            🧠 <b><T>元认知</T></b><T>: 你对自己掌握程度的判断是否准确（高信心+答对、低信心+答错都算"自评准确"）。</T>
          </div>
        </div>

        {/* 题型诊断 */}
        <div className="rounded-2xl border bg-card p-5 mb-6">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <Target className="size-4 text-primary" /> <T>题型诊断</T>
          </h2>
          <div className="space-y-2">
            {Object.entries(typeBreakdown).map(([type, v]) => {
              const p = v.correct / v.total * 100;
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
                      style={{ width: `${p}%` }} />
                    
                  </div>
                </div>);

            })}
          </div>
        </div>

        {/* 题目对错速览 */}
        <div className="rounded-2xl border bg-card p-5 mb-6">
          <h2 className="font-bold mb-3"><T>题目速览</T></h2>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {questions.map((q, i) => {
              const ok = answers[q.id] === q.correct_answer;
              return (
                <div
                  key={q.id}
                  className={cn(
                    "aspect-square rounded-lg border flex items-center justify-center text-sm font-bold",
                    ok ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" :
                    "bg-rose-500/10 border-rose-500/30 text-rose-600"
                  )}>
                  
                  {i + 1}
                </div>);

            })}
          </div>
        </div>

        {/* === ③ 新增：考点掌握诊断表 === */}
        <div className="mb-6">
          <DiagnosisTable
            rows={questions.map<DiagnosisRow>((q, i) => {
              const isCorrect = answers[q.id] === q.correct_answer;
              return {
                index: i + 1,
                point: q.question_type_cn ?? "阅读理解",
                isCorrect,
                trap: isCorrect ? null : inferTrap(q.question_type),
                cumulativeMastery: typeMastery[q.question_type] ?? null,
              };
            })}
          />
        </div>

        {/* === ③ 新增：错题本提示 === */}
        <div className="mb-6">
          <MistakeBookCallout
            mistakeCount={totalQ - correctCount}
            onAskAI={() => {
              const firstWrong = questions.find((q) => answers[q.id] !== q.correct_answer);
              if (firstWrong) {
                const idx = questions.indexOf(firstWrong) + 1;
                setTutorPrefill(
                  `我不明白第 ${idx} 题为什么不选 ${answers[firstWrong.id] ?? "我的答案"}。能带我回原文找证据吗？`,
                );
              } else {
                setTutorPrefill("帮我梳理一下这篇文章的主旨和结构。");
              }
              setStage("dialogue");
            }}
          />
        </div>

        {/* === ③.5 新增：每道错题的「年份+考点徽章 + 问小月 + AI 练 3 题」 === */}
        {questions.some((q) => answers[q.id] !== q.correct_answer) && (
          <div className="mb-6 rounded-2xl border bg-card p-5">
            <h2 className="font-bold mb-1"><T>逐题深挖 · 不懂就问 · 不会就练</T></h2>
            <p className="text-xs text-muted-foreground mb-4">
              <T>每道错题都标注了考查年份与考点。先问小月，听不懂就让 AI 出 3 道针对性练习；3 轮内仍未掌握会自动加入错题本。</T>
            </p>
            <div className="space-y-4">
              {questions
                .filter((q) => answers[q.id] !== q.correct_answer)
                .map((q) => {
                  const idx = questions.indexOf(q) + 1;
                  const userAns = answers[q.id] ?? "";
                  const userOptText = (q as any)[`option_${(userAns || "a").toLowerCase()}`] || "";
                  return (
                    <div key={q.id} className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-3">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[11px] font-bold text-rose-700">
                            第 {idx} 题
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            你选 <b className="text-rose-700">{userAns || "—"}</b> · 正确 <b className="text-emerald-700">{q.correct_answer}</b>
                          </span>
                        </div>
                        <QuestionExamBadge
                          module="gaokao_reading_article"
                          questionId={q.id}
                          fallbackLabel={q.question_type_cn}
                        />
                      </div>
                      <div className="mb-3 text-xs leading-relaxed text-foreground/85 line-clamp-2">{q.stem}</div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PracticeBooster
                          module="gaokao_reading_article"
                          sourceQuestionId={q.id}
                          sourceQuestionStem={q.stem}
                          fallbackKnowledgePointLabel={q.question_type_cn ?? "阅读理解"}
                          userWrongOption={userAns ? `${userAns}. ${userOptText}` : undefined}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* === ③ 新增：为你推荐的下一步 === */}
        <div className="mb-8">
          {(() => {
            // 找出最弱考点
            const weakest = Object.entries(typeBreakdown)
              .map(([k, v]) => ({ k, cn: v.cn, pct: v.total > 0 ? v.correct / v.total : 1 }))
              .sort((a, b) => a.pct - b.pct)[0];
            const weakKey = weakest?.k ?? questions[0]?.question_type ?? "main_idea";
            const weakCn = weakest?.cn ?? "细节定位";
            const cards = buildNextStepsFromResult({
              weakestPointKey: weakKey,
              weakestPointCn: weakCn,
              topicLabel: article.specific_topic ?? article.topic_group,
              onWeakClick: () => navigate("/gaokao/reading"),
              onMockClick: () => navigate("/gaokao/reading"),
              onMicroLessonClick: () => navigate("/gaokao/reading/knowledge"),
            });
            return <NextStepCards cards={cards} />;
          })()}
        </div>

        {/* === Action row === */}
        <div className="flex flex-col sm:flex-row gap-3 mb-20">
          <button
            className="exam-btn exam-btn-primary flex-1 h-12"
            onClick={() => {
              setTutorPrefill("");
              setStage("dialogue");
            }}
          >
            <Sparkles className="size-4" />
            <T>进入 ④ 对话 · 和译老师讨论</T>
          </button>
          <button
            className="exam-btn exam-btn-ghost flex-1 h-12"
            onClick={() => setStage("review")}
          >
            <Eye className="size-4" />
            <T>查看精读复盘（解析 / 文章分析 / 生词）</T>
          </button>
        </div>

        <button
          onClick={() => navigate("/gaokao/reading")}
          className="w-full text-sm exam-mute hover:text-[hsl(var(--exam-ink))] py-2"
        >
          <T>先返回，稍后复盘</T>
        </button>
        </ExamContainer>
        <ExamStepper
          current="diagnosis"
          reachable={["test", "diagnosis", "dialogue"]}
          onJump={(s) => setStage(s === "test" ? "test" : s === "dialogue" ? "dialogue" : "diagnosis")}
        />
      </ExamPaper>);

  }

  // ============ STAGE 4: DIALOGUE (④) ============
  if (stage === "dialogue") {
    const snapshot = {
      title: article.title,
      topic: article.specific_topic,
      sub_band: article.sub_band,
      passage_excerpt: cleanArticleBody(article.body).slice(0, 2000),
      questions: questions.map((q, i) => ({
        index: i + 1,
        type_cn: q.question_type_cn,
        stem: q.stem,
        options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
        correct_answer: q.correct_answer,
        user_answer: answers[q.id] ?? null,
        is_correct: answers[q.id] === q.correct_answer,
        explanations: {
          A: q.explanation_a,
          B: q.explanation_b,
          C: q.explanation_c,
          D: q.explanation_d,
        },
        general_explanation: q.general_explanation,
      })),
    };

    const wrongIdx = questions
      .map((q, i) => (answers[q.id] !== q.correct_answer ? i + 1 : null))
      .filter((x): x is number => x !== null);
    const starters = [
      wrongIdx[0]
        ? `我不明白第 ${wrongIdx[0]} 题为什么不选 ${answers[questions[wrongIdx[0] - 1].id] ?? "我的答案"}`
        : "帮我梳理一下这篇文章的主旨脉络",
      "文章里有哪个长难句？带我拆解一下",
      "这道题的陷阱是怎么设的？下次怎么避开？",
    ];

    return (
      <ExamPaper className="pb-32">
        <NoCopyGuard />
        <header className="sticky top-0 z-30 border-b exam-divider"
          style={{ background: "hsl(var(--exam-paper) / 0.95)", backdropFilter: "blur(8px)" }}>
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setStage("diagnosis")}
              className="exam-soft hover:text-[hsl(var(--exam-ink))]"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="exam-eyebrow">④ 对话 · Yi · AI 主教</div>
              <div className="exam-display text-[16px] truncate"><T>{article.title}</T></div>
            </div>
            <span className="exam-skill-tag hidden sm:inline-flex">
              {correctCount}/{totalQ}
            </span>
          </div>
        </header>

        <ExamContainer max="5xl">
          <InlineTutorChat
            sessionKey={`gaokao-reading:${article.id}`}
            context="gaokao_reading"
            questionRef={article.id}
            questionSnapshot={snapshot}
            title="译老师"
            subtitle="苏格拉底式 AI 主教 · 不会直接给答案，会引导你回到原文找证据"
            starters={starters}
            prefill={tutorPrefill}
          />
        </ExamContainer>

        <ExamStepper
          current="dialogue"
          reachable={["test", "diagnosis", "dialogue"]}
          onJump={(s) =>
            setStage(s === "test" ? "test" : s === "dialogue" ? "dialogue" : "diagnosis")
          }
          trailing={
            <button
              onClick={() => setStage("review")}
              className="ml-1 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-white/85 hover:text-white"
            >
              <Eye className="size-3.5" />
              精读复盘
            </button>
          }
        />
      </ExamPaper>
    );
  }

  // ============ STAGE 5: REVIEW ============
  return <ReviewStage article={article} questions={questions} answers={answers} vocab={vocab} />;
}

// ============================================================
// REVIEW STAGE COMPONENT
// ============================================================
function ReviewStage({
  article,
  questions,
  answers,
  vocab





}: {article: Article;questions: Question[];answers: Record<string, "A" | "B" | "C" | "D">;vocab: VocabItem[];}) {
  const [tab, setTab] = useState<"questions" | "analysis" | "vocab">("questions");

  return (
    <ExamPaper className="pb-12">
      <header className="sticky top-0 z-30 border-b exam-divider" style={{ background: "hsl(var(--exam-paper) / 0.95)", backdropFilter: "blur(8px)" }}>
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Link to="/gaokao/reading" className="exam-soft hover:text-[hsl(var(--exam-ink))]">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="exam-eyebrow"><T>精读复盘 · Review</T></div>
            <div className="exam-display text-[16px] truncate"><T>{article.title}</T></div>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 flex gap-1 -mb-px overflow-x-auto">
          {[
          { id: "questions", label: "题目解析", icon: Target },
          { id: "analysis", label: "文章分析", icon: FileText },
          { id: "vocab", label: "生词与表达", icon: BookOpen }].
          map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 inline-flex items-center gap-1.5 transition shrink-0",
                  active ?
                  "border-[hsl(var(--exam-ink))] text-[hsl(var(--exam-ink))] exam-display" :
                  "border-transparent exam-mute hover:text-[hsl(var(--exam-ink))]"
                )}>
                
                <Icon className="size-3.5" />
                <T>{t.label}</T>
              </button>);

          })}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {tab === "questions" &&
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
                        {q.locate_paragraph &&
                      <span className="text-[10px] rounded px-1.5 py-0.5 bg-muted text-muted-foreground">
                            <T>定位 第</T>{q.locate_paragraph}<T>段</T>
                          </span>
                      }
                        {isCorrect ?
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircle2 className="size-3" /> <T>答对</T>
                          </span> :

                      <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-semibold">
                            <XCircle className="size-3" /> <T>答错</T>
                          </span>
                      }
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
                          isCorrectOpt ?
                          "border-emerald-500/40 bg-emerald-500/5" :
                          isUserOpt ?
                          "border-rose-500/40 bg-rose-500/5" :
                          "border-border bg-muted/20"
                        )}>
                        
                          <div className="flex items-start gap-2.5">
                            <span className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold",
                            isCorrectOpt ?
                            "bg-emerald-500 text-white" :
                            isUserOpt ?
                            "bg-rose-500 text-white" :
                            "bg-muted text-muted-foreground"
                          )}>
                              {opt}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm font-medium">{text}</span>
                                {isCorrectOpt && <span className="text-[10px] font-bold text-emerald-600"><T>✓ 正确答案</T></span>}
                                {isUserOpt && !isCorrectOpt && <span className="text-[10px] font-bold text-rose-600"><T>你的选择</T></span>}
                              </div>
                              {exp &&
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                  <span className={cn("font-semibold mr-1", isCorrectOpt ? "text-emerald-600" : "text-rose-600")}>
                                    {isCorrectOpt ? "✓" : "✗"}
                                  </span>
                                  {exp}
                                </p>
                            }
                            </div>
                          </div>
                        </div>);

                  })}
                  </div>

                  {/* 总解析 + 关键句 */}
                  {(q.general_explanation || q.key_sentence) &&
                <div className="mt-3 pt-3 border-t space-y-2">
                      {q.general_explanation &&
                  <div className="text-xs">
                          <span className="font-semibold text-primary"><T>📌 解题思路：</T></span>
                          <span className="text-muted-foreground">{q.general_explanation}</span>
                        </div>
                  }
                      {q.key_sentence &&
                  <div className="text-xs rounded-lg bg-primary/5 border border-primary/15 p-2.5">
                          <div className="font-semibold text-primary mb-1"><T>🔑 原文关键句</T></div>
                          <div className="italic text-foreground/80">"{q.key_sentence}"</div>
                        </div>
                  }
                    </div>
                }
                </div>);

          })}
          </div>
        }

        {tab === "analysis" &&
        <div className="space-y-4">
            <AnalysisBlock title="📐 段落结构 · 文章如何展开" content={article.paragraph_structure} />
            <AnalysisBlock title="✍️ 写作手法 · 议论文常用技巧" content={article.writing_techniques} />
            <AnalysisBlock title="🎯 核心考点 · 这篇训练哪些题型" content={article.core_question_types} />
            <AnalysisBlock title="💡 应试技巧 · 怎么读·怎么答" content={article.exam_strategies} />
            <AnalysisBlock title="🔗 主题关联 · 为高考写作积累素材" content={article.topic_connection} />

            {article.useful_sentences && article.useful_sentences.length > 0 &&
          <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-amber-500" /> <T>写作可借用句型</T>
                </h3>
                <ul className="space-y-3">
                  {article.useful_sentences.map((s, i) =>
              <li key={i} className="rounded-xl bg-muted/30 p-3 border-l-4 border-amber-500">
                      <div className="text-sm font-medium leading-relaxed">{s.en}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.cn}</div>
                    </li>
              )}
                </ul>
              </div>
          }

            {article.argumentation_logic &&
          <div className="rounded-2xl border bg-card p-5">
                <h3 className="font-bold mb-2"><T>🧠 论证逻辑</T></h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{article.argumentation_logic}</p>
              </div>
          }
          </div>
        }

        {tab === "vocab" &&
        <div className="space-y-4">
            {(["word", "phrase", "collocation"] as const).map((cat) => {
            const items = vocab.filter((v) => v.category === cat);
            if (items.length === 0) return null;
            const titleMap = { word: "📚 生词注释", phrase: "🔤 重点表达", collocation: "🎯 高频搭配" };
            return (
              <div key={cat} className="rounded-2xl border bg-card p-5">
                  <h3 className="font-bold mb-3">{titleMap[cat]}</h3>
                  <ul className="divide-y">
                    {items.map((v) =>
                  <li key={v.id} className="py-2.5 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-bold">{v.word}</span>
                            {v.phonetic && v.phonetic !== "-" &&
                        <span className="text-xs text-muted-foreground">{v.phonetic}</span>
                        }
                            {v.pos && <span className="text-[10px] text-primary font-mono">{v.pos}</span>}
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">{v.meaning_cn}</div>
                        </div>
                        <div className="text-xs text-amber-500">{"★".repeat(v.importance)}</div>
                      </li>
                  )}
                  </ul>
                </div>);

          })}
          </div>
        }
      </div>
    </ExamPaper>);

}

function AnalysisBlock({ title, content }: {title: string;content: string | null;}) {
  const [open, setOpen] = useState(true);
  if (!content) return null;
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition">
        
        <h3 className="font-bold text-left">{title}</h3>
        {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>
      {open &&
      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground whitespace-pre-line border-t pt-3">
          {content}
        </div>
      }
    </div>);

}