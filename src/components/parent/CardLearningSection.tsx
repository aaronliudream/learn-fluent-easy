import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Target, Trophy, ChevronRight } from "lucide-react";

type AttemptRow = {
  id: string;
  card_id: string;
  total_questions: number;
  correct_count: number;
  score_pct: number;
  coins_awarded: number;
  stage: string;
  created_at: string;
};

export default function CardLearningSection() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AttemptRow[]>([]);
  const [cardMap, setCardMap] = useState<Record<string, { question: string; slug: string }>>({});

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) { setLoading(false); return; }
      const { data: attempts } = await supabase
        .from("card_attempts")
        .select("id, card_id, total_questions, correct_count, score_pct, coins_awarded, stage, created_at")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      const list = (attempts ?? []) as AttemptRow[];
      setRows(list);
      if (list.length > 0) {
        const ids = Array.from(new Set(list.map((r) => r.card_id)));
        const { data: cards } = await supabase
          .from("knowledge_cards")
          .select("id, slug, question")
          .in("id", ids);
        const m: Record<string, { question: string; slug: string }> = {};
        for (const c of cards ?? []) m[c.id] = { question: c.question, slug: c.slug };
        setCardMap(m);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return null;
  if (rows.length === 0) {
    return (
      <section className="mb-4 rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-5 text-primary" />
          <span className="font-extrabold">扫码答题学习</span>
        </div>
        <p className="text-muted-foreground mb-3">
          还没有扫码答题记录。生成卡片分享给孩子，TA 答完题就会出现在这里。
        </p>
        <Link to="/ask" className="inline-flex items-center gap-1 text-primary font-bold text-sm">
          创建一张知识卡 <ChevronRight className="size-4" />
        </Link>
      </section>
    );
  }

  const totalCoins = rows.reduce((n, r) => n + r.coins_awarded, 0);
  const totalCorrect = rows.reduce((n, r) => n + r.correct_count, 0);
  const totalQ = rows.reduce((n, r) => n + r.total_questions, 0);
  const avgPct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
  const perfectN = rows.filter((r) => r.correct_count === r.total_questions).length;

  return (
    <section className="mb-4 rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-5 text-primary" />
        <h2 className="font-extrabold text-base">扫码答题学习</h2>
        <span className="text-xs text-muted-foreground ml-auto">最近 20 次</span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        <MiniStat label="答题次数" value={rows.length} />
        <MiniStat label="平均正确率" value={`${avgPct}%`} accent />
        <MiniStat label="满分" value={perfectN} icon={<Trophy className="size-3" />} />
        <MiniStat label="获得金币" value={totalCoins} accent />
      </div>

      {/* Timeline */}
      <ol className="space-y-2 max-h-72 overflow-y-auto">
        {rows.map((r) => {
          const c = cardMap[r.card_id];
          const date = new Date(r.created_at);
          const today = new Date();
          const sameDay = date.toDateString() === today.toDateString();
          const dateLabel = sameDay
            ? date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
            : date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
          const perfect = r.correct_count === r.total_questions;
          return (
            <li key={r.id}>
              <Link
                to={c ? `/q/${c.slug}` : "#"}
                className="flex items-center gap-3 rounded-xl bg-background/70 p-3 hover:bg-background transition"
              >
                <div className="text-[10px] font-bold text-muted-foreground w-12 shrink-0">{dateLabel}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c?.question ?? "卡片"}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <Target className="size-3 inline mr-0.5" />
                    {r.correct_count}/{r.total_questions} 正确 · 第 {r.stage.replace("s", "")} 关
                    {r.coins_awarded > 0 && <> · 💰 +{r.coins_awarded}</>}
                    {perfect && <> · 🏆</>}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function MiniStat({ label, value, accent, icon }: { label: string; value: number | string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-2 ${accent ? "bg-primary/15" : "bg-background/70"}`}>
      <div className="text-base font-extrabold flex items-center justify-center gap-1">
        {icon}{value}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}