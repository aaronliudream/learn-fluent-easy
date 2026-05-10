import { useEffect, useState } from "react";
import { GraduationCap, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Parent-controlled default grade for the child's primary path.
// Spark uses this as the "推荐" grade in the switch dialog and as the seed
// grade for first-time visitors. The child can still freely switch in-session.
const GRADES: { id: number; emoji: string; label: string }[] = [
  { id: 1, emoji: "🐣", label: "一年级" },
  { id: 2, emoji: "🐥", label: "二年级" },
  { id: 3, emoji: "🦊", label: "三年级" },
  { id: 4, emoji: "🐼", label: "四年级" },
  { id: 5, emoji: "🦁", label: "五年级" },
  { id: 6, emoji: "🦉", label: "六年级" },
];

export default function RecommendedGradeCard() {
  const [uid, setUid] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u?.user?.id ?? null;
      setUid(id);
      if (!id) return;
      const { data } = await supabase
        .from("profiles")
        .select("recommended_grade")
        .eq("user_id", id)
        .maybeSingle();
      setRecommended((data as any)?.recommended_grade ?? null);
    })();
  }, []);

  async function pick(id: number) {
    if (!uid) return;
    setSaving(id);
    const { error } = await supabase
      .from("profiles")
      .update({ recommended_grade: id })
      .eq("user_id", uid);
    setSaving(null);
    if (error) {
      toast({ title: "保存失败", description: error.message, variant: "destructive" });
      return;
    }
    setRecommended(id);
    toast({ title: "已设置推荐年级", description: `孩子下次进入会先到 ${GRADES.find(g => g.id === id)?.label}。` });
  }

  return (
    <section className="mb-4 rounded-3xl border-2 border-border bg-card p-5 shadow-tile">
      <div className="flex items-center gap-2 text-sm font-extrabold">
        <GraduationCap className="size-4 text-emerald-500" /> 🎒 孩子的推荐年级
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        孩子可以临时切换到其他等级，但默认会进入这个推荐年级。
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {GRADES.map((g) => {
          const selected = recommended === g.id;
          const isHard = g.id >= 5;
          return (
            <button
              key={g.id}
              onClick={() => pick(g.id)}
              disabled={saving != null}
              className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition hover:-translate-y-0.5 disabled:opacity-60 ${
                selected
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <div className="text-2xl">{g.emoji}</div>
              <div className="text-xs font-bold">{g.label}</div>
              {isHard && (
                <div className="text-[9px] font-bold text-amber-600 dark:text-amber-400">⚠️ 难度较高</div>
              )}
              {selected && (
                <div className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                  {saving === g.id ? <Loader2 className="size-2.5 animate-spin" /> : <Check className="size-2.5" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}