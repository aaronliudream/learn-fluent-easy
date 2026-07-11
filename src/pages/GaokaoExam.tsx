import { T } from "@/i18n/T";import { Link } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Sparkles, BookOpen, FileText, PenLine, AlertTriangle, Trophy } from "lucide-react";

const COMBO = [
{
  to: "/stage-tests/gaokao/3",
  icon: Trophy,
  title: "高考模拟终测",
  desc: "覆盖三年所有考点 · 通关解锁宠物终极进化",
  gradient: "from-amber-500 to-orange-600"
},
{
  to: "/gaokao/vocab",
  icon: Sparkles,
  title: "3500 词冲刺",
  desc: "全部高考核心词 · 按掌握度智能推送",
  gradient: "from-fuchsia-500 to-pink-600"
},
{
  to: "/gaokao/grammar",
  icon: BookOpen,
  title: "语法全考点",
  desc: "三年所有语法点串讲 · 真题题组",
  gradient: "from-blue-600 to-indigo-700"
},
{
  to: "/gaokao/reading",
  icon: FileText,
  title: "阅读真题套卷",
  desc: "高考真题长难文 · 题型套路精讲",
  gradient: "from-violet-600 to-purple-700"
},
{
  to: "/gaokao/cloze",
  icon: PenLine,
  title: "完形真题",
  desc: "高考完形 · 逐空精解 + 错题攻坚",
  gradient: "from-violet-600 to-purple-700"
},
{
  to: "/gaokao/mistakes",
  icon: AlertTriangle,
  title: "错题攻坚",
  desc: "三年所有错题集中复盘 · 直到全部消灭",
  gradient: "from-rose-500 to-red-600"
}];


export default function GaokaoExam() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回高中专区</T>
      </BackLink>

      <div className="mb-5 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-5 text-white shadow-tile">
        <div className="grid size-14 place-items-center rounded-2xl bg-white/25 text-3xl">🏆</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-90"><T>GAOKAO · 综合冲刺</T></div>
          <h1 className="text-2xl font-extrabold leading-tight"><T>高考英语综合区</T></h1>
          <p className="mt-0.5 text-xs opacity-90"><T>真题模拟 + 三年综合诊断 + 错题攻坚 · 一站冲分</T></p>
        </div>
      </div>

      <section className="grid gap-3">
        {COMBO.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              to={s.to}
              className={`relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile transition hover:-translate-y-0.5`}>
              
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-base font-extrabold leading-tight"><T>{s.title}</T></div>
                <div className="mt-0.5 text-xs opacity-90"><T>{s.desc}</T></div>
              </div>
            </Link>);

        })}
      </section>
    </main>);

}