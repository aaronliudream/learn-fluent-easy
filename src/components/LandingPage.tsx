import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowRight, Mic, BookOpen, GraduationCap, Sparkles, Quote, Check, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLogo";
import SpeakingDemo from "@/components/SpeakingDemo";
import BrandFamilyHero from "@/components/BrandFamilyHero";

/**
 * 中文母品牌主页 — 专注中国 K-12 英语（小学 / 初中 / 高中）。
 * 不做全球营销、不做 CET、不做职场。
 */
export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
    setMuted(next);
  };
  return (
    <main className="min-h-dvh bg-[#FAF8F3] text-[#1F3A2E] antialiased">
      {/* HERO */}
      <section className="bg-[#EEF4FB]">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6 md:px-10 md:py-8">
          <BrandLockup size={36} />
          <div className="flex items-center gap-1 md:gap-2">
            {[
              { to: "/", label: "首页" },
              { to: "/kids", label: "小学" },
              { to: "/junior", label: "初中" },
              { to: "/senior", label: "高中" },
              { to: "/about", label: "关于我们" },
            ].map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className="hidden rounded-full px-3 py-1.5 text-[12px] font-bold tracking-[0.14em] text-[#1F3A2E]/70 hover:bg-white hover:text-[#1F3A2E] md:inline-block"
              >
                {it.label}
              </Link>
            ))}
            <Link
              to="/auth"
              className="hidden text-xs font-bold tracking-[0.14em] text-[#1F3A2E]/70 hover:text-[#1F3A2E] md:inline"
            >
              登录
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-6 md:px-10 md:pb-24 md:pt-10">
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] text-[#3BA3E0] shadow-[0_4px_14px_-6px_rgba(59,163,224,0.4)]">
              <Sparkles className="size-3.5" /> 专为中国 K-12 学生打造
            </div>
            <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-tight text-[#1F3A2E] md:text-[64px]">
              小学到高中，<br className="hidden md:block" />
              一个英语 App 全搞定。
            </h1>
            <p className="mt-6 max-w-xl mx-auto md:mx-0 font-serif text-base italic text-[#1F3A2E]/70 md:text-lg">
              Real English from real American kids, for every age in China.
            </p>
            <p className="mt-6 max-w-lg mx-auto md:mx-0 text-base leading-relaxed text-[#1F3A2E]/70 md:text-lg">
              人教版 / 外研版同步教材，AI 跟读评分、错题讲解、阅读完形语法专项 —— 一站式备考小升初 · 中考 · 高考。
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center md:justify-start">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8743C] px-8 py-4 text-sm font-bold tracking-[0.16em] text-white shadow-[0_10px_24px_-10px_rgba(232,116,60,0.6)] transition hover:bg-[#d4632d]"
              >
                免费开始 <ArrowRight className="size-4" />
              </Link>
              <a
                href="#try-now"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1F3A2E]/15 bg-white px-8 py-4 text-sm font-bold tracking-[0.16em] text-[#1F3A2E] transition hover:bg-[#F4EFE3]"
              >
                <Mic className="size-4" /> 试听 30 秒 AI 口语
              </a>
            </div>
          </div>
          {/* Spark 吉祥物视频 */}
          <div className="relative mx-auto w-full max-w-[440px]">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[#FFD9A8] via-[#FFB8C8] to-[#A8D8FF] opacity-60 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_60px_-20px_rgba(31,58,46,0.35)] ring-1 ring-white/60">
              <video
                src="/spark-hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="Spark — Big Moon English 学习伙伴"
                className="block aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#1F3A2E]/50">
              ✨ Meet Spark · 你的英语学习伙伴
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* TRY IT NOW */}
      <section id="try-now" className="border-t border-[#1F3A2E]/10 bg-[#F4EFE3]/40">
        <div className="mx-auto max-w-[900px] px-6 py-16 md:px-10 md:py-24">
          <SpeakingDemo />
        </div>
      </section>

      {/* 3 子品牌入口 */}
      <section className="border-t border-[#1F3A2E]/10 bg-white">
        <div className="mx-auto max-w-[1100px] px-6 py-16 md:px-10 md:py-24">
          <BrandFamilyHero />
        </div>
      </section>

      {/* 为什么选我们 */}
      <section className="border-t border-[#1F3A2E]/10">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#E8743C]">
              为什么选 BIG MOON ENGLISH
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              三件事，做到极致。
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <USP icon={<Mic className="size-5" />}     title="AI 口语跟读评分"   desc="按住说话，AI 当场给出发音、语调、流利度反馈 —— 像有个外教在身边。" />
            <USP icon={<BookOpen className="size-5" />} title="同步教材 · 应试导向" desc="人教版 / 外研版同步词汇、语法、阅读、完形，错题自动入库 + AI 讲解。" />
            <USP icon={<GraduationCap className="size-5" />} title="覆盖小升初 · 中考 · 高考" desc="一个 App 跟着孩子从一年级走到高三，节奏、难度、题型全部对齐校内进度。" />
          </div>
        </div>
      </section>

      {/* 真实评价 */}
      <section className="border-t border-[#1F3A2E]/10 bg-[#EEF4FB]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 text-center">
            <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#E8743C]">
              来自中国家长和学生
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              真实使用，真实进步。
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <ReviewCard quote="孩子三年级，第一次愿意主动开口说英语。" name="王女士" role="家长 · 上海" />
            <ReviewCard quote="中考前两个月集中刷错题，听力涨了 8 分。" name="李同学" role="初三 · 杭州" />
            <ReviewCard quote="高考完形和阅读训练特别对路子，比刷卷子高效。" name="张同学" role="高三 · 成都" />
          </div>
        </div>
      </section>

      {/* 简单定价 */}
      <section className="border-t border-[#1F3A2E]/10">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 text-center">
            <div className="mb-3 text-[11px] font-bold tracking-[0.2em] text-[#E8743C]">
              价格简单
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              先免费用，喜欢再升级。
            </h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
            <PricingCard
              tier="免费版"
              price="¥0"
              period="永久免费"
              features={["每天 3 节小课", "基础 AI 口语跟读", "每日学习连胜", "错题本"]}
              cta="免费开始"
              highlighted={false}
            />
            <PricingCard
              tier="Pro 会员"
              price="¥49"
              period="/ 月"
              badge="最受欢迎"
              features={["无限 AI 口语训练", "完整 AI 错题讲解（语法 / 阅读 / 完形）", "全部教材模块解锁", "每周学情报告", "优先客服支持"]}
              cta="升级 Pro"
              highlighted
            />
          </div>
          <div className="mt-6 text-center text-xs text-[#1F3A2E]/55">
            无需信用卡 · 随时取消
          </div>
        </div>
      </section>

      {/* 最终 CTA */}
      <section className="border-t border-[#1F3A2E]/10 bg-[#EEF4FB]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 text-center md:px-10 md:py-28">
          <MessageCircle className="mx-auto mb-6 size-10 text-[#E8743C]" />
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-medium leading-tight md:text-5xl">
            准备好让孩子真正会说英语了吗？
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-[#1F3A2E]/70">
            每天 5 分钟 · 同步课内进度 · 看得见的提分。
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8743C] px-9 py-4 text-sm font-bold tracking-[0.18em] text-white transition hover:bg-[#d4632d]"
            >
              免费开始 <ArrowRight className="size-4" />
            </Link>
            <a href="#try-now" className="text-xs font-bold tracking-[0.18em] text-[#1F3A2E]/55 hover:text-[#1F3A2E]">
              试听 30 秒 AI 口语
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1F3A2E]/10 bg-[#F4EFE3]/40">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-6 py-8 text-[11px] font-bold tracking-[0.18em] text-[#1F3A2E]/55 md:flex-row md:px-10">
          <div>© {new Date().getFullYear()} Big Moon English</div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/about" className="hover:text-[#1F3A2E]">关于</Link>
            <Link to="/privacy" className="hover:text-[#1F3A2E]">隐私</Link>
            <Link to="/terms" className="hover:text-[#1F3A2E]">条款</Link>
            <a href="mailto:support@bigmoonenglish.com" className="hover:text-[#1F3A2E]">联系我们</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ReviewCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  const initial = name.trim().charAt(0);
  return (
    <figure className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_8px_30px_-12px_rgba(31,58,46,0.18)] md:p-7">
      <Quote className="size-5 text-[#E8743C]" />
      <blockquote className="text-[15px] leading-relaxed text-[#1F3A2E]/85">
        “{quote}”
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-2">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1F3A2E]/10 text-sm font-bold text-[#1F3A2E]">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-[#1F3A2E]">{name}</div>
          <div className="text-[10px] font-bold tracking-[0.18em] text-[#1F3A2E]/55">{role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

function USP({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[#1F3A2E]/10 bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-25px_rgba(31,58,46,0.3)] md:p-8">
      <div className="grid size-11 place-items-center rounded-2xl bg-[#E8743C]/10 text-[#E8743C]">
        {icon}
      </div>
      <h3 className="font-serif text-xl font-medium leading-snug md:text-2xl">{title}</h3>
      <p className="text-sm leading-relaxed text-[#1F3A2E]/70">{desc}</p>
    </div>
  );
}

function PricingCard({
  tier, price, period, features, cta, badge, highlighted,
}: {
  tier: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  badge?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col gap-6 rounded-3xl border p-7 md:p-8 ${
        highlighted
          ? "border-[#E8743C] bg-white shadow-[0_24px_60px_-25px_rgba(232,116,60,0.45)]"
          : "border-[#1F3A2E]/15 bg-white"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E8743C] px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-white">
          {badge}
        </div>
      )}
      <div>
        <div className="text-[11px] font-bold tracking-[0.2em] text-[#1F3A2E]/55">{tier}</div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <div className="text-4xl font-extrabold text-[#1F3A2E]">{price}</div>
          <div className="text-xs text-[#1F3A2E]/60">{period}</div>
        </div>
      </div>
      <ul className="space-y-2.5 border-t border-[#1F3A2E]/10 pt-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-[#1F3A2E]/80">
            <Check className="mt-0.5 size-4 shrink-0 text-[#7FB069]" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/auth"
        className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold tracking-[0.18em] transition ${
          highlighted
            ? "bg-[#E8743C] text-white hover:bg-[#d4632d]"
            : "border border-[#1F3A2E]/20 text-[#1F3A2E] hover:bg-[#F4EFE3]"
        }`}
      >
        {cta} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
