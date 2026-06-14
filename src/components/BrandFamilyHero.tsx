import { T } from "@/i18n/T";import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Construction } from "lucide-react";

/**
 * 母品牌 Big Moon English 主页 4 子品牌入口卡片.
 * 每张卡片自带独立配色和定位语，并标注开发状态（Live / Coming soon）.
 * 注意：这里只做"重新组织 + 入口"，不修改任何子品牌内部逻辑.
 */

type Status = "live" | "soon";

type Brand = {
  to: string;
  eyebrow: string;
  title: string;
  desc: string;
  status: Status;
  /** Tailwind gradient classes (from / via / to) */
  gradient: string;
  /** Ring / accent color for the status pill */
  accent: string;
  /** Tagline shown small under desc */
  tag: string;
};

const BRANDS: Brand[] = [
{
  to: "/kids",
  eyebrow: "Big Moon Kids",
  title: "小学 · G1–G6",
  desc: "可爱卡通、安全感十足的英语启蒙。自然拼读、绘本朗读、AI 跟读评分。",
  status: "live",
  gradient: "from-amber-300 via-orange-400 to-rose-400",
  accent: "bg-orange-500",
  tag: "来自真实美国小朋友的英语 · 温暖橙黄"
},
{
  to: "/junior",
  eyebrow: "Big Moon Junior",
  title: "初中 · G7–G9",
  desc: "中考同步词汇、语法、阅读、听力 + AI 错题讲解，朝气向上的备考节奏。",
  status: "live",
  gradient: "from-emerald-400 via-teal-500 to-cyan-500",
  accent: "bg-teal-600",
  tag: "朝气向上 · 中考备考 · 青绿色"
},
{
  to: "/senior",
  eyebrow: "Big Moon Senior",
  title: "高中 · G10–G12 · 高考",
  desc: "高考英语全模块训练：阅读、完形、语法、词汇、听写 · 严肃高效。",
  status: "soon",
  gradient: "from-blue-700 via-indigo-700 to-slate-800",
  accent: "bg-indigo-700",
  tag: "严肃高效 · 应试导向 · 深蓝"
}];


function StatusPill({ status }: {status: Status;}) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-emerald-700">
        <Sparkles className="size-3" /> <T>已上线</T>
      </span>);

  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-white/90 backdrop-blur-sm">
      <Construction className="size-3" /> <T>整理中</T>
    </span>);

}

export default function BrandFamilyHero() {
  return (
    <section aria-labelledby="brand-family-heading" className="mb-10">
      <div className="grid gap-4 md:grid-cols-2">
        {BRANDS.map((b) => {
          const live = b.status === "live";
          const cls = `group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br ${b.gradient} p-6 text-white shadow-tile transition-all`;
          const inner = (
            <>
              <span className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-white/15 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                    {b.eyebrow}
                  </div>
                  <div className="mt-1 font-serif text-2xl font-extrabold leading-tight md:text-3xl">
                    <T>{b.title}</T>
                  </div>
                </div>
                <StatusPill status={b.status} />
              </div>
              <div className="relative mt-4">
                <p className="text-sm leading-relaxed opacity-95 md:text-[15px]"><T>{b.desc}</T></p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">
                    {b.tag}
                  </div>
                  {live ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm transition group-hover:bg-white/30">
                      <T>进入</T> <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm">
                      <T>敬请期待</T>
                    </span>
                  )}
                </div>
              </div>
            </>
          );
          return live ? (
            <Link
              key={b.to}
              to={b.to}
              className={`${cls} hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-20px_rgba(0,0,0,0.45)]`}>
              {inner}
            </Link>
          ) : (
            <div key={b.to} aria-disabled="true" className={`${cls} cursor-not-allowed opacity-90`}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>);

}