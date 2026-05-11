import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Check, Lock, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 单词「彻底掌握」的 5 步引导路径。
 * ① 认词 (browse) → ② 选义 quiz → ③ 听辨 listen → ④ 配对 match → ⑤ 拼写 spell
 * 每一步达 80% 正确率即可推进；五步走完，本年级整体「完美掌握」。
 */

type Skill = "quiz" | "listen" | "match" | "spell";
const STEPS: {key: "browse" | Skill;label: string;emoji: string;desc: string;}[] = [
{ key: "browse", label: "认词", emoji: "📖", desc: "看一遍 + 听发音" },
{ key: "quiz", label: "选义", emoji: "🎯", desc: "看英文选中文" },
{ key: "listen", label: "听辨", emoji: "🔊", desc: "听发音选英文" },
{ key: "match", label: "配对", emoji: "🧠", desc: "中英翻牌配对" },
{ key: "spell", label: "拼写", emoji: "✍️", desc: "补齐缺失字母" }];


const PASS_PCT = 0.8;
const MIN_ATTEMPTS = 10;

export type StepStatus = "done" | "current" | "locked";

export function browseDone(grade: number): boolean {
  return localStorage.getItem(`primary:browsed:G${grade}`) === "1";
}
export function markBrowseDone(grade: number) {
  localStorage.setItem(`primary:browsed:G${grade}`, "1");
}

