import React, { useEffect, useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Volume2, Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { stripTags } from "@/lib/richText";
import { T } from "@/i18n/T";
import { addSavedPhrase, isSaved, removeSavedPhrase, normalizePhrase } from "@/lib/savedPhrases";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type EnCnPair = { en: string; cn: string };
type LiteralWord = { word: string; meaning_cn: string; note_cn?: string };

export type Explanation = {
  phrase: string;
  pos?: string;
  one_line_cn?: string;
  literal?: LiteralWord[];
  scene_cn?: string;
  replies?: EnCnPair[];
  similar?: EnCnPair[];
  tip_cn?: string;
  example?: EnCnPair;
  // Backwards-compat with the v1 schema (still in cache for some users):
  meaning_cn?: string;
  usage_cn?: string;
  examples?: EnCnPair[];
  synonyms?: string[];
};

/**
 * Common multi-word phrases worth highlighting/grouping when present in a
 * sentence. Order matters — longer phrases first so they match before their
 * shorter substrings.
 */
export const KNOWN_PHRASES: string[] = [
  "a side of",
  "a couple of",
  "a piece of",
  "a bit of",
  "kind of",
  "sort of",
  "would you like",
  "i'd like",
  "i would like",
  "would like",
  "looking forward to",
  "look forward to",
  "by the way",
  "as well",
  "as well as",
  "in case",
  "in fact",
  "of course",
  "for sure",
  "no problem",
  "right this way",
  "right away",
  "would you mind",
  "do you mind",
  "could you",
  "would you",
  "instead of",
  "on the side",
  "to go",
  "for here",
  "check please",
  "make sense",
  "makes sense",
  "sounds good",
  "sounds great",
  "you bet",
  "thank you",
  "thanks a lot",
  "no worries",
  "go ahead",
  "hold on",
  "hang on",
  "let me",
  "let's",
  "got it",
  "i see",
  "i guess",
  "in a minute",
  "right now",
  "right here",
  "over there",
  "all right",
  "for someone",
  "for somebody",
  "have you ever",
  "used to",
  "supposed to",
  "going to",
  "wanna",
  "gonna",
  "gotta",
];

type Token =
  | { kind: "text"; text: string }
  | { kind: "tap"; text: string; phrase: string };

/**
 * Tokenize a sentence into a flat list of clickable spans. Each
 * single word becomes a tap target; runs of words that match a known
 * phrase are merged into a single multi-word tap target.
 */
function tokenize(sentence: string): Token[] {
  const clean = stripTags(sentence);
  // Split into words & non-word delimiters but keep delimiters.
  const parts = clean.split(/(\s+|[.,!?;:"'()\-—…])/g).filter((p) => p !== "");
  // Build word-position list to match phrases.
  const wordIdx: number[] = [];
  parts.forEach((p, i) => {
    if (/^[A-Za-z][A-Za-z'\-]*$/.test(p)) wordIdx.push(i);
  });
  // Mark phrase ranges (start..end inclusive in parts indices).
  const phraseRanges: Array<{ from: number; to: number; phrase: string }> = [];
  const lower = parts.map((p) => p.toLowerCase());
  for (const phrase of KNOWN_PHRASES) {
    const words = phrase.split(" ");
    for (let wi = 0; wi <= wordIdx.length - words.length; wi++) {
      let ok = true;
      for (let k = 0; k < words.length; k++) {
        if (lower[wordIdx[wi + k]] !== words[k]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        phraseRanges.push({
          from: wordIdx[wi],
          to: wordIdx[wi + words.length - 1],
          phrase,
        });
        wi += words.length - 1;
      }
    }
  }
  // Sort by start ascending, drop overlaps (keep earlier/longer first).
  phraseRanges.sort((a, b) => a.from - b.from || b.to - a.to);
  const filtered: typeof phraseRanges = [];
  let lastTo = -1;
  for (const r of phraseRanges) {
    if (r.from > lastTo) {
      filtered.push(r);
      lastTo = r.to;
    }
  }
  // Walk parts, emit tokens.
  const out: Token[] = [];
  let i = 0;
  while (i < parts.length) {
    const range = filtered.find((r) => r.from === i);
    if (range) {
      const text = parts.slice(range.from, range.to + 1).join("");
      out.push({ kind: "tap", text, phrase: range.phrase });
      i = range.to + 1;
      continue;
    }
    const p = parts[i];
    if (/^[A-Za-z][A-Za-z'\-]*$/.test(p)) {
      out.push({ kind: "tap", text: p, phrase: p.toLowerCase() });
    } else {
      out.push({ kind: "text", text: p });
    }
    i++;
  }
  return out;
}

function ExplainPopover({
  phrase,
  contextText,
  children,
}: {
  phrase: string;
  contextText: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Explanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [savingBusy, setSavingBusy] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    isSaved(phrase).then((v) => {
      if (!cancelled) setSaved(v);
    });
    return () => {
      cancelled = true;
    };
  }, [open, phrase]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (savingBusy) return;
    setSavingBusy(true);
    try {
      if (saved) {
        await removeSavedPhrase(normalizePhrase(phrase));
        setSaved(false);
        toast({ title: "已从收藏中移除" });
      } else {
        await addSavedPhrase({
          phrase,
          contextText,
          source: typeof window !== "undefined" ? window.location.pathname : null,
        });
        setSaved(true);
        toast({ title: "已加入我的收藏" });
      }
    } catch (err: any) {
      if (err?.message === "not_signed_in") {
        toast({
          title: "请先登录",
          description: "登录后即可收藏短语到学习列表",
        });
        nav("/auth");
      } else {
        console.warn("[saved] toggle error", err);
        toast({ title: "操作失败,请稍后再试", variant: "destructive" });
      }
    } finally {
      setSavingBusy(false);
    }
  };

  const fetchExplanation = async () => {
    if (data || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data: resp, error: fnErr } = await supabase.functions.invoke(
        "explain-phrase",
        { body: { phrase, context: contextText } },
      );
      if (fnErr) throw fnErr;
      if (resp?.error) throw new Error(resp.error);
      setData(resp.explanation as Explanation);
    } catch (e: any) {
      console.warn("[explain-phrase] failed", e);
      setError(e?.message || "failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) fetchExplanation();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded-sm border-b border-dotted border-transparent transition hover:border-primary/60 hover:text-primary focus:border-primary focus:text-primary focus:outline-none"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={6}
        className="w-[340px] max-w-[94vw] p-0"
      >
        <div className="border-b border-border bg-primary/5 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-base font-bold leading-tight text-foreground">
                {phrase}
              </div>
              {data?.pos ? (
                <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {data.pos}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={toggleSave}
                disabled={savingBusy}
                aria-label={saved ? "Remove from favorites" : "Save phrase"}
                className={`grid size-8 place-items-center rounded-full transition ${
                  saved
                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-300"
                    : "bg-secondary text-foreground/70 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-500/20 dark:hover:text-amber-300"
                }`}
              >
                <Star className={`size-4 ${saved ? "fill-current" : ""}`} />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  speak(phrase);
                }}
                className="grid size-8 place-items-center rounded-full bg-secondary text-foreground/70 transition hover:bg-primary/15 hover:text-primary"
                aria-label="play"
              >
                <Volume2 className="size-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
          {loading && (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <T>正在生成讲解…</T>
            </div>
          )}
          {error && !loading && (
            <div className="py-2 text-sm text-destructive">
              <T>暂时讲解不出来,请稍后再试。</T>
            </div>
          )}
          {data && !loading && <LessonBody data={data} />}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Section header with emoji + label. */
function SectionHeader({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-primary">
      <span>{emoji}</span>
      <T>{label}</T>
    </div>
  );
}

/** Renders an English line with a 🔊 button + Chinese translation underneath. */
function PlayableEnCn({ en, cn }: EnCnPair) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-2">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          speak(en);
        }}
        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20"
        aria-label="play"
      >
        <Volume2 className="size-3" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{en}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{cn}</div>
      </div>
    </div>
  );
}

function LessonBody({ data }: { data: Explanation }) {
  // Normalize v1 → v2 shape so old cached entries still render nicely.
  const oneLine = data.one_line_cn || data.meaning_cn || "";
  const literal = data.literal || [];
  const scene = data.scene_cn || data.usage_cn || "";
  const replies = data.replies || [];
  const similar =
    data.similar ||
    (data.synonyms || []).map((en) => ({ en, cn: "" })).filter((x) => x.en);
  const example =
    data.example ||
    (data.examples && data.examples[0] ? data.examples[0] : undefined);
  const tip = data.tip_cn || "";

  return (
    <div className="space-y-3.5">
      {oneLine ? (
        <div className="rounded-lg bg-primary/8 p-2.5">
          <SectionHeader emoji="🧠" label="一句话解释" />
          <div className="text-sm font-medium leading-relaxed text-foreground">
            👉 {oneLine}
          </div>
        </div>
      ) : null}

      {literal.length > 0 && (
        <div>
          <SectionHeader emoji="🔍" label="逐词理解" />
          <ul className="space-y-1.5">
            {literal.map((w, i) => (
              <li key={i} className="text-sm leading-relaxed">
                <span className="font-semibold text-foreground">{w.word}</span>
                <span className="text-muted-foreground"> = </span>
                <span className="text-foreground/90">{w.meaning_cn}</span>
                {w.note_cn ? (
                  <span className="ml-1 text-xs text-destructive/90">
                    ({w.note_cn})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {scene && (
        <div>
          <SectionHeader emoji="📍" label="典型场景" />
          <div className="text-sm leading-relaxed text-foreground/90">
            {scene}
          </div>
        </div>
      )}

      {replies.length > 0 && (
        <div>
          <SectionHeader emoji="✅" label="你可以这样说" />
          <div className="space-y-1.5">
            {replies.map((r, i) => (
              <PlayableEnCn key={i} en={r.en} cn={r.cn} />
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div>
          <SectionHeader emoji="🔁" label="同义说法" />
          <div className="space-y-1.5">
            {similar.map((r, i) =>
              r.cn ? (
                <PlayableEnCn key={i} en={r.en} cn={r.cn} />
              ) : (
                <span
                  key={i}
                  className="mr-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                >
                  {r.en}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {example && (
        <div>
          <SectionHeader emoji="📝" label="例句" />
          <PlayableEnCn en={example.en} cn={example.cn} />
        </div>
      )}

      {tip && (
        <div className="rounded-lg border border-amber-300/40 bg-amber-50/60 p-2.5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] font-bold text-amber-700 dark:text-amber-300">
            <Sparkles className="size-3" /> <T>高分小细节</T>
          </div>
          <div className="text-sm leading-relaxed text-foreground/90">{tip}</div>
        </div>
      )}
    </div>
  );
}

/**
 * Render a sentence where each word and known phrase is tappable. On tap it
 * shows a small explanation card (meaning, usage, English examples with
 * Chinese translation, and a TTS button).
 */
export function TappableLine({ sentence }: { sentence: string }) {
  const tokens = useMemo(() => tokenize(sentence), [sentence]);
  const contextText = useMemo(() => stripTags(sentence), [sentence]);
  return (
    <span>
      {tokens.map((tok, i) => {
        if (tok.kind === "text") return <span key={i}>{tok.text}</span>;
        return (
          <ExplainPopover key={i} phrase={tok.phrase} contextText={contextText}>
            <span>{tok.text}</span>
          </ExplainPopover>
        );
      })}
    </span>
  );
}