import BackLink from "@/components/BackLink";
import { ArrowLeft } from "lucide-react";
import { T } from "@/i18n/T";

const HERO_IMAGE = "/images/gaokao-hero-starry.jpg";

export function GaokaoHero() {
  return (
    <section className="relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
      <img
        src={HERO_IMAGE}
        alt="梵高 星月夜"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 via-indigo-900/60 to-background" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-8 sm:px-8">
        <BackLink
          to="/#courses"
          className="mb-10 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white font-['Noto_Serif_SC',serif]"
        >
          <ArrowLeft className="size-4" />
          <T>返回学习阶段</T>
        </BackLink>

        <div>
          <p className="font-display mb-3 text-sm italic tracking-[0.2em] text-amber-400/90">
            High School English
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl font-['Noto_Serif_SC',serif]">
            <T>高中英语专区</T>
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/80 font-['Noto_Serif_SC',serif]">
            <T>用世界名画开启你的高考冲刺之旅</T>
          </p>
          <p className="mt-8 text-xs text-white/40 font-['Noto_Serif_SC',serif]">背景：梵高《星月夜》</p>
        </div>
      </div>
    </section>
  );
}
