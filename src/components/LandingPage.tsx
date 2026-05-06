import { Link } from "react-router-dom";
import { ArrowRight, Mic, BookOpen, Flame, GraduationCap, Sparkles, Globe2, Quote, BookMarked, Star, Gamepad2, Heart, Trophy, Check, MessageCircle } from "lucide-react";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { BrandLockup } from "@/components/brand/BrandLogo";
import { T } from "@/i18n/T";
import { useI18n } from "@/i18n/I18nProvider";
import SpeakingDemo from "@/components/SpeakingDemo";
import BrandFamilyHero from "@/components/BrandFamilyHero";

/**
 * Polished English copy keyed by the Chinese source. When the user's
 * language is English we render this directly instead of letting the
 * auto-translator guess from Chinese — it keeps marketing copy crisp,
 * idiomatic and free of literal translations.
 * Other languages continue to translate from the Chinese source as before.
 */
const EN_COPY: Record<string, string> = {
  "登录": "Log in",
  "已在 184 个国家上线": "Built for learners worldwide",
  "说英语": "Speak English",
  "像玩游戏一样上头。": "the way you play your favorite game.",
  "5 分钟一节的小课、即时口语反馈、连胜系统让你真的停不下来。每天 5 分钟，就能开始。":
    "Bite-sized 5-minute lessons, instant speaking feedback, and a streak system you genuinely can't put down. Five minutes a day is all it takes to begin.",
  "免费开始": "Start free",
  "我已有账号": "I have an account",
  "4.9 平均评分": "4.9 average rating",
  "01 — 里面有什么": "01 — What's inside",
  "四种真正用得上英语的方式。": "Four ways to actually use English.",
  "每个模块都可以独立使用 —— 选你今天想学的，或者跟着完整路径从 A1 走到 C2。":
    "Every module stands on its own — pick what you feel like today, or follow the full path from A1 all the way to C2.",
  "结构化路径": "Structured path",
  "CEFR 等级 A1 → C2": "CEFR levels A1 → C2",
  "6 个等级、单元和短课程。词汇、语法、阅读和听力一条路径全包。":
    "Six levels, structured units and short lessons. Vocabulary, grammar, reading and listening — all in one path.",
  "口语训练": "Speaking practice",
  "AI 口语陪练": "AI speaking partner",
  "按住说话，立刻获得发音反馈。会议、面试、日常聊天 —— 随时练习。":
    "Hold to talk and get instant pronunciation feedback. Practise meetings, interviews and everyday chats — anytime.",
  "真实生活": "Real life",
  "真实场景对话": "Real-world dialogues",
  "机场、咖啡馆、看医生、求职面试，100+ 情景对话可以大声练习。":
    "Airports, cafés, the doctor's office, job interviews — 100+ real-life conversations to practise out loud.",
  "地道英语": "Sound like a native",
  "俚语 & 母语者表达": "Slang & native expressions",
  "从 lowkey 到 it's giving —— TikTok、Reddit 和职场上真实在用的词。":
    "From “lowkey” to “it's giving” — the words people actually use on TikTok, Reddit and at work.",
  "查看示例": "See an example",
  "02 — 适合谁": "02 — Who it's for",
  "为孩子、学生和成人精心打造。": "Thoughtfully built for kids, students and adults.",
  "孩子 · 8–14 岁": "Kids · ages 8–14",
  "比补习班更友好的选择。": "A friendlier alternative to after-school tutoring.",
  "自然拼读、常用词、短篇阅读": "Phonics, sight words and short readings",
  "游戏化经验值与每日连胜": "Game-style XP and daily streaks",
  "家长面板可追踪学习进度": "Parent dashboard to follow their progress",
  "中学生 · 中考 / 高考": "Teens · Zhongkao / Gaokao",
  "备考无需死记硬背。": "Exam prep without rote memorisation.",
  "阅读、完形、语法、听力": "Reading, cloze, grammar and listening",
  "学习中自动生成错题本": "An automatic mistake log built as you study",
  "每道错题都有 AI 讲解": "AI explanations for every wrong answer",
  "成人 · 工作 & 生活": "Adults · work & life",
  "在会议、邮件、出行中自信开口。": "Speak with confidence in meetings, emails and travel.",
  "职场场景与邮件模板": "Workplace scenarios and email templates",
  "俚语帮你跟上社交节奏": "Slang that helps you keep up socially",
  "5 分钟一节，融入日常": "5-minute lessons that fit into your day",
  "03 — 为什么大家会留下来": "03 — Why people stick around",
  "位学员本周在学习。": "learners studied this week.",
  "我女儿现在主动要求学英语，连胜系统让她上瘾。":
    "My daughter now asks to study English on her own — the streak system completely hooked her.",
  "家长 · 上海": "Parent · Shanghai",
  "我从开会发言紧张，到 3 个月后能主导会议。AI 发音反馈是别家没有的。":
    "I went from freezing up in meetings to leading them in three months. The AI pronunciation feedback is something no other app does.",
  "产品经理 · 墨西哥城": "Product Manager · Mexico City",
  "终于有一款不像作业的英语 app，连胜 127 天还在继续。":
    "Finally an English app that doesn't feel like homework — 127-day streak and still going.",
  "工程师 · 东京": "Engineer · Tokyo",
  "全球学员都在用": "Learners around the world choose",
  "Big Moon": "Big Moon",
  "终于有一款不像作业的英语 app。连胜 127 天，每晚都期待打开。":
    "Finally an English app that doesn't feel like homework. 127-day streak, and I look forward to it every night.",
  "旅行场景课救了我去伦敦的行程，我真的能开口对话，而不是手指着菜单。":
    "The travel scenarios saved my trip to London — I could actually hold a conversation instead of pointing at the menu.",
  "设计师 · 圣保罗": "Designer · São Paulo",
  "学员": "Learners",
  "国家": "Countries",
  "平均评分": "Avg. rating",
  "愿意推荐": "Would recommend",
  "不知道从哪里开始？": "Not sure where to start?",
  "3 分钟测试帮你定位水平，并生成专属学习路径。无需注册。":
    "A 3-minute placement test pinpoints your level and builds a learning path made for you. No signup required.",
  "测一测我的水平": "Test my level",
  "已经是会员？": "Already a member?",
  "关于": "About",
  "隐私": "Privacy",
  "条款": "Terms",
  "联系我们": "Contact",

  // ── High-conversion landing copy (v2) ───────────────────────────────────
  "Make speaking English as addictive as playing a game.": "Make speaking English as addictive as playing a game.",
  "Practice real conversations with AI, get instant feedback, and improve your speaking in just 5 minutes a day.":
    "Practice real conversations with AI, get instant feedback, and improve your speaking in just 5 minutes a day.",
  "Start for free": "Start for free",
  "Try the 30-sec demo": "Try the 30-sec demo",
  "4.9 rating · 10,000+ learners · Available worldwide": "Loved by early learners · Available worldwide",

  "Why Big Moon English works": "Why Big Moon English works",
  "Three things, done right.": "Three things, done right.",
  "AI Speaking Feedback": "AI Speaking Feedback",
  "Get instant corrections on pronunciation and fluency — like a real coach in your pocket.":
    "Get instant corrections on pronunciation and fluency — like a real coach in your pocket.",
  "Addictive Learning System": "Addictive Learning System",
  "Streaks, XP, and your own learning companion keep you coming back, day after day.":
    "Streaks, XP, and your own learning companion keep you coming back, day after day.",
  "Real-world English": "Real-world English",
  "Learn how people actually speak — from daily conversations to slang, not textbook lines.":
    "Learn how people actually speak — from daily conversations to slang, not textbook lines.",

  "Trusted by learners worldwide": "Trusted by learners worldwide",
  "Real stories from real users.": "Real stories from real users.",
  "Finally, something that actually helps me speak.": "Finally, something that actually helps me speak.",
  "Jason · United States": "Jason · United States",
  "I improved my pronunciation in just 2 weeks.": "I improved my pronunciation in just 2 weeks.",
  "Maria · Mexico": "Maria · Mexico",
  "My kid loves the pet system!": "My kid loves the pet system!",
  "Li Wei · China": "Li Wei · China",
  "Used in 180+ countries": "Used in 180+ countries",

  "Stay motivated, every day": "Stay motivated, every day",
  "Build your streak": "Build your streak",
  "Light up a flame each day you study. Miss a day and your streak resets — so you don't.":
    "Light up a flame each day you study. Miss a day and your streak resets — so you don't.",
  "Grow your learning companion": "Grow your learning companion",
  "Adopt a virtual buddy. Feed it with words you learn. Watch it evolve as you level up.":
    "Adopt a virtual buddy. Feed it with words you learn. Watch it evolve as you level up.",
  "Earn XP and level up": "Earn XP and level up",
  "Every lesson, quiz, and conversation earns XP. Climb the leaderboard with friends.":
    "Every lesson, quiz, and conversation earns XP. Climb the leaderboard with friends.",
  "Learning English doesn't feel like studying anymore.": "Learning English doesn't feel like studying anymore.",

  "Simple pricing": "Simple pricing",
  "Start free. Upgrade when you're hooked.": "Start free. Upgrade when you're hooked.",
  "Free": "Free",
  "Free forever": "Free forever",
  "3 lessons per day": "3 lessons per day",
  "Basic AI speaking practice": "Basic AI speaking practice",
  "Daily streak & XP": "Daily streak & XP",
  "Pet companion": "Pet companion",
  "Pro": "Pro",
  "/ month": "/ month",
  "Most popular": "Most popular",
  "Unlimited speaking practice": "Unlimited speaking practice",
  "Advanced AI feedback (pronunciation, grammar, fluency)": "Advanced AI feedback (pronunciation, grammar, fluency)",
  "All scenarios & slang unlocked": "All scenarios & slang unlocked",
  "Weekly progress reports": "Weekly progress reports",
  "Priority support": "Priority support",
  "Get Pro": "Get Pro",
  "No credit card required": "No credit card required",

  "Ready to actually speak English?": "Ready to actually speak English?",
  "Five minutes a day. Real conversations. Visible progress.":
    "Five minutes a day. Real conversations. Visible progress.",
};

