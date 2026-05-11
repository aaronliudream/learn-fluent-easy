import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BackLink from "@/components/BackLink";
import { Loader2, Target, Trophy, AlertTriangle, CheckCircle2 } from "lucide-react";

type Quiz = {q: string;options: string[];answer: number;difficulty?: number;};
type CardData = {
  id: string;
  slug: string;
  question: string;
  quiz: Quiz[];
  view_count: number;
  author_id: string;
};
type Event = {
  question_idx: number;
  picked_idx: number;
  is_correct: boolean;
};
type Attempt = {
  total_questions: number;
  correct_count: number;
  score_pct: number;
  stage: string | null;
};

export default function TeacherCardStats() {
  const { slug } = useParams<{slug: string;}>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<CardData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {navigate(`/auth?redirect=/teacher/cards/${slug}`);return;}
      const { data: c } = await supabase.
      from("knowledge_cards").
      select("id, slug, question, quiz, view_count, author_id").
      eq("slug", slug!).
      maybeSingle();
      if (!c) {setLoading(false);return;}
      if (c.author_id !== u.user.id) {setUnauthorized(true);setLoading(false);return;}
      setCard(c as any);
      const [{ data: ev }, { data: at }] = await Promise.all([
      supabase.from("card_answer_events").
      select("question_idx, picked_idx, is_correct").
      eq("card_id", c.id),
      supabase.from("card_attempts").
      select("total_questions, correct_count, score_pct, stage").
      eq("card_id", c.id)]
      );
      setEvents((ev ?? []) as Event[]);
      setAttempts((at ?? []) as Attempt[]);
      setLoading(false);
    })();
  }, [slug, navigate]);

  if (loading) {
    return <main className="p-10 text-center text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin mx-auto" /></main>;
  }
  if (unauthorized) {
    return <main className="max-w-md mx-auto p-8 text-center space-y-3">
      <p className="text-muted-foreground"><T>这张卡不是你创建的，无法查看数据。</T></p>
      <Link to="/teacher/cards"><Button><T>返回我的卡片</T></Button></Link>
    </main>;
  }
  if (!card) {
    return <main className="max-w-md mx-auto p-8 text-center space-y-3">
      <p className="text-muted-foreground"><T>卡片不存在</T></p>
      <Link to="/teacher/cards"><Button><T>返回</T></Button></Link>
    </main>;
  }

  // Aggregate per-question
  const perQ = card.quiz.map((q, idx) => {
    const evs = events.filter((e) => e.question_idx === idx);
    const total = evs.length;
    const correct = evs.filter((e) => e.is_correct).length;
    const optCounts = q.options.map((_, oi) => evs.filter((e) => e.picked_idx === oi).length);
    let mostWrong = -1;
    let mostWrongCount = 0;
    optCounts.forEach((n, oi) => {
      if (oi !== q.answer && n > mostWrongCount) {mostWrong = oi;mostWrongCount = n;}
    });
    return {
      q, idx, total, correct,
      pct: total ? Math.round(correct / total * 100) : null,
      optCounts, mostWrong, mostWrongCount
    };
  });

  // Stage performance
  const stageGroups = ["s3", "s5", "s10"].map((s) => {
    const list = attempts.filter((a) => a.stage === s);
    const sum = list.reduce((n, a) => n + a.score_pct, 0);
    return {
      stage: s,
      label: s === "s3" ? "第 1 关 (3题)" : s === "s5" ? "第 2 关 (+2题)" : "终极关 (+5题)",
      n: list.length,
      avg: list.length ? Math.round(sum / list.length) : 0,
      perfect: list.filter((a) => a.correct_count === a.total_questions).length
    };
  });

  const totalAnswers = events.length;
  const totalCorrect = events.filter((e) => e.is_correct).length;
  const overallPct = totalAnswers ? Math.round(totalCorrect / totalAnswers * 100) : 0;

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <BackLink to="/teacher/cards"><T>返回卡片列表</T></BackLink>
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground"><T>卡片数据</T></p>
        <h1 className="text-xl md:text-2xl font-bold leading-tight mt-1">{card.question}</h1>
        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{card.view_count} <T>扫码</T></Badge>
          <Badge variant="secondary">{attempts.length} <T>次答题</T></Badge>
          <Badge variant="secondary">{totalAnswers} <T>道答题次数</T></Badge>
          <Badge variant="secondary"><T>总正确率</T> {overallPct}%</Badge>
          <Link to={`/q/${card.slug}`} className="underline"><T>查看卡片 →</T></Link>
        </div>
      </header>

      {/* Stage performance */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <T>各关卡表现</T>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {stageGroups.map((s) =>
          <Card key={s.stage} className="p-4">
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="mt-1 text-2xl font-extrabold">{s.n}</p>
              <p className="text-xs text-muted-foreground"><T>完成人次</T></p>
              {s.n > 0 &&
            <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <T>平均正确率</T> <span className="font-semibold">{s.avg}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <T>满分</T> <span className="font-semibold">{s.perfect}</span>
                  </div>
                </div>
            }
            </Card>
          )}
        </div>
      </section>

      {/* Per-question */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <T>每道题正确率分布</T>
        </h2>
        {totalAnswers === 0 ?
        <Card className="p-6 text-center text-sm text-muted-foreground">
            <T>还没人答题。把卡片分享出去吧！</T>
          </Card> :

        <div className="space-y-3">
            {perQ.map((row) => {
            const tone = row.pct === null ? "muted" :
            row.pct >= 80 ? "good" :
            row.pct >= 50 ? "warn" : "bad";
            return (
              <Card key={row.idx} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Q{row.idx + 1}
                        {row.q.difficulty ? ` · 难度 ${row.q.difficulty}` : ""}
                        {" · "}{row.total} <T>次作答</T>
                      </p>
                      <p className="font-medium leading-snug mt-0.5">{row.q.q}</p>
                    </div>
                    {row.pct !== null &&
                  <div className={`text-right shrink-0 ${
                  tone === "good" ? "text-emerald-600 dark:text-emerald-400" :
                  tone === "warn" ? "text-amber-600 dark:text-amber-400" :
                  "text-rose-600 dark:text-rose-400"}`
                  }>
                        <p className="text-2xl font-extrabold leading-none">{row.pct}%</p>
                        <p className="text-[10px] uppercase tracking-wider"><T>正确率</T></p>
                      </div>
                  }
                  </div>

                  {row.pct !== null && <Progress value={row.pct} className="h-1.5" />}

                  {/* Option distribution */}
                  <div className="space-y-1.5">
                    {row.q.options.map((opt, oi) => {
                    const count = row.optCounts[oi];
                    const pct = row.total ? Math.round(count / row.total * 100) : 0;
                    const isAnswer = oi === row.q.answer;
                    const isMostWrong = oi === row.mostWrong && row.mostWrongCount > 0;
                    return (
                      <div key={oi} className="text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`flex items-center gap-1.5 min-w-0 ${
                          isAnswer ? "font-semibold text-emerald-700 dark:text-emerald-400" :
                          isMostWrong ? "font-semibold text-rose-700 dark:text-rose-400" :
                          "text-muted-foreground"}`
                          }>
                              {isAnswer && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                              {isMostWrong && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                              <span className="truncate">{String.fromCharCode(65 + oi)}. {opt}</span>
                            </span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">
                              {count} · {pct}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                            className={
                            isAnswer ? "h-full bg-emerald-500" :
                            isMostWrong ? "h-full bg-rose-500" :
                            "h-full bg-muted-foreground/40"
                            }
                            style={{ width: `${pct}%` }} />
                          
                          </div>
                        </div>);

                  })}
                  </div>

                  {row.mostWrong >= 0 && row.pct !== null && row.pct < 70 &&
                <div className="text-xs bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-md px-2.5 py-1.5 text-rose-700 dark:text-rose-300">
                      <T>💡 最常错选的是</T> <strong>{String.fromCharCode(65 + row.mostWrong)}</strong>
                      （{row.mostWrongCount} <T>次）— 也许讲解里要重点澄清这个误解。</T>
                    </div>
                }
                </Card>);

          })}
          </div>
        }
      </section>
    </main>);

}