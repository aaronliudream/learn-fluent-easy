import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Volume2, Drama } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { stripTags } from "@/lib/richText";
import { T } from "@/i18n/T";

type Alternative = {
  style: string;
  en: string;
  cn: string;
  diff_cn: string;
  tone?: string;
};

const TONE_BADGE: Record<string, string> = {
  formal: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  polite: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  casual: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  native: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
  neutral: "bg-secondary text-foreground/70",
};

export function RewriteDialog({
  open,
  onOpenChange,
  sentence,
  sceneHint,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sentence: string;
  sceneHint?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alts, setAlts] = useState<Alternative[]>([]);
  const cleanSentence = stripTags(sentence);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const fetchIt = async () => {
      setLoading(true);
      setError(null);
      setAlts([]);
      try {
        const { data, error: fnErr } = await supabase.functions.invoke(
          "rewrite-line",
          { body: { sentence: cleanSentence, sceneHint } },
        );
        if (cancelled) return;
        if (fnErr) throw fnErr;
        if (data?.error) throw new Error(data.error);
        const list = (data?.rewrites?.alternatives || []) as Alternative[];
        setAlts(list);
      } catch (e: any) {
        console.warn("[rewrite-line] failed", e);
        if (!cancelled) setError(e?.message || "failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchIt();
    return () => {
      cancelled = true;
    };
  }, [open, cleanSentence, sceneHint]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Drama className="size-5 text-primary" /> <T>换种说法</T>
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-lg border border-border bg-secondary/50 p-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <T>原句</T>
          </div>
          <div className="mt-1 flex items-start gap-2">
            <button
              onClick={() => speak(cleanSentence)}
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20"
              aria-label="play"
            >
              <Volume2 className="size-3" />
            </button>
            <div className="text-sm font-medium text-foreground">
              {cleanSentence}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> <T>正在生成不同说法…</T>
          </div>
        )}
        {error && !loading && (
          <div className="py-2 text-sm text-destructive">
            <T>暂时没法生成,请稍后再试。</T>
          </div>
        )}

        {!loading && !error && alts.length > 0 && (
          <div className="space-y-3">
            {alts.map((a, i) => {
              const toneClass =
                TONE_BADGE[a.tone || "neutral"] || TONE_BADGE.neutral;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${toneClass}`}
                    >
                      {a.style}
                    </span>
                    <button
                      onClick={() => speak(a.en)}
                      className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20"
                      aria-label="play"
                    >
                      <Volume2 className="size-3" />
                    </button>
                  </div>
                  <div className="text-base font-semibold leading-snug text-foreground">
                    {a.en}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {a.cn}
                  </div>
                  {a.diff_cn ? (
                    <div className="mt-2 rounded-lg bg-primary/8 p-2 text-xs leading-relaxed text-foreground/80">
                      <span className="mr-1">💡</span>
                      {a.diff_cn}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}