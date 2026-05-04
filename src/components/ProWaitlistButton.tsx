import { useState } from "react";
import { Sparkles, Mail, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { T } from "@/i18n/T";
import { toast } from "sonner";

/**
 * Pro waitlist trigger.
 *
 * Usage: drop next to any high-value entry that we plan to gate behind Pro
 * later. Clicking opens a modal that captures the user's email and writes a
 * row to `pro_waitlist` (signed-in users have user_id auto-attached).
 *
 * The point is to *measure demand* before building / pricing Premium.
 */
export default function ProWaitlistButton({
  feature,
  source,
  label,
}: {
  feature: string;       // e.g. "ai-talk", "scenes-pack"
  source?: string;       // e.g. "home-card", "talk-page"
  label?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const trimmed = email.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("pro_waitlist").insert({
      user_id: user?.id ?? null,
      email: trimmed || user?.email || null,
      feature,
      source: source ?? null,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => { setOpen(false); setDone(false); setEmail(""); }, 1800);
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="inline-flex items-center gap-1 rounded-full border border-amber-300/70 bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 transition hover:brightness-110 dark:border-amber-500/40 dark:from-amber-950/60 dark:to-orange-950/60 dark:text-amber-300"
      >
        <Sparkles className="size-3" />
        {label ?? <T>Pro · 即将上线</T>}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-amber-500" />
              <T>抢先解锁 Pro</T>
            </DialogTitle>
            <DialogDescription>
              <T>这个功能正在打磨中。留下邮箱，我们准备好后第一时间通知你，并送你早鸟折扣。</T>
            </DialogDescription>
          </DialogHeader>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Check className="size-7" />
              </div>
              <p className="text-sm font-bold"><T>已加入候补名单！</T></p>
              <p className="text-xs text-muted-foreground"><T>我们会通过邮件通知你。</T></p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
              <Button onClick={submit} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                <T>通知我</T>
              </Button>
              <p className="text-[11px] text-muted-foreground">
                <T>只用于 Pro 通知，可随时退订。</T>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
