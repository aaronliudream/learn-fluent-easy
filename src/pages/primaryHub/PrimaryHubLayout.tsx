import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { PrimaryHubProvider } from "@/lib/primaryHub/context";
import "@/lib/primaryHub/styles";
import { resolvePrimaryGrade, writePrimaryGradeToStorage } from "@/lib/primaryGrade";
import { useStudySession } from "@/hooks/useStudySession";
import type { PrimaryHubGrade } from "@/lib/primaryHub/types";
import { useEffect } from "react";

function BottomNav({ grade }: { grade: PrimaryHubGrade }) {
  const loc = useLocation();
  const base = `/primary/hub/${grade}`;
  const tab = (path: string, active: boolean) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? "text-[#FF6B35]" : "text-[#888780]"}`;

  const isHome = loc.pathname === base || loc.pathname === `${base}/`;
  const isCourse = loc.pathname.includes("/course") || loc.pathname.includes("/semester");
  const isMistakes = loc.pathname.includes("/mistakes");
  const isProfile = loc.pathname.includes("/profile") || loc.pathname.includes("/aihistory");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EEEAE0] bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg">
        <Link to={base} className={tab("home", isHome)}>
          <span className="text-xl">🏠</span>
          <span>首页</span>
        </Link>
        <Link to={`${base}/course`} className={tab("course", isCourse)}>
          <span className="text-xl">📚</span>
          <span>学习</span>
        </Link>
        <Link to={`${base}/mistakes`} className={tab("mistakes", isMistakes)}>
          <span className="text-xl">📝</span>
          <span>错题本</span>
        </Link>
        <Link to={`${base}/profile`} className={tab("profile", isProfile)}>
          <span className="text-xl">👤</span>
          <span>我的</span>
        </Link>
      </div>
    </nav>
  );
}

export default function PrimaryHubLayout() {
  const { grade: g } = useParams<{ grade: string }>();
  const grade = resolvePrimaryGrade(g) as PrimaryHubGrade;
  useStudySession(); // 学习时长埋点

  useEffect(() => {
    writePrimaryGradeToStorage(grade);
  }, [grade]);

  return (
    <PrimaryHubProvider grade={grade}>
      <div className="primary-hub-root mx-auto max-w-lg">
        <Outlet key={grade} />
        <BottomNav grade={grade} />
      </div>
    </PrimaryHubProvider>
  );
}
