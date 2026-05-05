import { useEffect, useState } from "react";
import BackLink from "@/components/BackLink";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ModuleStageTests from "@/components/ModuleStageTests";

type E = { id: string; title: string; topic: string | null; grade: number; difficulty: number; kind: string | null; duration_sec: number | null };

const SECTIONS: { key: string; label: string; emoji: string; desc: string }[] = [
  { key: "short", label: "Section A · 短对话", emoji: "💬", desc: "30 段 · 每段 1 题 · 听一遍即答" },
  { key: "long", label: "Section B · 长对话", emoji: "🗣️", desc: "10 段 · 每段 3 题 · 听两遍" },
  { key: "mono", label: "Section C · 独白短文", emoji: "📻", desc: "8 段 · 每段 5 题 · 含填空与判断" },
  { key: "passage", label: "Section D · 听短文填空", emoji: "📝", desc: "5 篇 · 每篇 4 个空 · 选项填空" },
  { key: "dictation", label: "Section E · 听写句子", emoji: "🖊️", desc: "10 句 · 听完整句默写" },
];

export default function JuniorListening() {
  const [params] = useSearchParams();
  const grade = params.get("grade");
  const backTo = grade ? `/junior/g/${grade}` : "/junior";
  const [items, setItems] = useState<E[]>([]);
  useEffect(() => {
    let q: any = (supabase as any).from("junior_listening_exercises")
      .select("id,title,topic,grade,difficulty,kind,duration_sec")
      .order("title");
    if (grade) {
      // 初1=七年级=7, 初2=8, 初3=9
      const g = Number(grade);
      const dbGrade = g <= 3 ? g + 6 : g;
      q = q.eq("grade", dbGrade);
    }
    q.then(({ data }: any) => setItems((data ?? []) as E[]));
  }, [grade]);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-8">
      <BackLink to={backTo} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> {grade ? `返回初${grade}` : "返回初中专区"}</BackLink>
      <h1 className="text-grad-title text-2xl font-extrabold">🎧 初中听力训练</h1>
      <p className="mt-1 text-sm text-muted-foreground">参考高考分块设计 · 短对话 / 长对话 / 独白短文</p>
      {grade && (
        <ModuleStageTests
          segment="junior"
          grade={Number(grade) >= 7 ? Number(grade) - 6 : Number(grade)}
          module="listening"
          className="mt-4"
        />
      )}
      {items.length === 0 && <p className="mt-6 text-sm text-muted-foreground">暂无听力，敬请期待</p>}
      {SECTIONS.map(sec => {
        const list = items.filter(e => (e.kind ?? "short") === sec.key);
        if (!list.length) return null;
        return (
          <section key={sec.key} className="mt-6">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-base font-extrabold">{sec.emoji} {sec.label}</h2>
              <span className="text-[11px] text-muted-foreground">{list.length} 段</span>
            </div>
            <p className="mb-2 text-[11px] text-muted-foreground">{sec.desc}</p>
            <div className="grid gap-2">
              {list.map(e => (
                <Link key={e.id} to={`/junior/listening/${e.id}`} className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card p-3 transition hover:-translate-y-0.5 hover:border-sky-400">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white"><Headphones className="size-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-extrabold">{e.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {e.topic ?? "general"} · 难度 {"★".repeat(e.difficulty)}{"☆".repeat(Math.max(0, 3 - e.difficulty))}
                      {e.duration_sec ? ` · ${Math.round(e.duration_sec)}s` : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}