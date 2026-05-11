import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Lock, Volume2, X, RotateCcw, Sparkles } from "lucide-react";
import BackLink from "@/components/BackLink";
import {
  PRIMARY_ROLE_PLAYS,
  type RolePlay,
  type RolePlayCategory,
} from "@/data/primaryRolePlays";
import { PRIMARY_ROLE_PLAYS_G2 } from "@/data/primaryRolePlaysG2";
import { supabase } from "@/integrations/supabase/client";

const CATEGORY_META: Record<RolePlayCategory, { label: string; emoji: string }> = {
  festival: { label: "过节",   emoji: "🎉" },
  school:   { label: "在学校", emoji: "🏫" },
  family:   { label: "在家里", emoji: "🏡" },
  friends:  { label: "和朋友", emoji: "🧒" },
  public:   { label: "在外面", emoji: "🌆" },
};
const CATEGORY_ORDER: RolePlayCategory[] = ["festival", "school", "family", "friends", "public"];
const DIFFICULTY_LABEL = { 1: "简单", 2: "一般", 3: "有点难" } as const;

function speak(text: string, rate = 0.9) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

const LOCAL_KEY = "primary_roleplay_completion_v1";
function loadLocal(): Record<string, { last_choice_correct: boolean; play_count: number }> {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); } catch { return {}; }
}
function saveLocal(map: Record<string, { last_choice_correct: boolean; play_count: number }>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

export default function PrimaryRolePlays() {
  const [params] = useSearchParams();
  const isG2 = params.get("grade") === "2";
  const DATA = isG2 ? PRIMARY_ROLE_PLAYS_G2 : PRIMARY_ROLE_PLAYS;
  const [completed, setCompleted] = useState<Record<string, { last_choice_correct: boolean; play_count: number }>>(() => loadLocal());
  const [uid, setUid] = useState<string | null>(null);
  const [open, setOpen] = useState<RolePlay | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    document.title = "和 Spark 演一段 · 角色扮演 | FluentPath";
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;
      setUid(userId);
      if (userId) {
        const { data } = await supabase
          .from("primary_roleplay_completion")
          .select("roleplay_id,last_choice_correct,play_count")
          .eq("user_id", userId);
        if (data) {
          const map: Record<string, { last_choice_correct: boolean; play_count: number }> = {};
          for (const r of data as any[]) {
            map[r.roleplay_id] = { last_choice_correct: !!r.last_choice_correct, play_count: r.play_count ?? 1 };
          }
          // merge with local (server wins)
          const merged = { ...loadLocal(), ...map };
          setCompleted(merged);
          saveLocal(merged);
        }
      }
    })();
  }, []);

  const sorted = useMemo(() => [...DATA].sort((a, b) => a.sortOrder - b.sortOrder), [DATA]);
  const completedIds = useMemo(() => new Set(Object.keys(completed)), [completed]);

  // Unlock rule: first scene always unlocked; rp(N+1) unlocks when rp(N) completed.
  function isUnlocked(rp: RolePlay): boolean {
    const idx = sorted.findIndex(r => r.id === rp.id);
    if (idx <= 0) return true;
    const prev = sorted[idx - 1];
    return completedIds.has(prev.id);
  }

  const totalDone = completedIds.size;
  const total = sorted.length;
  const nextRp = sorted.find(rp => !completedIds.has(rp.id)) ?? null;

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map(cat => ({
      cat,
      meta: CATEGORY_META[cat],
      items: DATA.filter(rp => rp.category === cat).sort((a, b) => a.sortOrder - b.sortOrder),
    })).filter(g => g.items.length > 0);
  }, [DATA]);

  // G1 全部完成时,在 G1 主页底部显示 G2 解锁入口
  const g1AllDone = !isG2 && PRIMARY_ROLE_PLAYS.every(rp => completedIds.has(rp.id));

  function start(rp: RolePlay) {
    if (!isUnlocked(rp)) return;
    setOpen(rp);
    setRevealed(0);
    setPicked(null);
    setTimeout(() => {
      setRevealed(1);
      speak(rp.lines[0].text_en);
    }, 200);
  }
  function nextLine() {
    if (!open) return;
    if (revealed < open.lines.length) {
      const next = open.lines[revealed];
      setRevealed(revealed + 1);
      speak(next.text_en);
    }
  }
  async function pickChoice(idx: number) {
    if (!open || picked !== null) return;
    setPicked(idx);
    const c = open.choices[idx];
    speak(c.text_en);
    const prev = completed[open.id];
    const newRec = { last_choice_correct: c.correct, play_count: (prev?.play_count ?? 0) + 1 };
    const merged = { ...completed, [open.id]: newRec };
    setCompleted(merged);
    saveLocal(merged);
    if (uid) {
      try {
        await supabase.from("primary_roleplay_completion").upsert({
          user_id: uid,
          roleplay_id: open.id,
          last_choice_correct: c.correct,
          play_count: newRec.play_count,
          completed_at: new Date().toISOString(),
        });
      } catch { /* offline ok */ }
    }
  }
  function reset() { if (open) start(open); }

  useEffect(() => {
    if (!open && typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, [open]);

  const allRevealed = open && revealed >= open.lines.length;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 pb-24 md:px-6">
      <BackLink to="/primary" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回小学专区
      </BackLink>

      {/* Spark 顶卡 */}
      <section className="rounded-3xl bg-gradient-to-br from-fuchsia-200 via-rose-200 to-amber-200 p-5 text-center shadow-tile dark:from-fuchsia-950/40 dark:via-rose-950/40 dark:to-amber-950/40">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/70 text-5xl shadow-md">🦊</div>
        <p className="mx-auto mt-3 max-w-md text-base font-extrabold leading-snug text-rose-900 dark:text-rose-100">
          "和 Spark 一起演 {total} 个小故事,说说生活里的话!"
        </p>
        <div className="mx-auto mt-3 flex max-w-xs items-center justify-between gap-3 text-xs font-bold text-rose-700 dark:text-rose-200">
          <span>已完成 {totalDone} / {total}</span>
          <span>{nextRp ? `下一个 · ${DIFFICULTY_LABEL[nextRp.difficulty]}` : "全部完成 ✨"}</span>
        </div>
        <div className="mx-auto mt-1.5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/60">
          <div className="h-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 transition-all" style={{ width: `${(totalDone / Math.max(1, total)) * 100}%` }} />
        </div>
      </section>

      {/* 继续演 CTA */}
      {nextRp && (
        <button
          onClick={() => start(nextRp)}
          className="mt-4 w-full rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">🎭 继续演新故事</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold">和 Spark 演 "{nextRp.title_cn}"</div>
              <div className="text-xs opacity-90">你已完成 {totalDone}/{total}</div>
            </div>
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">▶</div>
          </div>
        </button>
      )}

      {/* 分类地图 */}
      <section className="mt-6 space-y-5">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">📚 你的角色扮演地图</div>
        {grouped.map(g => (
          <div key={g.cat}>
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold">
              <span className="text-lg">{g.meta.emoji}</span>
              <span>{g.meta.label}</span>
              <span className="text-xs font-bold text-muted-foreground">· {g.items.length} 个小故事</span>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {g.items.map(rp => {
                const unlocked = isUnlocked(rp);
                const done = completedIds.has(rp.id);
                const lastOk = completed[rp.id]?.last_choice_correct;
                return (
                  <button
                    key={rp.id}
                    disabled={!unlocked}
                    onClick={() => start(rp)}
                    className={`group relative overflow-hidden rounded-2xl p-3 text-left text-white shadow-tile transition ${
                      unlocked
                        ? `bg-gradient-to-br ${rp.bg} hover:-translate-y-0.5`
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-3xl">{rp.emoji}</div>
                      <div className="flex items-center gap-1">
                        {!unlocked && <Lock className="size-3.5" />}
                        {done && <span className="text-base">{lastOk ? "🌟" : "✓"}</span>}
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${unlocked ? "bg-white/25 backdrop-blur-sm" : "bg-card text-muted-foreground"}`}>
                          {DIFFICULTY_LABEL[rp.difficulty]}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm font-extrabold">{rp.title_cn}</div>
                    <div className="text-[10px] font-bold opacity-90">{rp.title_en}</div>
                    <div className="mt-1 line-clamp-1 text-[11px] opacity-90">📖 {rp.scene_cn}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {g1AllDone && (
        <section className="mt-6 rounded-3xl border-2 border-fuchsia-300 bg-gradient-to-br from-fuchsia-100 via-violet-100 to-pink-100 p-4 text-center shadow-tile dark:border-fuchsia-800 dark:from-fuchsia-950/40 dark:via-violet-950/40 dark:to-pink-950/40">
          <div className="text-base font-extrabold text-fuchsia-900 dark:text-fuchsia-100">🎉 G1 角色扮演全部完成!</div>
          <Link
            to="/primary/roleplays?grade=2"
            className="mt-2 inline-block rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-5 py-2 text-sm font-extrabold text-white shadow-md hover:scale-[1.02]"
          >
            去解锁 G2 角色扮演 →
          </Link>
        </section>
      )}

      {/* 剧场弹窗 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className={`bg-gradient-to-r ${open.bg} px-5 pb-3 pt-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{open.emoji}</span>
                  <div>
                    <div className="text-base font-extrabold">{open.title_cn}</div>
                    <div className="text-[10px] font-bold opacity-90">{open.title_en}</div>
                  </div>
                </div>
                <button onClick={() => setOpen(null)} className="grid size-8 place-items-center rounded-full bg-white/20 hover:bg-white/30">
                  <X className="size-4" />
                </button>
              </div>
              <p className="mt-2 rounded-xl bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm">📖 {open.scene_cn}</p>
            </div>

            <div className="max-h-[55vh] space-y-2.5 overflow-y-auto bg-gradient-to-b from-muted/20 to-muted/5 p-4">
              {open.lines.slice(0, revealed).map((line, i) => (
                <div key={i} className={`flex items-end gap-2 ${line.side === "right" ? "flex-row-reverse" : ""}`}>
                  <div className="grid size-9 place-items-center rounded-full bg-card text-xl shadow-sm">{line.emoji}</div>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${
                    line.side === "right" ? "rounded-br-sm bg-emerald-500 text-white" : "rounded-bl-sm bg-card border-2 border-border"
                  }`}>
                    <div className="text-[10px] font-bold opacity-70">{line.speaker}</div>
                    <div className="text-sm font-bold">{line.text_en}</div>
                    <div className="mt-0.5 text-[11px] opacity-80">{line.text_cn}</div>
                    <button onClick={() => speak(line.text_en)} className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${line.side === "right" ? "bg-white/20 hover:bg-white/30" : "bg-muted hover:bg-muted/70"}`}>
                      <Volume2 className="size-2.5" /> 再听
                    </button>
                  </div>
                </div>
              ))}

              {allRevealed && (
                <div className="mt-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-3">
                  <div className="mb-2 text-center text-xs font-extrabold text-primary">🎤 该你说啦！选一句最合适的 ↓</div>
                  <div className="space-y-2">
                    {open.choices.map((c, i) => {
                      const isPicked = picked === i;
                      const showState = picked !== null;
                      return (
                        <button
                          key={i}
                          disabled={picked !== null}
                          onClick={() => pickChoice(i)}
                          className={`w-full rounded-xl border-2 p-2.5 text-left transition ${
                            !showState ? "border-border bg-card hover:border-primary hover:bg-primary/5" :
                            isPicked && c.correct ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" :
                            isPicked && !c.correct ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30" :
                            !isPicked && c.correct ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20" :
                            "border-border bg-card opacity-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-extrabold">{String.fromCharCode(65 + i)}</span>
                            <div className="flex-1">
                              <div className="text-sm font-bold">{c.text_en}</div>
                              <div className="text-[11px] text-muted-foreground">{c.text_cn}</div>
                            </div>
                            {showState && c.correct && <span className="text-lg">✅</span>}
                            {isPicked && !c.correct && <span className="text-lg">💭</span>}
                          </div>
                          {showState && isPicked && (
                            <div className={`mt-1.5 rounded-lg p-1.5 text-[11px] font-bold ${c.correct ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"}`}>{c.feedback_cn}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {picked !== null && (
                    <div className="mt-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 p-3 text-center dark:from-amber-950/40 dark:to-orange-950/40">
                      <div className="text-xs font-extrabold text-amber-800 dark:text-amber-200">
                        {open.choices[picked].correct ? (<><Sparkles className="mr-1 inline size-3" /> 三星演员！太棒啦</>) : "再来一次试试 →"}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t bg-muted/30 p-3">
              <button onClick={reset} className="inline-flex items-center gap-1 rounded-2xl border-2 border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted">
                <RotateCcw className="size-3.5" /> 重来
              </button>
              {!allRevealed ? (
                <button onClick={nextLine} className="flex-1 rounded-2xl bg-primary py-2 text-sm font-extrabold text-primary-foreground hover:bg-primary/90">下一句 →</button>
              ) : (
                <button onClick={() => setOpen(null)} className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-2 text-sm font-extrabold text-white shadow-md hover:scale-[1.02]">完成 ✨</button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
