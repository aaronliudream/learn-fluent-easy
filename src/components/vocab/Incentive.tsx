/**
 * PR-6 剩余四件:最难的词 top3 / 周报横幅 / 里程碑 confetti / 分享卡。
 *
 * 数据源全部是已建的 vocab_user_stats + vocab_study_days + vocab_mistake_book,
 * 不新建表、不新增口径 —— 连续天数一律用 stats.ts 的 computeStreak。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Flame, Share2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_SHADOW, FONT_STAT, GRAD_CTA, MILESTONES } from "@/lib/vocab/theme";
import {
  bjToday, shiftDay, listStudyDays, getStats, computeStreak, fmtDuration,
  type StudyDay, type UserStats,
} from "@/lib/vocab/stats";
import { listMistakes, type MistakeRow } from "@/lib/vocab/data";

/* ───────────────── 最难的词 top3 ───────────────── */

/**
 * 错次最多的前 3 词,滚动展示。
 * ⚠️ 文案是"和 environment 大战了 4 回合"这种 —— **把错误说成较量,不是缺陷**。
 *    错题本天生带挫败感,展示错得最多的词更是往伤口上撒盐,
 *    唯一能让它变成正向的就是叙事:你在跟这个词较劲,不是你不行。
 */
export function HardestWords({ color }: { color: string }) {
  const [rows, setRows] = useState<MistakeRow[] | null>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    let alive = true;
    listMistakes()
      .then(r => { if (alive) setRows([...r].sort((a, b) => (b.wrong_total ?? 0) - (a.wrong_total ?? 0)).slice(0, 3)); })
      .catch(() => { if (alive) setRows([]); });
    return () => { alive = false; };
  }, []);

  const top = rows ?? [];
  useEffect(() => {
    if (top.length < 2) return;
    const t = window.setInterval(() => setI(n => (n + 1) % top.length), 4000);
    return () => window.clearInterval(t);
  }, [top.length]);

  if (!rows || !top.length) return null;
  const r = top[i];
  return (
    <div className="mt-2 flex items-center gap-2 text-[13px] text-slate-500">
      <Flame className="h-3.5 w-3.5 shrink-0" style={{ color }} />
      <span key={r.word_id} className="truncate">
        和 <b className="font-semibold text-slate-700">{r.headword_snapshot ?? "这个词"}</b> 大战了 {r.wrong_total} 回合
      </span>
    </div>
  );
}

/* ───────────────── 周报横幅 ───────────────── */

const WEEK_DISMISS_KEY = "vocab_weekly_dismissed";

/** 上周一 / 上周日(北京时间日历日)。 */
function lastWeekRange(today: string) {
  const [y, m, d] = today.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();   // 0=周日
  const thisMon = shiftDay(today, -(dow === 0 ? 6 : dow - 1));
  return { from: shiftDay(thisMon, -7), to: shiftDay(thisMon, -1), thisMon };
}

export type WeeklySummary = {
  words: number; minutes: number; streak: number; hardest: string | null; from: string; to: string;
};

/**
 * 周报横幅:每周一展示上周汇总,可关闭(关闭状态按周记,下周还会再来)。
 * ⚠️ 只在**有数据**时出 —— 上周一题没做的人收到"上周学了 0 个词"是打击不是激励。
 */
export function WeeklyBanner({ color, onShare }: { color: string; onShare: (s: WeeklySummary) => void }) {
  const today = bjToday();
  const { from, to, thisMon } = useMemo(() => lastWeekRange(today), [today]);
  const [sum, setSum] = useState<WeeklySummary | null>(null);
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(WEEK_DISMISS_KEY) === thisMon; } catch { return false; }
  });

  useEffect(() => {
    if (hidden) return;
    let alive = true;
    (async () => {
      try {
        const [days, stats, mistakes] = await Promise.all([
          listStudyDays(shiftDay(from, -400), to), getStats(), listMistakes().catch(() => [] as MistakeRow[]),
        ]);
        if (!alive) return;
        const week = days.filter(d => d.day >= from && d.day <= to);
        const words = week.reduce((n, d) => n + (d.answers ?? 0), 0);
        if (!words) { setSum(null); return; }          // 没数据不出横幅
        const hardest = [...mistakes].sort((a, b) => (b.wrong_total ?? 0) - (a.wrong_total ?? 0))[0];
        setSum({
          words,
          minutes: Math.round(week.reduce((n, d) => n + (d.seconds ?? 0), 0) / 60),
          streak: computeStreak(days, stats?.daily_goal ?? 20, to),
          hardest: hardest?.headword_snapshot ?? null,
          from, to,
        });
      } catch { if (alive) setSum(null); }
    })();
    return () => { alive = false; };
  }, [from, to, hidden]);

  if (hidden || !sum) return null;
  return (
    <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: `${color}33`, background: `${color}0D` }}>
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <span className="text-[15px] font-semibold text-slate-900">上周小结</span>
        <button type="button" aria-label="关闭"
          onClick={() => { setHidden(true); try { localStorage.setItem(WEEK_DISMISS_KEY, thisMon); } catch { /* 隐私模式忽略 */ } }}
          className="rounded-full p-0.5 text-slate-400"><X className="h-4 w-4" /></button>
      </div>
      <p className="text-[14px] leading-relaxed text-slate-600">
        学了 <b className="font-semibold text-slate-900">{sum.words}</b> 词 ·
        投入 <b className="font-semibold text-slate-900">{sum.minutes}</b> 分钟
        {sum.streak > 0 && <> · 连续 <b className="font-semibold text-slate-900">{sum.streak}</b> 天</>}
        {sum.hardest && <> · 最难缠的是 <b className="font-semibold text-slate-900">{sum.hardest}</b></>}
      </p>
      <button type="button" onClick={() => onShare(sum)}
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[13px] text-slate-700">
        <Share2 className="h-3.5 w-3.5" />生成分享卡
      </button>
    </div>
  );
}

