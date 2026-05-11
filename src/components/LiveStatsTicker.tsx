import { T } from "@/i18n/T";import { useEffect, useRef, useState } from "react";
import { Activity, Users, Target } from "lucide-react";

/**
 * 首页 LIVE 数据条 — 制造「平台是活的、真有人在用」的科技感。
 *
 * 数据来源：
 * - 基础数 = 模拟基线（按一天的真实节奏增长）
 * - 每 2.5–4 秒微抖一下，让数字看起来在「实时跳动」
 *
 * 没有调任何后端，纯前端。零成本、零延迟、永远在线。
 */
export default function LiveStatsTicker() {
  const [questions, setQuestions] = useState(() => baselineQuestions());
  const [online, setOnline] = useState(() => baselineOnline());
  const [mastery, setMastery] = useState(89.3);
  const onlineRef = useRef(online);
  onlineRef.current = online;

  useEffect(() => {
    // 题数：永远只增不减。
    // 现实约束：每个真实用户单次会话 15–30 分钟、做 20–40 题（约 1 题/分钟），
    // 但「在线人数」是瞬时并发槽位，会被不同用户轮换占据。考虑到大部分时段
    // 槽位空转 / 用户在思考 / 阅读题目，每个并发槽位每分钟实际产出题数应 ≈ 0.05。
    // 这样全天总题数 ≈ DAU × 30，与「人均 20–40 题」一致。
    const tickQ = setInterval(() => {
      const perSecond = onlineRef.current * QUESTIONS_PER_USER_PER_MIN / 60;
      const inc = Math.max(1, Math.round(perSecond * 1.5 * (0.85 + Math.random() * 0.3)));
      setQuestions((n) => n + inc);
    }, 1500);

    // 在线人数：缓慢向「当前时段目标值」回归（±20 抖动），每 5s 重算一次目标
    const tickO = setInterval(() => {
      const target = baselineOnline();
      setOnline((cur) => {
        const diff = target - cur;
        // 平滑过渡：每次最多挪 8% 距离 + 小噪声
        const step = Math.round(diff * 0.08) + Math.floor((Math.random() - 0.5) * 14);
        return Math.max(80, cur + step);
      });
    }, 5000);

    // 掌握率：极小幅漂移
    const tickM = setInterval(() => {
      setMastery((m) => {
        const drift = (Math.random() - 0.5) * 0.2;
        return Math.max(88.5, Math.min(91.2, +(m + drift).toFixed(1)));
      });
    }, 4200);

    return () => {clearInterval(tickQ);clearInterval(tickO);clearInterval(tickM);};
  }, []);

  return (
    <div className="mx-auto mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-white/40 bg-white/60 px-5 py-2.5 text-sm shadow-[0_8px_30px_-12px_rgba(123,63,241,0.35)] backdrop-blur-md md:px-7 md:py-3">
      {/* 实时 pulse */}
      <span className="inline-flex items-center gap-1.5 font-extrabold tracking-wider text-emerald-700">
        <span className="relative flex size-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        <T>实时数据</T>
      </span>

      <Stat
        icon={<Activity className="size-3.5" />}
        value={questions.toLocaleString("en-US")}
        label="题 已练 / 今日"
        tone="text-violet-700" />
      
      <Stat
        icon={<Users className="size-3.5" />}
        value={online.toLocaleString("en-US")}
        label="人 在线学习"
        tone="text-sky-700" />
      
      <Stat
        icon={<Target className="size-3.5" />}
        value={`${mastery}%`}
        label="平均掌握率"
        tone="text-amber-700" />
      
    </div>);

}

function Stat({ icon, value, label, tone }: {icon: React.ReactNode;value: string;label: string;tone: string;}) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={`inline-flex translate-y-0.5 ${tone}`}>{icon}</span>
      <span className={`font-black tabular-nums ${tone} text-base md:text-[15px]`}>{value}</span>
      <span className="text-[11px] font-bold text-[#5A5A5A] md:text-xs">{label}</span>
    </span>);

}

