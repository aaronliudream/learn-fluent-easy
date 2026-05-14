import { T } from "@/i18n/T";
import { useNavigate } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { ArrowLeft, Mic, MessageSquare } from "lucide-react";
import { ContinueCard } from "@/components/mastery/ContinueCard";

const NAVY = "#0E2746";
const TERRA = "#C8896A";

function MoonDecor() {
  return (
    <svg viewBox="0 0 200 200" className="absolute right-3 top-4 h-[150px] w-[150px] sm:h-[170px] sm:w-[170px] pointer-events-none" aria-hidden="true">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0DDA8" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#F0DDA8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#F0DDA8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonBody" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#F4E2B0" />
          <stop offset="70%" stopColor="#D9B872" />
          <stop offset="100%" stopColor="#A8884A" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="90" fill="url(#moonGlow)" />
      <circle cx="100" cy="100" r="62" fill="url(#moonBody)" />
      <circle cx="78" cy="86" r="6" fill="#000" opacity="0.08" />
      <circle cx="118" cy="78" r="3.5" fill="#000" opacity="0.08" />
      <circle cx="124" cy="118" r="8" fill="#000" opacity="0.08" />
      <circle cx="92" cy="128" r="4" fill="#000" opacity="0.08" />
    </svg>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <span className={`absolute select-none text-[10px] ${className ?? ""}`} style={{ color: NAVY, opacity: 0.45 }}>✦</span>
  );
}

function GradeCard({
  num, code, badge, title, sub, onClick, dark,
}: { num: string; code: string; badge?: string; title: string; sub: string; onClick: () => void; dark?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full overflow-hidden rounded-2xl border px-5 py-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
        dark
          ? "border-transparent text-white"
          : "border-[#E7E1D2] bg-white text-[#0E2746] hover:border-[#0E2746]/30"
      }`}
      style={dark ? { background: `linear-gradient(135deg, ${NAVY} 0%, #1a3760 100%)` } : undefined}
    >
      {badge && (
        <span
          className="absolute right-4 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
          style={{ background: TERRA }}
        >
          <T>{badge}</T>
        </span>
      )}
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-[24px] font-bold tracking-wide" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          <T>{num}</T>
        </span>
        <span className={`text-[11px] font-mono uppercase tracking-[0.18em] ${dark ? "text-white/60" : "text-[#0E2746]/55"}`}>
          {code}
        </span>
        <span className={`text-[11px] ${dark ? "text-white/60" : "text-[#0E2746]/55"}`}>·</span>
        <span className={`text-[11px] ${dark ? "text-white/70" : "text-[#0E2746]/65"}`}><T>{sub.split("·")[0].trim()}</T></span>
      </div>
      <div className={`mt-1.5 text-[13px] ${dark ? "text-white/85" : "text-[#0E2746]/70"}`}>
        <T>{title}</T>
      </div>
      <span className={`absolute right-5 top-1/2 -translate-y-1/2 text-[20px] ${dark ? "text-white/80" : "text-[#0E2746]/60"}`}>→</span>
    </button>
  );
}

