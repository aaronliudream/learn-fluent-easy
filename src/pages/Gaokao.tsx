import { T } from "@/i18n/T";import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Trophy, Sparkles, BookOpen, FileText, PenLine, Headphones, Edit3, Lock, Mic, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ContinueCard } from "@/components/mastery/ContinueCard";

const GRADE_FILTERS = [
{ key: "all", label: "全部", q: "" },
{ key: "1", label: "G10 高一", q: "1" },
{ key: "2", label: "G11 高二", q: "2" },
{ key: "3", label: "G12 高三", q: "3" }];

const LS_KEY = "gaokao:gradeFilter";

export default function Gaokao() {
  const [grade, setGrade] = useState<string>("all");
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) setGrade(saved);
  }, []);
  useEffect(() => {localStorage.setItem(LS_KEY, grade);}, [grade]);
  const q = grade === "all" ? "" : `?grade=${grade}`;

  const MODULES: {to: string;icon: any;title: string;desc: string;gradient: string;soon?: boolean;}[] = [
  { to: `/gaokao/vocab${q}`, icon: Sparkles, title: "核心词汇", desc: "高考 3500 词 · 多种游戏巩固", gradient: "from-fuchsia-500 to-pink-500" },
  { to: `/talk?stage=gaokao`, icon: Mic, title: "AI 口语对话 · 高考题型", desc: "看图说话 · 议论话题 · 大学面试 · Alex 真人语音", gradient: "from-rose-500 via-pink-500 to-fuchsia-600" },
  { to: `/primary/chat`, icon: MessageSquare, title: "AI 文字陪练 · 不限次数", desc: "语音用完继续练 · 即时纠错 + 词汇巩固", gradient: "from-teal-500 via-cyan-500 to-sky-500" },
  { to: `/gaokao/grammar${q}`, icon: BookOpen, title: "语法专项", desc: "全考点串讲 + 高考真题题组", gradient: "from-blue-600 to-indigo-700" },
  { to: `/gaokao/reading${q}`, icon: FileText, title: "阅读理解", desc: "长难文 · 题型套路精讲", gradient: "from-violet-600 to-purple-700" },
  { to: `/gaokao/cloze${q}`, icon: PenLine, title: "完形填空", desc: "真题完形 · 逐空精解", gradient: "from-violet-600 to-purple-700" },
  { to: `#`, icon: Edit3, title: "写作训练", desc: "应用文 + 读后续写 · AI 批改", gradient: "from-amber-500 to-rose-500", soon: true },
  { to: `#`, icon: Headphones, title: "听力训练", desc: "高考听力套题 · 逐题精听", gradient: "from-sky-500 to-blue-500", soon: true }];


  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/#stages" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回学习阶段</T>
      </BackLink>
      <PageHeader title="高中英语" hideReviewBanner />
      <p className="mt-1 text-sm text-muted-foreground"><T>核心词汇 · 语法 · 阅读 · 完形 · 写作 · 听力（可按年级筛选）</T></p>

      <div className="mt-4">
        <ContinueCard stage="gaokao" />
      </div>

      <div className="mt-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-2"><T>年级筛选</T></div>
        <div className="flex flex-wrap gap-2">
          {GRADE_FILTERS.map((f) =>
          <button
            key={f.key}
            onClick={() => setGrade(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
            grade === f.key ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"}`
            }>
            
              <T>{f.label}</T>
            </button>
          )}
        </div>
      </div>

      <section className="mt-4 grid gap-3">
        {MODULES.map((s) => {
          const Icon = s.icon;
          const Card =
          <div className={`relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile ${s.soon ? "opacity-70" : "transition hover:-translate-y-0.5"}`}>
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-base font-extrabold leading-tight"><T>{s.title}</T></div>
               <div className="mt-0.5 text-xs opacity-90"><T>{s.soon ? "敬请期待" : s.desc}</T></div>
              </div>
              {s.soon && <Lock className="size-4 opacity-80" />}
            </div>;

          return s.soon ?
          <div key={s.title} className="cursor-not-allowed">{Card}</div> :
          <Link key={s.title} to={s.to}>{Card}</Link>;
        })}

        <Link
          to="/gaokao/exam"
          className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-5 text-white shadow-tile transition hover:-translate-y-0.5">
          
          <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/20 blur-2xl" />
          <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-white/25 text-3xl backdrop-blur-sm">🏆</div>
          <div className="relative flex-1 min-w-0">
            <div className="text-lg font-extrabold leading-tight"><T>高考英语 · 综合冲刺</T></div>
            <div className="mt-0.5 text-xs opacity-90"><T>3500 词 + 真题模拟 + 三年综合诊断 + 错题攻坚</T></div>
          </div>
          <span className="relative text-2xl">→</span>
        </Link>
      </section>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Trophy className="size-4 text-amber-500" /> <T>学习方式</T>
        </div>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
          <li><T>🎮 词汇用游戏化训练，错题自动进智能复习</T></li>
          <li><T>📚 语法 / 阅读 / 完形 / 写作按年级分层，由浅入深</T></li>
          <li><T>🐣 答对得金币 + 宠物经验，错题进艾宾浩斯曲线</T></li>
          <li><T>🏆 高考综合区做真题套卷，全方位查漏补缺</T></li>
        </ul>
      </div>

    </main>);

}