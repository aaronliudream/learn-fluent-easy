import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";

/**
 * 管理员路由守卫 —— 临时锁定开发中的板块(初中 /junior、高中 /senior→/gaokao)。
 *
 * - 判定加载中:渲染占位 loader,既不闪内容、也不误把用户重定向走。
 * - 非 admin:重定向回首页。
 * - admin:放行(children,或作为 layout route 时渲染嵌套 <Outlet/>)。
 */
export default function AdminRoute({ children }: { children?: ReactNode }) {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children ?? <Outlet />}</>;
}
