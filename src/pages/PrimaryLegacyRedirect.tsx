import { Navigate, useLocation } from "react-router-dom";
import { primaryHubPath, resolvePrimaryGrade } from "@/lib/primaryGrade";

/** Sends legacy /primary/* URLs to the PEP hub for the resolved grade. */
export default function PrimaryLegacyRedirect() {
  const { pathname } = useLocation();
  const match = pathname.match(/\/primary\/(?:adventure|grade|games|vocab|reading\/grade|culture)\/(\d+)/);
  const grade = resolvePrimaryGrade(match?.[1] ?? null);
  return <Navigate to={primaryHubPath(grade)} replace />;
}
