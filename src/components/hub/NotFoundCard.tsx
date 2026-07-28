/**
 * Hub 内「查无此册 / 查无此单元」的兜底卡片。
 *
 * 原来三条线各写着一个光秃秃的 `<div className="p-6 text-center">课程未找到</div>` ——
 * 用户走到这里就没路了:没有返回按钮,只能按浏览器后退或重开。
 * 这里给出「回上一页」和「回本学段首页」两条路,保证任何时候都走得出去。
 *
 * 注:这不是崩溃页(崩溃走 RouteErrorBoundary),而是**正常的空态**——
 * 收藏了一个已下线的册、URL 手打错一个字母,都应该落在这里而不是白屏。
 */
import { useNavigate } from "react-router-dom";

export default function NotFoundCard({
  title,
  hint,
  homePath,
  homeLabel = "回学段首页",
}: {
  title: string;
  hint?: string;
  homePath: string;
  homeLabel?: string;
}) {
  const nav = useNavigate();
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-6">
      <div className="w-full rounded-2xl border border-[#EEEAE0] bg-white p-6 text-center shadow-sm dark:border-border dark:bg-card">
        <div className="text-3xl">🧭</div>
        <p className="mt-3 text-lg font-extrabold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-[#888780] dark:text-muted-foreground">
          {hint ?? "这个地址可能已经变更,或者链接里少了点什么。"}
        </p>
        <div className="mt-6">
          {/* 只给「回学段首页」一条出路 —— 错误页上做 nav(-1) 容易再弹回那个坏 URL,
              而且历史栈里往回弹本来就是这次返回链事故的成因。 */}
          <button
            type="button"
            onClick={() => nav(homePath)}
            className="w-full rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white"
          >
            {homeLabel}
          </button>
        </div>
      </div>
    </main>
  );
}
