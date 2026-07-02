import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { T } from "@/i18n/T";
import {
  AMERICAN_COURSE_NAME,
  AMERICAN_COURSE_SUBTITLE,
  AMERICAN_COURSE_SCALE,
} from "@/lib/american/brand";

/**
 * 美语课程首页 —— **Phase 1 占位版**。
 * 本页仅为让首页卡片与旧成人路由 301 有落点、不 404。
 * 《美语课程落地指令》Phase 2 会把这里替换为 12 单元 tab 的完整 hub。
 */
export default function AmericanHome() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0a1628] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 75% 30%, rgba(59,130,246,0.20) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 20% 85%, rgba(229,181,103,0.14) 0%, transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-[720px] flex-col px-5 py-6">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white">
          <ArrowLeft className="size-4 shrink-0" />
          <T>返回首页</T>
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Sparkles className="size-8 text-[#e5b567]" aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
            {AMERICAN_COURSE_NAME}
          </h1>
          <p className="mt-3 text-base text-white/75 md:text-lg">{AMERICAN_COURSE_SUBTITLE}</p>
          <span className="mt-5 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
            {AMERICAN_COURSE_SCALE}
          </span>
          <p className="mt-8 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <T>课程内容制作中，单元 1 即将上线，敬请期待。</T>
          </p>
        </div>
      </div>
    </main>
  );
}
