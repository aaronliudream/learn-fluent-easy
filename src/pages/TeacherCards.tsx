import { T } from "@/i18n/T";import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BackLink from "@/components/BackLink";
import { Loader2, Sparkles, Users, Target, Trophy, Eye, Share2, ChevronRight } from "lucide-react";

type CardRow = {
  id: string;
  slug: string;
  question: string;
  view_count: number;
  like_count: number;
  created_at: string;
  attempts: number;
  unique_users: number;
  avg_score: number;
  perfect_count: number;
};

export default function TeacherCards() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<CardRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {setAuthed(false);setLoading(false);return;}
      setAuthed(true);

      // 1. Load my cards
      const { data: cards } = await supabase.
      from("knowledge_cards").
      select("id, slug, question, view_count, like_count, created_at").
      eq("author_id", u.user.id).
      order("created_at", { ascending: false }).
      limit(100);

      if (!cards?.length) {setRows([]);setLoading(false);return;}

      // 2. Load all attempts on my cards (RLS lets author read all)
      const cardIds = cards.map((c) => c.id);
      const { data: attempts } = await supabase.
      from("card_attempts").
      select("card_id, user_id, guest_token, score_pct, total_questions, correct_count").
      in("card_id", cardIds);

      // 3. Aggregate
      const byCard = new Map<string, {sumScore: number;n: number;users: Set<string>;perfect: number;}>();
      for (const a of attempts ?? []) {
        const acc = byCard.get(a.card_id) ?? { sumScore: 0, n: 0, users: new Set<string>(), perfect: 0 };
        acc.sumScore += a.score_pct;
        acc.n += 1;
        acc.users.add(a.user_id ?? `g:${a.guest_token}`);
        if (a.correct_count === a.total_questions) acc.perfect += 1;
        byCard.set(a.card_id, acc);
      }

      const merged: CardRow[] = cards.map((c) => {
        const a = byCard.get(c.id);
        return {
          ...c,
          attempts: a?.n ?? 0,
          unique_users: a?.users.size ?? 0,
          avg_score: a && a.n > 0 ? Math.round(a.sumScore / a.n) : 0,
          perfect_count: a?.perfect ?? 0
        };
      });
      setRows(merged);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <main className="p-10 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </main>);

  }
  if (!authed) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Trophy className="w-12 h-12 mx-auto text-primary" />
        <h1 className="text-2xl font-bold"><T>老师 / 创作者面板</T></h1>
        <p className="text-muted-foreground"><T>登录后查看你创建的知识卡数据</T></p>
        <Button onClick={() => navigate("/auth?redirect=/teacher/cards")}><T>登录</T></Button>
      </main>);

  }

  // Aggregate totals
  const totalCards = rows.length;
  const totalViews = rows.reduce((n, r) => n + r.view_count, 0);
  const totalAttempts = rows.reduce((n, r) => n + r.attempts, 0);
  const totalUsers = rows.reduce((n, r) => n + r.unique_users, 0);
  const overallAvg = rows.length ?
  Math.round(rows.reduce((n, r) => n + r.avg_score * r.attempts, 0) / Math.max(1, totalAttempts)) :
  0;

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <BackLink to="/"><T>返回</T></BackLink>
      <header>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" />
          <T>我的知识卡数据</T>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          <T>看看你创作的卡片帮助了多少人，他们答得怎么样</T>
        </p>
      </header>

      {/* Summary tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile icon={<Sparkles className="w-4 h-4" />} label="卡片" value={totalCards} />
        <Tile icon={<Eye className="w-4 h-4" />} label="扫码次数" value={totalViews} />
        <Tile icon={<Users className="w-4 h-4" />} label="答题人次" value={totalAttempts} accent />
        <Tile icon={<Target className="w-4 h-4" />} label="平均正确率" value={`${overallAvg}%`} accent />
      </section>

      {/* Empty state */}
      {rows.length === 0 &&
      <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4"><T>你还没有创建过知识卡</T></p>
          <Link to="/ask"><Button><T>提一个问题，生成第一张卡</T></Button></Link>
        </Card>
      }

      {/* List */}
      {rows.length > 0 &&
      <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <T>卡片列表 · 按最近创建排序</T>
          </h2>
          {rows.map((r) =>
        <Link
          to={`/teacher/cards/${r.slug}`}
          key={r.id}
          className="block group">
          
              <Card className="p-4 transition hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold leading-tight line-clamp-2">{r.question}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />{r.view_count} <T>扫码</T>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />{r.unique_users} <T>人答题</T>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" />{r.attempts > 0 ? `${r.avg_score}% 正确率` : "暂无作答"}
                      </span>
                      {r.perfect_count > 0 &&
                  <Badge variant="secondary" className="text-[10px]">
                          🏆 {r.perfect_count} <T>次满分</T>
                        </Badge>
                  }
                    </div>
                    {/* Funnel hint */}
                    {r.view_count > 0 && r.attempts === 0 &&
                <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
                        <T>💡 有人扫码但没答题 — 试着重新分享</T>
                      </p>
                }
                    {r.attempts > 0 && r.avg_score < 50 &&
                <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">
                        <T>⚠️ 正确率偏低，可能题目偏难或讲解不够清晰</T>
                      </p>
                }
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1 transition group-hover:translate-x-0.5" />
                </div>
              </Card>
            </Link>
        )}
        </section>
      }

      <div className="text-center pt-4 border-t">
        <Link to="/ask">
          <Button variant="ghost"><Sparkles className="w-4 h-4 mr-2" /><T>创建新卡片</T></Button>
        </Link>
      </div>
    </main>);

}

function Tile({ icon, label, value, accent }: {icon: React.ReactNode;label: string;value: number | string;accent?: boolean;}) {
  return (
    <Card className={`p-3 ${accent ? "bg-primary/5 border-primary/30" : ""}`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}<span>{label}</span>
      </div>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </Card>);

}