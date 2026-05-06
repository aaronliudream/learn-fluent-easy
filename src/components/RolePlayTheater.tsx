import { useEffect, useState } from "react";
import { Volume2, X, RotateCcw, Sparkles, ChevronRight } from "lucide-react";
import { PRIMARY_ROLE_PLAYS, type RolePlay } from "@/data/primaryRolePlays";

function speak(text: string, rate = 0.9) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

const STAR_KEY = "primary_roleplay_stars_v1";
function loadStars(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(STAR_KEY) || "{}"); } catch { return {}; }
}
function saveStar(id: string, stars: number) {
  const s = loadStars();
  s[id] = Math.max(s[id] || 0, stars);
  localStorage.setItem(STAR_KEY, JSON.stringify(s));
}

export default function RolePlayTheater() {
  const [open, setOpen] = useState<RolePlay | null>(null);
  const [revealed, setRevealed] = useState(0); // 已显示的对话条数
  const [picked, setPicked] = useState<number | null>(null);
  const [stars, setStars] = useState<Record<string, number>>(() => loadStars());

  function start(rp: RolePlay) {
    setOpen(rp);
    setRevealed(0);
    setPicked(null);
    // 自动播放第一句
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

  function pickChoice(idx: number) {
    if (!open || picked !== null) return;
    setPicked(idx);
    const c = open.choices[idx];
    speak(c.text_en);
    if (c.correct) {
      saveStar(open.id, 3);
      setStars(loadStars());
    } else {
      saveStar(open.id, 1);
      setStars(loadStars());
    }
  }

  function reset() {
    if (!open) return;
    start(open);
  }

  // 关闭时停止朗读
  useEffect(() => {
    if (!open && typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, [open]);

  const allRevealed = open && revealed >= open.lines.length;

  return (
    <>
      {/* 入口卡片网格 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PRIMARY_ROLE_PLAYS.map((rp) => {
          const earned = stars[rp.id] || 0;
          return (
            <button
              key={rp.id}
              onClick={() => start(rp)}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${rp.bg} p-4 text-left text-white shadow-tile transition hover:-translate-y-0.5`}
            >
              <span className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full bg-white/20 blur-2xl" />
              <div className="flex items-start justify-between">
                <div className="text-4xl">{rp.emoji}</div>
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((s) => (
                    <span key={s} className={`text-base ${earned >= s ? "" : "opacity-30"}`}>⭐</span>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-base font-extrabold">{rp.title_cn}</div>
              <div className="text-[11px] font-bold opacity-90">{rp.title_en}</div>
              <div className="mt-2 line-clamp-1 text-[11px] opacity-90">📖 {rp.scene_cn}</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                开始扮演 <ChevronRight className="size-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 剧场弹窗 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setOpen(null)}>
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* 顶部场景说明 */}
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

            {/* 对话区 */}
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
                    <button
                      onClick={() => speak(line.text_en)}
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        line.side === "right" ? "bg-white/20 hover:bg-white/30" : "bg-muted hover:bg-muted/70"
                      }`}
                    >
                      <Volume2 className="size-2.5" /> 再听
                    </button>
                  </div>
                </div>
              ))}

              {/* 选择题 */}
              {allRevealed && (
                <div className="mt-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-3">
                  <div className="mb-2 text-center text-xs font-extrabold text-primary">
                    🎤 该你说啦！选一句最合适的 ↓
                  </div>
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
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-extrabold">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <div className="flex-1">
                              <div className="text-sm font-bold">{c.text_en}</div>
                              <div className="text-[11px] text-muted-foreground">{c.text_cn}</div>
                            </div>
                            {showState && c.correct && <span className="text-lg">✅</span>}
                            {isPicked && !c.correct && <span className="text-lg">💭</span>}
                          </div>
                          {showState && isPicked && (
                            <div className={`mt-1.5 rounded-lg p-1.5 text-[11px] font-bold ${
                              c.correct ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                                        : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
                            }`}>{c.feedback_cn}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {picked !== null && (
                    <div className="mt-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 p-3 text-center dark:from-amber-950/40 dark:to-orange-950/40">
                      <div className="flex justify-center gap-1 text-2xl">
                        {[1, 2, 3].map((s) => (
                          <span key={s} className={open.choices[picked].correct || s === 1 ? "" : "opacity-30"}>⭐</span>
                        ))}
                      </div>
                      <div className="mt-1 text-xs font-extrabold text-amber-800 dark:text-amber-200">
                        {open.choices[picked].correct ? (
                          <><Sparkles className="mr-1 inline size-3" /> 三星演员！太棒啦</>
                        ) : (
                          "再来一次试试 3 星 →"
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center gap-2 border-t bg-muted/30 p-3">
              <button onClick={reset} className="inline-flex items-center gap-1 rounded-2xl border-2 border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted">
                <RotateCcw className="size-3.5" /> 重来
              </button>
              {!allRevealed ? (
                <button onClick={nextLine} className="flex-1 rounded-2xl bg-primary py-2 text-sm font-extrabold text-primary-foreground hover:bg-primary/90">
                  下一句 →
                </button>
              ) : (
                <button onClick={() => setOpen(null)} className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 py-2 text-sm font-extrabold text-white shadow-md hover:scale-[1.02]">
                  完成 ✨
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
