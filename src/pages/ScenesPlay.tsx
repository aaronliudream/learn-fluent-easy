import { useParams, Navigate } from "react-router-dom";
import { Volume2, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SCENE_CATEGORIES, SCENE_DIALOGUES } from "@/data/scenes";
import { speak, speakSequence, stopSpeaking } from "@/lib/speak";
import { T, useT } from "@/i18n/T";
import { renderRich, stripTags } from "@/lib/richText";
import { recordVisit } from "@/lib/guestProgress";

const ScenesPlay = () => {
  const t = useT();
  const { catKey, dialogueId } = useParams<{ catKey: string; dialogueId: string }>();
  const cat = SCENE_CATEGORIES.find((c) => c.key === catKey);
  const dlg = SCENE_DIALOGUES.find((d) => d.id === dialogueId);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const cancelledRef = useRef(false);
  const lineRefs = useRef<Array<HTMLElement | null>>([]);

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
    await speakSequence(
      dlg.lines.map((l) => stripTags(l.en)),
      {
        gapMs: 80,
        onIndex: (i) => setActiveIdx(i < 0 ? null : i),
      },
    );
  };

  const playOne = async (i: number) => {
    cancelledRef.current = true; // stop any in-progress full read
    setActiveIdx(i);
    await speak(stripTags(dlg.lines[i].en));
    setActiveIdx((cur) => (cur === i ? null : cur));
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={`${dlg.emoji} ${dlg.title}`}
        subtitle={`${t(dlg.titleCn)} · ${dlg.lines.length} ${t("句")}`}
        back={`/scenes/${cat.key}`}
      />

      <div className="mb-5 flex justify-start">
        <button
          onClick={playAll}
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
        >
          <PlayCircle className="size-4" /> <T>播放整段对话</T>
        </button>
      </div>

      <section className="space-y-3">
        {dlg.lines.map((l, i) => {
          const isYou = l.speaker.toLowerCase() === "you";
          const isActive = activeIdx === i;
          return (
            <article
              key={i}
              ref={(el) => (lineRefs.current[i] = el)}
              className={`flex gap-3 rounded-2xl border p-4 transition ${
                isActive ? "border-primary/40 bg-primary/5" : "border-border bg-card"
              } ${isYou ? "ml-6" : "mr-6"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {l.speaker}
                </div>
                <div className={`text-lg leading-relaxed transition md:text-xl ${isActive ? "font-bold text-primary" : "font-medium"}`}>{renderRich(l.en)}</div>
                <div className={`mt-1.5 text-base transition md:text-lg ${isActive ? "font-semibold text-primary" : "text-muted-foreground"}`}><T>{stripTags(l.cn)}</T></div>
              </div>
              <button
                onClick={() => playOne(i)}
                aria-label={t("播放")}
                className={`grid size-9 shrink-0 place-items-center rounded-full transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground/70 hover:bg-primary/15 hover:text-primary"
                }`}
              >
                <Volume2 className="size-4" />
              </button>
            </article>
          );
        })}
      </section>
    </main>
  );
};

export default ScenesPlay;