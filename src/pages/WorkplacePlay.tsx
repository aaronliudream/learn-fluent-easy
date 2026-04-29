import { useParams, Navigate } from "react-router-dom";
import { Volume2, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { WORK_CATEGORIES, WORK_DIALOGUES } from "@/data/workplace";
import { speak, stopSpeaking } from "@/lib/speak";

const WorkplacePlay = () => {
  const { catKey, dialogueId } = useParams<{ catKey: string; dialogueId: string }>();
  const cat = WORK_CATEGORIES.find((c) => c.key === catKey);
  const dlg = WORK_DIALOGUES.find((d) => d.id === dialogueId);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      stopSpeaking();
    };
  }, []);

  if (!cat || !dlg) return <Navigate to="/workplace" replace />;

  const playAll = async () => {
    cancelledRef.current = false;
    for (let i = 0; i < dlg.lines.length; i++) {
      if (cancelledRef.current) return;
      setActiveIdx(i);
      await speak(dlg.lines[i].en);
    }
    setActiveIdx(null);
  };

  const playOne = async (i: number) => {
    cancelledRef.current = true;
    setActiveIdx(i);
    await speak(dlg.lines[i].en);
    setActiveIdx((cur) => (cur === i ? null : cur));
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <PageHeader
        title={`${dlg.emoji} ${dlg.title}`}
        subtitle={`${dlg.titleCn} · ${dlg.lines.length} 句`}
        back={`/workplace/${cat.key}`}
      />

      <div className="mb-5 flex justify-start">
        <button
          onClick={playAll}
          className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
        >
          <PlayCircle className="size-4" /> 播放整段对话
        </button>
      </div>

      <section className="space-y-3">
        {dlg.lines.map((l, i) => {
          const isYou = l.speaker.toLowerCase() === "you";
          const isActive = activeIdx === i;
          return (
            <article
              key={i}
              className={`flex gap-3 rounded-2xl border p-4 transition ${
                isActive ? "border-primary/40 bg-primary/5" : "border-border bg-card"
              } ${isYou ? "ml-6" : "mr-6"}`}
            >
              <div className="flex-1 min-w-0">
                <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {l.speaker}
                </div>
                <div className="text-sm font-medium leading-relaxed md:text-base">{l.en}</div>
                <div className="mt-1 text-xs text-muted-foreground md:text-sm">{l.cn}</div>
              </div>
              <button
                onClick={() => playOne(i)}
                aria-label="播放"
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

export default WorkplacePlay;
