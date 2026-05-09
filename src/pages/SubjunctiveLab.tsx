import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { bumpMastery, recordAttempt } from "@/lib/gaokaoMastery";
import { recordGrammarAttempt } from "@/lib/grammarMastery";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";

/**
 * Wraps the standalone subjunctive-mood HTML in an iframe and bridges
 * its scoring events into the site-wide gaokao mastery system.
 */
export default function SubjunctiveLab() {
  const ref = useRef<HTMLIFrameElement>(null);
  // Active sub-level reported by the iframe via postMessage. Null when on the menu.
  const [activeLevel, setActiveLevel] = useState<{ id: string; title: string } | null>(null);

  // Register this page with the global AI assistant.
  // Free mode: user can ask anything about subjunctive concepts at any time;
  // strict prompt prevents the AI from revealing specific question answers.
  useRegisterAssistant({
    context: "subjunctive",
    ref: activeLevel ? `lab:${activeLevel.id}` : "lab",
    topic: activeLevel
      ? `虚拟语气 · ${activeLevel.title}`
      : "虚拟语气 (Subjunctive Mood)",
    mode: "free",
    unlocked: true,
    pageTitle: activeLevel
      ? `💬 小月 · ${activeLevel.title} 答疑`
      : "💬 小月 · 虚拟语气答疑",
  });

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.source !== "subjunctive-lab") return;
      const { type, payload } = data;
      if (type === "attempt") {
        const isCorrect = !!payload?.isCorrect;
        const qId = payload?.mistake?.qId
          ? `subjunctive_q_${payload.mistake.qId}`
          : `subjunctive_${payload?.kind || "exam"}`;
        // record granular attempt + bump mastery on the broader point
        recordAttempt({ questionType: "grammar", questionId: qId, isCorrect }).catch(() => {});
        bumpMastery({
          itemType: "grammar_question",
          itemId: qId,
          isCorrect,
        }).catch(() => {});
        // Also feed the new grammar-points mastery panel
        const lid = payload?.mistake?.levelId ?? payload?.levelId;
        if (lid != null) {
          recordGrammarAttempt(`subj-lv${String(lid)}`, isCorrect);
        }
      } else if (type === "level_complete") {
        const levelId = String(payload?.levelId ?? "");
        const score = Number(payload?.score ?? 0);
        const total = Number(payload?.total ?? 5);
        const passed = total > 0 && score / total >= 0.6;
        bumpMastery({
          itemType: "grammar_point",
          itemId: `subjunctive_lv${levelId}`,
          isCorrect: passed,
        }).catch(() => {});
        // Strong push to the new mastery model: target = score/total*100
        if (levelId) {
          // Send N attempts: score correct + (total-score) wrong, smoothing toward true rate
          for (let i = 0; i < score; i++) recordGrammarAttempt(`subj-lv${levelId}`, true);
          for (let i = 0; i < total - score; i++) recordGrammarAttempt(`subj-lv${levelId}`, false);
        }
      } else if (type === "state") {
        const lid = payload?.levelId;
        if (lid) {
          setActiveLevel({ id: String(lid), title: String(payload?.levelTitle || `Level ${lid}`) });
        } else {
          setActiveLevel(null);
        }
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <main className="min-h-dvh bg-background">
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
        <Link
          to="/gaokao/grammar"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> 返回语法专项
        </Link>
        <div className="ml-auto text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          虚拟语气全攻克 · 实时同步学习中心
        </div>
      </div>
      <iframe
        ref={ref}
        src="/grammar-lab/subjunctive-mood.html"
        title="虚拟语气全攻克"
        className="block h-[calc(100dvh-44px)] w-full border-0"
      />
    </main>
  );
}
