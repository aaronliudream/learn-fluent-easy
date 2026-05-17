import { T } from "@/i18n/T";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Check, Volume2, Sparkles } from "lucide-react";
import BackLink from "@/components/BackLink";
import { speakKid as speak } from "@/lib/speak";
import { findSightWordsContaining, findStoryBookForSound, markStoryBookReadToday } from "@/lib/phonicsJourney";
import { PHONICS_ITEMS } from "@/data/primaryPhonics";
import { PHONICS_ITEMS_G2 } from "@/data/primaryPhonicsG2";

/** Sound-in-Action — 把刚学的音"用一次":一个含此音的小词 + 一句含此音的例句 + 进绘本。 */
export default function PrimaryPhonicsUse() {
  const { letter = "" } = useParams<{ letter: string }>();
  const [sp] = useSearchParams();
  const grade = Number(sp.get("grade") || "1");
  const isG2 = grade === 2;
  const gradeQ = isG2 ? "?grade=2" : "";
  const nav = useNavigate();

  const item = useMemo(() => {
    const pool = isG2 ? PHONICS_ITEMS_G2 : PHONICS_ITEMS;
    return pool.find((it) => it.letter.toLowerCase() === letter.toLowerCase()) ?? null;
  }, [letter, isG2]);

  const sightWords = useMemo(() => findSightWordsContaining(letter, grade, 4), [letter, grade]);
  const book = useMemo(() => findStoryBookForSound(letter, grade), [letter, grade]);

  // 找一句来自所选绘本中"含此音"的英文句
  const exampleSentence = useMemo(() => {
    if (!book) return null;
    const k = letter.toLowerCase();
    const page = book.pages.find((p) => p.text_en.toLowerCase().includes(k)) ?? book.pages[0];
    return page?.text_en ?? null;
  }, [book, letter]);

  const [picked, setPicked] = useState<string | null>(null);
  const [correctWord, setCorrectWord] = useState<string | null>(sightWords[0]?.word ?? null);
  const [echoed, setEchoed] = useState(false);

  useEffect(() => {
    document.title = `用一下 ${letter} | FluentPath`;
    setCorrectWord(sightWords[0]?.word ?? null);
    setPicked(null);
    setEchoed(false);
  }, [letter, sightWords]);

  const phonicsHref = isG2 ? "/primary/phonics?grade=2" : "/primary/phonics";

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink to={phonicsHref} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回拼读冒险</T>
      </BackLink>

      <header className="mb-4 rounded-3xl bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300 p-5 text-rose-900 shadow-tile dark:text-rose-100 dark:from-amber-900/40 dark:via-orange-900/40 dark:to-rose-900/40">
        <div className="flex items-center gap-3">
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/70 text-4xl font-black shadow-md">
            {item?.letterUpper ?? letter.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80"><T>用一下今天学的音</T></div>
            <div className="text-xl font-extrabold">"<span className="font-mono">{item?.sound ?? `/${letter}/`}</span>" <T>能拼出哪些词?</T></div>
            <div className="mt-1 text-xs opacity-80"><T>Spark:把音用起来,你就真的会啦!</T></div>
          </div>
        </div>
      </header>

      {/* 1) 听音选词 */}
      {sightWords.length >= 2 && correctWord && (
        <section className="mb-4 rounded-2xl border-2 border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-extrabold"><T>① 听一听,这是哪个词?</T></div>
            <button
              onClick={() => speak(correctWord)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
            >
              <Volume2 className="size-3.5" /> <T>再听一遍</T>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sightWords.slice(0, 4).map((w) => {
              const isRight = w.word === correctWord;
              const isPicked = picked === w.word;
              return (
                <button
                  key={w.id}
                  disabled={!!picked}
                  onClick={() => setPicked(w.word)}
                  className={
                    "rounded-xl border-2 px-3 py-3 text-left transition " +
                    (picked === null
                      ? "border-border bg-card hover:border-primary/50"
                      : isRight
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                      : isPicked
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30"
                      : "border-border bg-card opacity-60")
                  }
                >
                  <div className="text-lg font-extrabold">
                    {highlightLetter(w.word, letter)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{w.meaningCn}</div>
                </button>
              );
            })}
          </div>
          {picked && (
            <div className="mt-3 text-xs">
              {picked === correctWord ? (
                <span className="font-bold text-emerald-600">🌟 <T>对啦!这个词里就有刚才的音。</T></span>
              ) : (
                <span className="text-muted-foreground"><T>差一点。正确答案是</T> <b className="text-emerald-600">{correctWord}</b></span>
              )}
            </div>
          )}
        </section>
      )}

      {/* 2) 跟读一句 */}
      {exampleSentence && (
        <section className="mb-4 rounded-2xl border-2 border-border bg-card p-4">
          <div className="mb-2 text-sm font-extrabold"><T>② 跟 Spark 念一句</T></div>
          <div className="rounded-xl bg-amber-50 px-3 py-3 text-center text-lg font-extrabold text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            {highlightLetterInSentence(exampleSentence, letter)}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              onClick={() => speak(exampleSentence)}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-amber-600"
            >
              <Volume2 className="size-4" /> <T>听 Spark 念</T>
            </button>
            <button
              onClick={() => setEchoed(true)}
              disabled={echoed}
              className={
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition " +
                (echoed
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow hover:-translate-y-0.5")
              }
            >
              {echoed ? <><Check className="size-4" /> <T>我念了</T></> : <><Sparkles className="size-4" /> <T>我跟着念了</T></>}
            </button>
          </div>
        </section>
      )}

      {/* 3) 主 CTA — 进绘本 */}
      {book && (
        <button
          onClick={() => {
            markStoryBookReadToday();
            nav(`/primary/reading/read/${book.id}?focus=${letter.toLowerCase()}`);
          }}
          className="w-full rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 text-left text-white shadow-tile transition hover:-translate-y-0.5"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-90"><T>③ 今天的小绘本</T></div>
          <div className="mt-1 flex items-center gap-3">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/25 text-3xl backdrop-blur-sm">
              {book.cover_emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xl font-extrabold">{book.title_cn}</div>
              <div className="text-xs opacity-90"><T>这本里就藏着今天的音 ✨ 我们一起把它找出来</T></div>
            </div>
            <BookOpen className="size-6 shrink-0" />
          </div>
        </button>
      )}

      {!book && (
        <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <T>暂时没有匹配的绘本,先去看看其它绘本吧</T>
          <div className="mt-2">
            <Link to={`/primary/storybooks${gradeQ}`} className="text-primary underline"><T>去拼读绘本书架 →</T></Link>
          </div>
        </div>
      )}
    </main>
  );
}

function highlightLetter(word: string, letter: string) {
  const k = letter.toLowerCase();
  if (!k) return word;
  const lower = word.toLowerCase();
  const idx = lower.indexOf(k);
  if (idx === -1) return word;
  return (
    <>
      {word.slice(0, idx)}
      <span className="text-amber-600 underline decoration-amber-400 decoration-2 underline-offset-2">
        {word.slice(idx, idx + k.length)}
      </span>
      {word.slice(idx + k.length)}
    </>
  );
}

function highlightLetterInSentence(text: string, letter: string) {
  const k = letter.toLowerCase();
  if (!k) return text;
  return text.split(/(\s+)/).map((tok, i) => {
    if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
    return <span key={i}>{highlightLetter(tok, k)} </span>;
  });
}
