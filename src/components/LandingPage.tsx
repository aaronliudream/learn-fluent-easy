import { Link } from "react-router-dom";
import { ArrowRight, Mic, BookOpen, Flame, GraduationCap, Sparkles, Globe2, Quote, BookMarked } from "lucide-react";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { BrandLockup } from "@/components/brand/BrandLogo";
import { T } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Public landing page (cold traffic).
 * All visible copy is wrapped in <T> so it auto-translates to the user's
 * chosen language (cached in localStorage by I18nProvider).
 */
export default function LandingPage() {
  const { lang } = useI18n();
  const isSimplifiedChinese = lang === "zh";
  return (
    <main className="min-h-dvh bg-[#FAF8F3] text-[#1F3A2E] antialiased">
      {/* NAV */}
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <BrandLockup size={36} />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            to="/auth"
            className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/70 hover:text-[#1F3A2E] md:inline"
          >
            <T>登录</T>
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-[#1F3A2E] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#FAF8F3] transition hover:bg-[#27513f]"
          >
            <T>开始使用</T>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-[1100px] px-6 pb-20 pt-10 md:px-10 md:pb-32 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#1F3A2E]/15 bg-white/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/70">
            <Globe2 className="size-3.5" /> <T>已覆盖 30+ 个国家的学员</T>
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.15] tracking-tight md:text-7xl md:leading-[1.1]" style={{ fontFamily: '"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif' }}>
            <T>开口说英语</T>
            <br className="hidden md:block" />
            <span className="text-[#E8743C]"> <T>就像在和朋友聊天。</T></span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-pretty text-base leading-relaxed text-[#1F3A2E]/75 md:text-lg">
            <T>从 CEFR 水平测试到俚语、真实场景对话，再到 AI 口语陪练 —— 一条结构化路径，从孩子到成人都适用。</T>
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/?hub=1"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F3A2E] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#FAF8F3] transition hover:bg-[#27513f]"
            >
              <T>浏览课程</T> <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/placement"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1F3A2E]/25 bg-transparent px-8 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#1F3A2E] transition hover:bg-[#1F3A2E]/5"
            >
              <T>3 分钟水平测试</T>
            </Link>
          </div>
          <p className="mt-5 text-xs text-[#1F3A2E]/55">
            <T>无需注册即可浏览。</T>{" "}
            <a href="#whats-inside" className="font-bold text-[#1F3A2E] underline-offset-4 hover:underline">
              <T>看看里面有什么 ↓</T>
            </a>
          </p>

          {isSimplifiedChinese && (
            <Link
              to="/china"
              className="group mx-auto mt-10 flex max-w-xl items-center gap-4 rounded-2xl border-2 border-[#E8743C]/30 bg-gradient-to-br from-[#FFF4EC] to-[#FFE3CF] px-6 py-5 text-left transition hover:-translate-y-0.5 hover:border-[#E8743C]/60 hover:shadow-[0_18px_40px_-20px_rgba(232,116,60,0.5)]"
            >
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#E8743C] text-white">
                <BookMarked className="size-6" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
                  中国学生专区 · China Students
                </div>
                <div className="mt-1 font-serif text-lg font-medium leading-tight text-[#1F3A2E] md:text-xl">
                  小学 · 初中 · 高考 一站式备考
                </div>
                <div className="mt-1 text-xs text-[#1F3A2E]/65">
                  人教版 · 外研版同步教材，AI 错题讲解、阅读完形、语法专项
                </div>
              </div>
              <ArrowRight className="size-5 shrink-0 text-[#E8743C] transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section id="whats-inside" className="border-t border-[#1F3A2E]/10 bg-[#F4EFE3]/50">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-14 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
                <T>01 — 里面有什么</T>
              </div>
              <h2 className="max-w-xl font-serif text-3xl font-medium leading-tight md:text-5xl">
                <T>四种真正用得上英语的方式。</T>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#1F3A2E]/65">
              <T>每个模块都可以独立使用 —— 选你今天想学的，或者跟着完整路径从 A1 走到 C2。</T>
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <FeatureCard
              to="/levels"
              eyebrow="结构化路径"
              title="CEFR 等级 A1 → C2"
              desc="6 个等级、单元和短课程。词汇、语法、阅读和听力一条路径全包。"
              icon={<BookOpen className="size-5" />}
            />
            <FeatureCard
              to="/talk"
              eyebrow="口语训练"
              title="AI 口语陪练"
              desc="按住说话，立刻获得发音反馈。会议、面试、日常聊天 —— 随时练习。"
              icon={<Mic className="size-5" />}
            />
            <FeatureCard
              to="/scenes"
              eyebrow="真实生活"
              title="真实场景对话"
              desc="机场、咖啡馆、看医生、求职面试，100+ 情景对话可以大声练习。"
              icon={<Sparkles className="size-5" />}
            />
            <FeatureCard
              to="/slang"
              eyebrow="地道英语"
              title="俚语 & 母语者表达"
              desc="从 lowkey 到 it's giving —— TikTok、Reddit 和职场上真实在用的词。"
              icon={<Flame className="size-5" />}
            />
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="border-t border-[#1F3A2E]/10">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
              <T>02 — 适合谁</T>
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              <T>为孩子、学生和成人精心打造。</T>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Audience
              tag="孩子 · 8–14 岁"
              title="比补习班更友好的选择。"
              points={[
                "自然拼读、常用词、短篇阅读",
                "游戏化经验值与每日连胜",
                "家长面板可追踪学习进度",
              ]}
            />
            <Audience
              tag="中学生 · 中考 / 高考"
              title="备考无需死记硬背。"
              points={[
                "阅读、完形、语法、听力",
                "学习中自动生成错题本",
                "每道错题都有 AI 讲解",
              ]}
            />
            <Audience
              tag="成人 · 工作 & 生活"
              title="在会议、邮件、出行中自信开口。"
              points={[
                "职场场景与邮件模板",
                "俚语帮你跟上社交节奏",
                "5 分钟一节，融入日常",
              ]}
            />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-t border-[#1F3A2E]/10 bg-[#1F3A2E] text-[#FAF8F3]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
              <T>03 — 为什么大家会留下来</T>
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              <span className="italic text-[#E8743C]">12,847</span> <T>位学员本周在学习。</T>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Testimonial
              quote="我女儿现在主动要求学英语，连胜系统让她上瘾。"
              name="Wei L."
              role="家长 · 上海"
            />
            <Testimonial
              quote="我从开会发言紧张，到 3 个月后能主导会议。AI 发音反馈是别家没有的。"
              name="Marisol G."
              role="产品经理 · 墨西哥城"
            />
            <Testimonial
              quote="终于有一款不像作业的英语 app，连胜 127 天还在继续。"
              name="Akira T."
              role="工程师 · 东京"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#1F3A2E]/10">
        <div className="mx-auto max-w-[1100px] px-6 py-24 text-center md:px-10 md:py-32">
          <GraduationCap className="mx-auto mb-6 size-10 text-[#E8743C]" />
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-medium leading-tight md:text-5xl">
            <T>不知道从哪里开始？</T>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-[#1F3A2E]/70">
            <T>3 分钟测试帮你定位水平，并生成专属学习路径。无需注册。</T>
          </p>
          <Link
            to="/placement"
            className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-[#E8743C] px-9 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#d4632d]"
          >
            <T>测一测我的水平</T> <ArrowRight className="size-4" />
          </Link>
          <div className="mt-6 text-xs text-[#1F3A2E]/50">
            <T>已经是会员？</T>{" "}
            <Link to="/auth" className="font-bold text-[#1F3A2E] underline-offset-4 hover:underline">
              <T>登录</T>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1F3A2E]/10 bg-[#F4EFE3]/40">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-6 py-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/55 md:flex-row md:px-10">
          <div>© {new Date().getFullYear()} Big Moon English</div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/about" className="hover:text-[#1F3A2E]"><T>关于</T></Link>
            <Link to="/privacy" className="hover:text-[#1F3A2E]"><T>隐私</T></Link>
            <Link to="/terms" className="hover:text-[#1F3A2E]"><T>条款</T></Link>
            <a href="mailto:support@bigmoonenglish.com" className="hover:text-[#1F3A2E]"><T>联系我们</T></a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  to, eyebrow, title, desc, icon,
}: { to: string; eyebrow: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group flex flex-col gap-4 rounded-3xl border border-[#1F3A2E]/10 bg-white p-7 transition hover:-translate-y-0.5 hover:border-[#1F3A2E]/25 hover:shadow-[0_20px_50px_-25px_rgba(31,58,46,0.3)] md:p-9"
    >
      <div className="flex items-center justify-between">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#1F3A2E]/5 text-[#1F3A2E]">
          {icon}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F3A2E]/45">
          <T>{eyebrow}</T>
        </div>
      </div>
      <h3 className="font-serif text-2xl font-medium leading-tight md:text-3xl"><T>{title}</T></h3>
      <p className="text-sm leading-relaxed text-[#1F3A2E]/65"><T>{desc}</T></p>
      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#E8743C]">
        <T>查看示例</T> <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function Audience({
  tag, title, points,
}: { tag: string; title: string; points: string[] }) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-[#1F3A2E]/10 bg-white p-7 md:p-8">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8743C]"><T>{tag}</T></div>
      <h3 className="font-serif text-xl font-medium leading-snug md:text-2xl"><T>{title}</T></h3>
      <ul className="space-y-2.5 border-t border-[#1F3A2E]/10 pt-5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-[#1F3A2E]/75">
            <span className="mt-2 block size-1.5 shrink-0 rounded-full bg-[#E8743C]" />
            <T>{p}</T>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Testimonial({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <figure className="flex flex-col gap-5 rounded-3xl border border-[#FAF8F3]/15 bg-[#27513f]/40 p-7 md:p-8">
      <Quote className="size-6 text-[#E8743C]" />
      <blockquote className="text-base leading-relaxed text-[#FAF8F3]/90">
        <T>{quote}</T>
      </blockquote>
      <figcaption className="border-t border-[#FAF8F3]/10 pt-4">
        <div className="text-sm font-bold text-[#FAF8F3]">{name}</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FAF8F3]/55"><T>{role}</T></div>
      </figcaption>
    </figure>
  );
}
