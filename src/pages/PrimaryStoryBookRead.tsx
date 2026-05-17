import { T } from "@/i18n/T";import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Volume2, RotateCcw, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import BackLink from "@/components/BackLink";
import { findBook } from "@/data/primaryStoryBooks";
import { findBookG2 } from "@/data/primaryStoryBooksG2";
import { supabase } from "@/integrations/supabase/client";
import { speak, stopSpeaking } from "@/lib/speak";
import { pickStoryVoice } from "@/lib/storyVoice";
import type { StoryBookPage } from "@/data/primaryStoryBooks";
import { useRegisterAssistant } from "@/contexts/AIAssistantContext";
import { markStoryBookReadToday } from "@/lib/phonicsJourney";
import { StoryBookHeader, StoryBookPageIllustration } from "@/components/storybook/StoryBookReadPanels";

function speakPage(page: StoryBookPage) {
  const v = pickStoryVoice(page.speaker);
  return speak(page.text_en, { voiceId: v.voiceId, speed: v.speed });
}

const LOCAL_KEY = "primary_storybook_completion_v1";
type CompRec = {questions_correct: number;questions_total: number;read_count: number;};
function loadLocal(): Record<string, CompRec> {
  try {return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");} catch {return {};}
}
function saveLocal(map: Record<string, CompRec>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

type Phase = "read" | "quiz" | "done";

export default function PrimaryStoryBookRead() {
  const { id = "" } = useParams();
  const [sp] = useSearchParams();
  const focusLetter = (sp.get("focus") || "").toLowerCase();
  const book = useMemo(() => findBook(id) ?? findBookG2(id), [id]);
  // G2 books have ids sb11..sb20 — keep return links scoped to the right shelf.
  const isG2Book = !!book && !!findBookG2(id);
  const shelfHref = isG2Book ? "/primary/storybooks?grade=2" : "/primary/storybooks";

  const [phase, setPhase] = useState<Phase>("read");
  const [pageIdx, setPageIdx] = useState(0); // 0-based
  const [qIdx, setQIdx] = useState(0);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  // 让小月只回答"当前页/当前题"相关的问题。snapshot 随翻页/换题更新。
  const currentPage = book?.pages[pageIdx];
  const currentQuestion = phase === "quiz" ? book?.questions[qIdx] : null;
  useRegisterAssistant(
    book ?
    {
      context: "primary_storybook_read",
      ref: `${book.id}:${phase}:${phase === "quiz" ? qIdx : pageIdx}`,
      topic: `绘本《${book.title_cn}》${phase === "quiz" ? `· 第 ${qIdx + 1} 题` : `· 第 ${pageIdx + 1} 页`}`,
      mode: "free",
      unlocked: true,
      pageTitle: `💬 小月 · 《${book.title_cn}》答疑`,
      starters:
      phase === "quiz" ?
      [
      "这道题在问什么？",
      "给我一个小提示",
      "这几个选项分别是什么意思？"] :

      [
      "这页里有不认识的单词",
      "这句话怎么读？",
      "这页讲了什么？"],

      snapshot: {
        hint:
        phase === "quiz" ?
        "用户正在做这本绘本的读后小测题。请只针对当前题目里的英文做解释(单词意思、读音、句子结构、为什么这个选项对/错),不要直接说出答案,可以用提示引导。" :
        "用户正在读这本绘本的当前一页。请只回答和这一页内容相关的问题(单词意思、句子怎么读、画面表达的意思),不要回答和这页无关的英语问题,也不要剧透后面的页面。",
        book: { id: book.id, title_cn: book.title_cn, title_en: book.title_en, total_pages: book.pages.length },
        phase,
        ...(currentPage ?
        {
          current_page: {
            page_number: currentPage.page,
            text_en: currentPage.text_en,
            text_cn: currentPage.text_cn,
            speaker: currentPage.speaker ?? "kid"
          }
        } :
        {}),
        ...(currentQuestion ?
        {
          current_question: {
            stem_cn: currentQuestion.stem_cn,
            stem_en: currentQuestion.stem_en,
            options: currentQuestion.options.map((o) => ({
              en: o.text_en,
              cn: o.text_cn,
              correct: o.correct
            }))
          }
        } :
        {})
      }
    } :
    null
  );

  // swipe handling
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (!book) return;
    document.title = `${book.title_cn} · 绘本阅读 | FluentPath`;
    setPhase("read");
    setPageIdx(0);
    setQIdx(0);
    setPickedIdx(null);
    setCorrectCount(0);
    const t = setTimeout(() => speakPage(book.pages[0]), 350);
    return () => clearTimeout(t);
  }, [id, book]);

  useEffect(() => () => {stopSpeaking();}, []);

  if (!book) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <BackLink to={shelfHref} className="text-sm text-muted-foreground"><T>← 返回书架</T></BackLink>
        <p className="mt-6 text-center text-sm text-muted-foreground"><T>找不到这本绘本 (</T>{id})</p>
      </main>);

  }

  const totalPages = book.pages.length;
  const page = book.pages[pageIdx];
  const isLast = pageIdx === totalPages - 1;

  // 含 focus letter 的词,用作高亮 + 找一找环节
  const focusWordsOnPage = useMemo(() => {
    if (!focusLetter) return [] as string[];
    return page.text_en.split(/\b/).filter((tok) =>
      /[a-z]/i.test(tok) && tok.toLowerCase().includes(focusLetter)
    );
  }, [page, focusLetter]);

  function goPage(next: number) {
    if (next < 0 || next >= totalPages) return;
    stopSpeaking();
    setPageIdx(next);
    setTimeout(() => speakPage(book.pages[next]), 200);
  }

  function startQuiz() {
    stopSpeaking();
    setPhase("quiz");
    setQIdx(0);
    setPickedIdx(null);
  }

  function pick(i: number) {
    if (pickedIdx !== null) return;
    setPickedIdx(i);
    if (book.questions[qIdx].options[i].correct) setCorrectCount((c) => c + 1);
  }
  function retryAnswer() {setPickedIdx(null);}

  async function nextQuestion() {
    const last = qIdx + 1 >= book.questions.length;
    if (last) {
      setPhase("done");
      try { markStoryBookReadToday(); } catch {/* noop */}
      try {
        const { data: u } = await supabase.auth.getUser();
        const userId = u?.user?.id ?? null;
        const total = book.questions.length;
        const local = loadLocal();
        const prev = local[book.id];
        const finalCorrect = correctCount;
        const newRec: CompRec = {
          questions_correct: finalCorrect,
          questions_total: total,
          read_count: (prev?.read_count ?? 0) + 1
        };
        local[book.id] = newRec;
        saveLocal(local);
        if (userId) {
          await supabase.from("primary_storybook_completion").upsert({
            user_id: userId,
            book_id: book.id,
            questions_correct: finalCorrect,
            questions_total: total,
            read_count: newRec.read_count,
            completed_at: new Date().toISOString()
          });
        }
      } catch {/* offline ok */}
      return;
    }
    setQIdx(qIdx + 1);
    setPickedIdx(null);
  }

  function rereadBook() {
    setPhase("read");
    setPageIdx(0);
    setQIdx(0);
    setPickedIdx(null);
    setCorrectCount(0);
    setTimeout(() => speakPage(book.pages[0]), 200);
  }

  function onTouchStart(e: React.TouchEvent) {touchX.current = e.touches[0].clientX;}
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goPage(pageIdx + 1);else
    goPage(pageIdx - 1);
  }

  const q = book.questions[qIdx];
  const picked = pickedIdx !== null ? q?.options[pickedIdx] : null;
  const totalQ = book.questions.length;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-6 pb-24 md:px-6">
      <BackLink to={shelfHref} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> <T>返回书架</T>
      </BackLink>

      {!book.cover_designed && <StoryBookHeader book={book} />}

      {/* 阶段 1:翻页阅读 */}
      {phase === "read" &&
      <section className="mt-4">
          <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="relative rounded-3xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-yellow-50 p-6 shadow-tile dark:border-amber-900/40 dark:from-amber-950/20 dark:to-yellow-950/10">
          
            <div className="grid min-h-[340px] place-items-center text-center">
              <div className="w-full max-w-lg">
                <StoryBookPageIllustration page={page} />
                {page.image_designed ?
                <button
                  type="button"
                  onClick={() => speakPage(page)}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-4 py-2 text-sm font-extrabold text-white shadow-sm hover:bg-amber-600">
                  <Volume2 className="size-4" /> <T>听 Spark 念</T>
                </button> :
                <div
                  className="mx-auto mt-4 rounded-2xl border-2 border-amber-200 bg-white/80 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30"
                  style={{ fontFamily: 'Fredoka, "Comic Sans MS", system-ui, sans-serif' }}>
                  <div className="text-2xl font-extrabold text-amber-900 dark:text-amber-100 md:text-3xl">
                    {focusLetter ? renderWithFocus(page.text_en, focusLetter) : page.text_en}
                  </div>
                  <div className="mt-1 text-sm font-bold text-amber-700 dark:text-amber-200">{page.text_cn}</div>
                  <button
                  onClick={() => speakPage(page)}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-amber-600">
                  
                    <Volume2 className="size-3.5" /> <T>听 Spark 念</T>
                  </button>
                  {focusLetter && focusWordsOnPage.length > 0 && (
                    <div className="mt-3 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                      🔍 <T>找一找：这一页里"</T>{focusLetter}<T>"出现在</T>
                      <span className="ml-1 font-mono">
                        {focusWordsOnPage.map((w, i) => (
                          <span key={i} className="ml-1 rounded bg-amber-200/60 px-1 py-0.5 dark:bg-amber-900/40">{w}</span>
                        ))}
                      </span>
                    </div>
                  )}
                </div>}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
            onClick={() => goPage(pageIdx - 1)}
            disabled={pageIdx === 0}
            className="inline-flex items-center gap-1 rounded-2xl border-2 border-border bg-card px-3 py-2 text-xs font-bold disabled:opacity-40 hover:bg-muted">
            
              <ChevronLeft className="size-4" /> <T>上一页</T>
            </button>
            <div className="flex-1 text-center text-xs font-bold text-muted-foreground">
              <T>第</T> {pageIdx + 1} / {totalPages} <T>页</T>
            </div>
            {!isLast ?
          <button
            onClick={() => goPage(pageIdx + 1)}
            className="inline-flex items-center gap-1 rounded-2xl bg-primary px-3 py-2 text-xs font-extrabold text-primary-foreground hover:bg-primary/90">
                <T>下一页</T> 
            <ChevronRight className="size-4" />
              </button> :

          <button
            onClick={startQuiz}
            className="inline-flex items-center gap-1 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-2 text-xs font-extrabold text-white shadow-md hover:scale-[1.02]">
                <T>完成,开始答题 →</T>
              
          </button>
          }
          </div>

          {/* 进度条 */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all" style={{ width: `${(pageIdx + 1) / totalPages * 100}%` }} />
          </div>
        </section>
      }

      {/* 阶段 2:测试 */}
      {phase === "quiz" && q &&
      <section className="mt-4 rounded-3xl border-2 border-border bg-card p-4 shadow-tile">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-bold text-muted-foreground"><T>第</T> {qIdx + 1} / {totalQ} <T>题</T></div>
            <div className="text-xs font-bold text-emerald-600"><T>已答对</T> {correctCount}</div>
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
                "border-border bg-card opacity-50"}`
                }>
                
                  <div className="flex items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-extrabold">{String.fromCharCode(65 + i)}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{opt.text_en}</div>
                      {opt.text_cn && opt.text_cn.trim() !== opt.text_en.trim() &&
                    <div className="text-[11px] text-muted-foreground">{opt.text_cn}</div>
                    }
                    </div>
                    {showState && opt.correct && <span className="text-lg">✅</span>}
                    {isPicked && !opt.correct && <span className="text-lg">💭</span>}
                  </div>
                </button>);

          })}
          </div>

          {pickedIdx !== null && picked &&
        <div className={`mt-3 rounded-2xl p-3 text-sm font-bold ${
        picked.correct ?
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" :
        "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"}`
        }>
              {picked.correct ? `🌟 完美! ${q.feedback_correct_cn}` : q.feedback_wrong_cn}
            </div>
        }

          <div className="mt-3 flex items-center gap-2">
            {pickedIdx !== null && !picked?.correct &&
          <button onClick={retryAnswer} className="inline-flex items-center gap-1 rounded-2xl border-2 border-border bg-card px-3 py-2 text-xs font-bold hover:bg-muted">
                <RotateCcw className="size-3.5" /> <T>再试一次</T>
              </button>
          }
            {pickedIdx !== null && picked?.correct &&
          <button onClick={nextQuestion} className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 py-2 text-sm font-extrabold text-white shadow-md hover:scale-[1.01]">
                {qIdx + 1 >= totalQ ? "查看结果 →" : "下一题 →"}
              </button>
          }
          </div>
        </section>
      }

      {/* 阶段 3:总结 */}
      {phase === "done" &&
      <section className="mt-4 rounded-3xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 p-6 text-center shadow-tile dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-white/80 text-4xl shadow-md">📖</div>
          <div className="mt-3 text-lg font-extrabold"><T>读完 "</T>{book.title_en}"!</div>
          <div className="mt-2 inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold">
            <T>测试结果:</T>{correctCount} / {totalQ} {correctCount === totalQ ? "全对!" : ""}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-200/70 px-3 py-1 text-xs font-bold text-rose-800">
            <Sparkles className="size-3" /> <T>+5 亲密度 · +10 XP</T>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button onClick={rereadBook} className="rounded-2xl border-2 border-border bg-card px-4 py-2 text-sm font-bold hover:bg-muted">
              <T>再读一遍</T>
            </button>
            <Link to={shelfHref} className="rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2 text-sm font-extrabold text-white shadow-md hover:scale-[1.02]">
              <T>返回书架</T>
            </Link>
          </div>
        </section>
      }
    </main>);

}

function renderWithFocus(text: string, letter: string) {
  const k = letter.toLowerCase();
  if (!k) return text;
  return text.split(/(\s+)/).map((tok, i) => {
    if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
    const lower = tok.toLowerCase();
    const idx = lower.indexOf(k);
    if (idx === -1) return <span key={i}>{tok}</span>;
    return (
      <span key={i}>
        {tok.slice(0, idx)}
        <span className="rounded bg-amber-300/70 px-0.5 text-amber-900 dark:bg-amber-700/60 dark:text-amber-100">
          {tok.slice(idx, idx + k.length)}
        </span>
        {tok.slice(idx + k.length)}
      </span>
    );
  });
}