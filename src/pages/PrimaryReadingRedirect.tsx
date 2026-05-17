import { Navigate, useSearchParams } from "react-router-dom";
import { primaryReadingEntryPath, resolvePrimaryGrade } from "@/lib/primaryGrade";

/**
 * /primary/reading → Supabase 趣味阅读列表（按年级）。
 * 拼读启蒙用的旧绘本书架在 /primary/storybooks。
 */
export default function PrimaryReadingRedirect() {
  const [sp] = useSearchParams();
  const grade = resolvePrimaryGrade(sp.get("grade"));
  return <Navigate to={primaryReadingEntryPath(grade)} replace />;
}
