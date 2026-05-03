import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Headphones, BookOpen, PenLine, Sparkles, MessageCircle } from "lucide-react";

const SKILLS = [
  { key: "listening", title: "🎧 听力", desc: "听词选图 · 短对话理解", gradient: "from-sky-400 to-cyan-400", to: "#" },
  { key: "reading", title: "📖 阅读", desc: "单句 → 段落 → 短文", gradient: "from-emerald-400 to-teal-400", to: "#" },
  { key: "writing", title: "✍️ 写作", desc: "拼写 · 填空 · 看图写句", gradient: "from-violet-400 to-fuchsia-400", to: "#" },
  { key: "vocab", title: "📚 词汇", desc: "听音辨义 · 智能复习", gradient: "from-amber-400 to-orange-400", to: "/primary/vocab" },
  { key: "chat", title: "💬 Spark 对话", desc: "AI 陪你说英语", gradient: "from-pink-400 to-rose-400", to: "/primary/chat" },
];

export default function PrimaryGrade() {
  const { grade } = useParams<{ grade: string }>();
  const g = Number(grade ?? "3");
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <Link to="/primary" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回年级选择
      </Link>
      <div className="mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">PRIMARY · G{g}</div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl">{g} 年级 · 四大能力</h1>
        <p className="mt-1 text-xs text-muted-foreground">输入 → 理解 → 练习 → 输出 → 测试 · 每天一键开始</p>
      </div>

      <section className="grid gap-3">
        {SKILLS.map((s) => (
          <Link key={s.key} to={s.to} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-tile transition hover:-translate-y-0.5`}>
            <span className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/15 blur-2xl" />
            <div className="text-base font-extrabold">{s.title}</div>
            <div className="mt-1 text-xs opacity-90">{s.desc}</div>
            {s.to === "#" && <div className="mt-2 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">即将上线</div>}
          </Link>
        ))}
      </section>
    </main>
  );
}