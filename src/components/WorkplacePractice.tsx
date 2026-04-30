import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Headphones,
  MessageSquare,
  Mic,
  Volume2,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Trophy,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { speak, stopSpeaking } from "@/lib/speak";
import { supabase } from "@/integrations/supabase/client";
import { T } from "@/i18n/T";
import type { WorkDialogue } from "@/data/workplace";

type VocabItem = { word: string; pos: string; meaning_cn: string; example: string; example_cn: string; tip?: string };
type Blank = { answer: string; hint: string };
type DictItem = { lineIndex: number; sentence: string; blanks: Blank[] };
type Seed = { setting: string; userRole: string; aiRole: string; openingLine: string; goals: string[] };
type Feedback = { score: number; grammar: string; vocabulary: string; naturalness: string; suggestion: string };
type ChatTurn = { role: "user" | "assistant"; content: string; feedback?: Feedback };

type Stage = "intro" | "vocab" | "dict" | "rp" | "summary";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const PUBLISHABLE = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function callPractice(body: any) {
  const url = `https://${PROJECT_ID}.supabase.co/functions/v1/workplace-practice`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: PUBLISHABLE,
      Authorization: `Bearer ${PUBLISHABLE}`,
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || `HTTP ${resp.status}`);
  return data;
}

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9'\-\s]/g, "").replace(/\s+/g, " ").trim();

