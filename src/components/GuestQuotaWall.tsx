// 游客整站答题硬墙:未登录访客累计答满 GUEST_QUESTION_LIMIT 题后,全站学习页弹出此墙,
// 必须注册/登录才能继续答题。登录用户永远看不到(无限)。全局挂载一次(App.tsx)。
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { T } from "@/i18n/T";
import { saveRedirectPath } from "@/lib/authRedirect";
import {
  GUEST_QUESTION_LIMIT,
  isGuestQuotaExhausted,
  subscribeGuestQuota,
} from "@/lib/guestQuestionQuota";

// 这些路径不弹墙:登录页(去注册)、定价页、纯落地首页(留一个可浏览/可注册的出口)。
const ALLOW = new Set<string>(["/auth", "/pricing", "/"]);

export default function GuestQuotaWall() {
  const location = useLocation();
  const navigate = useNavigate();
  const [exhausted, setExhausted] = useState(isGuestQuotaExhausted());

  // 计数变动 / 登录态翻转时重新评估。
  useEffect(() => subscribeGuestQuota(() => setExhausted(isGuestQuotaExhausted())), []);
  // 切路由时也重新评估(从 allowlist 页跳回学习页要能再次拦截)。
  useEffect(() => { setExhausted(isGuestQuotaExhausted()); }, [location.pathname]);

  if (!exhausted) return null;
  if (ALLOW.has(location.pathname)) return null;

  const goAuth = () => { saveRedirectPath(); navigate("/auth"); };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="text-4xl">🎉</div>
        <h2 className="mt-3 text-xl font-extrabold text-[#0E2746]">
          你已体验 {GUEST_QUESTION_LIMIT} 道题
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          <T>注册后即可无限练习,学习进度还能云端同步、跨设备继续。</T>
        </p>
        <button
          onClick={goAuth}
          className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
        >
          <T>免费注册 / 登录,继续练习</T>
        </button>
        <button
          onClick={() => navigate("/")}
          className="mt-2 w-full rounded-xl py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <T>返回首页</T>
        </button>
      </div>
    </div>
  );
}