/* ───────────────── 里程碑 confetti ───────────────── */

const MILESTONE_SEEN = "vocab_milestone_seen";

/**
 * 里程碑跨线时撒彩带 —— **只在跨线那一刻**,不是每次达到都撒。
 * ⚠️ 用 localStorage 记已庆祝过的档位:刷新页面不该重放,
 *    否则"仪式感"变成"又来了"。
 * ⚠️ 打卡达标只做轻量祝贺(不撒彩带),彩带只留给里程碑 —— Aaron 定的分级。
 */
export function useMilestoneCelebration(mastered: number): number | null {
  const [fire, setFire] = useState<number | null>(null);
  useEffect(() => {
    if (!mastered) return;
    const reached = MILESTONES.filter(m => mastered >= m);
    if (!reached.length) return;
    const top = reached[reached.length - 1];
    try {
      const seen = Number(localStorage.getItem(MILESTONE_SEEN) ?? "0");
      if (top > seen) { localStorage.setItem(MILESTONE_SEEN, String(top)); setFire(top); }
    } catch { /* 隐私模式:不庆祝也不报错 */ }
  }, [mastered]);
  return fire;
}

/** 极简彩带:纯 CSS,不引第三方库(包体优先)。prefers-reduced-motion 时不放。 */
export function Confetti({ onDone }: { onDone: () => void }) {
  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    const t = window.setTimeout(onDone, reduced ? 0 : 2200);
    return () => window.clearTimeout(t);
  }, [onDone, reduced]);
  if (reduced) return null;
  const bits = Array.from({ length: 36 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {bits.map(i => (
        <span key={i}
          className="absolute block h-2 w-1.5 rounded-[1px]"
          style={{
            left: `${(i * 37) % 100}%`,
            top: "-12px",
            background: ["#0C447C", "#F59E0B", "#10B981", "#EF4444"][i % 4],
            animation: `vconf 2.2s cubic-bezier(.2,.6,.4,1) ${(i % 9) * 0.08}s forwards`,
          }} />
      ))}
      <style>{`@keyframes vconf{to{transform:translateY(105vh) rotate(${540}deg);opacity:0}}`}</style>
    </div>
  );
}

/* ───────────────── 分享卡 ───────────────── */

/**
 * 分享卡:1080×1440 深海蓝,大数字主角,底部二维码位。
 * ⚠️ 用 canvas 直接画而不是截图 DOM:微信里长按保存要的是**一张真图片**,
 *    html2canvas 那条路在移动端字体和圆角上不稳,且要引一个不小的库。
 * ⚠️ 二维码这一版画的是**占位方块 + 站点文字** —— 生成真二维码要引库,
 *    等 PR-7 落地正式落地页地址后再补,现在画个假二维码是骗人。
 */