export const WorkplacePractice = ({ dialogue, catKey }: { dialogue: WorkDialogue; catKey: string }) => {
  const [stage, setStage] = useState<Stage>("intro");

  // ---------- VOCAB ----------
  const [vocab, setVocab] = useState<VocabItem[] | null>(null);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [vocabError, setVocabError] = useState<string | null>(null);
  const [vocabIdx, setVocabIdx] = useState(0);
  const [vocabFlipped, setVocabFlipped] = useState(false);
  const [vocabKnown, setVocabKnown] = useState<Record<number, boolean>>({});

  // ---------- DICTATION ----------
  const [dict, setDict] = useState<DictItem[] | null>(null);
  const [dictLoading, setDictLoading] = useState(false);
  const [dictError, setDictError] = useState<string | null>(null);
  const [dictIdx, setDictIdx] = useState(0);
  const [dictAnswers, setDictAnswers] = useState<Record<string, string>>({});
  const [dictRevealed, setDictRevealed] = useState<Record<number, boolean>>({});
  const [dictPlays, setDictPlays] = useState<Record<number, number>>({});
  const [dictResults, setDictResults] = useState<Record<number, { correct: number; total: number }>>({});

  // ---------- ROLE-PLAY ----------
  const [seed, setSeed] = useState<Seed | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [rpInput, setRpInput] = useState("");
  const [rpBusy, setRpBusy] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat.length, rpBusy]);

  // ===== Scores =====
  const vocabScore = useMemo(
    () => ({
      total: vocab?.length ?? 0,
      correct: Object.values(vocabKnown).filter(Boolean).length,
    }),
    [vocab, vocabKnown],
  );
  const dictScore = useMemo(() => {
    let c = 0, t = 0;
    Object.values(dictResults).forEach((r) => { c += r.correct; t += r.total; });
    return { correct: c, total: t };
  }, [dictResults]);
  const rpScore = useMemo(() => {
    const fbs = chat.filter((c) => c.role === "user" && c.feedback).map((c) => c.feedback!.score);
    if (!fbs.length) return { avg: 0, turns: 0 };
    return { avg: Math.round(fbs.reduce((a, b) => a + b, 0) / fbs.length), turns: fbs.length };
  }, [chat]);

  // ===== Stage starters =====
  const startVocab = async () => {
    setStage("vocab");
    if (vocab) return;
    setVocabLoading(true); setVocabError(null);
    try {
      const data = await callPractice({ mode: "vocab", dialogue });
      setVocab(data.items ?? []);
    } catch (e) { setVocabError(e instanceof Error ? e.message : "Failed"); }
    finally { setVocabLoading(false); }
  };
  const startDict = async () => {
    setStage("dict");
    if (dict) return;
    setDictLoading(true); setDictError(null);
    try {
      const data = await callPractice({ mode: "dictation", dialogue });
      setDict(data.items ?? []);
    } catch (e) { setDictError(e instanceof Error ? e.message : "Failed"); }
    finally { setDictLoading(false); }
  };
  const startRoleplay = async () => {
    setStage("rp");
    if (seed) return;
    setSeedLoading(true); setSeedError(null);
    try {
      const s: Seed = await callPractice({ mode: "roleplay_seed", dialogue });
      setSeed(s);
      setChat([{ role: "assistant", content: s.openingLine }]);
      setTimeout(() => speak(s.openingLine), 120);
    } catch (e) { setSeedError(e instanceof Error ? e.message : "Failed"); }
    finally { setSeedLoading(false); }
  };

  // ===== Dictation helpers =====
  const playDict = (i: number) => {
    if (!dict) return;
    const used = dictPlays[i] ?? 0;
    if (used >= 3) return;
    setDictPlays((p) => ({ ...p, [i]: used + 1 }));
    speak(dict[i].sentence);
  };
  const checkDict = (i: number) => {
    if (!dict) return;
    const item = dict[i];
    let correct = 0;
    item.blanks.forEach((b, bi) => {
      const val = dictAnswers[`${i}:${bi}`] ?? "";
      if (norm(val) === norm(b.answer)) correct++;
    });
    setDictResults((r) => ({ ...r, [i]: { correct, total: item.blanks.length } }));
    setDictRevealed((r) => ({ ...r, [i]: true }));
  };

  // ===== Role-play =====
  const sendRp = async () => {
    if (!seed || !rpInput.trim() || rpBusy) return;
    const userTurn = rpInput.trim();
    setRpInput("");
    const newChat: ChatTurn[] = [...chat, { role: "user", content: userTurn }];
    setChat(newChat);
    setRpBusy(true);
    try {
      const data = await callPractice({
        mode: "roleplay_grade",
        dialogue,
        seed,
        history: newChat.slice(0, -1).map((c) => ({ role: c.role, content: c.content })),
        userTurn,
      });
      setChat((cur) => {
        const updated = [...cur];
        // attach feedback to the user turn (last)
        for (let k = updated.length - 1; k >= 0; k--) {
          if (updated[k].role === "user") { updated[k] = { ...updated[k], feedback: data.feedback }; break; }
        }
        updated.push({ role: "assistant", content: data.reply });
        return updated;
      });
      setTimeout(() => speak(data.reply), 100);
    } catch (e) {
      setChat((cur) => [...cur, { role: "assistant", content: `⚠️ ${e instanceof Error ? e.message : "Error"}` }]);
    } finally { setRpBusy(false); }
  };

  // ===== Persist on summary =====
  const persistedRef = useRef(false);
  useEffect(() => {
    if (stage !== "summary" || persistedRef.current) return;
    persistedRef.current = true;
    void (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth?.user?.id;
        if (!uid) return;
        const v = vocabScore, d = dictScore, r = rpScore;
        const totalSlots = (v.total || 1) + (d.total || 1) + (r.turns ? 1 : 0.0001);
        const score = (
          (v.total ? v.correct / v.total : 0) +
          (d.total ? d.correct / d.total : 0) +
          (r.turns ? r.avg / 100 : 0)
        ) / Math.max(1, [v.total, d.total, r.turns].filter(Boolean).length);
        await supabase.from("workplace_practice").upsert({
          user_id: uid,
          dialogue_id: dialogue.id,
          cat_key: catKey,
          vocab_score: v.correct,
          vocab_total: v.total,
          dictation_score: d.correct,
          dictation_total: d.total,
          roleplay_score: r.avg,
          roleplay_turns: r.turns,
          mastery: Math.round(score * 100) / 100,
          attempts: 1,
          last_payload: { vocab, dict, chat },
        } as any, { onConflict: "user_id,dialogue_id" });
      } catch (e) { console.warn("persist workplace practice", e); }
    })();
  }, [stage]);

  // ===== UI =====
  return (
    <section className="mt-10 rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-card md:p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-grad-title text-white shadow-tile">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold md:text-2xl"><T>课后训练</T></h3>
          <p className="text-sm text-muted-foreground"><T>词汇 · 听写 · AI 角色扮演</T></p>
        </div>
      </div>

      {/* Stage tabs */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        {([
          { k: "vocab", label: "词汇", icon: BookOpen, on: startVocab },
          { k: "dict", label: "听力填空", icon: Headphones, on: startDict },
          { k: "rp", label: "AI 对练", icon: MessageSquare, on: startRoleplay },
        ] as const).map(({ k, label, icon: Icon, on }) => {
          const active = stage === k;
          return (
            <button
              key={k}
              onClick={on}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-3 text-xs font-bold transition ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Icon className="size-5" />
              <T>{label}</T>
            </button>
          );
        })}
      </div>

      {stage === "intro" && (
        <div className="space-y-3 rounded-2xl bg-secondary/40 p-5 text-sm leading-relaxed">
          <p className="font-semibold text-foreground"><T>仅听一遍是不够的。完成训练才能真正掌握这一篇职场对话：</T></p>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>📚 <T>词汇卡片：从对话中提取关键商务表达 + 例句</T></li>
            <li>🎧 <T>听力填空：再听一遍，写下关键词，强化听辨</T></li>
            <li>💬 <T>AI 角色扮演：用刚学的表达和 AI 实战对话，AI 即时点评你的表达</T></li>
          </ul>
          <p className="text-muted-foreground"><T>完成后会保存掌握度，弱项会自动安排复习。</T></p>
          <button
            onClick={startVocab}
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-grad-title px-5 py-3 text-sm font-bold text-white shadow-tile hover:opacity-90"
          >
            <T>开始训练</T> <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {/* ============ VOCAB ============ */}
      {stage === "vocab" && (
        <div>
          {vocabLoading && <Spinner label="正在生成词汇卡片..." />}
          {vocabError && <ErrorBox msg={vocabError} onRetry={() => { setVocab(null); startVocab(); }} />}
          {vocab && vocab[vocabIdx] && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>{vocabIdx + 1} / {vocab.length}</span>
                <span><T>认识</T>: {vocabScore.correct} / {vocab.length}</span>
              </div>
              <div
                onClick={() => setVocabFlipped((f) => !f)}
                className="cursor-pointer rounded-3xl border-2 border-primary/20 bg-grad-title p-7 text-white shadow-tile transition hover:scale-[1.01]"
              >
                <div className="mb-3 text-[11px] font-bold uppercase tracking-wider opacity-75">{vocab[vocabIdx].pos}</div>
                <div className="text-3xl font-extrabold md:text-4xl">{vocab[vocabIdx].word}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); speak(vocab[vocabIdx].word); }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm hover:bg-white/30"
                >
                  <Volume2 className="size-3.5" /> <T>发音</T>
                </button>
                {vocabFlipped && (
                  <div className="mt-5 space-y-2 rounded-2xl bg-white/15 p-4 text-sm backdrop-blur-sm">
                    <p className="text-base font-bold">{vocab[vocabIdx].meaning_cn}</p>
                    <p className="italic">"{vocab[vocabIdx].example}"</p>
                    <p className="text-xs opacity-90">{vocab[vocabIdx].example_cn}</p>
                    {vocab[vocabIdx].tip && (
                      <p className="mt-2 rounded-lg bg-white/20 px-2 py-1 text-xs">💡 {vocab[vocabIdx].tip}</p>
                    )}
                  </div>
                )}
                {!vocabFlipped && (
                  <p className="mt-5 text-xs opacity-80"><T>点击卡片查看释义</T></p>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setVocabKnown((k) => ({ ...k, [vocabIdx]: false }));
                    advanceVocab();
                  }}
                  className="rounded-2xl border-2 border-rose-300 bg-rose-50 py-3 text-sm font-bold text-rose-700 hover:bg-rose-100"
                >
                  <XCircle className="mr-1 inline size-4" /> <T>还不熟</T>
                </button>
                <button
                  onClick={() => {
                    setVocabKnown((k) => ({ ...k, [vocabIdx]: true }));
                    advanceVocab();
                  }}
                  className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                >
                  <CheckCircle2 className="mr-1 inline size-4" /> <T>认识</T>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ DICTATION ============ */}
      {stage === "dict" && (
        <div>
          {dictLoading && <Spinner label="正在生成听力题..." />}
          {dictError && <ErrorBox msg={dictError} onRetry={() => { setDict(null); startDict(); }} />}
          {dict && dict[dictIdx] && (() => {
            const item = dict[dictIdx];
            const plays = dictPlays[dictIdx] ?? 0;
            const playsLeft = 3 - plays;
            const revealed = dictRevealed[dictIdx];
            const result = dictResults[dictIdx];
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>{dictIdx + 1} / {dict.length}</span>
                  <span><T>得分</T>: {dictScore.correct} / {dictScore.total}</span>
                </div>
                <button
                  onClick={() => playDict(dictIdx)}
                  disabled={playsLeft <= 0 || revealed}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white shadow-tile transition ${
                    playsLeft <= 0 || revealed ? "cursor-not-allowed bg-muted-foreground/40" : "bg-grad-title hover:opacity-90"
                  }`}
                >
                  <Volume2 className="size-5" /> <T>播放音频</T> ({plays}/3)
                </button>
                <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                  {revealed ? (
                    <p className="text-base leading-relaxed md:text-lg">
                      {item.sentence.split(/\s+/).map((w, wi) => {
                        const isAnswer = item.blanks.some((b) => norm(b.answer).split(" ").includes(norm(w)));
                        return (
                          <span key={wi} className={isAnswer ? "rounded bg-primary/20 px-1 font-bold text-primary" : ""}>
                            {w}{wi < item.sentence.split(/\s+/).length - 1 ? " " : ""}
                          </span>
                        );
                      })}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground"><T>请仔细听后填写下方关键词：</T></p>
                  )}
                </div>
                <div className="space-y-3">
                  {item.blanks.map((b, bi) => {
                    const key = `${dictIdx}:${bi}`;
                    const val = dictAnswers[key] ?? "";
                    const isCorrect = revealed && norm(val) === norm(b.answer);
                    return (
                      <div key={bi}>
                        <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                          #{bi + 1} · <T>{b.hint}</T>
                        </label>
                        <input
                          value={val}
                          onChange={(e) => setDictAnswers((a) => ({ ...a, [key]: e.target.value }))}
                          disabled={revealed}
                          placeholder="type the word you heard..."
                          className={`w-full rounded-xl border-2 bg-background px-4 py-3 text-base outline-none transition ${
                            revealed
                              ? isCorrect
                                ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                                : "border-rose-400 bg-rose-50 text-rose-900"
                              : "border-border focus:border-primary"
                          }`}
                        />
                        {revealed && !isCorrect && (
                          <p className="mt-1 text-xs font-semibold text-emerald-700">✓ {b.answer}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!revealed ? (
                  <button
                    onClick={() => checkDict(dictIdx)}
                    className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
                  >
                    <T>提交答案</T>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (dictIdx + 1 < (dict?.length ?? 0)) setDictIdx(dictIdx + 1);
                      else startRoleplay();
                    }}
                    className="w-full rounded-2xl bg-grad-title py-3 text-sm font-bold text-white hover:opacity-90"
                  >
                    {dictIdx + 1 < (dict?.length ?? 0) ? <T>下一题</T> : <><T>进入 AI 对练</T> <ArrowRight className="ml-1 inline size-4" /></>}
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ============ ROLE PLAY ============ */}
      {stage === "rp" && (
        <div>
          {seedLoading && <Spinner label="AI 正在准备角色扮演..." />}
          {seedError && <ErrorBox msg={seedError} onRetry={() => { setSeed(null); startRoleplay(); }} />}
          {seed && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-grad-title p-4 text-sm text-white shadow-tile">
                <p className="font-bold"><T>{seed.setting}</T></p>
                <p className="mt-1 text-xs opacity-90">👤 {seed.userRole}</p>
                <p className="text-xs opacity-90">🤖 {seed.aiRole}</p>
                {seed.goals?.length > 0 && (
                  <ul className="mt-2 space-y-0.5 text-xs opacity-90">
                    {seed.goals.map((g, i) => <li key={i}>🎯 <T>{g}</T></li>)}
                  </ul>
                )}
              </div>

              <div className="max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl border border-border bg-secondary/20 p-3">
                {chat.map((m, i) => (
                  <div key={i}>
                    <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                      }`}>
                        {m.content}
                        {m.role === "assistant" && (
                          <button onClick={() => speak(m.content)} className="ml-2 inline-flex items-center text-xs opacity-60 hover:opacity-100">
                            <Volume2 className="inline size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {m.feedback && (
                      <div className="ml-auto mt-1.5 max-w-[85%] rounded-xl border-l-4 border-amber-400 bg-amber-50 p-3 text-xs text-amber-900">
                        <div className="mb-1 flex items-center justify-between font-bold">
                          <span>📋 <T>AI 点评</T></span>
                          <span className="rounded-full bg-amber-200 px-2 py-0.5">{m.feedback.score}/100</span>
                        </div>
                        <p>📐 <T>语法</T>: <T>{m.feedback.grammar}</T></p>
                        <p>📚 <T>词汇</T>: <T>{m.feedback.vocabulary}</T></p>
                        <p>💬 <T>地道度</T>: <T>{m.feedback.naturalness}</T></p>
                        <p className="mt-1 rounded bg-white/70 px-2 py-1 italic">💡 {m.feedback.suggestion}</p>
                      </div>
                    )}
                  </div>
                ))}
                {rpBusy && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> <T>AI 正在回复...</T></div>}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <textarea
                  value={rpInput}
                  onChange={(e) => setRpInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendRp(); } }}
                  rows={2}
                  placeholder="Type your reply in English..."
                  disabled={rpBusy}
                  className="flex-1 resize-none rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={sendRp}
                  disabled={rpBusy || !rpInput.trim()}
                  className="rounded-2xl bg-grad-title px-5 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Mic className="size-5" />
                </button>
              </div>

              {rpScore.turns >= 3 && (
                <button
                  onClick={() => setStage("summary")}
                  className="w-full rounded-2xl border-2 border-primary bg-primary/10 py-3 text-sm font-bold text-primary hover:bg-primary/20"
                >
                  <Trophy className="mr-1 inline size-4" /> <T>结束训练 · 查看总结</T>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============ SUMMARY ============ */}
      {stage === "summary" && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-grad-title p-6 text-center text-white shadow-tile">
            <Trophy className="mx-auto mb-2 size-10" />
            <h4 className="text-xl font-extrabold"><T>训练完成！</T></h4>
            <p className="mt-1 text-sm opacity-90"><T>掌握度已保存，弱项会安排复习</T></p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <ScoreTile label="词汇" value={`${vocabScore.correct}/${vocabScore.total}`} />
            <ScoreTile label="听写" value={`${dictScore.correct}/${dictScore.total}`} />
            <ScoreTile label="对练" value={rpScore.turns ? `${rpScore.avg}/100` : "—"} />
          </div>
          <button
            onClick={() => {
              persistedRef.current = false;
              setStage("intro"); setVocabIdx(0); setVocabFlipped(false); setVocabKnown({});
              setDictIdx(0); setDictAnswers({}); setDictRevealed({}); setDictPlays({}); setDictResults({});
              setChat([]); setSeed(null);
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary py-3 text-sm font-bold text-primary hover:bg-primary/10"
          >
            <RefreshCw className="size-4" /> <T>再练一次</T>
          </button>
        </div>
      )}
    </section>
  );

  function advanceVocab() {
    setVocabFlipped(false);
    if (!vocab) return;
    if (vocabIdx + 1 < vocab.length) setVocabIdx(vocabIdx + 1);
    else startDict();
  }
};

const Spinner = ({ label }: { label: string }) => (
  <div className="flex items-center justify-center gap-2 rounded-2xl bg-secondary/40 p-8 text-sm text-muted-foreground">
    <Loader2 className="size-4 animate-spin" /> <T>{label}</T>
  </div>
);

const ErrorBox = ({ msg, onRetry }: { msg: string; onRetry: () => void }) => (
  <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 text-sm text-rose-900">
    <p className="font-bold">⚠️ <T>加载失败</T></p>
    <p className="mt-1 text-xs">{msg}</p>
    <button onClick={onRetry} className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700">
      <T>重试</T>
    </button>
  </div>
);

const ScoreTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border-2 border-primary/20 bg-secondary/40 p-4">
    <p className="text-xs font-semibold text-muted-foreground"><T>{label}</T></p>
    <p className="mt-1 text-2xl font-extrabold text-primary">{value}</p>
  </div>
);