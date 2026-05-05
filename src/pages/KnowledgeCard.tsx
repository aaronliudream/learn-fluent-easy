import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Lock, Share2, Sparkles, Volume2, BookmarkPlus, Trophy, Copy } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { speak } from "@/lib/speak";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import QRCode from "qrcode";
import { awardCoins, awardForCorrect, notifyWrong } from "@/lib/coins";
import { getGuestCardToken } from "@/lib/cardGuest";

// Tiny WebAudio beep — no asset files, no library
function playTone(freq: number, duration = 0.1, type: OscillatorType = "sine") {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
  } catch {}
}

type Quiz = { q: string; options: string[]; answer: number; explain?: string; difficulty?: number };
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
  // English-only text for TTS. Returns "" if no usable English content.
  const ttsText = (c: CardData | null) => {
    if (!c) return "";
    const isEn = (s: string) => /[a-zA-Z]/.test(s) && !/[\u4e00-\u9fff]/.test(s);
    return c.examples?.find(isEn) || (isEn(c.short_answer) ? c.short_answer : "") || "";
  };
  const navigate = useNavigate();
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [refUserId, setRefUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  // Two URLs:
  //   • qrUrl: clean short URL — used inside the QR image (smaller, easier to scan)
  //   • shareUrl: points to the OG edge function so WeChat / Twitter / Facebook
  //     crawlers get a card-specific preview (title, description, cover image).
  //     Real users are 302-redirected to /q/<slug>.
  // Both append ?ref=<myUserId> for share-bonus tracking.
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const refQuery = myUserId ? `?ref=${myUserId}` : "";
  const qrUrl = `https://bigmoonenglish.com/q/${slug}${refQuery}`;
  const ogPath = `/functions/v1/card-og/${slug}${refQuery}`;
  const shareUrl = `https://bigmoonenglish.com${ogPath}`;
  const backendShareUrl = projectId
    ? `https://${projectId}.supabase.co${ogPath}`
    : shareUrl;
  // Progressive challenge: start with 3, can extend to 5, then 10.
  const [stage, setStage] = useState<3 | 5 | 10>(3);
  const [stageDone, setStageDone] = useState<{ s3?: boolean; s5?: boolean; s10?: boolean }>({});
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [savedCTA, setSavedCTA] = useState(false); // shows "saved + sign-up" CTA after stage settle
  const [cardStats, setCardStats] = useState<{ attempts: number; avgPct: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!mounted) return;
      setAuthed(!!u?.user);
      setMyUserId(u?.user?.id ?? null);

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
      // Don't credit self-shares
      const refClean = ref && ref !== u?.user?.id ? ref : null;
      setRefUserId(refClean);
      supabase.from("card_views").insert({
        card_id: data.id,
        viewer_id: u?.user?.id ?? null,
        ref_user_id: refClean,
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

      // Lightweight aggregate: how many people tried + avg correct rate
      try {
        const { data: aRows } = await supabase
          .from("card_attempts")
          .select("score_pct")
          .eq("card_id", data.id)
          .limit(500);
        if (aRows && aRows.length > 0) {
          const sum = aRows.reduce((n: number, r: any) => n + (r.score_pct ?? 0), 0);
          setCardStats({ attempts: aRows.length, avgPct: Math.round(sum / aRows.length) });
        }
      } catch {}
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
    // Render a high-fidelity QR (large, high error-correction) so any phone can scan it.
    try {
      const dataUrl = await QRCode.toDataURL(qrUrl, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 720,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
      setQrOpen(true);
    } catch (e) {
      console.error("qr failed", e);
      toast.error("二维码生成失败");
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("链接已复制");
    } catch {
      toast.error("复制失败，请手动选择网址");
    }
  }

  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

  async function nativeShare() {
    if (isWeChat) {
      await copyLink();
      toast.info("微信不允许网页按钮直接发到聊天，已复制链接，请粘贴到聊天窗口发送");
      return;
    }

    try {
      if (navigator.share) await navigator.share({ title: card?.question, text: card?.short_answer, url: shareUrl });
      else await copyLink();
    } catch {
      await copyLink();
    }
  }

  if (loading) return <main className="p-10 text-center text-muted-foreground">Loading…</main>;
  if (!card) return (
    <main className="p-10 text-center">
      <p className="text-muted-foreground mb-4">这张卡片不存在或已删除。</p>
      <Link to="/ask"><Button>提一个新问题</Button></Link>
    </main>
  );

  // ===== Quiz logic (progressive) =====
  const visibleQuiz = card.quiz.slice(0, stage);
  const answeredCount = visibleQuiz.reduce((n, _, i) => n + (picked[i] !== undefined ? 1 : 0), 0);
  const correctCount = visibleQuiz.reduce((n, q, i) => n + (picked[i] === q.answer ? 1 : 0), 0);
  const stageComplete = answeredCount === visibleQuiz.length && visibleQuiz.length > 0;
  const stageKey = stage === 3 ? "s3" : stage === 5 ? "s5" : "s10";
  const justSettled = stageComplete && !stageDone[stageKey as keyof typeof stageDone];

  async function pickAnswer(qIdx: number, optIdx: number) {
    if (picked[qIdx] !== undefined) return;
    setPicked((p) => ({ ...p, [qIdx]: optIdx }));
    const q = card!.quiz[qIdx];
    const isRight = optIdx === q.answer;
    // Fire-and-forget: record this answer for per-question analytics
    try {
      void supabase.auth.getUser().then(({ data: u }) => {
        supabase.from("card_answer_events").insert({
          card_id: card!.id,
          question_idx: qIdx,
          picked_idx: optIdx,
          is_correct: isRight,
          user_id: u?.user?.id ?? null,
          guest_token: u?.user ? null : getGuestCardToken(),
        });
      });
    } catch {}
    if (isRight) {
      // Sound + tiny haptic on correct
      try { playTone(880, 0.08); } catch {}
      try { (navigator as any).vibrate?.(15); } catch {}
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (authed) {
        const r = await awardForCorrect(newStreak, "card_quiz", `${card!.id}:${qIdx}`, "card_quiz");
        if (r?.awarded) setCoinsEarned((c) => c + r.awarded);
      } else {
        // 游客：本地暂记，注册后通过 first-login bonus 一次性补发
        setCoinsEarned((c) => c + 1);
      }
    } else {
      // Haptic + low tone on wrong
      try { playTone(220, 0.12, "square"); } catch {}
      try { (navigator as any).vibrate?.([30, 40, 30]); } catch {}
      setStreak(0);
      notifyWrong();
      // Add to mistakes book (logged-in only)
      if (authed) {
        try {
          const { data: u } = await supabase.auth.getUser();
          if (u?.user) {
            await supabase.from("user_mistakes").upsert({
              user_id: u.user.id,
              module: "card_quiz",
              source_key: `${card!.id}:${qIdx}`,
              source_label: card!.question?.slice(0, 60) ?? "知识卡",
              question: q.q,
              user_answer: q.options[optIdx] ?? "",
              correct_answer: q.options[q.answer] ?? "",
              explanation: q.explain ?? card!.explanation ?? "",
              snapshot: {
                card_slug: card!.slug,
                card_id: card!.id,
                question_idx: qIdx,
                options: q.options,
                answer: q.answer,
                picked: optIdx,
              } as any,
              wrong_count: 1,
              is_resolved: false,
              is_starred: false,
              last_wrong_at: new Date().toISOString(),
              next_review_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            }, { onConflict: "user_id,module,source_key" });
          }
        } catch (e) {
          console.warn("[mistakes] save failed", e);
        }
      }
    }
  }

  async function settleStage() {
    if (!card || stageDone[stageKey as keyof typeof stageDone]) return;
    setStageDone((d) => ({ ...d, [stageKey]: true }));
    const allRight = correctCount === visibleQuiz.length;
    let bonus = 0;
    if (allRight) bonus = stage === 3 ? 5 : stage === 5 ? 10 : 20;
    if (authed && bonus > 0) {
      const r = await awardCoins(bonus, `card_quiz_${stage}_perfect`);
      if (r?.awarded) setCoinsEarned((c) => c + r.awarded);
    } else if (!authed && bonus > 0) {
      setCoinsEarned((c) => c + bonus);
    }
    // First-completion bonus: peak-end anchor. award_for_item dedupes by item_id,
    // so the user only ever gets this +5 the very first time they finish stage 3
    // on this card (no farming, no abuse).
    if (authed && stage === 3) {
      try {
        const { data: r2 } = await supabase.rpc("award_for_item", {
          _amount: 5,
          _source: "card_first_complete",
          _item_id: `${card.id}:first_complete`,
          _module: "card_quiz",
        });
        const row: any = Array.isArray(r2) ? r2[0] : r2;
        if (row?.awarded > 0) setCoinsEarned((c) => c + row.awarded);
      } catch {}
      // Reward the friend who shared this card (once per viewer per card)
      if (refUserId) {
        try {
          await supabase.rpc("award_referrer", {
            _ref_user_id: refUserId,
            _card_id: card.id,
            _amount: 2,
          });
        } catch {}
      }
    }
    // Persist attempt (works for guest + logged-in via RLS)
    try {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("card_attempts").insert({
        card_id: card.id,
        user_id: u?.user?.id ?? null,
        guest_token: u?.user ? null : getGuestCardToken(),
        total_questions: visibleQuiz.length,
        correct_count: correctCount,
        score_pct: Math.round((correctCount / visibleQuiz.length) * 100),
        coins_awarded: coinsEarned + bonus,
        stage: `s${stage}`,
      });
    } catch (e) {
      console.warn("[card_attempts] insert failed", e);
    }
    if (!authed) setSavedCTA(true);
  }

  // Auto-settle the moment a stage is just completed
  if (justSettled) { void settleStage(); }

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
          🎯 挑战测试 · 第 {stage} 关
          <span className="ml-auto text-[11px] normal-case tracking-normal text-primary font-bold">
            {coinsEarned > 0 && `💰 已获 ${coinsEarned} 金币`}
          </span>
        </p>
        {/* Difficulty preview — reduces drop-off by setting expectations */}
        {(() => {
          const easy = card.quiz.filter((q) => (q.difficulty ?? 0) <= 3).length;
          const hard = card.quiz.filter((q) => (q.difficulty ?? 0) >= 8).length;
          if (card.quiz.length === 0) return null;
          return (
            <div className="mb-3 px-3 py-2 rounded-md bg-muted/40 border border-border text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>📊 共 {card.quiz.length} 题</span>
              {easy > 0 && <span>· {easy} 道简单</span>}
              {hard > 0 && <span>· {hard} 道挑战</span>}
              {cardStats && cardStats.attempts >= 3 && (
                <span>· 已有 {cardStats.attempts} 人挑战，平均正确率 <strong className="text-foreground">{cardStats.avgPct}%</strong></span>
              )}
            </div>
          );
        })()}
        <div className="space-y-3">
            {visibleQuiz.map((q, i) => (
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
                        onClick={() => pickAnswer(i, j)}
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

        {/* Stage settlement — appears the moment all visible questions are answered */}
        {stageComplete && (
          <Card className="mt-4 p-6 text-center bg-gradient-to-br from-primary/15 via-primary/5 to-background border-primary shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Trophy className="w-12 h-12 mx-auto text-primary mb-2" />
            <p className="text-2xl font-extrabold mb-1">
              {correctCount === visibleQuiz.length ? "🎉 全部答对！" : `答对 ${correctCount}/${visibleQuiz.length}`}
            </p>
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: visibleQuiz.length }).map((_, i) => (
                <span key={i} className={`text-xl ${i < correctCount ? "" : "grayscale opacity-30"}`}>⭐</span>
              ))}
            </div>
            {coinsEarned > 0 && (
              <p className="text-base font-bold text-primary mb-3">💰 共获得 {coinsEarned} 金币</p>
            )}

            {/* Progression: stage 3 → 5 → 10 */}
            {stage === 3 && card.quiz.length >= 5 && (
              <Button
                size="lg"
                className="w-full h-12 text-base mt-2"
                onClick={() => setStage(5)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                再战 2 题（全对再得 +10）→
              </Button>
            )}
            {stage === 5 && card.quiz.length >= 10 && (
              <Button
                size="lg"
                className="w-full h-12 text-base mt-2"
                onClick={() => setStage(10)}
              >
                <Trophy className="w-4 h-4 mr-2" />
                冲刺 5 题精通章（全对 +20）🏆
              </Button>
            )}
            {stage === 10 && (
              <p className="text-sm text-muted-foreground mt-1">
                你已完成精通章，了不起！🏆
              </p>
            )}

            {/* Guest CTA: register to keep score */}
            {!authed && savedCTA && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <p className="text-sm font-semibold mb-2">想保留这 {coinsEarned} 金币 + 喂宠物吗？</p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/auth?redirect=/q/${slug}`)}
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  注册 1 秒领取金币 + 永久保存
                </Button>
                <p className="text-[11px] text-muted-foreground mt-2">注册后金币自动到账，可去给宠物买东西</p>
              </div>
            )}
            {authed && (
              <p className="text-[11px] text-muted-foreground mt-3">金币已入账，去 🐾 喂宠物吧</p>
            )}
          </Card>
        )}
      </section>

      {/* Speak / Ask AI placeholders (locked for guests) */}
      <section className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-12"
          disabled={!ttsText(card)}
          onClick={async () => {
            const text = ttsText(card);
            if (!text) {
              toast.info("这张卡片没有英文例句可朗读");
              return;
            }
            try {
              await speak(text, { accent: "US" });
            } catch (e) {
              console.error("speak failed", e);
              toast.error("发音播放失败，请稍后再试");
            }
          }}
        >
          <Volume2 className="w-4 h-4 mr-2" />跟读发音
        </Button>
        <Button
          variant="outline"
          className="h-12"
          onClick={() => {
            if (!authed) {
              toast.info("登录后即可向 AI 追问这张卡片");
              navigate(`/auth?next=/q/${card.slug}`);
              return;
            }
            const seed = `请就这张知识卡继续讲解：\n问题：${card.question}\n要点：${card.short_answer}`;
            navigate(`/ask?q=${encodeURIComponent(seed)}`);
          }}
        >
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

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">扫码挑战 3 题</DialogTitle>
            <DialogDescription className="text-center">
              二维码用于扫码打开；要在微信聊天里显示标题/封面/描述，请发送下方链接
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {qrDataUrl && (
              <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-border">
                <img
                  src={qrDataUrl}
                  alt="分享二维码"
                  className="block w-[280px] h-[280px]"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            )}
            {myUserId && (
              <p className="text-[11px] text-center text-primary font-medium">
                💡 朋友扫码答完题，你也能得金币（每张卡每人 +2）
              </p>
            )}
            <p className="text-xs text-muted-foreground break-all text-center px-2">
              {shareUrl}
            </p>
            {isWeChat && (
              <p className="text-xs text-center text-muted-foreground px-2">
                微信内网页按钮不能直接发出消息：点“复制链接”后粘贴到聊天窗口，或用右上角菜单分享。
              </p>
            )}
            <div className="flex gap-2 w-full">
              <Button onClick={copyLink} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />复制链接
              </Button>
              <Button onClick={nativeShare} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />{isWeChat ? "复制去微信发" : "分享"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}