/**
 * Render polished English when the user is in English; otherwise fall back
 * to the existing <L> auto-translation pipeline (which uses the Chinese
 * source to translate to all other languages).
 */
function L({ children }: { children: string }) {
  const { lang } = useI18n();
  if (lang === "en" && EN_COPY[children]) return <>{EN_COPY[children]}</>;
  return <T>{children}</T>;
}

/**
 * Public landing page (cold traffic).
 * All visible copy is wrapped in <L> so it auto-translates to the user's
 * chosen language (cached in localStorage by I18nProvider).
 */
export default function LandingPage() {
  const { lang } = useI18n();
  const isSimplifiedChinese = lang === "zh";
  return (
    <main className="min-h-dvh bg-[#FAF8F3] text-[#1F3A2E] antialiased">
      {/* HERO — light-blue gamified hero */}
      <section className="bg-[#EEF4FB]">
        {/* NAV */}
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6 md:px-10 md:py-8">
          <BrandLockup size={36} />
          <div className="flex items-center gap-1 md:gap-2">
            {[
              { to: "/", label: "Home" },
              { to: "/kids", label: "Kids" },
              { to: "/junior", label: "Junior" },
              { to: "/senior", label: "Senior" },
              { to: "/cet", label: "CET" },
              { to: "/about", label: "About Us" },
            ].map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className="hidden rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1F3A2E]/70 hover:bg-white hover:text-[#1F3A2E] md:inline-block"
              >
                {it.label}
              </Link>
            ))}
            <LanguageSwitcher />
            <Link
              to="/auth"
              className="hidden text-xs font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/70 hover:text-[#1F3A2E] md:inline"
            >
              <L>登录</L>
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-6 md:px-10 md:pb-24 md:pt-10">
          <div className="mx-auto max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3BA3E0] shadow-[0_4px_14px_-6px_rgba(59,163,224,0.4)]">
              <Globe2 className="size-3.5" /> <L>已在 184 个国家上线</L>
            </div>
            <h1 className="text-[40px] font-extrabold leading-[1.05] tracking-tight text-[#1F3A2E] md:text-[72px]">
              <L>Make speaking English as addictive as playing a game.</L>
            </h1>
            <p className="mt-4 max-w-xl font-serif text-base italic text-[#1F3A2E]/70 md:text-lg">
              Real English from real American kids, for every age in China.
            </p>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-[#1F3A2E]/70 md:text-lg">
              <L>Practice real conversations with AI, get instant feedback, and improve your speaking in just 5 minutes a day.</L>
            </p>
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8743C] px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_-10px_rgba(232,116,60,0.6)] transition hover:bg-[#d4632d]"
              >
                <L>Start for free</L> <ArrowRight className="size-4" />
              </Link>
              <a
                href="#try-now"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1F3A2E]/15 bg-white px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#1F3A2E] transition hover:bg-[#F4EFE3]"
              >
                <Mic className="size-4" /> <L>Try the 30-sec demo</L>
              </a>
            </div>

            {/* social proof bar */}
            <div className="mt-10 flex items-center gap-4 border-t border-[#1F3A2E]/10 pt-6">
              <div className="flex -space-x-2">
                {["#F4B86A","#E8743C","#7FB069","#3BA3E0"].map((c) => (
                  <div key={c} className="grid size-8 place-items-center rounded-full border-2 border-[#EEF4FB] text-[10px] font-bold text-white" style={{ background: c }}>
                    {c.slice(1,2)}
                  </div>
                ))}
                <div className="grid size-8 place-items-center rounded-full border-2 border-[#EEF4FB] bg-[#3BA3E0] text-[10px] font-bold text-white">
                  +
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex gap-0.5 text-[#F5A623]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/55">
                  <L>Loved by early learners · Available worldwide</L>
                </div>
              </div>
            </div>
          </div>

          {isSimplifiedChinese && (
            <Link
              to="/china"
              className="group mx-auto mt-10 flex max-w-2xl items-center gap-4 rounded-2xl border-2 border-[#E8743C]/30 bg-gradient-to-br from-[#FFF4EC] to-[#FFE3CF] px-6 py-5 text-left transition hover:-translate-y-0.5 hover:border-[#E8743C]/60 hover:shadow-[0_18px_40px_-20px_rgba(232,116,60,0.5)]"
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

      {/* 02 — TRY IT NOW (the highest-leverage section: live AI demo) */}
      <section id="try-now" className="border-t border-[#1F3A2E]/10 bg-[#F4EFE3]/40">
        <div className="mx-auto max-w-[900px] px-6 py-16 md:px-10 md:py-24">
          <SpeakingDemo />
        </div>
      </section>

      {/* 03 — THREE CORE USPs (only 3, exactly as the screenshot says) */}
      <section className="border-t border-[#1F3A2E]/10">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
              <L>Why Big Moon English works</L>
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              <L>Three things, done right.</L>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <USP icon={<Mic className="size-5" />}     title="AI Speaking Feedback"      desc="Get instant corrections on pronunciation and fluency — like a real coach in your pocket." />
            <USP icon={<Gamepad2 className="size-5" />} title="Addictive Learning System" desc="Streaks, XP, and your own learning companion keep you coming back, day after day." />
            <USP icon={<Globe2 className="size-5" />}   title="Real-world English"        desc="Learn how people actually speak — from daily conversations to slang, not textbook lines." />
          </div>
        </div>
      </section>

      {/* 04 — SOCIAL PROOF */}
      <section className="border-t border-[#1F3A2E]/10 bg-[#EEF4FB]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 text-center">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
              <L>Trusted by learners worldwide</L>
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              <L>Real stories from real users.</L>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <ReviewCard quote="Finally, something that actually helps me speak." name="Jason M." role="Jason · United States" />
            <ReviewCard quote="I improved my pronunciation in just 2 weeks."     name="Maria G." role="Maria · Mexico" />
            <ReviewCard quote="My kid loves the pet system!"                      name="Li Wei"   role="Li Wei · China" />
          </div>
          <div className="mt-10 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1F3A2E]/55">
            <Globe2 className="size-3.5" /> <L>Used in 180+ countries</L>
          </div>
        </div>
      </section>

      {/* 05 — GAMIFICATION (your strength) */}
      <section className="border-t border-[#1F3A2E]/10 bg-[#1F3A2E] text-[#FAF8F3]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
              🔥 <L>Stay motivated, every day</L>
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              <L>Learning English doesn't feel like studying anymore.</L>
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <GameCard icon={<Flame className="size-5" />}  title="Build your streak"             desc="Light up a flame each day you study. Miss a day and your streak resets — so you don't." />
            <GameCard icon={<Heart className="size-5" />}  title="Grow your learning companion" desc="Adopt a virtual buddy. Feed it with words you learn. Watch it evolve as you level up." />
            <GameCard icon={<Trophy className="size-5" />} title="Earn XP and level up"          desc="Every lesson, quiz, and conversation earns XP. Climb the leaderboard with friends." />
          </div>
        </div>
      </section>

      {/* 06 — SIMPLE PRICING */}
      <section className="border-t border-[#1F3A2E]/10">
        <div className="mx-auto max-w-[1100px] px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 text-center">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8743C]">
              💰 <L>Simple pricing</L>
            </div>
            <h2 className="font-serif text-3xl font-medium leading-tight md:text-5xl">
              <L>Start free. Upgrade when you're hooked.</L>
            </h2>
          </div>
          <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
            <PricingCard
              tier="Free"
              price="$0"
              period="Free forever"
              features={["3 lessons per day", "Basic AI speaking practice", "Daily streak & XP", "Pet companion"]}
              cta="Start for free"
              highlighted={false}
            />
            <PricingCard
              tier="Pro"
              price="$6.99"
              period="/ month"
              badge="Most popular"
              features={["Unlimited speaking practice", "Advanced AI feedback (pronunciation, grammar, fluency)", "All scenarios & slang unlocked", "Weekly progress reports", "Priority support"]}
              cta="Get Pro"
              highlighted
            />
          </div>
          <div className="mt-6 text-center text-xs text-[#1F3A2E]/55">
            <L>No credit card required</L>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-[#1F3A2E]/10 bg-[#EEF4FB]">
        <div className="mx-auto max-w-[1100px] px-6 py-20 text-center md:px-10 md:py-28">
          <MessageCircle className="mx-auto mb-6 size-10 text-[#E8743C]" />
          <h2 className="mx-auto max-w-2xl font-serif text-3xl font-medium leading-tight md:text-5xl">
            <L>Ready to actually speak English?</L>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-[#1F3A2E]/70">
            <L>Five minutes a day. Real conversations. Visible progress.</L>
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8743C] px-9 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#d4632d]"
            >
              <L>Start for free</L> <ArrowRight className="size-4" />
            </Link>
            <a href="#try-now" className="text-xs font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/55 hover:text-[#1F3A2E]">
              <L>Try the 30-sec demo</L>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1F3A2E]/10 bg-[#F4EFE3]/40">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 px-6 py-8 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/55 md:flex-row md:px-10">
          <div>© {new Date().getFullYear()} Big Moon English</div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link to="/about" className="hover:text-[#1F3A2E]"><L>关于</L></Link>
            <Link to="/privacy" className="hover:text-[#1F3A2E]"><L>隐私</L></Link>
            <Link to="/terms" className="hover:text-[#1F3A2E]"><L>条款</L></Link>
            <a href="mailto:support@bigmoonenglish.com" className="hover:text-[#1F3A2E]"><L>联系我们</L></a>
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
          <L>{eyebrow}</L>
        </div>
      </div>
      <h3 className="font-serif text-2xl font-medium leading-tight md:text-3xl"><L>{title}</L></h3>
      <p className="text-sm leading-relaxed text-[#1F3A2E]/65"><L>{desc}</L></p>
      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#E8743C]">
        <L>查看示例</L> <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function Audience({
  tag, title, points,
}: { tag: string; title: string; points: string[] }) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-[#1F3A2E]/10 bg-white p-7 md:p-8">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8743C]"><L>{tag}</L></div>
      <h3 className="font-serif text-xl font-medium leading-snug md:text-2xl"><L>{title}</L></h3>
      <ul className="space-y-2.5 border-t border-[#1F3A2E]/10 pt-5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-sm text-[#1F3A2E]/75">
            <span className="mt-2 block size-1.5 shrink-0 rounded-full bg-[#E8743C]" />
            <L>{p}</L>
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
        <L>{quote}</L>
      </blockquote>
      <figcaption className="border-t border-[#FAF8F3]/10 pt-4">
        <div className="text-sm font-bold text-[#FAF8F3]">{name}</div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#FAF8F3]/55"><L>{role}</L></div>
      </figcaption>
    </figure>
  );
}

function ReviewCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <figure className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_8px_30px_-12px_rgba(31,58,46,0.18)] md:p-7">
      <div className="flex gap-1 text-[#F5A623]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-4 fill-current" />
        ))}
      </div>
      <blockquote className="text-[15px] leading-relaxed text-[#1F3A2E]/80">
        &ldquo;<L>{quote}</L>&rdquo;
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-2">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1F3A2E]/10 text-sm font-bold text-[#1F3A2E]">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-[#1F3A2E]">{name}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1F3A2E]/55"><L>{role}</L></div>
        </div>
      </figcaption>
    </figure>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-white px-5 py-6 text-center shadow-[0_8px_24px_-12px_rgba(31,58,46,0.15)]">
      <div className="text-2xl font-extrabold text-[#3BA3E0] md:text-3xl">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1F3A2E]/55"><L>{label}</L></div>
    </div>
  );
}

