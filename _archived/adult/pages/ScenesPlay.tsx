import { useParams, Navigate } from "react-router-dom";
import { Volume2, PlayCircle, StopCircle, Drama, PencilLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SCENE_CATEGORIES, SCENE_DIALOGUES } from "@/data/scenes";
import { speak, speakSequence, stopSpeaking } from "@/lib/speak";
import { T, useT } from "@/i18n/T";
import { stripTags } from "@/lib/richText";
import { TappableLine } from "@/components/TappableLine";
import { RewriteDialog } from "@/components/RewriteDialog";
import { PhraseQuiz } from "@/components/PhraseQuiz";
import { recordVisit } from "@/lib/guestProgress";

const ScenesPlay = () => {
  const t = useT();
  const { catKey, dialogueId } = useParams<{ catKey: string; dialogueId: string }>();
  const cat = SCENE_CATEGORIES.find((c) => c.key === catKey);
  const dlg = SCENE_DIALOGUES.find((d) => d.id === dialogueId);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const cancelledRef = useRef(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const lineRefs = useRef<Array<HTMLElement | null>>([]);
  const [rewriteIdx, setRewriteIdx] = useState<number | null>(null);
  const quizRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the currently-playing line into the upper portion of the
  // viewport so the user can follow along without manually scrolling.
  useEffect(() => {
    if (activeIdx == null) return;
    const el = lineRefs.current[activeIdx];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const targetTop = window.innerHeight * 0.2;
    const delta = rect.top - targetTop;
    if (Math.abs(delta) < 8) return;
    window.scrollBy({ top: delta, behavior: "smooth" });
  }, [activeIdx]);

  useEffect(() => {
    if (dlg) recordVisit(`scene:${dlg.id}`);
    return () => {
      cancelledRef.current = true;
      stopSpeaking();
    };
  }, [dlg]);

  if (!cat || !dlg) return <Navigate to="/scenes" replace />;

  const playAll = async () => {
    cancelledRef.current = false;
    setIsPlayingAll(true);
    await speakSequence(
      dlg.lines.map((l) => stripTags(l.en)),
      {
        gapMs: 80,
        onIndex: (i) => setActiveIdx(i < 0 ? null : i),
      },
    );
    setIsPlayingAll(false);
  };

  const playOne = async (i: number) => {
    cancelledRef.current = true; // stop any in-progress full read
    setIsPlayingAll(false);
    setActiveIdx(i);
    await speak(stripTags(dlg.lines[i].en));
    setActiveIdx((cur) => (cur === i ? null : cur));
  };

  const stopAll = () => {
    stopSpeaking();
    setIsPlayingAll(false);
    setActiveIdx(null);
  };

  const scrollToQuiz = () => {
    quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={`${dlg.emoji} ${dlg.title}`}
        subtitle={`${t(dlg.titleCn)} · ${dlg.lines.length} ${t("句")}`}
        back={`/scenes/${cat.key}`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {isPlayingAll ? (
          <button
            onClick={stopAll}
            className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/20"
          >
            <StopCircle className="size-4" /> <T>停止播放</T>
          </button>
        ) : (
          <button
            onClick={playAll}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
          >
            <PlayCircle className="size-4" /> <T>播放整段对话</T>
          </button>
        )}
        <button
          onClick={scrollToQuiz}
          className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25"
        >
          <PencilLine className="size-4" /> <T>巩固一下</T>
        </button>
      </div>

      <section className="space-y-3">
        {dlg.lines.map((l, i) => {
          const isYou = l.speaker.toLowerCase() === "you";
          const isActive = activeIdx === i;
          // Stable emoji avatar per non-"you" speaker name so each character
          // gets a recognizable face throughout the dialogue.
          const avatarEmojis = ["👩", "👨", "🧑", "👩‍🍳", "🧑‍💼", "👨‍🦱", "👩‍🦰"];
          const speakerHash = Array.from(l.speaker).reduce((a, c) => a + c.charCodeAt(0), 0);
          const avatar = isYou ? "🙋" : avatarEmojis[speakerHash % avatarEmojis.length];
          return (
            <article
              key={i}
              ref={(el) => (lineRefs.current[i] = el)}
              className={`flex w-full items-end gap-2 ${isYou ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`grid size-9 shrink-0 place-items-center rounded-full text-lg shadow-sm ${
                  isYou ? "bg-primary/15" : "bg-secondary"
                }`}
                aria-hidden
              >
                {avatar}
              </div>

              {/* Bubble + meta */}
              <div className={`flex max-w-[78%] flex-col ${isYou ? "items-end" : "items-start"}`}>
                <div
                  className={`mb-0.5 px-1 text-[11px] font-semibold tracking-wide text-muted-foreground ${
                    isYou ? "text-right" : "text-left"
                  }`}
                >
                  {l.speaker}
                </div>
                <div
                  className={`relative rounded-2xl px-4 py-2.5 shadow-sm transition ${
                    isYou
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border border-border bg-card text-foreground"
                  } ${isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                >
                  {/* Tail */}
                  <span
                    aria-hidden
                    className={`absolute bottom-0 size-3 ${
                      isYou
                        ? "right-0 translate-x-1 translate-y-0.5 bg-primary [clip-path:polygon(0_0,100%_100%,0_100%)]"
                        : "left-0 -translate-x-1 translate-y-0.5 border-b border-l border-border bg-card [clip-path:polygon(100%_0,100%_100%,0_100%)]"
                    }`}
                  />
                  <div className="text-base font-medium leading-relaxed md:text-lg">
                    <TappableLine sentence={l.en} />
                  </div>
                  <div
                    className={`mt-1 text-xs leading-snug ${
                      isYou ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    <T>{stripTags(l.cn)}</T>
                  </div>
                </div>

                {/* Actions row */}
                <div className={`mt-1 flex items-center gap-1.5 ${isYou ? "flex-row-reverse" : ""}`}>
                  <button
                    onClick={() => playOne(i)}
                    aria-label={t("播放")}
                    className={`grid size-7 place-items-center rounded-full transition ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground/60 hover:bg-primary/15 hover:text-primary"
                    }`}
                  >
                    <Volume2 className="size-3.5" />
                  </button>
                  <button
                    onClick={() => setRewriteIdx(i)}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-foreground/60 transition hover:bg-primary/15 hover:text-primary"
                  >
                    <Drama className="size-3" /> <T>换种说法</T>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section ref={quizRef} className="mt-10">
        <PhraseQuiz
          lines={dlg.lines.map((l) => ({ en: l.en, cn: l.cn }))}
          dialogueKey={`scene:${dlg.id}`}
        />
      </section>

      {rewriteIdx != null && (
        <RewriteDialog
          open={rewriteIdx != null}
          onOpenChange={(v) => {
            if (!v) setRewriteIdx(null);
          }}
          sentence={dlg.lines[rewriteIdx].en}
          sceneHint={`${dlg.title} (${t(dlg.titleCn)})`}
        />
      )}
    </main>
  );
};

export default ScenesPlay;