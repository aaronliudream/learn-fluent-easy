/**
 * 最难的词 top3 / 周报横幅 / 分享卡。(里程碑 confetti 已于 2026-08-09 整套删除)
 *
 * 数据源全部是已建的 vocab_user_stats + vocab_study_days + vocab_mistake_book,
 * 不新建表、不新增口径 —— 连续天数一律用 stats.ts 的 computeStreak。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Flame, Share2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTA_SHADOW, FONT_STAT, GRAD_CTA } from "@/lib/vocab/theme";
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

/* ⚰️ 里程碑整套已删(Aaron 2026-08-09):`useMilestoneCelebration`、`Confetti`、
 * `MilestoneSummary`、`MilestoneStrip`、`MILESTONE_SEEN` 键、以及 theme.ts 的 `MILESTONES` 常量。
 * 词汇板块不再有"成就/徽章"这一层;打卡月历与我的数据四宫格保留 —— 那是数据不是成就。
 * ⚠️ 这里删掉的 `Confetti` 是**词汇板块自己那份**;
 *    全站其它板块用的是 `lib/feedback` 的 `fireEmojiConfetti`,与本次无关,别一起动。 */

export function ShareCard({ data, onClose }: {
  data: { mastered: number; streak: number; points: number; totalMs: number };
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

    // 胶囊:连续天数
    const pills: string[] = [];
    if (data.streak > 0) pills.push(`🔥 连续 ${data.streak} 天`);
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

