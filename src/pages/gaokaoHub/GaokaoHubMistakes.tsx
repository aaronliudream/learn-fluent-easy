import { Link } from "react-router-dom";
import { useGaokaoHub } from "@/lib/gaokaoHub/context";

export default function GaokaoHubMistakes() {
  const { grade, state } = useGaokaoHub();
  const base = `/gaokao/hub/${grade}`;

  return (
    <>
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#FFB627] px-5 pb-6 pt-4 text-white">
        <div className="text-sm opacity-90">📝 错题本</div>
        <div className="text-xl font-bold">共 {state.mistakes.length} 道错题</div>
      </div>
      <div className="px-4 py-4">
        {state.mistakes.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-2 text-5xl">🎉</div>
            <div className="font-semibold">还没有错题</div>
            <p className="text-sm text-[#888780]">继续学习，错题会自动收录到这里</p>
          </div>
        ) : (
          state.mistakes.map((m) => (
            <div key={m.id} className="mb-2 rounded-xl border border-[#EEEAE0] bg-white p-3">
              <div className="mb-1 flex justify-between text-[11px] text-[#888780]">
                <span>{m.unitTitle}</span>
                <span>{m.point || "其他"}</span>
              </div>
              <div className="text-sm font-semibold">{m.q}</div>
              {m.opts && m.opts.length > 1 && (
                <div className="mt-1 text-xs text-[#639922]">✓ {m.opts[m.answer]}</div>
              )}
            </div>
          ))
        )}
        <Link to={base} className="mt-4 block text-center text-sm text-[#FF6B35]">
          返回首页
        </Link>
      </div>
    </>
  );
}
