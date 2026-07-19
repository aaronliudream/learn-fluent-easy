import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useIsTeacher } from "@/hooks/useIsTeacher";

/**
 * 教师路由守卫 —— /teacher 及子路由仅老师可进。
 *
 * - 判定加载中:渲染占位 loader,既不闪内容、也不误重定向。
 * - 非老师(含未登录):重定向回首页(在账户页自助"开通教师功能"后即可进)。
 * - 老师:放行(children,或作为 layout route 时渲染嵌套 <Outlet/>)。
 *
 * 采用角色型守卫(镜像 AdminRoute),而非 ChineseOnlyRoute —— 教师门是身份门,
 * 不是语言门。
 */
export default function TeacherRoute({ children }: { children?: ReactNode }) {
  const { isTeacher, loading } = useIsTeacher();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!isTeacher) return <Navigate to="/" replace />;

  return <>{children ?? <Outlet />}</>;
}
