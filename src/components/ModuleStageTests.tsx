import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Lock, Clock, Trophy, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Test = {
  id: string;scope: string;unit_index: number | null;title: string;description: string | null;
  required_lessons: number;total_questions: number;pass_threshold: number;
  base_coins: number;base_exp: number;module: string | null;
  completed_lessons: number;unlocked: boolean;
  pass_count: number;attempt_count: number;
  cooldown_until: string | null;best_score: number;
  next_reward_coins: number;next_reward_exp: number;
};

const SCOPE_COLOR: Record<string, string> = {
  unit: "from-sky-400 to-blue-500",
  module: "from-violet-500 to-fuchsia-500",
  term: "from-amber-500 to-orange-500",
  final: "from-rose-500 to-red-600"
};

const MODULE_LABEL: Record<string, string> = {
  grammar: "语法",
  vocab: "词汇",
  reading: "阅读",
  listening: "听力",
  writing: "写作"
};

/**
 * 嵌入到每个学习板块顶部的「阶段测试」入口。
 * - 自动按 segment + grade + module 拉取测试
 * - 优先展示「已解锁 + 未冷却」的下一个测试，引导用户去考
 * - 全部完成或无可考时隐藏
 */
export default function ModuleStageTests({
  segment,
  grade,
  module,
  className = ""





}: {segment: "primary" | "junior" | "gaokao";grade: number;module: "grammar" | "vocab" | "reading" | "listening" | "writing";className?: string;}) {
  const nav = useNavigate();
  const [tests, setTests] = useState<Test[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("list_stage_tests", {
        _segment: segment,
        _grade: grade,
        _module: module
      });
      if (!cancelled && !error) setTests(data as Test[] ?? []);
    })();
    return () => {cancelled = true;};
  }, [segment, grade, module]);

  if (!tests || tests.length === 0) return null;

  // 选择"下一个最该考的测试"：解锁 & 未冷却 & 未通过 优先；否则解锁 & 未冷却；否则第一个
  const now = Date.now();
  const unlockedReady = tests.filter((t) =>
  t.unlocked && (!t.cooldown_until || new Date(t.cooldown_until).getTime() < now)
  );
  const next =
  unlockedReady.find((t) => t.pass_count === 0) ??
  unlockedReady[0] ??
  tests.find((t) => !t.unlocked) ??
  tests[0];

  const cd = next.cooldown_until ? new Date(next.cooldown_until) : null;
  const cooling = cd && cd.getTime() > now;
  const hoursLeft = cooling ? Math.ceil((cd!.getTime() - now) / 3600000) : 0;
  const lessonsNeeded = Math.max(0, next.required_lessons - next.completed_lessons);
  const color = SCOPE_COLOR[next.scope] ?? SCOPE_COLOR.unit;
  const moduleLabel = MODULE_LABEL[module];

  const passedCount = tests.filter((t) => t.pass_count > 0).length;

  return (
    <div className={`mb-4 rounded-2xl bg-gradient-to-br ${color} p-[2px] shadow-tile ${className}`}>
      <div className="rounded-[14px] bg-background p-3">
        <div className="flex items-start gap-3">
          <div className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${color} text-white`}>
            {next.scope === "final" ? <Trophy className="size-5" /> : <Sparkles className="size-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                📊 {moduleLabel}<T>阶段测试</T>
              </span>
              {passedCount > 0 &&
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="size-3" /> <T>已通过</T> {passedCount}/{tests.length}
                </span>
              }
            </div>
            <div className="mt-0.5 truncate text-sm font-extrabold">{next.title}</div>
            <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
              {next.description ?? `${next.total_questions} 题 · 通过线 ${Math.round(next.pass_threshold * 100)}% · +${next.next_reward_coins} 金币`}
            </div>
          </div>
          <div className="shrink-0">
            {!next.unlocked ?
            <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1.5 text-[11px] text-muted-foreground">
                <Lock className="size-3.5" /> <T>还差</T> {lessonsNeeded}
              </div> :
            cooling ?
            <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] font-semibold text-amber-700">
                <Clock className="size-3.5" /> {hoursLeft}h
              </div> :

            <button
              onClick={() => nav(`/stage-test/${segment}/${grade}/${next.id}`)}
              className={`rounded-lg bg-gradient-to-r ${color} px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:-translate-y-0.5`}>
              
                {next.pass_count > 0 ? "再战 →" : "开始测试 →"}
              </button>
            }
          </div>
        </div>
      </div>
    </div>);

}