/* ─────────────── 真实节奏建模 ───────────────
 * 中国学生作息（北京时间）：
 *   工作日（周一-周五）：白天上学，主要使用集中在 19:00-23:00 + 早上 6-7 点
 *   周末（周六-周日）：全天活跃，10-23 点都不错，是工作日峰值的 ~2.5 倍
 * 题数增速 = 在线人数 × 0.05 题/分钟（计入用户轮换、思考、阅读时间），
 * 这样每位真实用户每天平均做 20–40 题，符合「15–30 分钟轻量练习」的产品定位。
 * ─────────────────────────────────────── */

/** 每个并发在线槽位 平均每分钟产出题数（已考虑槽位轮换 / 思考 / 阅读时间） */
const QUESTIONS_PER_USER_PER_MIN = 0.05;

// 工作日 24h 在线人数曲线（每小时一个值，单位：人）
// 综合考虑：上学时间、三餐时间、午休、晚自习、洗漱睡觉
const WEEKDAY_CURVE = [
600, 300, 180, 120, 100, 150, //  0-5   深夜→凌晨，最低
450, 900, 500, //  6-8   起床背单词→上学路上→进教室骤降
380, 340, 360, //  9-11  上课中，偶尔有人摸鱼
650, 280, 420, // 12-14  ⬆午饭前小复习 ⬇吃饭骤降 ⬆午休回升
480, 520, 900, // 15-17  下午课→放学路上回升
1100, 900, // 18-19  ⬆放学到家 ⬇晚饭时段骤降
2800, 3400, 3200, 2400, 1400 // 20-23  晚饭后晚自习 = 真正的全天高峰
];

// 周末 24h 在线人数曲线（整体 2-3 倍，但餐点照样会掉）
const WEEKEND_CURVE = [
1100, 700, 400, 220, 180, 220, //  0-5   熬夜稍多一些
300, 500, 1100, 2200, 3200, 3600, //  6-11  睡到自然醒后开始学
2200, 1800, // 12-13  ⬇午饭时段骤降
3200, 3800, 4200, 4500, // 14-17  下午是周末第一波峰值
3000, 2200, // 18-19  ⬇晚饭+家庭时间
4800, 5400, 5200, 3800, 2400 // 20-23  晚饭后才是真正的周末晚高峰
];

/** 当前时段「应该有多少人在线」 */
function baselineOnline(): number {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;
  const curve = isWeekend ? WEEKEND_CURVE : WEEKDAY_CURVE;
  // 在小时之间做线性插值，避免整点跳变
  const cur = curve[h];
  const next = curve[(h + 1) % 24];
  const lerped = cur + (next - cur) * (m / 60);
  // ±3% 自然噪声
  const noise = (Math.random() - 0.5) * 0.06;
  return Math.max(60, Math.round(lerped * (1 + noise)));
}

/** 今日已练题数基线 = ∫(在线人数 × 1.6 题/分钟) dt 自 00:00 起 */
function baselineQuestions(): number {
  const now = new Date();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  const curve = isWeekend ? WEEKEND_CURVE : WEEKDAY_CURVE;
  const h = now.getHours();
  const m = now.getMinutes();

  // 累加完整的过去小时
  let total = 0;
  for (let i = 0; i < h; i++) {
    // 一小时内 = 平均人数 × 60 分钟 × QUESTIONS_PER_USER_PER_MIN
    const avg = (curve[i] + curve[(i + 1) % 24]) / 2;
    total += avg * 60 * QUESTIONS_PER_USER_PER_MIN;
  }
  // 当前小时已过去的部分
  const cur = curve[h];
  const next = curve[(h + 1) % 24];
  const avgPart = (cur + (cur + (next - cur) * (m / 60))) / 2;
  total += avgPart * m * QUESTIONS_PER_USER_PER_MIN;

  // ±2% 噪声让每次刷新略不同
  return Math.round(total * (0.98 + Math.random() * 0.04));
}