import { T } from "@/i18n/T";import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Volume2, Award, Sparkles, Check, Eye, Ear, GitCompare, Gamepad2, Mic, Share2, Download, CalendarDays } from "lucide-react";
import BackLink from "@/components/BackLink";
import { PRIMARY_CULTURE_CARDS, CULTURE_CATEGORIES, type CultureCard } from "@/data/primaryCultureCards";
import RolePlayTheater from "@/components/RolePlayTheater";

const STAMP_KEY = "primary_culture_stamps_v1";

function loadStamps(): Record<string, number> {
  try {return JSON.parse(localStorage.getItem(STAMP_KEY) || "{}");} catch {return {};}
}
function saveStamp(id: string) {
  const s = loadStamps();
  s[id] = Date.now();
  localStorage.setItem(STAMP_KEY, JSON.stringify(s));
}

function speak(text: string, rate = 0.85) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// ===== 节日时令推送 =====
// 根据今天日期返回当下/即将到来的节日卡 id
function getSeasonalCardId(now = new Date()): {id: string;daysAway: number;label: string;} | null {
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const today = m * 100 + d;
  // [起始, 结束, cardId, 标签]
  const windows: Array<[number, number, string, string]> = [
  [1215, 1231, "f1", "圣诞节就快到啦"],
  [1010, 1101, "f2", "万圣节季节"],
  [1101, 1130, "f3", "感恩节季节"],
  [301, 430, "f4", "复活节春天到"],
  [201, 215, "f5", "情人节就要到了"],
  [101, 110, "f7", "新年新气象"],
  [501, 515, "f8", "母亲节快到了"],
  [615, 625, "f8", "父亲节快到了"]];

  for (const [s, e, id, label] of windows) {
    if (today >= s && today <= e) return { id, daysAway: 0, label };
  }
  return null;
}

// ===== 家长分享卡 =====
async function buildShareCard(card: CultureCard, stampedCount: number, total: number): Promise<string> {
  const W = 720,H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  // 背景渐变
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#fff7ed");g.addColorStop(1, "#fde68a");
  ctx.fillStyle = g;ctx.fillRect(0, 0, W, H);
  // 顶部装饰
  ctx.fillStyle = "#f59e0b";ctx.fillRect(0, 0, W, 12);
  // 标题
  ctx.fillStyle = "#92400e";
  ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
  ctx.fillText("📔 我的文化护照", 60, 90);
  ctx.font = "bold 18px system-ui";
  ctx.fillStyle = "#b45309";
  ctx.fillText("MY CULTURE PASSPORT · 1ST GRADE", 60, 120);
  // 主 emoji 圆框
  ctx.beginPath();ctx.arc(W / 2, 340, 130, 0, Math.PI * 2);ctx.closePath();
  ctx.fillStyle = "#ffffff";ctx.fill();
  ctx.lineWidth = 8;ctx.strokeStyle = "#f59e0b";ctx.stroke();
  ctx.font = "150px system-ui";
  ctx.textAlign = "center";ctx.fillStyle = "#000";
  ctx.fillText(card.emoji, W / 2, 390);
  ctx.textAlign = "left";
  // 今天学了
  ctx.fillStyle = "#78350f";
  ctx.font = "bold 22px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("今天我学了", W / 2, 530);
  ctx.fillStyle = "#7c2d12";
  ctx.font = "bold 52px system-ui";
  ctx.fillText(card.title_cn, W / 2, 600);
  ctx.fillStyle = "#b45309";
  ctx.font = "bold 30px system-ui";
  ctx.fillText(card.title_en, W / 2, 645);
  // 一句话
  ctx.fillStyle = "#92400e";
  ctx.font = "italic 22px system-ui";
  const sentence = `"${card.sentence_en || card.title_en}"`;
  ctx.fillText(sentence, W / 2, 720);
  // 进度条
  const barX = 80,barY = 820,barW = W - 160,barH = 28;
  ctx.fillStyle = "#fed7aa";ctx.beginPath();
  (ctx as any).roundRect?.(barX, barY, barW, barH, 14);
  ctx.fill();
  const pct = stampedCount / total;
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, "#fbbf24");grad.addColorStop(1, "#f97316");
  ctx.fillStyle = grad;ctx.beginPath();
  (ctx as any).roundRect?.(barX, barY, Math.max(barW * pct, 16), barH, 14);
  ctx.fill();
  ctx.fillStyle = "#7c2d12";ctx.font = "bold 22px system-ui";
  ctx.fillText(`已盖 ${stampedCount} / ${total} 章 文化印章`, W / 2, barY + 80);
  // 底部署名
  ctx.fillStyle = "#a16207";ctx.font = "bold 18px system-ui";
  ctx.fillText("Big Moon English · 一年级文化小课堂", W / 2, H - 60);
  ctx.textAlign = "left";
  return canvas.toDataURL("image/png");
}

