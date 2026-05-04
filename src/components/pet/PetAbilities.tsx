import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Lock, Sparkles } from "lucide-react";

type Binding = {
  skill_code: string; label_cn: string; label_en: string;
  emoji: string; description_cn: string; module: string;
  threshold: number; rarity: string;
};
type Progress = { skill_code: string; progress: number; unlocked_at: string | null };

/**
 * Shows knowledge-point → pet ability bindings with transparent progress bars.
 * Replaces opaque "random reward" loop with explainable mastery gates.
 */
export default function PetAbilities() {
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [b, p] = await Promise.all([
        (supabase as any).from("pet_skill_bindings").select("*"),
        (supabase as any).from("user_pet_skills").select("skill_code,progress,unlocked_at"),
      ]);
      setBindings((b.data ?? []) as Binding[]);
      const map: Record<string, Progress> = {};
      for (const r of (p.data ?? []) as Progress[]) map[r.skill_code] = r;
      setProgress(map);
      setLoading(false);
    })();
  }, []);

  if (loading) return null;
  if (!bindings.length) return null;

  const items = bindings.map(b => {
    const pr = progress[b.skill_code];
    const cur = Math.min(pr?.progress ?? 0, b.threshold);
    const unlocked = !!pr?.unlocked_at;
    const pct = Math.round((cur / b.threshold) * 100);
    return { ...b, cur, unlocked, pct };
  }).sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.pct - a.pct);

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-tile">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-sm font-extrabold">伙伴的能力</h3>
        <span className="text-[10px] text-muted-foreground">每掌握一个知识点，它就会解锁一个能力</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(it => (
          <div
            key={it.skill_code}
            className={cn(
              "rounded-2xl border p-3 transition",
              it.unlocked ? "border-emerald-300/60 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border bg-muted/30"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn("text-2xl", !it.unlocked && "grayscale opacity-60")}>{it.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-sm font-bold">
                  {it.label_cn}
                  {!it.unlocked && <Lock className="size-3 text-muted-foreground" />}
                </div>
                <div className="text-[11px] text-muted-foreground">{it.description_cn}</div>
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all",
                  it.unlocked ? "bg-emerald-500" : "bg-gradient-to-r from-fuchsia-400 to-amber-400")}
                style={{ width: `${it.pct}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{it.cur} / {it.threshold}</span>
              <span>
                {it.unlocked
                  ? "已解锁 ✨"
                  : `还差 ${it.threshold - it.cur} 次`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
