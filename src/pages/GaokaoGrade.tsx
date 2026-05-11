import { T } from "@/i18n/T";import { Link, useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Sparkles, BookOpen, FileText, PenLine, Headphones, Edit3, Activity, Lock } from "lucide-react";
import OnlineWidget from "@/components/social/OnlineWidget";

const GRADE_META: Record<string, {title: string;emoji: string;gradient: string;tag: string;focus: string;}> = {
  "1": { title: "高一 · Grade 10", emoji: "🌱", gradient: "from-emerald-500 to-teal-500", tag: "SENIOR · G1", focus: "词汇基础 + 语法搭建" },
  "2": { title: "高二 · Grade 11", emoji: "🚀", gradient: "from-violet-500 to-indigo-500", tag: "SENIOR · G2", focus: "语法系统化 + 阅读专项" },
  "3": { title: "高三 · Grade 12", emoji: "🔥", gradient: "from-fuchsia-500 to-rose-500", tag: "SENIOR · G3", focus: "真题套卷 + 写作 + 完形" }
};

export default function GaokaoGrade() {
  const { grade } = useParams<{grade: string;}>();
  const g = grade ?? "1";
  const meta = GRADE_META[g] ?? GRADE_META["1"];

  // 各年级模块入口 — 共享同一题库，前缀页面通过 URL 暗示进度路径
  const SECTIONS: {to: string;icon: any;title: string;desc: string;gradient: string;soon?: boolean;}[] = [
  {
    to: `/gaokao/vocab?grade=${g}`,
    icon: Sparkles,
    title: "核心词汇",
    desc: g === "3" ? "高考 3500 词冲刺 · 多种游戏巩固" : g === "2" ? "拓展词汇 · 词形+搭配训练" : "高一基础词汇 · 听说读写多模训练",
    gradient: "from-fuchsia-500 to-pink-500"
  },
  {
    to: `/gaokao/grammar?grade=${g}`,
    icon: BookOpen,
    title: "语法专项",
    desc: g === "3" ? "全考点串讲 + 高考真题题组" : g === "2" ? "从句 · 非谓语 · 虚拟语气" : "时态 · 语态 · 基础句型",
    gradient: "from-blue-600 to-indigo-700"
  },
  {
    to: `/gaokao/reading?grade=${g}`,
    icon: FileText,
    title: "阅读理解",
    desc: g === "3" ? "高考长难文 · 题型套路精讲" : g === "2" ? "细节/推断/主旨 题型专项" : "短文阅读入门 · 选项逐项分析",
    gradient: "from-violet-600 to-purple-700"
  },
  {
    to: `/gaokao/cloze?grade=${g}`,
    icon: PenLine,
    title: "完形填空",
    desc: g === "3" ? "高考真题完形 · 逐空精解" : g === "2" ? "话题完形 · 上下文逻辑训练" : "完形入门 · 词义辨析",
    gradient: "from-violet-600 to-purple-700"
  },
  {
    to: `#`,
    icon: Edit3,
    title: "写作训练",
    desc: g === "3" ? "应用文 + 读后续写 · AI 批改" : g === "2" ? "段落写作 · 高分句型积累" : "句子翻译 · 短段写作起步",
    gradient: "from-amber-500 to-rose-500",
    soon: true
  },
  {
    to: `#`,
    icon: Headphones,
    title: "听力训练",
    desc: g === "3" ? "高考听力套题 · 逐题精听" : g === "2" ? "对话/独白 长篇训练" : "短对话 听力起步",
    gradient: "from-sky-500 to-blue-500",
    soon: true
  }];


  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to="/gaokao" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回高中专区</T>
      </BackLink>

      <section className="grid gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const Card =
          <div className={`relative flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile ${s.soon ? "opacity-70" : "transition hover:-translate-y-0.5"}`}>
              <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
              <div className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="size-6" />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-base font-extrabold leading-tight"><T>{s.title}</T></div>
                <div className="mt-0.5 text-xs opacity-90">{s.soon ? "敬请期待" : s.desc}</div>
              </div>
              {s.soon && <Lock className="size-4 opacity-80" />}
            </div>;

          return s.soon ?
          <div key={s.title} className="cursor-not-allowed">{Card}</div> :
          <Link key={s.title} to={s.to}>{Card}</Link>;
        })}
      </section>

      <div className="mt-6 flex justify-center"><OnlineWidget grade="gaokao" page={`/gaokao/g/${g}`} /></div>
    </main>);

}