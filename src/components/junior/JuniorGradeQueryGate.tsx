import { Outlet, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { isJuniorGradeOpen } from "@/lib/juniorHub/access";
import JuniorComingSoon from "./JuniorComingSoon";

const GRADE_LABEL: Record<string, string> = { "8": "初二", "9": "初三" };

/**
 * 初中学科页 grade 守卫(读 ?grade= 查询参数)。
 * 受限年级(初二/初三)非管理员访问 → 整理中占位;管理员放行。
 * 无 grade / 已开放年级 → 正常渲染。
 */
export default function JuniorGradeQueryGate() {
  const [sp] = useSearchParams();
  const raw = sp.get("grade");
  const grade = raw ? Number(raw) : null;
  const restricted = grade != null && !isJuniorGradeOpen(grade);
  const { isAdmin, loading } = useIsAdmin();

  if (!restricted) return <Outlet />;
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }
  if (isAdmin) return <Outlet />;
  return <JuniorComingSoon gradeLabel={GRADE_LABEL[String(grade)]} />;
}