export default function Gaokao() {
  const navigate = useNavigate();

  return (
    <main
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #F8F6EF 0%, #EFECDF 100%)" }}
    >
      <div className="mx-auto max-w-2xl px-5 py-6">
        <BackLink
          to="/#stages"
          className="mb-3 inline-flex items-center gap-1 text-xs hover:opacity-70"
          style={{ color: NAVY, opacity: 0.7 }}
        >
          <ArrowLeft className="size-4" /> <T>返回学习阶段</T>
        </BackLink>

        {/* Hero card */}
        <section className="relative overflow-hidden rounded-3xl border border-[#E7E1D2] bg-white/80 p-7 sm:p-9 shadow-sm">
          <MoonDecor />
          <Star className="left-[40%] top-6" />
          <Star className="left-[55%] top-12" />
          <Star className="left-[28%] top-20" />

          {/* Logo lockup */}
          <div className="relative flex items-center gap-3">
            <div
              className="grid size-10 place-items-center rounded-full text-base"
              style={{ background: NAVY, color: "#F0DDA8" }}
              aria-hidden
            >
              🌙
            </div>
            <div>
              <div
                className="text-[17px] font-bold leading-tight"
                style={{ color: NAVY, fontFamily: "'Noto Serif SC', serif" }}
              >
                Big Moon English
              </div>
              <div className="text-[11px]" style={{ color: NAVY, opacity: 0.55 }}>
                <T>海上生明月 · 学海有伴</T>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 h-[2px] w-9" style={{ background: NAVY }} />

          {/* Eyebrow */}
          <div
            className="mt-4 text-[10px] font-bold uppercase"
            style={{ color: NAVY, opacity: 0.65, letterSpacing: "0.22em" }}
          >
            HIGH SCHOOL · <T>AI 学情系统</T>
          </div>

          {/* Headline */}
          <h1
            className="mt-4 text-[34px] leading-[1.18] font-bold"
            style={{ color: NAVY, fontFamily: "'Noto Serif SC', serif" }}
          >
            <T>不刷题海</T>
            <br />
            <T>刷</T>
            <span className="relative inline-block">
              <span
                className="absolute inset-x-0 bottom-1 h-3 -z-0"
                style={{ background: "#F0DDA8" }}
              />
              <span className="relative"><T>你的</T></span>
            </span>
            <T>薄弱点</T>
          </h1>

          {/* Body */}
          <p className="mt-5 max-w-md text-[13px] leading-relaxed" style={{ color: NAVY, opacity: 0.75 }}>
            <T>每一题都是 AI 为你新生成的——根据弱点、阶段、上次错题实时调整。</T>
            <span className="font-bold"><T>永不重复，背不下答案。</T></span>
          </p>

          {/* 3 numbered points */}
          <ul className="mt-7 space-y-5">
            {[
              { n: "01", t: "精准定位 4 类错因", d: "知识漏洞 / 速度 / 策略 / 粗心——AI 替你分类每道错题，对症下药" },
              { n: "02", t: "题目实时 AI 生成", d: "不依赖固定题库——每题为你的水平和兴趣量身定制，永不重复" },
              { n: "03", t: "比刷题海高效 3 倍", d: "省下的时间留给打篮球 / 看小说 / 谈恋爱——青春不止英语" },
            ].map((row) => (
              <li key={row.n} className="flex gap-4">
                <span className="font-mono text-[12px] font-bold pt-0.5" style={{ color: TERRA }}>
                  {row.n}
                </span>
                <div className="flex-1 border-b border-[#E7E1D2] pb-4">
                  <div
                    className="text-[15px] font-bold"
                    style={{ color: NAVY, fontFamily: "'Noto Serif SC', serif" }}
                  >
                    <T>{row.t}</T>
                  </div>
                  <div className="mt-1 text-[12px]" style={{ color: NAVY, opacity: 0.65 }}>
                    <T>{row.d}</T>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Continue card (if any) */}
          <div className="mt-6">
            <ContinueCard stage="gaokao" />
          </div>

          {/* Divider */}
          <div className="mt-8 h-[2px] w-9" style={{ background: NAVY }} />

          {/* Grade selector */}
          <div
            className="mt-4 text-[11px] font-bold uppercase"
            style={{ color: NAVY, opacity: 0.65, letterSpacing: "0.18em" }}
          >
            <T>选你现在的年级</T>
          </div>

          <div className="mt-4 space-y-3">
            <GradeCard
              num="高一"
              code="G-10"
              sub="打基础"
              title="学完 95 个本年级核心考点"
              onClick={() => navigate("/gaokao/g/1")}
            />
            <GradeCard
              num="高二"
              code="G-11"
              sub="学练并行"
              title="高考备考度冲 80%+"
              onClick={() => navigate("/gaokao/g/2")}
            />
            <GradeCard
              num="高三"
              code="G-12"
              sub="高考冲刺"
              title="每分必争 · AI 按性价比排弱点"
              badge="最常见"
              dark
              onClick={() => navigate("/gaokao/g/3")}
            />
          </div>

          {/* Next-step card */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#E7E1D2] bg-[#FAF8F1] p-4">
            <span className="text-lg leading-none" aria-hidden>🌒</span>
            <div className="text-[12px] leading-relaxed" style={{ color: NAVY }}>
              <div className="font-bold">
                <T>下一步 · 6-8 分钟入门快测（15 道适应性测题）</T>
              </div>
              <div className="mt-1 opacity-65">
                <T>AI 据此搭建初始学情画像 · 1-2 周日常练习自动校准</T>
              </div>
            </div>
          </div>

          {/* Direct entries (kept but de-emphasized) */}
          <div className="mt-6">
            <div
              className="text-[10px] font-bold uppercase"
              style={{ color: NAVY, opacity: 0.55, letterSpacing: "0.18em" }}
            >
              <T>或者直接进入功能</T>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
              <button
                onClick={() => navigate("/talk?stage=gaokao")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E1D2] bg-white px-3 py-1.5 hover:border-[#0E2746]/30"
                style={{ color: NAVY }}
              >
                <Mic className="size-3.5" /> <T>AI 口语对话</T>
              </button>
              <button
                onClick={() => navigate("/primary/chat")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E1D2] bg-white px-3 py-1.5 hover:border-[#0E2746]/30"
                style={{ color: NAVY }}
              >
                <MessageSquare className="size-3.5" /> <T>AI 文字陪练</T>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-6 flex items-center justify-between text-[11px]" style={{ color: NAVY, opacity: 0.55 }}>
          <span>© Big Moon Studio · 2024</span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="grid size-5 place-items-center rounded-sm font-serif text-[10px] font-bold text-white"
              style={{ background: "#B8442C", fontFamily: "'Noto Serif SC', serif" }}
              aria-hidden
            >
              月
            </span>
            <T>明月知我</T>
          </span>
        </footer>
      </div>
    </main>
  );
}