export function ShareCard({ data, onClose }: {
  data: { mastered: number; streak: number; points: number; totalMs: number; milestone?: number | null };
  onClose: () => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const W = 1080, H = 1440;
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    if (!g) return;

    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#0C2E52"); grad.addColorStop(1, "#071B31");
    g.fillStyle = grad; g.fillRect(0, 0, W, H);

    g.textAlign = "center";
    g.fillStyle = "rgba(255,255,255,.62)";
    g.font = "600 40px system-ui, -apple-system, sans-serif";
    g.fillText("我的词汇量", W / 2, 300);

    // 大数字主角
    g.fillStyle = "#FFFFFF";
    g.font = "800 240px system-ui, -apple-system, sans-serif";
    g.fillText(String(data.mastered), W / 2, 520);
    g.fillStyle = "rgba(255,255,255,.5)";
    g.font = "500 36px system-ui, -apple-system, sans-serif";
    g.fillText("个单词已掌握", W / 2, 580);

    // 胶囊:连续天数 + 里程碑
    const pills: string[] = [];
    if (data.streak > 0) pills.push(`🔥 连续 ${data.streak} 天`);
    if (data.milestone) pills.push(`🏅 ${data.milestone} 里程碑`);
    if (data.points > 0) pills.push(`⭐ ${data.points} 积分`);
    g.font = "600 34px system-ui, -apple-system, sans-serif";
    let y = 700;
    for (const p of pills) {
      const w = g.measureText(p).width + 64;
      g.fillStyle = "rgba(255,255,255,.12)";
      const x = (W - w) / 2;
      g.beginPath(); g.roundRect(x, y, w, 76, 38); g.fill();
      g.fillStyle = "rgba(255,255,255,.92)";
      g.fillText(p, W / 2, y + 51);
      y += 98;
    }

    g.fillStyle = "rgba(255,255,255,.45)";
    g.font = "500 32px system-ui, -apple-system, sans-serif";
    g.fillText(`累计投入 ${fmtDuration(data.totalMs)}`, W / 2, y + 40);

    // 二维码位:占位方块 + 文字。真二维码等 PR-7 定了落地页再补,不画假的
    g.fillStyle = "rgba(255,255,255,.08)";
    g.beginPath(); g.roundRect(W / 2 - 110, H - 340, 220, 220, 24); g.fill();
    g.fillStyle = "rgba(255,255,255,.35)";
    g.font = "500 28px system-ui, -apple-system, sans-serif";
    g.fillText("扫码一起背", W / 2, H - 90);

    setUrl(c.toDataURL("image/png"));
  }, [data]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-5" onClick={onClose}>
      <div className="w-full max-w-[300px]" onClick={e => e.stopPropagation()}>
        <canvas ref={ref} className="hidden" />
        {url && <img src={url} alt="分享卡" className="w-full rounded-2xl shadow-2xl" />}
        <p className="mt-3 text-center text-[13px] text-white/70">长按图片保存到相册</p>
        <button onClick={onClose}
          className="mt-3 w-full rounded-2xl bg-white/10 px-5 py-3 text-[15px] text-white">关闭</button>
      </div>
    </div>
  );
}

/**
 * 里程碑**折叠态**:一行「当前档位 + 下一档还差 N 词」,点开才铺全部档位。
 *
 * ⚠️ 由来:六个胶囊 + 一行说明在 iPhone SE 上占掉近 120px,
 *    而首屏必须留给"学习进度 + 错题/复习"。里程碑是**回顾性**信息,
 *    不是每次打开都要看的东西 —— 折叠它换来的首屏空间,值。
 * ⚠️ 信息一个没少:展开后就是原来的 MilestoneStrip。
 */
export function MilestoneSummary({ mastered, color }: { mastered: number; color: string }) {
  const [open, setOpen] = useState(false);
  const reached = MILESTONES.filter(m => mastered >= m);
  const current = reached.length ? reached[reached.length - 1] : null;
  const next = MILESTONES.find(m => m > mastered) ?? null;

  return (
    <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* ⚠️ 摘要单独占一行,不跟标题挤在一行 —— 375px 宽下
          「还没达成第一档 · 距 1600 还差 1600 词」必然被 truncate 砍掉尾巴,
          而被砍掉的恰好是"还差多少"这个唯一有用的数字。 */}
      <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open}
        className="block w-full text-left">
        <span className="flex items-center gap-2">
          <Sparkles className="h-[17px] w-[17px] shrink-0 text-amber-500" />
          <span className="flex-1 text-[15px] font-semibold text-slate-900">里程碑</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-300 transition-transform", open && "rotate-180")} />
        </span>
        <span className="mt-1 block text-[13px] text-slate-500">
          {current
            ? <>已达 <b className="font-semibold text-slate-700" style={{ fontVariantNumeric: "tabular-nums" }}>{current}</b></>
            : <span className="text-slate-400">还没达成第一档</span>}
          {next && <> · 距 {next} 还差 <b className="font-semibold text-slate-700" style={{ fontVariantNumeric: "tabular-nums" }}>{next - mastered}</b> 词</>}
        </span>
      </button>
      {open && <div className="mt-3"><MilestoneStrip mastered={mastered} color={color} /></div>}
    </div>
  );
}

/** 里程碑徽章卡:达成的高亮,**同时显示下一站** —— 只显示已达成会让人觉得到顶了。 */
export function MilestoneStrip({ mastered, color }: { mastered: number; color: string }) {
  const next = MILESTONES.find(m => m > mastered) ?? null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {MILESTONES.map(m => (
        <span key={m}
          className={cn("inline-flex min-w-[64px] items-center justify-center rounded-xl border px-3 py-2 text-[15px] font-bold",
            mastered >= m ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : m === next ? "bg-white" : "border-black/[0.06] bg-slate-50 text-slate-300")}
          style={m === next && mastered < m ? { borderColor: color, color } : undefined}
          aria-label={mastered >= m ? `已达成 ${m}` : m === next ? `下一站 ${m}` : `未达成 ${m}`}>
          {m}
        </span>
      ))}
      {next && (
        <span className="ml-1 inline-flex items-center gap-1 text-[13px] text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />下一站还差 {next - mastered}
        </span>
      )}
    </div>
  );
}

export { GRAD_CTA, CTA_SHADOW, FONT_STAT };
