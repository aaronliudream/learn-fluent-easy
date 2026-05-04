import { useEffect, useState } from "react";
import { MessageCircle, X, Loader2, Star, Bug, Lightbulb, Heart, FileText } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { T, useT } from "@/i18n/T";

type Category = "bug" | "suggestion" | "praise" | "other";

const CATS: { value: Category; label: string; icon: any; color: string }[] = [
  { value: "bug",        label: "Bug",   icon: Bug,       color: "from-rose-500 to-red-500" },
  { value: "suggestion", label: "建议",  icon: Lightbulb, color: "from-amber-500 to-orange-500" },
  { value: "praise",     label: "表扬",  icon: Heart,     color: "from-pink-500 to-fuchsia-500" },
  { value: "other",      label: "其他",  icon: FileText,  color: "from-slate-500 to-slate-700" },
];

/** Floating feedback widget — bottom-right bubble + dialog.
 *  Submits to the `submit-feedback` edge function which handles moderation,
 *  storage, and email notifications. */
export default function FeedbackWidget() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState<Category>("suggestion");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const schema = z.object({
    category: z.enum(["bug", "suggestion", "praise", "other"]),
    rating: z.number().min(1).max(5).optional().nullable(),
    message: z.string().trim().min(10, t("至少 10 个字")).max(1000, t("最多 1000 字")),
    email: z.string().trim().email(t("邮箱格式不正确")).max(255).optional().or(z.literal("")),
  });

  // Auto-fill email if logged in
  useEffect(() => {
    if (!open) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email && !email) setEmail(data.user.email);
    });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    const parsed = schema.safeParse({
      category,
      rating: rating || undefined,
      message,
      email: email || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t("请检查输入"));
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-feedback", {
        body: {
          ...parsed.data,
          email: parsed.data.email || null,
          page_url: typeof window !== "undefined" ? window.location.href : null,
        },
      });
      if (error) {
        // FunctionsHttpError surfaces the response body in `context`
        const ctx: any = (error as any).context;
        let msg = t("提交失败，请稍后重试");
        try {
          const body = ctx?.body ? JSON.parse(await new Response(ctx.body).text()) : null;
          if (body?.error) msg = body.error;
        } catch { /* ignore */ }
        toast.error(msg);
        return;
      }
      if ((data as any)?.error) {
        toast.error((data as any).error);
        return;
      }
      toast.success(t("反馈已收到，谢谢你 🙏"));
      setOpen(false);
      setMessage(""); setRating(0); setCategory("suggestion");
    } catch (e: any) {
      toast.error(e?.message ?? t("提交失败"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen(true)}
        aria-label={t("反馈")}
        className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_10px_30px_-10px_rgba(91,43,201,0.6)] transition hover:scale-105"
      >
        <MessageCircle className="size-6" />
      </button>

      {/* Dialog */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="relative w-full max-w-md rounded-t-3xl border border-border bg-background p-5 shadow-2xl sm:rounded-3xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              aria-label={t("关闭")}
            >
              <X className="size-4" />
            </button>

            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              FEEDBACK
            </div>
            <h2 className="text-xl font-extrabold"><T>告诉我们你的想法 💬</T></h2>
            <p className="mt-1 text-xs text-muted-foreground">
              <T>仅限英语学习 / 网站相关反馈 · 我们会在 24h 内查看</T>
            </p>

            {/* Category */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {CATS.map(c => {
                const Icon = c.icon;
                const active = category === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-xs font-bold transition ${
                      active
                        ? "border-transparent bg-gradient-to-br text-white shadow " + c.color
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <Icon className="size-4" />
                    {c.value === "bug" ? "Bug" : <T>{c.label}</T>}
                  </button>
                );
              })}
            </div>

            {/* Rating */}
            <div className="mt-4">
              <div className="mb-1 text-[11px] font-bold text-muted-foreground"><T>整体满意度（可选）</T></div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(rating === n ? 0 : n)}
                    aria-label={`${n} ${t("星")}`}
                    className="grid size-9 place-items-center rounded-lg hover:bg-secondary"
                  >
                    <Star className={`size-6 transition ${rating >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mt-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                placeholder={t("说说你的想法、Bug 或建议… (10–1000 字)")}
                rows={5}
                className="w-full rounded-xl border-2 border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
              />
              <div className="mt-1 text-right text-[10px] text-muted-foreground">{message.length}/1000</div>
            </div>

            {/* Email */}
            <div className="mt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("邮箱（可选，便于我们回复你）")}
                className="w-full rounded-xl border-2 border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <button
              onClick={submit}
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-extrabold text-white shadow transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? <><Loader2 className="size-4 animate-spin" /> <T>发送中…</T></> : <T>发送反馈</T>}
            </button>

            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              <T>📜 含色情、暴力、毒品或与英语学习无关的内容会被自动过滤</T>
            </p>
          </div>
        </div>
      )}
    </>
  );
}