const STEPS = [
{ key: "see", label: "看一看", icon: Eye, color: "from-sky-400 to-cyan-400" },
{ key: "hear", label: "听一听", icon: Ear, color: "from-violet-400 to-fuchsia-400" },
{ key: "compare", label: "比一比", icon: GitCompare, color: "from-amber-400 to-orange-400" },
{ key: "play", label: "玩一玩", icon: Gamepad2, color: "from-emerald-400 to-teal-400" },
{ key: "say", label: "说一说", icon: Mic, color: "from-rose-400 to-pink-400" }] as
const;

export default function PrimaryCulture() {
  const { grade } = useParams<{grade: string;}>();
  const g = Number(grade ?? "1");
  const [filter, setFilter] = useState<CultureCard["category"] | "all" | "passport">("all");
  const [openCard, setOpenCard] = useState<CultureCard | null>(null);
  const [stamps, setStamps] = useState<Record<string, number>>(() => loadStamps());
  const [stepIdx, setStepIdx] = useState(0);
  const [quizPicked, setQuizPicked] = useState<string | null>(null);
  const [saidIt, setSaidIt] = useState(false);
  const [justStamped, setJustStamped] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const seasonal = useMemo(() => getSeasonalCardId(), []);
  const seasonalCard = useMemo(
    () => seasonal ? PRIMARY_CULTURE_CARDS.find((c) => c.id === seasonal.id) : null,
    [seasonal]
  );

  // 按当前年级解锁：minGrade 默认 1，G6 看到全部，G1 只看到入门卡。
  const gradeCards = useMemo(
    () => PRIMARY_CULTURE_CARDS.filter((c) => (c.minGrade ?? 1) <= g),
    [g]
  );

  const cards = useMemo(() => {
    if (filter === "all") return gradeCards;
    if (filter === "passport") return gradeCards.filter((c) => stamps[c.id]);
    return gradeCards.filter((c) => c.category === filter);
  }, [filter, stamps, gradeCards]);

  const cats = Object.entries(CULTURE_CATEGORIES) as [CultureCard["category"], typeof CULTURE_CATEGORIES[CultureCard["category"]]][];
  // 护照进度只统计本年级解锁的卡，避免 G1 永远是 X/30。
  const gradeIds = useMemo(() => new Set(gradeCards.map((c) => c.id)), [gradeCards]);
  const stampedCount = Object.keys(stamps).filter((id) => gradeIds.has(id)).length;
  const total = gradeCards.length;

  // 简单 quiz: 在同类别其他卡里取 2 个干扰项
  const quizOptions = useMemo(() => {
    if (!openCard) return [];
    const sameCat = PRIMARY_CULTURE_CARDS.filter((c) => c.category === openCard.category && c.id !== openCard.id);
    const distractors = sameCat.sort(() => Math.random() - 0.5).slice(0, 2);
    return [openCard, ...distractors].sort(() => Math.random() - 0.5);
  }, [openCard]);

  function openMicroLesson(c: CultureCard) {
    setOpenCard(c);
    setStepIdx(0);
    setQuizPicked(null);
    setSaidIt(false);
    setJustStamped(false);
  }

  function nextStep() {
    if (!openCard) return;
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      // 完成 → 盖章
      if (!stamps[openCard.id]) {
        saveStamp(openCard.id);
        setStamps(loadStamps());
        setJustStamped(true);
        setTimeout(() => setJustStamped(false), 2200);
        // v2 Spark bond: culture stamp collected.
        import("@/lib/petGrowth").then(({ bondOnCultureStamp }) => bondOnCultureStamp()).catch(() => {});
      }
    }
  }

  // 自动朗读"听一听"步骤
  useEffect(() => {
    if (openCard && STEPS[stepIdx].key === "hear") {
      const t = setTimeout(() => speak(openCard.sentence_en || openCard.title_en), 250);
      return () => clearTimeout(t);
    }
  }, [stepIdx, openCard]);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-6">
      <BackLink to={`/primary/grade/${g}`} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回</T> {g} <T>年级</T>
      </BackLink>
      <div className="mb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground"><T>CULTURE · 文化意识</T></div>
        <h1 className="text-grad-title mt-1 text-2xl font-extrabold md:text-3xl"><T>🌍 西方文化小课堂</T></h1>
        <p className="mt-1 text-xs text-muted-foreground"><T>每张卡 = 一次 5 步小冒险：看 → 听 → 比 → 玩 → 说，集满 30 章成为环球小公民</T></p>
      </div>

      {/* 文化护照进度条 */}
      <div className="mb-4 overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-tile dark:border-amber-700 dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-md">📔</div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <div className="text-sm font-extrabold text-amber-900 dark:text-amber-200"><T>我的文化护照</T></div>
              <div className="text-[10px] font-bold text-amber-700/70 dark:text-amber-300/70">PASSPORT</div>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                style={{ width: `${stampedCount / total * 100}%` }} />
              
            </div>
            <div className="mt-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
              <T>已盖</T> <span className="text-base">{stampedCount}</span> / {total} <T>章</T>
              {stampedCount >= total && <span className="ml-2"><T>🏆 环球小公民达成！</T></span>}
            </div>
          </div>
        </div>
      </div>

      {/* 节日时令推送 */}
      {seasonalCard && !stamps[seasonalCard.id] &&
      <button
        onClick={() => openMicroLesson(seasonalCard)}
        className="mb-4 flex w-full items-center gap-3 overflow-hidden rounded-3xl border-2 border-rose-300 bg-gradient-to-r from-rose-100 via-pink-100 to-orange-100 p-3 text-left shadow-tile transition hover:scale-[1.01] dark:border-rose-700 dark:from-rose-950/40 dark:via-pink-950/40 dark:to-orange-950/40">
        
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-md">
            {seasonalCard.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300">
              <CalendarDays className="size-3" /> <T>今日推荐 ·</T> {seasonal!.label}
            </div>
            <div className="truncate text-base font-extrabold text-rose-900 dark:text-rose-100">
              📣 {seasonalCard.title_cn} · {seasonalCard.title_en}
            </div>
            <div className="text-[11px] font-bold text-rose-700/80 dark:text-rose-300/80"><T>点这里立刻学，赶上节日氛围 →</T></div>
          </div>
        </button>
      }

      {/* 角色扮演剧场 */}
      <section className="mb-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-base font-extrabold"><T>🎭 角色扮演剧场</T></h2>
          <span className="text-[11px] font-bold text-muted-foreground"><T>读对话 → 自己选答 → 拿 ⭐⭐⭐</T></span>
        </div>
        <RolePlayTheater />
      </section>

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-base font-extrabold"><T>📚 文化卡片库</T></h2>
        <span className="text-[11px] font-bold text-muted-foreground"><T>点击任意卡片开始 5 步小冒险</T></span>
      </div>

      {/* 分类筛选 */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
          filter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"}`
          }>
          <T>全部 ·</T> 
          {total}
        </button>
        <button
          onClick={() => setFilter("passport")}
          className={`inline-flex items-center gap-1 rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
          filter === "passport" ? "border-amber-500 bg-amber-500 text-white" : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300"}`
          }>
          
          <Award className="size-3" /> <T>已学 ·</T> {stampedCount}
        </button>
        {cats.map(([key, cat]) => {
          const count = PRIMARY_CULTURE_CARDS.filter((c) => c.category === key).length;
          const done = PRIMARY_CULTURE_CARDS.filter((c) => c.category === key && stamps[c.id]).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition ${
              filter === key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"}`
              }>
              
              {cat.emoji} {cat.label} · {done}/{count}
            </button>);

        })}
      </div>

      {/* 卡片网格 */}
      {cards.length === 0 ?
      <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          <T>还没有盖章哦，去学一张吧 ✨</T>
        </div> :

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {cards.map((c) => {
          const cat = CULTURE_CATEGORIES[c.category];
          const stamped = !!stamps[c.id];
          return (
            <button
              key={c.id}
              onClick={() => openMicroLesson(c)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.color} p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5`}>
              
                <span className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-white/20 blur-2xl" />
                {stamped &&
              <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white text-amber-600 shadow-md">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
              }
                <div className="text-3xl">{c.emoji}</div>
                <div className="mt-2 text-sm font-extrabold leading-tight">{c.title_cn}</div>
                <div className="mt-0.5 text-[11px] font-bold opacity-90">{c.title_en}</div>
                <div className="mt-2 inline-block rounded-full bg-white/25 px-2 py-0.5 text-[9px] font-bold backdrop-blur-sm">
                  {cat.emoji} {cat.label}
                </div>
              </button>);

        })}
        </div>
      }

      {/* 5 步微课弹窗 */}
      {openCard &&
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={() => setOpenCard(null)}>
        
          <div
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl"
          onClick={(e) => e.stopPropagation()}>
          
            {/* 顶部步骤指示 */}
            <div className={`bg-gradient-to-r ${STEPS[stepIdx].color} px-5 pb-3 pt-4 text-white`}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-90">
                <span>{openCard.title_cn} · {openCard.title_en}</span>
                <span><T>第</T> {stepIdx + 1} / {STEPS.length} <T>步</T></span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {STEPS.map((s, i) =>
              <div
                key={s.key}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= stepIdx ? "bg-white" : "bg-white/30"}`
                } />

              )}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-base font-extrabold">
                {(() => {const I = STEPS[stepIdx].icon;return <I className="size-5" />;})()}
                {STEPS[stepIdx].label}
              </div>
            </div>

            {/* 步骤内容 */}
            <div className="min-h-[280px] p-5">
              {STEPS[stepIdx].key === "see" &&
            <div className="text-center">
                  <div className="mx-auto text-7xl">{openCard.emoji}</div>
                  <div className="mt-3 text-xl font-extrabold">{openCard.title_cn}</div>
                  <div className="mt-1 text-sm font-bold text-muted-foreground">{openCard.title_en}</div>
                  <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm leading-relaxed">{openCard.desc_cn}</p>
                </div>
            }

              {STEPS[stepIdx].key === "hear" &&
            <div className="text-center">
                  <div className="text-5xl">🔊</div>
                  <p className="mt-3 text-xs text-muted-foreground"><T>点击下方按钮反复听</T></p>
                  <button
                onClick={() => speak(openCard.sentence_en || openCard.title_en)}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-5 py-3 font-extrabold text-white shadow-md hover:scale-105">
                
                    <Volume2 className="size-5" /> <T>再听一次</T>
                  </button>
                  <div className="mt-4 rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-base font-bold text-violet-900 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-200">
                    "{openCard.sentence_en || openCard.title_en}"
                  </div>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {openCard.keywords.map((kw) =>
                <button
                  key={kw}
                  onClick={() => speak(kw)}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-border bg-card px-3 py-1 text-sm font-bold hover:border-primary">
                  
                        <Volume2 className="size-3" /> {kw}
                      </button>
                )}
                  </div>
                </div>
            }

              {STEPS[stepIdx].key === "compare" &&
            <div>
                  <div className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground"><T>中国 VS 西方</T></div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-3 text-center dark:border-rose-800 dark:bg-rose-950/30">
                      <div className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400"><T>🇨🇳 中国</T></div>
                      <div className="mt-2 text-4xl">{openCard.cn_compare?.emoji}</div>
                      <div className="mt-1 text-sm font-extrabold">{openCard.cn_compare?.label}</div>
                      <p className="mt-1 text-[11px] leading-snug text-rose-900 dark:text-rose-200">{openCard.cn_compare?.desc}</p>
                    </div>
                    <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 text-center dark:border-sky-800 dark:bg-sky-950/30">
                      <div className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400"><T>🌍 西方</T></div>
                      <div className="mt-2 text-4xl">{openCard.emoji}</div>
                      <div className="mt-1 text-sm font-extrabold">{openCard.title_cn}</div>
                      <p className="mt-1 text-[11px] leading-snug text-sky-900 dark:text-sky-200">{openCard.desc_cn}</p>
                    </div>
                  </div>
                  <p className="mt-3 rounded-xl bg-amber-50 p-2 text-center text-[11px] font-bold text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    <T>💡 不同文化都很棒，让我们互相了解！</T>
                  </p>
                </div>
            }

              {STEPS[stepIdx].key === "play" &&
            <div>
                  <p className="text-center text-sm font-bold"><T>哪一个是</T> <span className="text-primary">{openCard.title_en}</span>？</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {quizOptions.map((opt) => {
                  const isRight = opt.id === openCard.id;
                  const picked = quizPicked === opt.id;
                  return (
                    <button
                      key={opt.id}
                      disabled={!!quizPicked}
                      onClick={() => setQuizPicked(opt.id)}
                      className={`rounded-2xl border-2 p-3 text-center transition ${
                      picked && isRight ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" :
                      picked && !isRight ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30" :
                      quizPicked && isRight ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" :
                      "border-border bg-card hover:border-primary"}`
                      }>
                      
                          <div className="text-3xl">{opt.emoji}</div>
                          <div className="mt-1 text-[10px] font-bold">{opt.title_cn}</div>
                        </button>);

                })}
                  </div>
                  {quizPicked &&
              <div className={`mt-3 rounded-xl p-2 text-center text-xs font-bold ${
              quizPicked === openCard.id ?
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" :
              "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"}`
              }>
                      {quizPicked === openCard.id ? "🎉 答对啦！太棒了！" : "再想想看～正确答案已高亮 💡"}
                    </div>
              }
                </div>
            }

              {STEPS[stepIdx].key === "say" &&
            <div className="text-center">
                  <p className="text-xs text-muted-foreground"><T>大声跟读这一句：</T></p>
                  <div className="mt-3 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-base font-extrabold text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
                    "{openCard.sentence_en || openCard.title_en}"
                  </div>
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                  onClick={() => speak(openCard.sentence_en || openCard.title_en, 0.7)}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-violet-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-md hover:scale-105">
                  
                      <Volume2 className="size-4" /> <T>听示范</T>
                    </button>
                    <button
                  onClick={() => setSaidIt(true)}
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-extrabold shadow-md transition hover:scale-105 ${
                  saidIt ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`
                  }>
                  
                      <Mic className="size-4" /> {saidIt ? "✓ 我说啦" : "我跟读啦"}
                    </button>
                  </div>
                  {saidIt &&
              <p className="mt-3 text-xs font-bold text-emerald-600"><T>🌟 太棒啦！点下方完成盖章吧</T></p>
              }
                </div>
            }

              {/* 盖章动效 */}
              {justStamped &&
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                  <div className="animate-[ping_2s_ease-out] rounded-full bg-amber-400/30 p-12">
                    <div className="grid size-24 place-items-center rounded-full border-4 border-amber-500 bg-amber-100 text-4xl shadow-2xl">
                      📔
                    </div>
                  </div>
                  <div className="absolute mt-32 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-extrabold text-white shadow-lg">
                    <Sparkles className="mr-1 inline size-3.5" /> <T>集得一枚新印章！</T>
                  </div>
                </div>
            }
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center gap-2 border-t bg-muted/30 p-4">
              <button
              onClick={() => setOpenCard(null)}
              className="rounded-2xl border-2 border-border bg-card px-4 py-2.5 text-sm font-bold hover:bg-muted">
                <T>关闭</T>
              
            </button>
              {stamps[openCard.id] &&
            <button
              onClick={async () => {
                const url = await buildShareCard(openCard, stampedCount, total);
                setShareUrl(url);
              }}
              className="inline-flex items-center gap-1 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2.5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
              title="生成家长分享卡">
              
                  <Share2 className="size-3.5" /> <T>分享</T>
                </button>
            }
              {stepIdx < STEPS.length - 1 ?
            <button
              onClick={nextStep}
              className="flex-1 rounded-2xl bg-primary py-2.5 text-sm font-extrabold text-primary-foreground hover:bg-primary/90">
                  <T>下一步 →</T>
                
            </button> :

            <button
              onClick={() => {
                if (!stamps[openCard.id]) nextStep();else
                setOpenCard(null);
              }}
              className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-2.5 text-sm font-extrabold text-white shadow-md hover:scale-[1.02]">
              
                  {stamps[openCard.id] ? "已收藏 · 知道啦 ✨" : "🎯 完成 · 盖章！"}
                </button>
            }
            </div>
          </div>
        </div>
      }

      {/* 家长分享卡预览 */}
      {shareUrl &&
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShareUrl(null)}>
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-card p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 text-center text-sm font-extrabold"><T>📨 分享给爸爸妈妈</T></div>
            <img src={shareUrl} alt="分享卡" className="w-full rounded-2xl border-2 border-amber-200 shadow-md" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
              href={shareUrl}
              download={`culture-passport-${Date.now()}.png`}
              className="inline-flex items-center justify-center gap-1 rounded-2xl bg-primary py-2.5 text-sm font-extrabold text-primary-foreground hover:bg-primary/90">
              
                <Download className="size-4" /> <T>保存图片</T>
              </a>
              <button
              onClick={() => setShareUrl(null)}
              className="rounded-2xl border-2 border-border bg-card py-2.5 text-sm font-bold hover:bg-muted">
                <T>关闭</T>
              
            </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground"><T>长按图片可保存或转发到微信</T></p>
          </div>
        </div>
      }
    </main>);

}