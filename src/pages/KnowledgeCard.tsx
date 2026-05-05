import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Lock, Share2, Sparkles, Volume2, BookmarkPlus, Trophy } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/BrandLogo";

type Quiz = { q: string; options: string[]; answer: number; explain?: string };
type CardData = {
  id: string;
  slug: string;
  question: string;
  short_answer: string;
  explanation: string;
  examples: string[];
  common_mistakes: string[];
  quiz: Quiz[];
  tags: string[];
  view_count: number;
  like_count: number;
  author_id: string | null;
  created_at: string;
};

export default function KnowledgeCard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [picked, setPicked] = useState<Record<number, number>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!mounted) return;
      setAuthed(!!u?.user);

      const { data, error } = await supabase
        .from("knowledge_cards")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error || !data) { setLoading(false); return; }
      setCard(data as any);
      setLoading(false);

      // record view + ref reward hook (Phase 2 will use ref_user_id)
      const ref = new URLSearchParams(window.location.search).get("ref");
      supabase.from("card_views").insert({
        card_id: data.id,
        viewer_id: u?.user?.id ?? null,
        ref_user_id: ref ?? null,
      });

      if (u?.user) {
        const { data: like } = await supabase
          .from("card_likes")
          .select("id")
          .eq("card_id", data.id)
          .eq("user_id", u.user.id)
          .maybeSingle();
        setLiked(!!like);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  async function toggleLike() {
    if (!authed || !card) { navigate(`/auth?redirect=/q/${slug}`); return; }
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    if (liked) {
      await supabase.from("card_likes").delete().eq("card_id", card.id).eq("user_id", u.user.id);
      setLiked(false);
      setCard({ ...card, like_count: Math.max(0, card.like_count - 1) });
    } else {
      await supabase.from("card_likes").insert({ card_id: card.id, user_id: u.user.id });
      setLiked(true);
      setCard({ ...card, like_count: card.like_count + 1 });
    }
  }

  async function share() {
    // Share link points to edge function so crawlers (WeChat etc.) get proper OG tags;
    // real users are 302-redirected back to the SPA.
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const url = `https://${projectId}.supabase.co/functions/v1/card-og/${slug}`;
    try {
      if (navigator.share) await navigator.share({ title: card?.question, url });
      else { await navigator.clipboard.writeText(url); toast.success("链接已复制"); }
    } catch {}
  }

  if (loading) return <main className="p-10 text-center text-muted-foreground">Loading…</main>;
  if (!card) return (
    <main className="p-10 text-center">
      <p className="text-muted-foreground mb-4">这张卡片不存在或已删除。</p>
      <Link to="/ask"><Button>提一个新问题</Button></Link>
    </main>
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <header>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {card.tags.map((t) => <Badge key={t} variant="secondary">#{t}</Badge>)}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight">{card.question}</h1>
        <p className="text-xs text-muted-foreground mt-2">
          帮助了 {card.view_count} 人 · {card.like_count} ❤️
        </p>
      </header>

      {/* Short answer */}
      <Card className="p-5 bg-primary/5 border-primary/30">
        <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">✅ 简短答案</p>
        <p className="text-lg font-medium">{card.short_answer}</p>
      </Card>

      {/* Explanation */}
      <Card className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">📖 详细解释</p>
        <p className="whitespace-pre-wrap leading-relaxed">{card.explanation}</p>
      </Card>

      {/* Examples */}
      {card.examples?.length > 0 && (
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">💬 例句</p>
          <ul className="space-y-2">
            {card.examples.map((ex, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-bold">{i + 1}.</span>
                <span className="flex-1">{ex}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Common mistakes */}
      {card.common_mistakes?.length > 0 && (
        <Card className="p-5 border-destructive/30 bg-destructive/5">
          <p className="text-xs uppercase tracking-wider text-destructive font-semibold mb-2">⚠️ 常见错误</p>
          <ul className="space-y-1.5 list-disc list-inside text-sm">
            {card.common_mistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </Card>
      )}

      {/* Quiz — gated */}
      <section>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
          🎯 3 题小测验
        </p>
        <div className="space-y-3">
            {card.quiz.map((q, i) => (
              <Card key={i} className="p-4">
                <p className="font-medium mb-3">{i + 1}. {q.q}</p>
                <div className="grid gap-2">
                  {q.options.map((opt, j) => {
                    const chosen = picked[i];
                    const isRight = j === q.answer;
                    const isPicked = chosen === j;
                    const showState = chosen !== undefined;
                    return (
                      <button
                        key={j}
                        onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                        className={`text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                          showState && isRight ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                          : showState && isPicked ? "border-destructive bg-destructive/10"
                          : "border-border hover:bg-muted"
                        }`}
                      >
                        {String.fromCharCode(65 + j)}. {opt}
                      </button>
                    );
                  })}
                </div>
                {picked[i] !== undefined && (
                  <div className="mt-3">
                    {picked[i] === q.answer ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-primary/10 to-transparent border border-primary/30 animate-in fade-in slide-in-from-bottom-1 duration-300">
                        <BrandLogo size={22} />
                        <span className="text-sm font-semibold text-primary">太棒了，答对了！</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-muted/60 border border-border animate-in fade-in duration-300">
                        <span className="text-base leading-none mt-0.5">🌙</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">没关系，再看看～</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            正确答案是 <span className="font-semibold text-foreground">{String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}</span>
                          </p>
                        </div>
                      </div>
                    )}
                    {q.explain && (
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{q.explain}</p>
                    )}
                  </div>
                )}
              </Card>
            ))}
        </div>
      </section>

      {/* End-of-quiz CTA — only after user answered all questions, only for guests */}
      {!authed && Object.keys(picked).length === card.quiz.length && card.quiz.length > 0 && (() => {
        const correct = card.quiz.reduce((acc, q, i) => acc + (picked[i] === q.answer ? 1 : 0), 0);
        return (
          <Card className="p-6 text-center bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary shadow-lg">
            <Trophy className="w-10 h-10 mx-auto text-primary mb-2" />
            <p className="text-lg font-bold mb-1">🎉 答对 {correct}/{card.quiz.length}！</p>
            <p className="text-sm text-muted-foreground mb-4">
              想再练一道类似的题？让 AI 给你出专属题目。
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate(`/auth?redirect=/ask`)}
                className="w-full h-12 text-base"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                免费生成我的专属题 →
              </Button>
              <Button
                onClick={() => navigate(`/auth?redirect=/q/${slug}`)}
                variant="outline"
                className="w-full"
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                保存这张卡片到我的学习库
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">注册免费 · 30 秒搞定</p>
          </Card>
        );
      })()}

      {/* Speak / Ask AI placeholders (locked for guests) */}
      <section className="grid grid-cols-2 gap-3">
        <Button variant="outline" disabled={!authed} className="h-12">
          <Volume2 className="w-4 h-4 mr-2" />跟读发音 {!authed && <Lock className="w-3 h-3 ml-1" />}
        </Button>
        <Button variant="outline" disabled={!authed} className="h-12">
          <Sparkles className="w-4 h-4 mr-2" />追问 AI {!authed && <Lock className="w-3 h-3 ml-1" />}
        </Button>
      </section>

      {/* Actions */}
      <div className="flex gap-3 sticky bottom-20 lg:static">
        <Button onClick={toggleLike} variant={liked ? "default" : "outline"} className="flex-1">
          <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
          {liked ? "已点赞" : "点赞"} · {card.like_count}
        </Button>
        <Button onClick={share} variant="outline" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />分享
        </Button>
      </div>

      <div className="text-center pt-4 border-t">
        <Link to="/ask">
          <Button variant="ghost"><Sparkles className="w-4 h-4 mr-2" />提一个新问题</Button>
        </Link>
      </div>
    </main>
  );
}