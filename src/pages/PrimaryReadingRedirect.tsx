import { Navigate, useSearchParams } from "react-router-dom";

/**
 * /primary/reading → Supabase 趣味阅读列表（按年级）。
 * 拼读启蒙用的旧绘本书架在 /primary/storybooks。
 */
export default function PrimaryReadingRedirect() {
  const [sp] = useSearchParams();
  const fromQuery = sp.get("grade");
  const fromStorage =
    typeof window !== "undefined" ? localStorage.getItem("primary:lastGrade") : null;
  const grade = fromQuery || fromStorage || "1";
  return <Navigate to={`/primary/reading/grade/${grade}`} replace />;
}
