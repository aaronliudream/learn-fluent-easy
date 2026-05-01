import React, { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Volume2, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speak } from "@/lib/speak";
import { stripTags } from "@/lib/richText";
import { T } from "@/i18n/T";

type ExplanationExample = { en: string; cn: string };
export type Explanation = {
  phrase: string;
  pos?: string;
  meaning_cn: string;
  usage_cn?: string;
  examples?: ExplanationExample[];
  synonyms?: string[];
};

/**
 * Common multi-word phrases worth highlighting/grouping when present in a
 * sentence. Order matters — longer phrases first so they match before their
 * shorter substrings.
 */
const KNOWN_PHRASES: string[] = [
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
          className="rounded px-0.5 transition hover:bg-primary/15 hover:text-primary focus:bg-primary/15 focus:text-primary focus:outline-none"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={6}
        className="w-[300px] max-w-[92vw] p-0"
      >
        <div className="border-b border-border px-4 py-3">
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
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                speak(phrase);
              }}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 transition hover:bg-primary/15 hover:text-primary"
              aria-label="play"
            >
              <Volume2 className="size-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[55vh] overflow-y-auto px-4 py-3">
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
          {data && !loading && (
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                  <BookOpen className="size-3" /> <T>含义</T>
                </div>
                <div className="text-sm leading-relaxed text-foreground">
                  {data.meaning_cn}
                </div>
              </div>
              {data.usage_cn ? (
                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <T>用法</T>
                  </div>
                  <div className="text-sm leading-relaxed text-foreground/90">
                    {data.usage_cn}
                  </div>
                </div>
              ) : null}
              {data.examples && data.examples.length > 0 ? (
                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <T>例句</T>
                  </div>
                  <ul className="space-y-2">
                    {data.examples.map((ex, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-border bg-secondary/40 p-2"
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              speak(ex.en);
                            }}
                            className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20"
                            aria-label="play example"
                          >
                            <Volume2 className="size-3" />
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {ex.en}
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {ex.cn}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {data.synonyms && data.synonyms.length > 0 ? (
                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <T>近义表达</T>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.synonyms.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
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