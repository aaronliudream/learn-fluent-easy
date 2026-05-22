import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { T } from "@/i18n/T";
import { useJuniorGrammarContinue } from "@/hooks/useJuniorGrammarContinue";
import { countPendingRevengeMistakes } from "@/lib/juniorGrammarRevenge";

type Props = {
  stage: string;
  continueModule?: string;
  defaultTo: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultTone: string;
};

/** Dashboard stage tab continue CTA — junior grammar deep-links to adventure / revenge. */
export function StageContinueCta({
  stage,
  continueModule,
  defaultTo,
  defaultTitle,
  defaultSubtitle,
  defaultTone,
}: Props) {
  const isJunior = stage === "junior";
  const { pick: juniorPick } = useJuniorGrammarContinue(isJunior);
  const pending = isJunior ? countPendingRevengeMistakes() : 0;
  const useJuniorGrammar =
    isJunior && juniorPick && (pending > 0 || continueModule === "grammar");

  const to = useJuniorGrammar ? juniorPick!.to : defaultTo;
  const title = useJuniorGrammar ? juniorPick!.title : defaultTitle;
  const subtitle = useJuniorGrammar ? juniorPick!.subtitle : defaultSubtitle;
  const tone =
    useJuniorGrammar && pending > 0
      ? "from-rose-600 to-orange-500"
      : useJuniorGrammar
        ? "from-violet-600 to-fuchsia-600"
        : defaultTone;

  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br ${tone} p-5 text-white shadow-tile transition-all hover:-translate-y-0.5`}>
      <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm text-2xl">▶</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-85"><T>📍 从这里继续</T></div>
        <div className="mt-1 text-lg font-extrabold leading-tight">{title}</div>
        <div className="mt-0.5 text-xs opacity-90">{subtitle}</div>
      </div>
      <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
