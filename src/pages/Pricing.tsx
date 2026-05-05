import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { trackFunnel } from "@/lib/funnel";
import BackLink from "@/components/BackLink";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import wechatQr from "@/assets/wechat-pay-qr.png";

const PLANS = [
  {
    id: "free",
    name: "免费",
    price: "¥0",
    period: "永久",
    cta: "继续免费使用",
    features: ["每日 5 题", "基础语法讲解", "进度同步"],
    highlight: false,
    priceId: null as string | null,
  },
  {
    id: "monthly",
    name: "月付",
    price: "¥39",
    period: "/月",
    cta: "选择月付",
    features: ["不限题量", "AI 小月一对一", "全部错题本 + 间隔复习", "随时取消"],
    highlight: false,
    priceId: "pro_monthly",
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
    priceId: "pro_yearly",
  },
];

export default function Pricing() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const fromTrigger = params.get("from") || "direct";
  const [checkout, setCheckout] = useState<{ priceId: string; userId?: string; email?: string } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    trackFunnel("pricing_view", "page_view", { from: fromTrigger }).catch(() => {});
    document.title = "升级 Pro · Big Moon English";
  }, [fromTrigger]);

  const onChoose = async (planId: string) => {
    if (planId === "free") {
      navigate("/");
      return;
    }
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan?.priceId) return;
    setLoadingPlan(planId);
    trackFunnel("pricing_select_plan", planId, { from: fromTrigger }).catch(() => {});

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // 未登录 → 去登录，登录后回到 pricing
      navigate(`/auth?redirect=${encodeURIComponent(`/pricing?plan=${planId}&from=${fromTrigger}`)}`);
      return;
    }
    setCheckout({ priceId: plan.priceId, userId: user.id, email: user.email });
    setLoadingPlan(null);
  };

  return (
    <>
    <PaymentTestModeBanner />
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

      {checkout ? (
        <section className="rounded-3xl border bg-card p-3 shadow-card">
          <button
            onClick={() => setCheckout(null)}
            className="mb-2 inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            ← 重新选择档位
          </button>
          <StripeEmbeddedCheckout
            priceId={checkout.priceId}
            userId={checkout.userId}
            customerEmail={checkout.email}
            returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
          />
        </section>
      ) : (
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
              disabled={loadingPlan === p.id}
              className="w-full"
            >
              {loadingPlan === p.id ? "准备中…" : p.cta}
            </Button>
          </article>
        ))}
      </section>
      )}

      <section className="mx-auto mt-10 max-w-md rounded-3xl border-2 border-emerald-500/40 bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
        <h2 className="mb-1 text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
          🇨🇳 国内用户：微信支付
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          扫码付款后，请截图发给客服开通 Pro（月付 ¥39 / 年付 ¥299）
        </p>
        <img
          src={wechatQr}
          alt="微信支付收款码"
          className="mx-auto w-64 rounded-2xl shadow-md"
        />
      </section>

      <p className="mx-auto mt-8 max-w-md text-center text-xs text-muted-foreground">
        支付通道：信用卡 / Apple Pay · 7 天无理由退款。
        付费后立即解锁所有 Pro 权益。
      </p>
    </main>
    </>
  );
}