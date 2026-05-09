import { useEffect, useState } from "react";
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
  // 初始基线：用「自零点起经过的秒数」算出今日累计，刷新页面也保持一致
  const [questions, setQuestions] = useState(() => baselineQuestions());
  const [online, setOnline] = useState(() => baselineOnline());
  const [mastery, setMastery] = useState(89.3);

  useEffect(() => {
    const tickQ = setInterval(() => {
      setQuestions((n) => n + Math.floor(Math.random() * 7) + 1);
    }, 2200);
    const tickO = setInterval(() => {
      setOnline((n) => Math.max(2400, n + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 9) + 1)));
    }, 3500);
    const tickM = setInterval(() => {
      setMastery((m) => {
        const drift = (Math.random() - 0.5) * 0.2;
        return Math.max(88.5, Math.min(91.2, +(m + drift).toFixed(1)));
      });
    }, 4200);
    return () => { clearInterval(tickQ); clearInterval(tickO); clearInterval(tickM); };
  }, []);

  return (
    <div className="mx-auto mt-6 inline-flex max-w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full border border-white/40 bg-white/60 px-5 py-2.5 text-sm shadow-[0_8px_30px_-12px_rgba(123,63,241,0.35)] backdrop-blur-md md:px-7 md:py-3">
      {/* LIVE pulse */}
      <span className="inline-flex items-center gap-1.5 font-extrabold tracking-wider text-emerald-700">
        <span className="relative flex size-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        LIVE
      </span>

      <Stat
        icon={<Activity className="size-3.5" />}
        value={questions.toLocaleString("en-US")}
        label="题 已练 / 今日"
        tone="text-violet-700"
      />
      <Stat
        icon={<Users className="size-3.5" />}
        value={online.toLocaleString("en-US")}
        label="人 在线学习"
        tone="text-sky-700"
      />
      <Stat
        icon={<Target className="size-3.5" />}
        value={`${mastery}%`}
        label="平均掌握率"
        tone="text-amber-700"
      />
    </div>
  );
}

function Stat({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={`inline-flex translate-y-0.5 ${tone}`}>{icon}</span>
      <span className={`font-black tabular-nums ${tone} text-base md:text-[15px]`}>{value}</span>
      <span className="text-[11px] font-bold text-[#5A5A5A] md:text-xs">{label}</span>
    </span>
  );
}

/** 让今日数随时间自然增长（00:00 起 ~12k/日） */
function baselineQuestions(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const elapsedSec = Math.max(0, (now.getTime() - start) / 1000);
  const dayProgress = elapsedSec / 86400; // 0 → 1
  // 一天目标 ~12,500，加 ±300 噪声
  return Math.floor(12500 * dayProgress + 600 + Math.random() * 200);
}

/** 在线人数：白天高、夜间低，固定基线 */
function baselineOnline(): number {
  const h = new Date().getHours();
  // 工作/学习高峰：14-22 点，深夜低谷
  const dayCurve = [
    1800, 1500, 1300, 1200, 1200, 1300, // 0-5
    1600, 2100, 2600, 2900, 3000, 3100, // 6-11
    3200, 3300, 3500, 3700, 3800, 3700, // 12-17
    3600, 3500, 3400, 3300, 3000, 2400, // 18-23
  ];
  return dayCurve[h] + Math.floor(Math.random() * 80) - 40;
}