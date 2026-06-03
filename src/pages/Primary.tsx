import { T } from "@/i18n/T";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, Layers, Sparkles, TrendingUp } from "lucide-react";
import BackLink from "@/components/BackLink";
import { writePrimaryGradeToStorage } from "@/lib/primaryGrade";
import type { PrimaryHubGrade } from "@/lib/primaryHub/types";
import { cn } from "@/lib/utils";
import "@/lib/primaryHub/styles";

// 名画美育体系(与初中专区统一)。图片在 src/assets/painting/primary/(单数 painting)。
import composition8 from "@/assets/painting/primary/composition8.webp";
import starryNight from "@/assets/painting/primary/starry_night.webp";
import almondBlossom from "@/assets/painting/primary/almond_blossom.webp";
import qianliJiangshan from "@/assets/painting/primary/qianli_jiangshan.webp";
import montmartre from "@/assets/painting/primary/montmartre.webp";
import bedroom from "@/assets/painting/primary/bedroom.webp";

const GRADES: Array<{
  id: PrimaryHubGrade;
  name_cn: string;
  image: string;
  imageAlt: string;
  /** 圆形图书图标底色(各年级各异,样式一致) */
  iconBg: string;
}> = [
  { id: 3, name_cn: "三年级", image: almondBlossom, imageAlt: "梵高《盛开的杏花》", iconBg: "bg-emerald-500" },
  { id: 4, name_cn: "四年级", image: qianliJiangshan, imageAlt: "王希孟《千里江山图》", iconBg: "bg-amber-500" },
  { id: 5, name_cn: "五年级", image: montmartre, imageAlt: "毕沙罗《蒙马特大道》", iconBg: "bg-sky-500" },
  { id: 6, name_cn: "六年级", image: bedroom, imageAlt: "梵高《卧室》", iconBg: "bg-rose-500" },
];

const FEATURES: Array<{ icon: typeof BookOpen; title: string; desc: string; iconBg: string }> = [
  { icon: BookOpen, title: "同步教材", desc: "与人教版 PEP 教材同步,学习更系统", iconBg: "bg-[#2f6fb0]" },
  { icon: Layers, title: "知识体系", desc: "科学分级,由浅入深,稳步提升", iconBg: "bg-[#3f9a6e]" },
  { icon: Sparkles, title: "趣味学习", desc: "丰富的学习资源,激发学习兴趣", iconBg: "bg-[#d6792b]" },
  { icon: TrendingUp, title: "全面发展", desc: "听说读写全面提升,培养综合能力", iconBg: "bg-[#7b5bff]" },
];

export default function Primary() {
  const nav = useNavigate();

  useEffect(() => {
    document.title = "小学英语 G3-G6 · 人教版 PEP | FluentPath";
  }, []);

  function enterGrade(id: PrimaryHubGrade) {
    writePrimaryGradeToStorage(id);
    nav(`/primary/hub/${id}`);
  }

  return (
    <main className="relative min-h-screen pb-20 text-[#2C2C2A]">
      {/* 整页背景:康定斯基《构图八》+ 85% 白色半透明蒙版 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${composition8})` }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-white/85" />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <BackLink
          to="/#courses"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[#888780] transition-colors hover:text-[#2C2C2A]"
        >
          <ArrowLeft className="size-4" /> <T>返回学习阶段</T>
        </BackLink>

        {/* Hero:名画背景(星空)+ 深色叠层 + 居中文字(对齐初中 Junior Hero) */}
        <section className="relative overflow-hidden rounded-3xl shadow-lg">
          <img src={starryNight} alt="梵高《星空》" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/65" />
          <div className="relative flex flex-col items-center gap-3 px-6 py-14 text-center sm:py-20">
            <p className="text-xs italic tracking-[0.25em] text-amber-100/90 text-shadow-strong font-['Noto_Serif_SC',serif]">
              Primary English
            </p>
            <h1 className="text-3xl font-bold leading-tight text-white text-shadow-strong sm:text-4xl font-['Noto_Serif_SC',serif]">
              <T>小学英语学习中心</T>
            </h1>
            <p className="text-sm text-white/90 text-shadow-strong font-['Noto_Serif_SC',serif]">
              <T>人教版 PEP · 三年级起点 · 上下册同步</T>
            </p>
            <p className="text-sm font-semibold text-white text-shadow-strong font-['Noto_Serif_SC',serif]">
              <T>选择年级进入学习,开启你的英语之旅</T>
            </p>
          </div>
        </section>

        {/* 四张年级卡:名画在上 + 圆形图书图标 + 居中年级/上下册 + 实心橙色「进入学习」按钮;等高等宽 */}
        <div className="mt-7 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {GRADES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => enterGrade(g.id)}
              className={cn(
                "group flex h-full flex-col overflow-hidden rounded-2xl bg-white text-center shadow-md",
                "transition hover:-translate-y-1 hover:shadow-xl",
                "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/60 focus:ring-offset-2",
              )}
            >
              {/* 名画(接近原画比例) */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={g.image}
                  alt={g.imageAlt}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {/* 白底信息区(圆形图书图标骑在画与白底交界处) */}
              <div className="relative flex flex-1 flex-col items-center justify-start gap-2 px-3 pb-4 pt-8">
                <span
                  className={cn(
                    "absolute -top-6 grid size-12 place-items-center rounded-full border-4 border-white text-white shadow-md",
                    g.iconBg,
                  )}
                >
                  <BookOpen className="size-5" />
                </span>
                <div className="text-lg font-extrabold font-['Noto_Serif_SC',serif]">{g.name_cn}</div>
                <div className="text-xs font-semibold text-[#888780]">上册 · 下册</div>
                <span className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-sm font-bold text-white shadow-sm transition group-hover:bg-[#e85d27]">
                  <T>进入学习</T>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* 底部说明条:圆形彩色图标 + 标题 + 两行说明,整条装在圆角卡片里 */}
        <div className="mt-8 rounded-2xl border border-[#e7dfce] bg-white/85 p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3 text-left">
                <span className={cn("grid size-11 flex-none place-items-center rounded-full text-white", f.iconBg)}>
                  <f.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#2C2C2A] font-['Noto_Serif_SC',serif]">
                    <T>{f.title}</T>
                  </div>
                  <div className="mt-0.5 text-xs leading-relaxed text-[#6b6a64]">
                    <T>{f.desc}</T>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
