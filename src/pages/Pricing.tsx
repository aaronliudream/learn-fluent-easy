import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { trackFunnel } from "@/lib/funnel";
import BackLink from "@/components/BackLink";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "free",
    name: "免费",
    price: "¥0",
    period: "永久",
    cta: "继续免费使用",
    features: ["每日 5 题", "基础语法讲解", "进度同步"],
    highlight: false,
  },
  {
    id: "monthly",
    name: "月付",
    price: "¥39",
    period: "/月",
    cta: "选择月付",
    features: ["不限题量", "AI 小月一对一", "全部错题本 + 间隔复习", "随时取消"],
    highlight: false,
  },
  {
    id: "yearly",
    name: "年付",
    price: "¥299",
    period: "/年",
    sub: "≈ ¥0.82/天 · 省 ¥169",
    cta: "选择年付（推荐）",
    features: ["月付全部权益", "高考 / 中考真题库", "听说读写四项全开", "宠物专属皮肤"],
    highlight: true,
  },
];

export default function Pricing() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fromTrigger = params.get("from") || "direct";
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  useEffect(() => {
    trackFunnel("pricing_view", "page_view", { from: fromTrigger }).catch(() => {});
    document.title = "升级 Pro · Big Moon English";
  }, [fromTrigger]);

  const onChoose = (planId: string) => {
    if (planId === "free") {
      navigate("/");
      return;
    }
    trackFunnel("pricing_select_plan", planId, { from: fromTrigger }).catch(() => {});
    setPendingPlan(planId);
    // TODO（下一迭代）：调用 Stripe / WeChat checkout edge function
    setTimeout(() => setPendingPlan(null), 1500);
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-8 md:py-14">
      <BackLink to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回
      </BackLink>
      <header className="mb-10 text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="size-7" />
        </div>
        <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
          选一个学习节奏
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          三档清晰，随时取消。所有付费用户支持 7 天无理由退款。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <article
            key={p.id}
            className={`relative flex flex-col rounded-3xl border-2 p-6 ${
              p.highlight
                ? "border-primary bg-primary/5 shadow-[0_10px_40px_-10px_hsl(var(--primary)/0.4)]"
                : "border-border bg-card"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold text-primary-foreground">
                最受欢迎
              </span>
            )}
            <div className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {p.name}
            </div>
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tabular-nums">{p.price}</span>
              <span className="text-sm text-muted-foreground">{p.period}</span>
            </div>
            {p.sub && <div className="mb-3 text-xs text-primary font-semibold">{p.sub}</div>}
            <ul className="my-5 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex-1" />
            <Button
              onClick={() => onChoose(p.id)}
              variant={p.highlight ? "default" : "outline"}
              size="lg"
              disabled={pendingPlan === p.id}
              className="w-full"
            >
              {pendingPlan === p.id ? "跳转中…" : p.cta}
            </Button>
          </article>
        ))}
      </section>

      <p className="mx-auto mt-8 max-w-md text-center text-xs text-muted-foreground">
        支付通道：Stripe（信用卡 / Apple Pay）· 微信支付即将上线。
        付费后立即解锁所有 Pro 权益。
      </p>
    </main>
  );
}