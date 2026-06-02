import { T } from "@/i18n/T";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
  painter: string;
}> = [
  {
    id: 3,
    name_cn: "三年级",
    image: almondBlossom,
    imageAlt: "梵高《盛开的杏花》",
    painter: "梵高《盛开的杏花》",
  },
  {
    id: 4,
    name_cn: "四年级",
    image: qianliJiangshan,
    imageAlt: "王希孟《千里江山图》",
    painter: "王希孟《千里江山图》",
  },
  {
    id: 5,
    name_cn: "五年级",
    image: montmartre,
    imageAlt: "毕沙罗《蒙马特大道》",
    painter: "毕沙罗《蒙马特大道》",
  },
  {
    id: 6,
    name_cn: "六年级",
    image: bedroom,
    imageAlt: "梵高《卧室》",
    painter: "梵高《卧室》",
  },
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
      {/* 整页背景:康定斯基《构图八》+ 85% 白色半透明蒙版(画隐约透出当氛围,不抢前景文字) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${composition8})` }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-white/85" />

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <BackLink
          to="/#courses"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[#888780] transition-colors hover:text-[#2C2C2A]"
        >
          <ArrowLeft className="size-4" /> <T>返回学习阶段</T>
        </BackLink>

        {/* 顶部通栏 banner:梵高《星空》大图 + 深色渐变遮罩 */}
        <section className="relative overflow-hidden rounded-3xl shadow-lg">
          <img
            src={starryNight}
            alt="梵高《星空》"
            className="h-48 w-full object-cover sm:h-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <p className="mb-2 text-xs italic tracking-[0.2em] text-amber-100/90 text-shadow-strong font-['Noto_Serif_SC',serif]">
              Primary English
            </p>
            <h1 className="text-2xl font-bold leading-tight text-white drop-shadow-md sm:text-3xl font-['Noto_Serif_SC',serif] text-shadow-strong">
              <T>小学英语学习中心</T>
            </h1>
            <p className="mt-2 text-sm text-white/90 text-shadow-strong font-['Noto_Serif_SC',serif]">
              <T>人教版 PEP · 三年级起点 · 上下册同步</T>
            </p>
          </div>
        </section>

        <p className="mt-8 px-1 text-sm font-semibold text-[#2C2C2A] font-['Noto_Serif_SC',serif]">
          <T>选择年级进入学习</T>
        </p>

        {/* 四张年级卡:各配名画,窄屏 2 列、宽屏一行 4 张铺满 */}
        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {GRADES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => enterGrade(g.id)}
              className={cn(
                "group relative aspect-[3/4] overflow-hidden rounded-2xl text-left shadow-md",
                "transition hover:-translate-y-0.5 hover:shadow-xl",
                "focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/60 focus:ring-offset-2",
              )}
            >
              <img
                src={g.image}
                alt={g.imageAlt}
                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-end p-4">
                <div className="text-lg font-extrabold text-white drop-shadow-md font-['Noto_Serif_SC',serif]">
                  {g.name_cn}
                </div>
                <div className="text-[11px] font-bold text-white/90">上册 · 下册</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
