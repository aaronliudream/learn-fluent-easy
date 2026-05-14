import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { T } from "@/i18n/T";

interface Props {
  variant?: "primary" | "secondary" | "hero";
}

export function DeepDiagnosisCard({ variant = "primary" }: Props) {
  const navigate = useNavigate();
  const isHero = variant === "hero";
  return (
    <button
      onClick={() => navigate("/gaokao/deep-diagnosis")}
      className="group relative w-full overflow-hidden rounded-2xl text-left transition-all hover:-translate-y-0.5 hover:shadow-2xl"
      style={{
        background:
          "linear-gradient(135deg, #0E2746 0%, #1a3a6e 50%, #2D5896 100%)",
        padding: isHero ? "20px 22px" : "18px 20px",
        boxShadow: "0 8px 28px -10px rgba(14,39,70,0.55)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full opacity-30 blur-2xl"
        style={{ background: "radial-gradient(circle, #C8896A 0%, transparent 70%)" }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.14)" }}
        >
          <Sparkles className="size-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-white leading-tight">
            <T>AI 深度学情诊断</T>
          </div>
          <div className="mt-0.5 text-[12px] text-white/75 leading-snug">
            <T>基于你 30 天的答题数据，发现别人看不到的规律</T>
          </div>
        </div>
        <ArrowRight className="size-5 shrink-0 text-white transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}

export default DeepDiagnosisCard;