function USP({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[#1F3A2E]/10 bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-25px_rgba(31,58,46,0.3)] md:p-8">
      <div className="grid size-11 place-items-center rounded-2xl bg-[#E8743C]/10 text-[#E8743C]">
        {icon}
      </div>
      <h3 className="font-serif text-xl font-medium leading-snug md:text-2xl"><L>{title}</L></h3>
      <p className="text-sm leading-relaxed text-[#1F3A2E]/70"><L>{desc}</L></p>
    </div>
  );
}

function GameCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-[#FAF8F3]/15 bg-[#27513f]/40 p-7 md:p-8">
      <div className="grid size-11 place-items-center rounded-2xl bg-[#E8743C] text-white">
        {icon}
      </div>
      <h3 className="font-serif text-xl font-medium leading-snug text-[#FAF8F3] md:text-2xl"><L>{title}</L></h3>
      <p className="text-sm leading-relaxed text-[#FAF8F3]/75"><L>{desc}</L></p>
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
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E8743C] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          <L>{badge}</L>
        </div>
      )}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#1F3A2E]/55"><L>{tier}</L></div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <div className="text-4xl font-extrabold text-[#1F3A2E]">{price}</div>
          <div className="text-xs text-[#1F3A2E]/60"><L>{period}</L></div>
        </div>
      </div>
      <ul className="space-y-2.5 border-t border-[#1F3A2E]/10 pt-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-[#1F3A2E]/80">
            <Check className="mt-0.5 size-4 shrink-0 text-[#7FB069]" />
            <L>{f}</L>
          </li>
        ))}
      </ul>
      <Link
        to="/auth"
        className={`mt-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] transition ${
          highlighted
            ? "bg-[#E8743C] text-white hover:bg-[#d4632d]"
            : "border border-[#1F3A2E]/20 text-[#1F3A2E] hover:bg-[#F4EFE3]"
        }`}
      >
        <L>{cta}</L> <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
