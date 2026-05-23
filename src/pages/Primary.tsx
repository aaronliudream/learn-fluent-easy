import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StreakBanner } from "@/components/StreakBanner";
import MonthlyPostcard from "@/components/pet/MonthlyPostcard";
import EvolutionTree from "@/components/pet/EvolutionTree";
import { PHONICS_ITEMS } from "@/data/primaryPhonics";
import { SIGHT_WORD_ITEMS } from "@/data/primarySightWords";
import { getPhonicsMasteryMap } from "@/lib/phonicsMastery";
import { getSightWordMasteryMap } from "@/lib/sightWordMastery";
import { getCurrentGrade, getSightWordsPolicy } from "@/lib/sightWordsGradeGate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
"@/components/ui/dialog";
import {
  primaryAdventurePath,
  primaryGradeMapPath,
  primaryReadingEntryPath,
  PRIMARY_LAST_GRADE_KEY,
  writePrimaryGradeToStorage,
} from "@/lib/primaryGrade";

type Grade = {
  id: number;name_cn: string;name_en: string;
  emoji: string | null;gradient: string | null;
};

type Pet = {name: string;level: number;xp: number;bond: number;stars: number;hunger?: number;mood?: number;stage?: number;};

// Spark 的视觉来自 pet_species 表(优先用户激活的宠物;否则回退 fire_fox)。
// 阶段索引按 level 派生:Lv.1=蛋, Lv.2-3=幼年, Lv.4-6=成年, Lv.7+=传说 —— 因为
// pet_state.level 是 Spark 唯一稳定的进化信号(stage 字段目前不会自动推进)。
type SparkEmojis = {egg: string;baby: string;adult: string;legend: string;};
const SPARK_FALLBACK: SparkEmojis = { egg: "🥚", baby: "🦊", adult: "🔥", legend: "☄️" };
function sparkStageFromLevel(level: number): keyof SparkEmojis {
  if (level <= 1) return "egg";
  if (level <= 3) return "baby";
  if (level <= 6) return "adult";
  return "legend";
}
function sparkFace(level: number, emojis: SparkEmojis): string {
  return emojis[sparkStageFromLevel(level)];
}

const FALLBACK_GRADES: Grade[] = [
{ id: 3, name_cn: "三年级", name_en: "Grade 3", emoji: "🦊", gradient: "from-rose-300 via-fuchsia-300 to-violet-300" },
{ id: 4, name_cn: "四年级", name_en: "Grade 4", emoji: "🐼", gradient: "from-violet-300 via-indigo-300 to-blue-300" },
{ id: 5, name_cn: "五年级", name_en: "Grade 5", emoji: "🦁", gradient: "from-blue-300 via-sky-300 to-cyan-300" },
{ id: 6, name_cn: "六年级", name_en: "Grade 6", emoji: "🦉", gradient: "from-cyan-300 via-teal-300 to-emerald-300" }];


// Spark greeting — tries to make Spark feel like it knows the child.
// Pure function over (pet, streak, daysSinceLastVisit, isFirstVisit, isWeekend).
// Order matters: most "personal" signals win.
function pickSparkLine(opts: {
  pet: Pet | null;
  streak: number;
  daysSinceLastVisit: number | null; // null = first ever visit
  isWeekend: boolean;
}): string {
  const { pet, streak, daysSinceLastVisit, isWeekend } = opts;

  // 1. First time ever — warm intro
  if (daysSinceLastVisit == null) {
    return "嗨!我是 Spark,今天我们一起冒险吗?";
  }
  // 2. Long absence (7+ days) — guilt-free, missed-you tone
  if (daysSinceLastVisit >= 7) {
    return "我有点想你了… 你回来啦!";
  }
  // 3. Skipped yesterday — gentle nudge
  if (daysSinceLastVisit >= 2) {
    return "我昨天等你了一整天… 今天有空吗?";
  }
  // 4. About to level up — concrete next-step framing
  if (pet && pet.bond >= 90) {
    return "我快升级啦!再做一件事就行!";
  }
  // 5. Healthy streaks
  if (streak >= 7) return `我们已经一起冒险 ${streak} 天啦,继续吗?`;
  if (streak >= 3) return `连续 ${streak} 天啦,我每天都在等你 ✨`;
  // 6. Weekend variant
  if (isWeekend) return "今天也要陪我吗?周末也别忘了我哦~";
  // 7. Hunger fallback (pet exists but neglected today)
  if (pet && (pet.hunger ?? 50) < 25) return "我有点饿啦,陪我学一会儿好吗?";
  // 8. Level milestones
  if (pet && pet.level >= 5) return "我变强好多!这都是你的功劳~";
  // 9. Same-day return
  if (daysSinceLastVisit === 0) return "你又回来啦!我们再做一件事?";
  // 10. Default
  return "今天也要一起冒险吗?";
}

