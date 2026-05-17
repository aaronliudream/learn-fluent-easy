import { Navigate } from "react-router-dom";
import { readPrimaryGradeFromStorage } from "@/lib/primaryGrade";

/** /primary/adventure → /primary/adventure/{last selected grade} */
export default function PrimaryAdventureRedirect() {
  const grade = readPrimaryGradeFromStorage();
  return <Navigate to={`/primary/adventure/${grade}`} replace />;
}
