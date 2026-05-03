/**
 * MistakeExplainer — deep AI explanation panel that appears when a user
 * gets a vocabulary question wrong. Shows: 词根 + 口诀 + 易混词辨析 +
 * 高考搭配 + 例句 + 针对性提醒.
 *
 * Lazy: only fetches when the user expands it (saves AI cost).
 * Cached per word in-memory for the session.
 */
import { useState } from "react";
import { Loader2, Lightbulb, BookOpen, Sparkles, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import ReportAIButton from "@/components/pet/ReportAIButton";
import ReflectionEnergy from "@/components/ReflectionEnergy";

export interface MistakeWordInput {
  id: string;
  word: string;
  meaning_cn: string;
  pos?: string | null;
  example_en?: string | null;
  example_cn?: string | null;
}

interface DeepExplanation {
  etymology: string;
  mnemonic: string;
  differentiation: { word: string; diff: string }[];
  collocations?: string[];
  example: { en: string; cn: string };
  tip: string;
}

const cache = new Map<string, DeepExplanation>();

export default function MistakeExplainer({
  vocab,
  userAnswer,
  questionKind,
  defaultOpen = false,
}: {
  vocab: MistakeWordInput;
  userAnswer?: string | null;
  questionKind?: string | null;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DeepExplanation | null>(
    () => cache.get(vocab.id) ?? null,
  );

  async function load() {
    if (data || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke(
        "explain-mistake",
        {
          body: {
            word: vocab.word,
            meaning_cn: vocab.meaning_cn,
            pos: vocab.pos,
            example_en: vocab.example_en,
            example_cn: vocab.example_cn,
            user_answer: userAnswer ?? null,
            question_kind: questionKind ?? null,
          },
        },
      );
      if (fnErr) throw fnErr;
      const ex = (res as { explanation?: DeepExplanation })?.explanation;
      if (!ex) throw new Error("AI 未返回结果");
      cache.set(vocab.id, ex);
      setData(ex);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI 讲解失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) load();
  }

  return (
    <div className="mt-3 rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 overflow-hidden">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition hover:bg-amber-500/10"
      >
        <span className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
          <Lightbulb className="size-4" />
          AI 深度讲解（词根 · 口诀 · 辨析）
        </span>
        {open ? <ChevronUp className="size-4 text-amber-600" /> : <ChevronDown className="size-4 text-amber-600" />}
      </button>

      {open && (
        <div className="border-t border-amber-500/20 p-4 animate-fade-in">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> AI 正在分析记忆方法…
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <div>
                {error}
                <button
                  onClick={load}
                  className="ml-2 underline font-semibold"
                >
                  重试
                </button>
              </div>
            </div>
          )}
          {data && (
            <div className="space-y-3 text-sm">
              <Block icon="🌱" title="词根/拆分">{data.etymology}</Block>
              <Block icon="🎭" title="形象口诀">{data.mnemonic}</Block>

              {data.differentiation && data.differentiation.length > 0 && (
                <div>
                  <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    🔍 易混辨析
                  </div>
                  <ul className="space-y-1.5">
                    {data.differentiation.map((d, i) => (
                      <li
                        key={i}
                        className="rounded-lg border bg-card px-3 py-1.5 leading-snug"
                      >
                        <span className="font-mono font-bold text-primary">{d.word}</span>
                        <span className="mx-1.5 text-muted-foreground">·</span>
                        <span>{d.diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.collocations && data.collocations.length > 0 && (
                <div>
                  <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    📚 高考搭配
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.collocations.map((c, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.example && (
                <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-500/5 p-3">
                  <div className="mb-1 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <BookOpen className="size-3" /> 例句
                  </div>
                  <div className="font-mono italic">{data.example.en}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{data.example.cn}</div>
                </div>
              )}

              {data.tip && (
                <div className="rounded-lg bg-fuchsia-500/10 px-3 py-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-bold text-fuchsia-700 dark:text-fuchsia-300">
                    <Sparkles className="size-3" /> 针对你这次的错误
                  </span>
                  <span className="ml-2">{data.tip}</span>
                </div>
              )}
              <div className="flex justify-end">
                <ReportAIButton
                  feature="mistake_explain"
                  sourceId={vocab.id}
                  contentSnippet={`${data.etymology}\n${data.mnemonic}\n${data.tip ?? ""}`}
                />
              </div>
              <ReflectionEnergy
                itemId={vocab.id}
                module={questionKind ?? "vocab"}
                word={vocab.word}
                correctAnswer={vocab.meaning_cn}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Block({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      <div className={cn("leading-relaxed")}>{children}</div>
    </div>
  );
}
