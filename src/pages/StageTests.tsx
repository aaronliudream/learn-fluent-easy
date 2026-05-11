import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Trophy, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Test = {
  id: string;scope: string;unit_index: number | null;title: string;description: string | null;
  required_lessons: number;total_questions: number;pass_threshold: number;
  base_coins: number;base_exp: number;
  completed_lessons: number;unlocked: boolean;
  pass_count: number;attempt_count: number;
  cooldown_until: string | null;best_score: number;
  next_reward_coins: number;next_reward_exp: number;
};

const SEGMENT_LABEL: Record<string, string> = { primary: "小学", junior: "初中", gaokao: "高中" };
const SCOPE_LABEL: Record<string, {name: string;color: string;}> = {
  unit: { name: "单元小测", color: "from-sky-400 to-blue-500" },
  module: { name: "模块过关", color: "from-violet-500 to-fuchsia-500" },
  term: { name: "学段诊断", color: "from-amber-500 to-orange-500" },
  final: { name: "毕业大考", color: "from-rose-500 to-red-600" }
};

export default function StageTests() {
  const { segment = "primary", grade = "1" } = useParams();
  const nav = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.rpc("list_stage_tests", {
      _segment: segment, _grade: Number(grade)
    });
    if (error) toast.error(error.message);
    setTests(data as Test[] ?? []);
    setLoading(false);
  }

  useEffect(() => {load();}, [segment, grade]);

  function backUrl() {
    if (segment === "primary") return `/primary/grade/${grade}`;
    if (segment === "junior") return `/junior`;
    return `/gaokao`;
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6 pb-24">
      <BackLink to={backUrl()} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回</T>
      </BackLink>

      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          MASTERY CHECKPOINT
        </div>
        <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">
          📊 {SEGMENT_LABEL[segment]} · {grade} <T>年级 · 阶段测试</T>
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          <T>掌握学习模型 · 通关解锁 · 答对得金币与宠物经验 · 防刷机制保护学习真实性</T>
        </p>
      </div>

      {/* 防作弊说明 */}
      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <div className="font-bold"><T>🛡️ 学习真实性保护</T></div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li><T>通过后</T> <b><T>48 小时冷却</T></b><T>，未通过 24 小时后可重考</T></li>
          <li><T>第 2 次通过仅</T> <b>50%</b> <T>奖励，第 3 次 25%，之后无奖励</T></li>
          <li><T>重考必须包含</T> <b><T>≥60% 新题</T></b><T>，否则不发奖励</T></li>
          <li><T>每日金币上限 500 · 宠物经验上限 200</T></li>
          <li><T>首次满分额外</T> <b>+50%</b> <T>奖励 🎉</T></li>
        </ul>
      </div>

      {loading ?
      <div className="text-center text-sm text-muted-foreground"><T>加载中…</T></div> :

      <div className="space-y-3">
          {tests.map((t) => {
          const cd = t.cooldown_until ? new Date(t.cooldown_until) : null;
          const cooling = cd && cd > new Date();
          const hoursLeft = cooling ? Math.ceil((cd!.getTime() - Date.now()) / 3600000) : 0;
          const scope = SCOPE_LABEL[t.scope] ?? SCOPE_LABEL.unit;
          const lessonsNeeded = Math.max(0, t.required_lessons - t.completed_lessons);
          const canStart = t.unlocked && !cooling;
          return (
            <div key={t.id} className={`rounded-2xl bg-gradient-to-br ${scope.color} p-[2px] shadow-tile`}>
                <div className="rounded-[14px] bg-background p-4">
                  <div className="flex items-start gap-3">
                    <div className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${scope.color} text-white`}>
                      {t.scope === "final" ? <Trophy className="size-6" /> : <Sparkles className="size-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">{scope.name}</span>
                        {t.pass_count > 0 &&
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 className="size-3" /> <T>已通过</T> {t.pass_count} <T>次</T>
                          </span>
                      }
                      </div>
                      <div className="mt-0.5 text-base font-extrabold">{t.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{t.description}</div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span>📝 {t.total_questions} <T>题</T></span>
                        <span><T>🎯 通过线</T> {Math.round(t.pass_threshold * 100)}%</span>
                        <span>🪙 +{t.next_reward_coins} <T>金币</T></span>
                        <span>⭐ +{t.next_reward_exp} <T>经验</T></span>
                        {t.best_score > 0 && <span><T>🏆 最佳</T> {Math.round(t.best_score * 100)}%</span>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    {!t.unlocked ?
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                        <Lock className="size-4" /> <T>还需完成</T> {lessonsNeeded} <T>个课时解锁</T>
                      </div> :
                  cooling ?
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                        <Clock className="size-4" /> <T>冷却中 · 约</T> {hoursLeft} <T>小时后可再考</T>
                      </div> :

                  <button
                    onClick={() => nav(`/stage-test/${segment}/${grade}/${t.id}`)}
                    className={`w-full rounded-xl bg-gradient-to-r ${scope.color} py-2.5 text-sm font-extrabold text-white shadow-tile transition hover:-translate-y-0.5`}>
                    
                        {t.pass_count > 0 ? "再次挑战 →" : "开始测试 →"}
                      </button>
                  }
                    {!canStart && t.unlocked &&
                  <button disabled className="mt-1 w-full text-[11px] text-muted-foreground">
                        {/* placeholder */}
                      </button>
                  }
                  </div>
                </div>
              </div>);

        })}
        </div>
      }
    </main>);

}