const LAST_VISIT_KEY = "primary:lastVisitDate";
function readLastVisit(): string | null {
  try {return localStorage.getItem(LAST_VISIT_KEY);} catch {return null;}
}
function writeLastVisit() {
  try {localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString().slice(0, 10));} catch {/* noop */}
}
function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / (24 * 3600 * 1000));
}

export default function Primary() {
  const nav = useNavigate();
  const [grades, setGrades] = useState<Grade[]>(FALLBACK_GRADES);
  const [pet, setPet] = useState<Pet | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [recommendedGrade, setRecommendedGrade] = useState<number | null>(null);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [sparkEmojis, setSparkEmojis] = useState<SparkEmojis>(SPARK_FALLBACK);
  const [grade, setGrade] = useState<number | null>(() => {
    const saved = localStorage.getItem(PRIMARY_LAST_GRADE_KEY);
    return saved ? Number(saved) : null;
  });
  // Stable across the render — captured once when the page mounts so the
  // greeting doesn't change mid-session after we mark today as visited.
  const [visitContext] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const last = readLastVisit();
    return {
      daysSinceLastVisit: last ? Math.max(0, daysBetween(last, today)) : null,
      isWeekend: [0, 6].includes(new Date().getDay())
    };
  });

  useEffect(() => {
    (async () => {
      // SEO: title + meta description
      document.title = "小学英语 G3-G6 · 教材同步 · 词汇 · 听说读写 | FluentPath";
      const desc = "3-6年级英语教材同步(人教/外研社)：核心词汇、听力对话、阅读闯关、AI口语陪练，每天10分钟。";
      let m = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!m) {m = document.createElement("meta");m.name = "description";document.head.appendChild(m);}
      m.content = desc;

      const { data } = await supabase.from("primary_grades").select("*").order("sort_order");
      // 3 年级才正式开始小学英语，过滤掉历史遗留的一/二年级行。
      if (data && data.length) setGrades((data as Grade[]).filter((g) => g.id >= 3));
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;
      setUid(userId);
      if (userId) {
        const { data: p } = await supabase.from("pet_state").select("*").eq("user_id", userId).maybeSingle();
        if (p) setPet(p as Pet);else
        {
          const { data: created } = await supabase.from("pet_state").insert({ user_id: userId }).select().maybeSingle();
          if (created) setPet(created as Pet);
        }
        // 找用户当前激活的宠物 → 拿对应物种的四阶段 emoji。
        // 没有激活宠物时回退到 fire_fox(Spark 的默认形象)。
        const { data: activePet } = await supabase.
        from("user_pets").
        select("species_id").
        eq("user_id", userId).
        eq("is_active", true).
        maybeSingle();
        const speciesId = activePet?.species_id ?? "fire_fox";
        const { data: sp } = await supabase.
        from("pet_species").
        select("emoji_egg,emoji_baby,emoji_adult,emoji_legend").
        eq("id", speciesId).
        maybeSingle();
        if (sp) {
          setSparkEmojis({
            egg: sp.emoji_egg ?? SPARK_FALLBACK.egg,
            baby: sp.emoji_baby ?? SPARK_FALLBACK.baby,
            adult: sp.emoji_adult ?? SPARK_FALLBACK.adult,
            legend: sp.emoji_legend ?? SPARK_FALLBACK.legend
          });
        }
        // Pull parent-set recommended grade — drives the "推荐" tag in the
        // switch dialog and seeds the default grade for first-time visitors.
        const { data: prof } = await supabase.
        from("profiles").
        select("recommended_grade").
        eq("user_id", userId).
        maybeSingle();
        const rg = (prof as any)?.recommended_grade ?? null;
        if (rg) {
          setRecommendedGrade(rg);
          if (!localStorage.getItem(PRIMARY_LAST_GRADE_KEY)) {
            setGrade(rg);
            writePrimaryGradeToStorage(rg);
          }
        }
      }
      // Record this visit *after* we've captured visitContext above.
      writeLastVisit();
    })();
  }, []);

  function pickGrade(id: number) {
    setGrade(id);
    writePrimaryGradeToStorage(id);
    setSwitchOpen(false);
  }

  function goAdventure() {
    if (grade == null) return;
    writePrimaryGradeToStorage(grade);
    nav(primaryAdventurePath(grade));
  }

  // First-time visitor → inline grade picker, then immediately show CTA.
  const needsGrade = grade == null;
  const sparkLine = pickSparkLine({
    pet,
    streak,
    daysSinceLastVisit: visitContext.daysSinceLastVisit,
    isWeekend: visitContext.isWeekend
  });
  const currentGradeName = grades.find((g) => g.id === grade)?.name_cn ?? "";

  // Visualize bond as 10 hearts so kids read it instantly.
  const bondNow = Math.max(0, Math.min(100, pet?.bond ?? 0));
  const bondHearts = Math.round(bondNow / 10);
  const bondToLevel = Math.max(0, 100 - bondNow);
  const sparkEmoji = sparkFace(pet?.level ?? 1, sparkEmojis);

  return (
    <main className="mx-auto min-h-screen max-w-2xl md:max-w-3xl px-5 py-6">
      <BackLink to="/#courses" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回学习阶段</T>
      </BackLink>

      {/* === Phase 1: Spark 主屏 === 单一中心 = Spark + 一句话 + 一个 CTA === */}
      {needsGrade ?
      <section className="mt-6 rounded-3xl border-2 border-border bg-card p-6 md:p-8 text-center shadow-tile">
          {/* P0 — Spark shows up. Big face + small wave so the first impression is a *who*, not a punctuation mark. */}
          <div className="relative mx-auto grid size-24 md:size-32 place-items-center rounded-full bg-gradient-to-br from-pink-200 via-rose-200 to-amber-200 text-6xl md:text-7xl shadow-md">
            {sparkEmoji}
            <span className="absolute -right-1 -top-1 grid size-9 md:size-11 place-items-center rounded-full bg-white text-2xl md:text-3xl shadow-sm">👋</span>
          </div>
          <h1 className="mt-3 md:mt-4 text-xl md:text-2xl font-extrabold"><T>嗨!我是 Spark,想认识你!</T></h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground"><T>先告诉我你在几年级,我会按你的进度陪你学。</T></p>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {grades.map((g) => {
            // P1 — gentle "推荐" tag. Uses parent-set grade if any, otherwise
            // the national-curriculum default (G3, when English officially starts).
            const recId = recommendedGrade ?? 3;
            const isRecommended = g.id === recId;
            return (
              <button
                key={g.id}
                onClick={() => pickGrade(g.id)}
                className={`relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br ${g.gradient ?? "from-slate-200 to-slate-300"} p-3 text-left shadow-tile transition hover:-translate-y-0.5`}>

                  <div className="text-3xl md:text-4xl">{g.emoji}</div>
                  {isRecommended &&
                <span className="absolute right-1.5 top-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-600 shadow-sm">
                      <T>⭐ 推荐</T>
                    </span>
                }
                  <div className="absolute inset-x-3 bottom-3">
                    <div className="text-sm font-extrabold text-white drop-shadow"><T>{g.name_cn}</T></div>
                    <div className="text-[10px] font-bold text-white/90 drop-shadow">
                      <T>教材同步 · 词汇·听·读·说</T>
                    </div>
                  </div>
                </button>);

          })}
          </div>
          {/* P1 — lower decision pressure: tell parents/kids switching is easy. */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <T>✨ 选错了也没关系,Spark 随时陪你换 →</T>
          </p>
        </section> :

      <>
          {/* Spark 主屏 — 大头像 + 它说的话 + 唯一 CTA */}
          <section className="mt-4 rounded-3xl bg-gradient-to-br from-pink-200 via-rose-200 to-amber-200 p-6 text-center shadow-tile dark:from-pink-950/40 dark:via-rose-950/40 dark:to-amber-950/40">
            <Link to="/pets" className="inline-block transition hover:scale-105">
              <div className="mx-auto grid size-28 place-items-center rounded-full bg-white/70 text-7xl shadow-md">
                {sparkEmoji}
              </div>
            </Link>
            <div className="mt-4 inline-flex flex-col items-center gap-1 rounded-2xl bg-white/85 px-4 py-2 text-xs font-bold text-rose-700 shadow-sm">
              <div className="flex items-center gap-2">
                <span>Spark · Lv.{pet?.level ?? 1}</span>
                <span className="text-rose-300">·</span>
                <span aria-label={`亲密度 ${bondNow} / 100`} className="tracking-tight">
                  {Array.from({ length: 10 }).map((_, i) =>
                <span key={i}>{i < bondHearts ? "❤️" : "🤍"}</span>
                )}
                </span>
              </div>
              <div className="text-[10px] font-semibold text-rose-500">
                <T>{bondToLevel === 0
                  ? "马上就要升级啦!"
                  : `距离升级还差 ${bondToLevel} ❤️`}</T>
              </div>
            </div>
            <p className="mx-auto mt-3 max-w-md text-lg font-extrabold leading-snug text-rose-900 dark:text-rose-100">
              "<T>{sparkLine}</T>"
            </p>
            <button
            onClick={goAdventure}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 px-8 py-4 text-lg font-extrabold text-white shadow-tile transition hover:-translate-y-0.5 hover:scale-105"
            aria-label="陪 Spark 出发吧">
            
              <Play className="size-5 fill-white" /> <T>陪 Spark 出发吧</T>
            </button>
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center rounded-full bg-rose-100/80 px-3 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
                <T>当前 ·</T> <T>{currentGradeName}</T>
              </span>
            </div>
            <div className="mt-2 flex justify-center">
              <button
              onClick={() => setSwitchOpen(true)}
              className="text-xs text-muted-foreground hover:text-rose-700"
              aria-label="去别的年级陪 Spark 冒险">
                <T>Spark 在别的等级也有冒险 →</T>
              
            </button>
            </div>
          </section>

          {/* 累计掌握 — 让家长一眼看到 Phonics + Sight Words 的整体进度 */}
          <CumulativeMasteryCard />

          {/* Streak 退到次要位置 */}
          {uid && <div className="mt-4"><StreakBanner userId={uid} /></div>}

          {/* Phase 5 — 复活宠物资产 */}
          {pet &&
        <div className="mt-4">
              <EvolutionTree stage={pet.stage ?? 0} level={pet.level ?? 1} nickname={pet.name} />
            </div>
        }
          <div className="mt-4">
            <MonthlyPostcard />
          </div>

          {/* 唯一二级入口 — 周计划 & 进度(给家长) */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            <Link
            to="/parent"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-bold text-muted-foreground transition hover:text-foreground">
              <T>📊 家长后台</T>
            
          </Link>
            <Link
            to={primaryGradeMapPath(grade)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-bold text-muted-foreground transition hover:text-foreground">
            
              <Star className="size-3.5" /> <T>完整学习地图</T>
            </Link>
            <Link
            to={primaryReadingEntryPath(grade)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-bold text-muted-foreground transition hover:text-foreground">
            
              📖 <T>读绘本</T>
            </Link>
          </div>
        </>
      }

      {/* === Grade switcher dialog === Spark 在每个等级都有冒险 === */}
      <Dialog open={switchOpen} onOpenChange={setSwitchOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="text-center text-5xl">{sparkEmoji}</div>
            <DialogTitle className="mt-2 text-center text-lg">
              <T>Spark 在每个等级都有冒险,你想去哪个?</T>
            </DialogTitle>
            <DialogDescription className="text-center">
              <T>所有等级都开放,你可以自由探索。</T>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {grades.map((g) => {
              const isCurrent = g.id === grade;
              const isRecommended = recommendedGrade != null && g.id === recommendedGrade;
              return (
                <button
                  key={g.id}
                  onClick={() => pickGrade(g.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition hover:-translate-y-0.5 ${
                  isCurrent ?
                  "border-rose-400 bg-rose-50 dark:bg-rose-950/30" :
                  "border-border bg-card hover:bg-muted"}`
                  }>

                  <div className="text-3xl">{g.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-extrabold"><T>{g.name_cn}</T></div>
                      <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                        <T>📚 教材同步</T>
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-1.5 text-[10px] font-bold">
                      {isCurrent &&
                      <span className="rounded bg-rose-500 px-1.5 py-0.5 text-white"><T>当前</T></span>
                      }
                      {isRecommended && !isCurrent &&
                      <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-white"><T>推荐</T></span>
                      }
                    </div>
                  </div>
                </button>);

            })}
          </div>
          <p className="mt-1 text-center text-[11px] text-muted-foreground">
            <T>下次进来会回到</T>{recommendedGrade ? "你的推荐等级" : "你上次选的等级"}。
          </p>
        </DialogContent>
      </Dialog>
    </main>);

}

function CumulativeMasteryCard() {
  const [phonics, setPhonics] = useState({ done: 0, total: PHONICS_ITEMS.length });
  const [sw, setSw] = useState({ done: 0, total: SIGHT_WORD_ITEMS.length });
  const swPolicy = getSightWordsPolicy(getCurrentGrade());
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [pm, sm] = await Promise.all([getPhonicsMasteryMap(), getSightWordMasteryMap()]);
      if (cancelled) return;
      setPhonics({
        done: PHONICS_ITEMS.filter((it) => (pm.get(it.id)?.mastery_level ?? 0) >= 2).length,
        total: PHONICS_ITEMS.length
      });
      setSw({
        done: SIGHT_WORD_ITEMS.filter((it) => (sm.get(it.id)?.mastery_level ?? 0) >= 2).length,
        total: SIGHT_WORD_ITEMS.length
      });
    })();
    return () => {cancelled = true;};
  }, []);
  return (
    <section className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground"><T>📊 学到哪儿啦</T></div>
      <div className={`mt-2 grid gap-3 text-sm ${swPolicy.showInMain ? "grid-cols-2" : "grid-cols-1"}`}>
        <Link
          to="/primary/phonics"
          className="flex flex-col items-center rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 p-3 text-center hover:-translate-y-0.5 transition dark:from-rose-950/30 dark:to-amber-950/30">
          
          <div className="font-bold"><T>🔤 字母拼读</T></div>
          <div className="mt-1 font-mono text-lg font-extrabold text-rose-600 dark:text-rose-300">
            {phonics.done}
            <span className="text-xs text-muted-foreground"> / {phonics.total}</span>
          </div>
        </Link>
        {swPolicy.showInMain &&
        <Link
          to="/primary/sight-words"
          className="flex flex-col items-center rounded-xl bg-gradient-to-br from-sky-50 to-emerald-50 p-3 text-center hover:-translate-y-0.5 transition dark:from-sky-950/30 dark:to-emerald-950/30">
          
            <div className="font-bold"><T>📚 常见小词</T></div>
            <div className="mt-1 font-mono text-lg font-extrabold text-sky-600 dark:text-sky-300">
              {sw.done}
              <span className="text-xs text-muted-foreground"> / {sw.total}</span>
            </div>
          </Link>
        }
      </div>
    </section>);

}