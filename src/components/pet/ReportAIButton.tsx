import { useState } from "react";
import { Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * AI 内容举报按钮 — 任何 AI 生成内容旁可挂载
 * 用户举报后写入 ai_content_reports（RLS：用户只能 insert/select 自己的举报）
 */
type Props = {
  feature: string;          // e.g. 'pet_diary' | 'pet_chat' | 'mistake_explain'
  sourceId?: string;
  contentSnippet: string;
  className?: string;
};

const REASONS = [
  { code: "inappropriate", label: "内容不合适 / Inappropriate" },
  { code: "wrong_info",    label: "信息错误 / Wrong info" },
  { code: "scary",         label: "让人不舒服 / Makes me uncomfortable" },
  { code: "other",         label: "其他 / Other" },
];

export default function ReportAIButton({ feature, sourceId, contentSnippet, className }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (reason: string) => {
    setSubmitting(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { toast.error("请先登录"); setSubmitting(false); setOpen(false); return; }
      await supabase.from("ai_content_reports").insert({
        user_id: u.user.id,
        feature,
        source_id: sourceId ?? null,
        content_snippet: (contentSnippet || "").slice(0, 500),
        reason,
      });
      toast.success("举报已提交，谢谢！我们会尽快查看 🙏");
    } catch (e: any) {
      toast.error("提交失败：" + (e?.message || "未知错误"));
    } finally {
      setSubmitting(false);
      setOpen(false);
    }
  };

  return (
    <div className={className}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-rose-500"
          aria-label="举报此 AI 内容"
        >
          <Flag className="size-3" />
          举报
        </button>
      ) : (
        <div className="rounded-xl border border-border bg-card p-2 text-xs shadow-lg">
          <div className="mb-1.5 font-bold">为什么举报？</div>
          <div className="space-y-1">
            {REASONS.map(r => (
              <button
                key={r.code}
                disabled={submitting}
                onClick={() => submit(r.code)}
                className="block w-full rounded-md px-2 py-1 text-left hover:bg-muted disabled:opacity-50"
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => setOpen(false)}
              className="block w-full rounded-md px-2 py-1 text-left text-muted-foreground hover:bg-muted"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}