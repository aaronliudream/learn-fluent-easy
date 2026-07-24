import { Link } from "react-router-dom";
import { useGaokaoHub } from "@/lib/gaokaoHub/context";

export default function GaokaoHubMistakes() {
  const { grade, state, removeMistake, clearMistakes } = useGaokaoHub();
  const base = `/gaokao/hub/${grade}`;

  const onClearAll = () => {
    if (window.confirm(`确定清空全部 ${state.mistakes.length} 道错题吗？此操作不可撤销。`)) {
      clearMistakes();
    }
  };

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
          <>
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-[#C0392B] transition hover:bg-red-100"
              >
                🗑 一键清空错题本
              </button>
            </div>
            {state.mistakes.map((m) => (
              <div key={m.id} className="mb-2 flex items-start gap-2 rounded-xl border border-[#EEEAE0] bg-white p-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between text-[11px] text-[#888780]">
                    <span>{m.unitTitle}</span>
                    <span>{m.point || "其他"}</span>
                  </div>
                  <div className="text-sm font-semibold">{m.q}</div>
                  {m.opts && m.opts.length > 1 && (
                    <div className="mt-1 text-xs text-[#639922]">✓ {m.opts[m.answer]}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeMistake(m.id)}
                  className="shrink-0 rounded-lg border border-[#EEEAE0] px-2 py-1 text-sm text-[#C0392B] transition hover:bg-red-50"
                  aria-label="删除该错题"
                >
                  🗑
                </button>
              </div>
            ))}
          </>
        )}
        <Link to={base} className="mt-4 block text-center text-sm text-[#FF6B35]">
          返回首页
        </Link>
      </div>
    </>
  );
}
