import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { GaokaoHubProvider } from "@/lib/gaokaoHub/context";
import "@/lib/juniorHub/styles";
import { resolveGaokaoHubGrade } from "@/lib/gaokaoHub/resolveGrade";
import type { GaokaoHubGrade } from "@/lib/gaokaoHub/types";

function BottomNav({ grade }: { grade: GaokaoHubGrade }) {
  const loc = useLocation();
  const base = `/gaokao/hub/${grade}`;
  const tab = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? "text-indigo-600" : "text-[#888780]"}`;

  const isHome = loc.pathname === base || loc.pathname === `${base}/`;
  const isCourse = loc.pathname.includes("/course") || loc.pathname.includes("/semester");
  const isMistakes = loc.pathname.includes("/mistakes");
  const isProfile = loc.pathname.includes("/profile") || loc.pathname.includes("/aihistory");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EEEAE0] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg">
        <Link to={base} className={tab(isHome)}>
          <span className="text-xl">🏠</span>
          <span>首页</span>
        </Link>
        <Link to={`${base}/course`} className={tab(isCourse)}>
          <span className="text-xl">📚</span>
          <span>学习</span>
        </Link>
        <Link to={`${base}/mistakes`} className={tab(isMistakes)}>
          <span className="text-xl">📝</span>
          <span>错题本</span>
        </Link>
        <Link to={`${base}/profile`} className={tab(isProfile)}>
          <span className="text-xl">👤</span>
          <span>我的</span>
        </Link>
      </div>
    </nav>
  );
}

export default function GaokaoHubLayout() {
  const { grade: g } = useParams<{ grade: string }>();
  const grade = resolveGaokaoHubGrade(g);

  return (
    <GaokaoHubProvider grade={grade}>
      <div className="primary-hub-root mx-auto max-w-lg pb-20">
        <div className="border-b border-[#EEEAE0] bg-white px-4 py-2">
          <BackLink to="/gaokao" className="text-sm text-muted-foreground">
            ← 返回高中专区
          </BackLink>
        </div>
        <Outlet />
        <BottomNav grade={grade} />
      </div>
    </GaokaoHubProvider>
  );
}
