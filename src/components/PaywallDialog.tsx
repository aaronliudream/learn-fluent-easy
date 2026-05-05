import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Check, X } from "lucide-react";
import { trackFunnel } from "@/lib/funnel";

type Props = {
  open: boolean;
  onClose: () => void;
  trigger: "daily_quota_exhausted" | "first_wrong" | "manual";
  used?: number;
  limit?: number;
};

/**
 * 付费墙弹窗 — 文档 Part 2 转化触发点 #1：每日 5 题用完。
 * 文案紧扣"延迟满足 + 真实学习"：不是"再做一题"，而是"今晚陪你练到会"。
 */
export default function PaywallDialog({ open, onClose, trigger, used = 5, limit = 5 }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) trackFunnel("paywall_view", trigger, { used, limit }).catch(() => {});
  }, [open, trigger, used, limit]);

  if (!open) return null;

  const handleUpgrade = (plan: "monthly" | "yearly") => {
    trackFunnel("paywall_click_upgrade", trigger, { plan }).catch(() => {});
    navigate(`/pricing?plan=${plan}&from=${trigger}`);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted"
          aria-label="关闭"
        >
          <X className="size-4" />
        </button>

        {/* 顶部插画区 */}
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 pb-3 pt-7 text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Sparkles className="size-7" />
          </div>
          <h2 className="text-xl font-extrabold leading-tight">
            今天的免费 5 题练完啦 🌙
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            想现在继续？升级 Pro，今晚陪你练到会。
          </p>
        </div>

        {/* 价值点 */}
        <ul className="space-y-2 px-6 py-4 text-sm">
          {[
            "✅ 每日不限题，一次练个够",
            "✅ AI 小月一对一讲解，每个错题不放过",
            "✅ 错题本 + 间隔复习，永久记忆",
            "✅ 高考 / 中考真题库 + 听说读写四项",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-foreground/90">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <span>{t.replace("✅ ", "")}</span>
            </li>
          ))}
        </ul>

        {/* 价格档位 */}
        <div className="grid grid-cols-2 gap-2.5 px-6 pb-3">
          <button
            onClick={() => handleUpgrade("monthly")}
            className="rounded-2xl border-2 border-border bg-background p-3.5 text-left transition hover:border-primary/40"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">月付</div>
            <div className="mt-0.5 text-2xl font-extrabold tabular-nums">¥39<span className="text-xs font-normal text-muted-foreground">/月</span></div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">随时取消</div>
          </button>
          <button
            onClick={() => handleUpgrade("yearly")}
            className="relative rounded-2xl border-2 border-primary bg-primary/5 p-3.5 text-left transition hover:bg-primary/10"
          >
            <span className="absolute -top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground">
              省 36%
            </span>
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">年付</div>
            <div className="mt-0.5 text-2xl font-extrabold tabular-nums">¥299<span className="text-xs font-normal text-muted-foreground">/年</span></div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">≈ ¥0.82/天</div>
          </button>
        </div>

        {/* 次要按钮 */}
        <div className="flex items-center justify-between gap-3 px-6 pb-6 pt-2 text-xs">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            明天再来 →
          </button>
          <span className="text-muted-foreground">
            北京时间 0:00 重置 · 已用 {used}/{limit}
          </span>
        </div>
      </div>
    </div>
  );
}