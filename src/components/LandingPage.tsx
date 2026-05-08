import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Play, Target, Rocket, Trophy, Users, Award,
  TrendingUp, CheckCircle2, BookOpen, Brain, Headphones, PenLine,
  BarChart3, Zap, Star, Quote, Check, Phone, Mail, MapPin, Gift,
  GraduationCap,
} from "lucide-react";
import { BrandLockup } from "@/components/brand/BrandLogo";

/**
 * 中文母品牌主页 — Big Moon English K-12（小学/初中/高中）
 * 风格参考: 紫蓝渐变 + 卡片化数据 + 暗色 stats + 浅色课程/功能/评价/价格
 */

const NAV = [
  { href: "#courses", label: "课程体系" },
  { href: "#features", label: "学习特色" },
  { href: "#pricing", label: "价格方案" },
  { href: "#contact", label: "联系我们" },
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-white text-slate-900 antialiased">
      {/* ============ NAV ============ */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <BookOpen className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-extrabold">Big Moon English</div>
              <div className="text-[10px] tracking-wider text-slate-500">专业英语培训平台</div>
            </div>
          </div>
          <div className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                {n.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-sm font-semibold text-slate-600 md:inline-flex">
              <Phone className="size-4" /> 400-888-8888
            </span>
            <Link
              to="/auth"
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:shadow-lg"
            >
              免费试听
            </Link>
          </div>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="pointer-events-none absolute -left-32 top-20 size-96 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 size-96 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1240px] gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-indigo-600 shadow-sm ring-1 ring-indigo-100">
              <Sparkles className="size-3.5" /> 已帮助 100,000+ 学生提升英语成绩
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[1.1] tracking-tight md:text-6xl">
              从小学到高中
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
                全阶段英语提分系统
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-600 md:text-lg">
              AI 驱动的个性化学习平台，同步课标教材，平均提分{" "}
              <span className="font-bold text-indigo-600">20+</span>，让每个学生都能学好英语
            </p>

            <ul className="mt-8 space-y-3">
              {[
                { icon: Target, text: "精准定位薄弱点，针对性强化训练", color: "from-rose-500 to-pink-500" },
                { icon: Rocket, text: "独家记忆法，单词语法过目不忘", color: "from-violet-500 to-indigo-500" },
                { icon: Trophy, text: "真题题库，中高考命题规律全掌握", color: "from-amber-500 to-orange-500" },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <li
                    key={f.text}
                    className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100"
                  >
                    <span className={`grid size-8 place-items-center rounded-lg bg-gradient-to-br ${f.color} text-white`}>
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{f.text}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 hover:shadow-xl transition"
              >
                <Sparkles className="size-4" /> 立即开始免费试学
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
              >
                <Play className="size-4" /> 观看学习演示
              </a>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["from-indigo-400 to-violet-500", "from-pink-400 to-rose-500", "from-amber-400 to-orange-500", "from-emerald-400 to-teal-500"].map((g, i) => (
                  <div key={i} className={`size-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-white`} />
                ))}
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-700">10,000+ 学生正在学习</div>
                <div className="mt-0.5 flex items-center gap-1 text-slate-500">
                  平均评分 4.9/5.0
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: stats card panel */}
          <div className="relative">
            <div className="absolute -right-3 -top-3 z-10 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-center text-white shadow-xl">
              <div>
                <div className="text-lg font-black leading-none">7天</div>
                <div className="text-[10px] font-bold opacity-90">免费试学</div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-indigo-500/10 ring-1 ring-slate-100">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, num: "100K+", label: "学员总数", g: "from-blue-500 to-indigo-600" },
                  { icon: Award, num: "98%", label: "满意度", g: "from-violet-500 to-purple-600" },
                  { icon: TrendingUp, num: "+20分", label: "平均提分", g: "from-emerald-500 to-teal-600" },
                  { icon: CheckCircle2, num: "500+", label: "合作学校", g: "from-orange-500 to-rose-500" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.g} p-5 text-white`}>
                      <Icon className="size-6 opacity-90" />
                      <div className="mt-3 text-3xl font-black leading-none">{s.num}</div>
                      <div className="mt-2 text-xs font-semibold opacity-90">{s.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">本月学习成果</span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="size-3" /> 15%
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "完成课程", pct: 85, color: "bg-blue-500" },
                    { label: "单词掌握", pct: 92, color: "bg-violet-500" },
                    { label: "模拟测试", pct: 78, color: "bg-emerald-500" },
                  ].map((b) => (
                    <div key={b.label}>
                      <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>{b.label}</span>
                        <span>{b.pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS (DARK) ============ */}
      <section className="relative overflow-hidden bg-[#0E1530] py-20 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-[1240px] px-6 text-center">
          <h2 className="text-3xl font-black md:text-4xl">数据说话，实力见证</h2>
          <p className="mt-3 text-sm text-slate-400">真实的学习成果，值得信赖的教育品牌</p>
          <div className="mt-14 grid grid-cols-2 gap-10 md:grid-cols-4">
            {[
              { icon: Users, num: "100,000+", label: "累计学员", g: "from-blue-500 to-indigo-600" },
              { icon: BookOpen, num: "5,000+", label: "精品课程", g: "from-pink-500 to-fuchsia-600" },
              { icon: TrendingUp, num: "85%", label: "成绩提升率", g: "from-emerald-500 to-teal-600" },
              { icon: Award, num: "500+", label: "合作学校", g: "from-orange-500 to-rose-500" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col items-center">
                  <div className={`grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${s.g} text-white shadow-lg`}>
                    <Icon className="size-7" />
                  </div>
                  <div className="mt-5 text-4xl font-black md:text-5xl">{s.num}</div>
                  <div className="mt-2 text-xs text-slate-400">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ COURSES ============ */}
      <section id="courses" className="bg-white py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="text-center">
            <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-600">课程体系</span>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">分阶段系统化学习方案</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500">
              根据不同年龄段学生的认知特点和学习需求，提供针对性的课程内容
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                badge: "小学 G1-G6", title: "小学英语", age: "适合 6-12 岁学生",
                items: ["自然拼读法，轻松记单词", "趣味互动课堂，激发学习兴趣", "同步课本知识点，巩固课堂学习", "听说读写全面训练"],
                bg: "bg-orange-50", badgeBg: "bg-gradient-to-r from-orange-400 to-amber-500",
                btn: "bg-gradient-to-r from-orange-500 to-amber-500", dot: "bg-orange-500", to: "/kids",
              },
              {
                badge: "初中 G7-G9", title: "初中英语", age: "适合 12-15 岁学生",
                items: ["中考必考语法专项突破", "阅读理解技巧训练", "写作模板与实战演练", "听力专项强化训练"],
                bg: "bg-emerald-50", badgeBg: "bg-gradient-to-r from-emerald-500 to-teal-500",
                btn: "bg-gradient-to-r from-emerald-500 to-teal-500", dot: "bg-emerald-500", to: "/junior",
              },
              {
                badge: "高中 G10-G12", title: "高中英语", age: "适合 15-18 岁学生",
                items: ["高考真题精讲，把握命题规律", "3500 词汇高效记忆法", "完形填空与阅读满分策略", "高分作文写作技巧"],
                bg: "bg-violet-50", badgeBg: "bg-gradient-to-r from-violet-500 to-indigo-500",
                btn: "bg-gradient-to-r from-violet-500 to-indigo-500", dot: "bg-violet-500", to: "/senior",
              },
            ].map((c) => (
              <div key={c.title} className={`rounded-3xl ${c.bg} p-7 ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl`}>
                <span className={`inline-flex items-center gap-1.5 rounded-lg ${c.badgeBg} px-3 py-1.5 text-xs font-bold text-white shadow-sm`}>
                  <GraduationCap className="size-3.5" /> {c.badge}
                </span>
                <h3 className="mt-5 text-2xl font-black">{c.title}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{c.age}</p>
                <ul className="mt-5 space-y-3">
                  {c.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${c.dot}`} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={c.to}
                  className={`mt-7 flex items-center justify-center gap-1.5 rounded-xl ${c.btn} px-5 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg`}
                >
                  了解详情 <ArrowRight className="size-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="text-center">
            <span className="rounded-full bg-violet-100 px-4 py-1.5 text-xs font-bold text-violet-600">学习特色</span>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">六大核心功能，助力英语提分</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500">
              结合 AI 技术与科学教学方法，让学习更高效、更有趣
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: Brain, title: "AI 智能学习", desc: "根据学习进度智能推荐练习，个性化定制学习路径", g: "from-violet-500 to-purple-600" },
              { icon: Target, title: "精准诊断", desc: "实时分析薄弱环节，针对性强化训练，快速提分", g: "from-blue-500 to-indigo-600" },
              { icon: Headphones, title: "听力专训", desc: "海量听力材料，模拟真实考试场景，提升听力水平", g: "from-emerald-500 to-teal-600" },
              { icon: PenLine, title: "写作批改", desc: "AI 智能批改作文，及时反馈，快速提升写作能力", g: "from-orange-500 to-rose-500" },
              { icon: BarChart3, title: "学习报告", desc: "详细的学习数据分析，让进步看得见", g: "from-pink-500 to-fuchsia-600" },
              { icon: Zap, title: "快速记忆", desc: "科学记忆曲线，高效记忆单词和语法知识点", g: "from-amber-500 to-yellow-500" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className={`grid size-12 place-items-center rounded-xl bg-gradient-to-br ${f.g} text-white shadow-md`}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-black">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="text-center">
            <span className="rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700">学员真实评价</span>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">听听学员怎么说</h2>
            <p className="mt-3 text-sm text-slate-500">来自全国各地学生的真实反馈</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {[
              { name: "李明", grade: "初三学生", school: "北京市第一中学", avatar: "👦", tag: "从 65 分提升到 92 分", quote: "之前英语成绩一直不理想，用了这个平台后，通过 AI 智能诊断找到了我的薄弱环节，老师讲解很细致，练习题也很有针对性，三个月就提分 27 分！" },
              { name: "王静怡", grade: "高二学生", school: "上海外国语中学", avatar: "👧", tag: "高考英语 145 分", quote: "作为高中生，时间非常宝贵。这个平台的学习路径很清晰，每天只需要 30 分钟就能完成高效学习。特别是高考真题解析，让我掌握了很多答题技巧。强烈推荐！" },
              { name: "张浩然", grade: "小学六年级", school: "深圳实验小学", avatar: "🧒", tag: "班级第一名", quote: "我特别喜欢这里的互动游戏学习，记单词再也不枯燥了！每次闯关成功都特别有成就感。现在我的英语成绩从中等水平提升到了班级第一，感谢老师们！" },
              { name: "陈雨萱", grade: "初一学生", school: "杭州育才中学", avatar: "👧", tag: "听力满分", quote: "最喜欢这个平台的听力训练功能，有很多真实场景的对话练习。每天坚持练习 15 分钟，现在听力考试基本都是满分。而且还能纠正我的发音，太实用了！" },
            ].map((t) => (
              <div key={t.name} className="relative rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-100">
                <Quote className="absolute right-6 top-6 size-8 text-slate-100" />
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-amber-100 text-2xl">{t.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base font-extrabold">{t.name}</div>
                        <div className="text-xs font-semibold text-slate-500">{t.grade}</div>
                        <div className="text-[11px] text-slate-400">{t.school}</div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((i) => <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-xs font-bold text-white">
                  🎯 {t.tag}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{t.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="bg-white py-24">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="text-center">
            <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700">价格方案</span>
            <h2 className="mt-4 text-3xl font-black md:text-4xl">选择适合你的学习方案</h2>
            <p className="mt-3 text-sm text-slate-500">所有方案均支持随时取消，不满意全额退款</p>
          </div>
          <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
            {[
              {
                name: "免费体验版", desc: "适合初次了解的学生", price: "¥0", unit: "永久免费",
                items: ["7 天完整课程体验", "基础词汇和语法练习", "每日 3 次 AI 智能测评", "学习报告查看", "社区学习资源"],
                btn: "立即开始", btnCls: "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
                accent: "text-slate-900", popular: false,
              },
              {
                name: "标准学习版", desc: "最受欢迎的选择", price: "¥49", unit: "/月",
                items: ["全部课程无限学习", "海量题库和真题模拟", "无限次 AI 智能测评", "作文智能批改（每月30篇）", "专属学习顾问 1 对 1 指导", "学习数据详细分析报告", "优先客服支持"],
                btn: "开始学习", btnCls: "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg hover:shadow-xl",
                accent: "text-indigo-600", popular: true,
              },
              {
                name: "高级冲刺版", desc: "备考冲刺必选", price: "¥99", unit: "/月",
                items: ["标准版全部功能", "作文智能批改（不限次数）", "名师 1 对 1 在线答疑", "中/高考冲刺专项课程", "每周直播答疑课", "定制化学习方案", "考前预测试卷", "学习资料免费下载"],
                btn: "立即升级", btnCls: "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg hover:shadow-xl",
                accent: "text-violet-600", popular: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-3xl bg-white p-8 ring-1 transition ${
                  p.popular ? "ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20 md:-translate-y-3" : "ring-slate-200 shadow-sm"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-1.5 text-[11px] font-bold tracking-wide text-white shadow-md">
                    ⭐ 最受欢迎
                  </span>
                )}
                <div className="text-center">
                  <h3 className="text-lg font-black">{p.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{p.desc}</p>
                  <div className="mt-6 flex items-baseline justify-center gap-1">
                    <span className={`text-5xl font-black ${p.accent}`}>{p.price}</span>
                    <span className="text-sm font-semibold text-slate-500">{p.unit}</span>
                  </div>
                </div>
                <ul className="mt-7 flex-1 space-y-3">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={`mt-8 block rounded-xl px-5 py-3 text-center text-sm font-bold transition hover:-translate-y-0.5 ${p.btnCls}`}
                >
                  {p.btn}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center text-xs text-slate-500">
            <div className="font-bold text-slate-700">🎓 学校/机构批量购买可享受 8折优惠</div>
            <div className="mt-2">支持支付宝、微信支付、银行卡等多种支付方式</div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section id="contact" className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-600 to-pink-500 py-20 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative mx-auto max-w-[900px] px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur">
            <Gift className="size-3.5" /> 限时优惠：前 100 名注册送 3 个月会员
          </span>
          <h2 className="mt-6 text-4xl font-black leading-tight md:text-5xl">
            开启你的英语提分之旅
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
              现在就开始免费试学
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm text-white/90 md:text-base">
            无需信用卡，无需承诺，7 天完整功能体验
            <br />加入 100,000+ 学生的学习社区
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-600 shadow-xl hover:-translate-y-0.5"
            >
              <Sparkles className="size-4" /> 立即免费试学 7 天 <ArrowRight className="size-4" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-7 py-3.5 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/20"
            >
              联系课程顾问
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs">
            {["无需信用卡", "随时取消", "7 天退款保证"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#0E1530] py-14 text-slate-300">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-6 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <BookOpen className="size-5" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">Big Moon English</div>
                <div className="text-[10px] tracking-wider text-slate-500">专业英语培训平台</div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              专注于为中国学生提供优质的英语学习解决方案，助力每一位学生实现英语学习目标。
            </p>
          </div>
          <div>
            <div className="text-sm font-bold text-white">快速链接</div>
            <ul className="mt-4 space-y-2.5 text-xs">
              {["课程体系", "学习特色", "价格方案", "师资团队", "学员案例"].map((t) => (
                <li key={t}><a href="#" className="hover:text-white">{t}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-bold text-white">学习资源</div>
            <ul className="mt-4 space-y-2.5 text-xs">
              {["下载中心", "学习资料", "常见问题", "使用指南", "联系客服"].map((t) => (
                <li key={t}><a href="#" className="hover:text-white">{t}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm font-bold text-white">联系我们</div>
            <ul className="mt-4 space-y-3 text-xs">
              <li className="flex items-start gap-2"><Phone className="mt-0.5 size-4 text-slate-500" /><div><div className="text-slate-500">客服热线</div><div className="font-bold text-white">400-888-8888</div></div></li>
              <li className="flex items-start gap-2"><Mail className="mt-0.5 size-4 text-slate-500" /><div><div className="text-slate-500">客服邮箱</div><div className="font-bold text-white">support@bigmoonenglish.com</div></div></li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 text-slate-500" /><div><div className="text-slate-500">公司地址</div><div className="font-bold text-white">北京市朝阳区xxx路xx号</div></div></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1240px] flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 pt-6 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} Big Moon English 教育科技有限公司 版权所有</div>
          <div className="flex gap-5">
            <Link to="/terms" className="hover:text-white">用户协议</Link>
            <Link to="/privacy" className="hover:text-white">隐私政策</Link>
            <a href="#" className="hover:text-white">退款政策</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
