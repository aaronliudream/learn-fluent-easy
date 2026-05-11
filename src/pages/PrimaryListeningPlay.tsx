import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, RotateCcw, Sparkles } from "lucide-react";
import BackLink from "@/components/BackLink";
import { findDialogue } from "@/data/primaryListeningDialogues";
import { supabase } from "@/integrations/supabase/client";

function speak(text: string, rate = 0.9) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

const LOCAL_KEY = "primary_listening_completion_v1";
type CompRec = { questions_correct: number; questions_total: number; play_count: number };
function loadLocal(): Record<string, CompRec> {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); } catch { return {}; }
}
function saveLocal(map: Record<string, CompRec>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

type Phase = "play" | "quiz" | "done";

export default function PrimaryListeningPlay() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const dialogue = useMemo(() => findDialogue(id), [id]);

  const [phase, setPhase] = useState<Phase>("play");
  const [revealed, setRevealed] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (!dialogue) return;
    document.title = `${dialogue.title_cn} · 听力对话 | FluentPath`;
    setPhase("play");
    setRevealed(0);
    setQIdx(0);
    setPickedIdx(null);
    setCorrectCount(0);
    const t = setTimeout(() => {
      setRevealed(1);
      speak(dialogue.lines[0].text_en);
    }, 250);
    return () => clearTimeout(t);
  }, [id, dialogue]);

  useEffect(() => {
    return () => { try { window.speechSynthesis?.cancel(); } catch { /* */ } };
  }, []);

  if (!dialogue) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <BackLink to="/primary/listening" className="text-sm text-muted-foreground">← 返回听力地图</BackLink>
        <p className="mt-6 text-center text-sm text-muted-foreground">找不到这个对话 ({id})</p>
      </main>
    );
  }

  function nextLine() {
    if (revealed < dialogue.lines.length) {
      const next = dialogue.lines[revealed];
      setRevealed(revealed + 1);
      speak(next.text_en);
    }
  }
  const allRevealed = revealed >= dialogue.lines.length;

  function startQuiz() {
    setPhase("quiz");
    setQIdx(0);
    setPickedIdx(null);
  }

  function pick(i: number) {
    if (pickedIdx !== null) return;
    setPickedIdx(i);
    const opt = dialogue.questions[qIdx].options[i];
    if (opt.correct) setCorrectCount(c => c + 1);
  }

  async function nextQuestion() {
    const isLast = qIdx + 1 >= dialogue.questions.length;
    if (isLast) {
      setPhase("done");
      // upsert completion
      try {
        const { data: u } = await supabase.auth.getUser();
        const userId = u?.user?.id ?? null;
        const total = dialogue.questions.length;
        const local = loadLocal();
        const prev = local[dialogue.id];
        const newRec: CompRec = {
          questions_correct: correctCount + (dialogue.questions[qIdx].options[pickedIdx ?? -1]?.correct ? 1 : 0),
          questions_total: total,
          play_count: (prev?.play_count ?? 0) + 1,
        };
        // We've already added the last question's correct via setCorrectCount in pick(),
        // but state update is async — recompute using current pickedIdx for safety.
        const finalCorrect = correctCount; // pick() already updated when answered; use that.
        newRec.questions_correct = finalCorrect;
        local[dialogue.id] = newRec;
        saveLocal(local);
        if (userId) {
          await supabase.from("primary_listening_completion").upsert({
            user_id: userId,
            dialogue_id: dialogue.id,
            questions_correct: finalCorrect,
            questions_total: total,
            play_count: newRec.play_count,
            completed_at: new Date().toISOString(),
          });
        }
      } catch { /* offline ok */ }
      return;
    }
    setQIdx(qIdx + 1);
    setPickedIdx(null);
  }

  function retryAnswer() {
    setPickedIdx(null);
  }

  function replayDialogue() {
    setPhase("play");
    setRevealed(0);
    setQIdx(0);
    setPickedIdx(null);
    setCorrectCount(0);
    setTimeout(() => { setRevealed(1); speak(dialogue.lines[0].text_en); }, 200);
  }

  const q = dialogue.questions[qIdx];
  const picked = pickedIdx !== null ? q?.options[pickedIdx] : null;
  const total = dialogue.questions.length;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink to="/primary/listening" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> 返回听力地图
      </BackLink>

      {/* 标题条 */}
      <div className={`rounded-3xl bg-gradient-to-r ${dialogue.bg} px-5 py-4 text-white shadow-tile`}>
        <div className="flex items-center gap-2">
          <span className="text-3xl">{dialogue.emoji}</span>
          <div>
            <div className="text-xs font-bold opacity-90">{dialogue.themeCn}</div>
            <div className="text-lg font-extrabold">{dialogue.title_cn}</div>
            <div className="text-[11px] font-bold opacity-90">{dialogue.title_en}</div>
          </div>
        </div>
        <p className="mt-2 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-sm">🎬 {dialogue.scene_cn}</p>
      </div>

      {/* 阶段 1:播放对话 */}
      {phase === "play" && (
        <section className="mt-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
          <div className="space-y-2.5">
            {dialogue.lines.slice(0, revealed).map((line, i) => (
              <div key={i} className={`flex items-end gap-2 ${line.side === "right" ? "flex-row-reverse" : ""}`}>
                <div className="grid size-9 place-items-center rounded-full bg-muted text-xl shadow-sm">{line.emoji}</div>
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 shadow-sm ${
                  line.side === "right" ? "rounded-br-sm bg-emerald-500 text-white" : "rounded-bl-sm bg-muted/40 border-2 border-border"
                }`}>
                  <div className="text-[10px] font-bold opacity-70">{line.speaker}</div>
                  <div className="text-sm font-bold">{line.text_en}</div>
                  <div className="mt-0.5 text-[11px] opacity-80">{line.text_cn}</div>
                  <button onClick={() => speak(line.text_en)} className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    line.side === "right" ? "bg-white/20 hover:bg-white/30" : "bg-card hover:bg-muted"
                  }`}>
                    <Volume2 className="size-2.5" /> 再听
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button onClick={replayDialogue} className="inline-flex items-center gap-1 rounded-2xl border-2 border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted">
              <RotateCcw className="size-3.5" /> 重听
            </button>
            {!allRevealed ? (
              <button onClick={nextLine} className="flex-1 rounded-2xl bg-primary py-2 text-sm font-extrabold text-primary-foreground hover:bg-primary/90">
                下一句 →
              </button>
            ) : (
              <button onClick={startQuiz} className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 py-2 text-sm font-extrabold text-white shadow-md hover:scale-[1.01]">
                完成播放,开始测试 →
              </button>
            )}
          </div>
        </section>
      )}

      {/* 阶段 2:测试 */}
      {phase === "quiz" && q && (
        <section className="mt-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-bold text-muted-foreground">第 {qIdx + 1} / {total} 题</div>
            <div className="text-xs font-bold text-emerald-600">已答对 {correctCount}</div>
          </div>
          <div className="rounded-2xl bg-muted/30 p-3">
            <div className="text-base font-extrabold">{q.stem_cn}</div>
            <div className="mt-1 text-xs font-bold text-muted-foreground">{q.stem_en}</div>
          </div>

          <div className="mt-3 space-y-2">
            {q.options.map((opt, i) => {
              const isPicked = pickedIdx === i;
              const showState = pickedIdx !== null;
              return (
                <button
                  key={i}
                  disabled={pickedIdx !== null && !isPicked && !opt.correct}
                  onClick={() => pick(i)}
                  className={`w-full rounded-xl border-2 p-3 text-left transition ${
                    !showState ? "border-border bg-card hover:border-primary hover:bg-primary/5" :
                    isPicked && opt.correct ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" :
                    isPicked && !opt.correct ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30" :
                    !isPicked && opt.correct ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20" :
                    "border-border bg-card opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-extrabold">{String.fromCharCode(65 + i)}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{opt.text_en}</div>
                      <div className="text-[11px] text-muted-foreground">{opt.text_cn}</div>
                    </div>
                    {showState && opt.correct && <span className="text-lg">✅</span>}
                    {isPicked && !opt.correct && <span className="text-lg">💭</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {pickedIdx !== null && picked && (
            <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${
              picked.correct
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
            }`}>
              {picked.correct ? `🌟 完美! ${q.feedback_correct_cn}` : q.feedback_wrong_cn}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            {pickedIdx !== null && !picked?.correct && (
              <button onClick={retryAnswer} className="inline-flex items-center gap-1 rounded-2xl border-2 border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted">
                <RotateCcw className="size-3.5" /> 再试一次
              </button>
            )}
            {pickedIdx !== null && picked?.correct && (
              <button onClick={nextQuestion} className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 py-2 text-sm font-extrabold text-white shadow-md hover:scale-[1.01]">
                {qIdx + 1 >= total ? "查看结果 →" : "下一题 →"}
              </button>
            )}
          </div>
        </section>
      )}

      {/* 阶段 3:总结 */}
      {phase === "done" && (
        <section className="mt-4 rounded-3xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 p-6 text-center shadow-tile dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/80 text-4xl shadow-md">🎉</div>
          <div className="mt-3 text-lg font-extrabold">完成 "{dialogue.title_cn}"</div>
          <div className="mt-2 inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold">
            测试结果:{correctCount} / {total} {correctCount === total ? "全对!" : ""}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-200/70 px-3 py-1 text-xs font-bold text-rose-800">
            <Sparkles className="size-3" /> +5 亲密度
          </div>
          <div className="mt-5 flex items-center justify-center gap-2">
            <button onClick={replayDialogue} className="rounded-2xl border-2 border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted">
              再听一遍
            </button>
            <Link to="/primary/listening" className="rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-sm font-extrabold text-white shadow-md hover:scale-[1.02]">
              返回听力地图
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