export default function MasteryPath({ grade, isAll }: {grade: number;isAll?: boolean;}) {
  const [stats, setStats] = useState<Record<Skill, {c: number;w: number;}>>({
    quiz: { c: 0, w: 0 }, listen: { c: 0, w: 0 }, match: { c: 0, w: 0 }, spell: { c: 0, w: 0 }
  });
  const [browsed, setBrowsed] = useState<boolean>(() => browseDone(grade));
  const [signedIn, setSignedIn] = useState(true);
  const base = isAll ? "all" : grade;

  useEffect(() => {
    setBrowsed(browseDone(grade));
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {setSignedIn(false);return;}
      let q = supabase.
      from("primary_word_mastery").
      select("quiz_correct,quiz_wrong,listen_correct,listen_wrong,match_correct,match_wrong,spell_correct,spell_wrong").
      eq("user_id", u.user.id);
      if (!isAll) q = q.eq("grade", grade);
      const { data } = await q;
      const agg: Record<Skill, {c: number;w: number;}> = {
        quiz: { c: 0, w: 0 }, listen: { c: 0, w: 0 }, match: { c: 0, w: 0 }, spell: { c: 0, w: 0 }
      };
      for (const r of (data ?? []) as any[]) {
        agg.quiz.c += r.quiz_correct ?? 0;agg.quiz.w += r.quiz_wrong ?? 0;
        agg.listen.c += r.listen_correct ?? 0;agg.listen.w += r.listen_wrong ?? 0;
        agg.match.c += r.match_correct ?? 0;agg.match.w += r.match_wrong ?? 0;
        agg.spell.c += r.spell_correct ?? 0;agg.spell.w += r.spell_wrong ?? 0;
      }
      setStats(agg);
    })();
  }, [grade, isAll]);

  function skillStatus(key: Skill): {done: boolean;pct: number;attempts: number;} {
    const { c, w } = stats[key];
    const attempts = c + w;
    const pct = attempts ? c / attempts : 0;
    return { done: attempts >= MIN_ATTEMPTS && pct >= PASS_PCT, pct, attempts };
  }

  // 计算每一步状态
  const statuses: ("done" | "current" | "locked")[] = STEPS.map(() => "locked");
  let firstUndone = -1;
  STEPS.forEach((s, i) => {
    const ok = s.key === "browse" ? browsed : skillStatus(s.key as Skill).done;
    if (ok) statuses[i] = "done";else
    if (firstUndone === -1) {firstUndone = i;statuses[i] = "current";}
  });
  const allDone = firstUndone === -1;
  const doneCount = statuses.filter((s) => s === "done").length;

  const linkFor = (key: "browse" | Skill): string =>
  key === "browse" ? `/primary/vocab/${grade}` : `/primary/games/${base}/${key}`;

  return (
    <section className="mb-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 p-4 shadow-tile md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">MASTERY PATH</div>
          <h2 className="text-grad-title text-lg font-extrabold md:text-xl"><T>⭐ 彻底掌握 5 步走</T></h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <T>每步正确率 ≥ 80% 才算通过 · 走完五步才算「完美掌握」</T>
          </p>
        </div>
        <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-amber-700 shadow-sm">
          <T>进度</T> {doneCount} / 5
        </div>
      </div>

      {/* 进度条 */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500 transition-all"
          style={{ width: `${doneCount / 5 * 100}%` }} />
        
      </div>

      {/* 五步 */}
      <ol className="mt-4 grid gap-2 sm:grid-cols-5">
        {STEPS.map((s, i) => {
          const st = statuses[i];
          const skill = s.key === "browse" ? null : skillStatus(s.key as Skill);
          return (
            <li key={s.key}>
              <Link
                to={linkFor(s.key)}
                onClick={() => {if (s.key === "browse") markBrowseDone(grade);}}
                className={cn(
                  "relative block h-full rounded-2xl border-2 p-3 text-center transition",
                  st === "done" && "border-emerald-400 bg-emerald-50",
                  st === "current" && "border-rose-500 bg-white shadow-md ring-2 ring-rose-200 hover:-translate-y-0.5",
                  st === "locked" && "border-dashed border-border bg-white/60 opacity-70 hover:opacity-100"
                )}
                aria-label={`第 ${i + 1} 步 ${s.label}`}>
                
                <div className="absolute left-2 top-2 grid size-5 place-items-center rounded-full bg-white text-[10px] font-extrabold text-muted-foreground shadow-sm">
                  {st === "done" ? <Check className="size-3 text-emerald-600" /> : st === "locked" ? <Lock className="size-3" /> : i + 1}
                </div>
                <div className="text-2xl">{s.emoji}</div>
                <div className="mt-1 text-sm font-extrabold"><T>{s.label}</T></div>
                <div className="text-[10px] text-muted-foreground"><T>{s.desc}</T></div>
                {skill && skill.attempts > 0 &&
                <div className={cn(
                  "mt-1 text-[10px] font-bold",
                  skill.done ? "text-emerald-600" : "text-rose-500"
                )}>
                    {Math.round(skill.pct * 100)}% · {skill.attempts} <T>题</T>
                  </div>
                }
                {st === "current" &&
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                    <T>立即开始</T> <ArrowRight className="size-3" />
                  </div>
                }
              </Link>
            </li>);

        })}
      </ol>

      {allDone && signedIn &&
      <div className="mt-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-3 text-center">
          <div className="inline-flex items-center gap-2 text-base font-extrabold text-emerald-700">
            <Sparkles className="size-5" /> <T>恭喜！你已彻底掌握本</T>{isAll ? "学段" : "年级"}<T>词汇 ⭐</T>
          </div>
          <div className="mt-1 text-xs text-emerald-700/80">
            <T>进入 [今日复习] 巩固即可保持 5 星，不会遗忘。</T>
          </div>
        </div>
      }
      {!signedIn &&
      <div className="mt-3 text-center text-[11px] text-muted-foreground">
          <T>登录后才能记录每一步的进度哦 ✨</T>
        </div>
      }
    </section>);

}

/** 在游戏结算卡里使用：返回下一步要做的游戏 key 和提示文本。 */
export function nextStepAfter(current: Skill): {key: Skill | null;label: string;emoji: string;} | null {
  const order: Skill[] = ["quiz", "listen", "match", "spell"];
  const i = order.indexOf(current);
  if (i === -1 || i >= order.length - 1) return null;
  const next = order[i + 1];
  const meta = STEPS.find((s) => s.key === next)!;
  return { key: next, label: meta.label, emoji: meta.emoji };
}