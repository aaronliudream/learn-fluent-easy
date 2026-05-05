import { useEffect, useState } from "react";
import { MessageCircle, X, Loader2, Star, Bug, Lightbulb, Heart, FileText } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { T, useT } from "@/i18n/T";
import { useDraggable } from "@/hooks/useDraggable";

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
  const drag = useDraggable("bme_feedback_pos");
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState<Category>("suggestion");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ---- Client-side quality check (mirrors edge function) ----
  function countTokens(text: string): number {
    const cjk = (text.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) ?? []).length;
    const words = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
    return cjk + words;
  }
  function qualityIssue(raw: string): string | null {
    const text = raw.trim();
    if (!text) return t("内容不能为空");
    if (countTokens(text) < 10) return t("反馈太短啦，请至少写 10 个字（或 10 个英文单词）");
    const stripped = text.replace(/\s+/g, "");
    const unique = new Set(stripped.toLowerCase()).size;
    if (stripped.length >= 10 && unique < Math.max(4, Math.floor(stripped.length * 0.2)))
      return t("内容看起来是重复字符，请认真描述你的反馈");
    if (/(.)\1{6,}/.test(stripped)) return t("请不要重复相同字符");
    const words = text.toLowerCase().match(/[a-z\u4e00-\u9fff]+/g) ?? [];
    if (words.length >= 6) {
      const uniq = new Set(words).size;
      if (uniq <= Math.max(2, Math.floor(words.length * 0.25)))
        return t("内容看起来是重复粘贴，请认真描述你的反馈");
    }
    const hasCJK = /[\u4e00-\u9fff]/.test(text);
    if (!hasCJK) {
      const letters = text.replace(/[^a-zA-Z]/g, "");
      if (letters.length >= 15) {
        const vowels = (letters.match(/[aeiouAEIOU]/g) ?? []).length;
        const ratio = vowels / letters.length;
        if (ratio < 0.15 || ratio > 0.75)
          return t("内容看起来不是正常文字，请用完整句子描述");
        if (letters.length >= 30 && !/\s/.test(text))
          return t("请用完整的句子描述你的反馈（用空格分词）");
      }
    }
    return null;
  }
  const qIssue = qualityIssue(message);
  const canSubmit = !submitting && !qIssue;

  const schema = z.object({
    category: z.enum(["bug", "suggestion", "praise", "other"]),
    rating: z.number().min(1).max(5).optional().nullable(),
    message: z.string().trim().min(10, t("至少 10 个字")).max(1000, t("最多 1000 字")),
    email: z.string().trim().email(t("邮箱格式不正确")).max(255).optional().or(z.literal("")),
  });

  // Detect login status & auto-fill email if available
  useEffect(() => {
    if (!open) return;
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user;
      setIsLoggedIn(!!u);
      // Real (non-guest) email — auth.users always has email for normal signups,
      // but guest accounts may have a placeholder. Heuristic: must look like a
      // real address the user would actually check.
      const e = u?.email && !u.email.endsWith("@guest.local") ? u.email : null;
      setAuthedEmail(e);
      if (e && !email) setEmail(e);
    });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit() {
    const issue = qualityIssue(message);
    if (issue) {
      toast.error(issue);
      return;
    }
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
          if (body?.error) msg = t(body.error);
        } catch { /* ignore */ }
        toast.error(msg);
        return;
      }
      if ((data as any)?.error) {
        toast.error(t((data as any).error));
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
      <div
        ref={drag.ref}
        style={drag.style}
        {...drag.handlers}
        className="fixed left-4 z-40 sm:left-5 bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] sm:bottom-5"
      >
        <div className="relative">
          {drag.dragging && <span className="drag-wings" aria-hidden />}
          <button
            onClick={() => { if (drag.wasDragging()) return; setOpen(true); }}
            aria-label={t("反馈")}
            className="relative grid size-12 cursor-grab place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_10px_30px_-10px_rgba(91,43,201,0.6)] transition hover:scale-105 active:cursor-grabbing sm:size-14"
          >
            <MessageCircle className="size-6" />
          </button>
        </div>
      </div>

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
            {!authedEmail && (
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isLoggedIn
                    ? t("留个邮箱以便我们回复你（可选）")
                    : t("邮箱（可选，便于我们回复你）")}
                  className="w-full rounded-xl border-2 border-border bg-card p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            )}

            <button
              onClick={submit}
              disabled={!canSubmit}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-extrabold text-white shadow transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? <><Loader2 className="size-4 animate-spin" /> <T>发送中…</T></> : <T>发送反馈</T>}
            </button>
            {message.length > 0 && qIssue && (
              <p className="mt-2 text-center text-[11px] font-semibold text-rose-500">{qIssue}</p>
            )}

          </div>
        </div>
      )}
    </>
  );
}