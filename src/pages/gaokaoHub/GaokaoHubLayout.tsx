import { Link, Outlet, useLocation, useParams, useSearchParams } from "react-router-dom";
import BackLink from "@/components/BackLink";
import { GaokaoHubProvider } from "@/lib/gaokaoHub/context";
import "@/lib/juniorHub/styles";
import { resolveGaokaoHubGrade } from "@/lib/gaokaoHub/resolveGrade";
import { readPublisherParam, withPublisher, DEFAULT_PUBLISHER, type Publisher } from "@/lib/gaokaoHub/publisher";
import { useStudySession } from "@/hooks/useStudySession";
import type { GaokaoHubGrade } from "@/lib/gaokaoHub/types";

function BottomNav({ grade, publisher }: { grade: GaokaoHubGrade; publisher: Publisher }) {
  const loc = useLocation();
  const base = `/gaokao/hub/${grade}`;
  const wp = (p: string) => withPublisher(p, publisher);
  const tab = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? "text-indigo-600" : "text-[#888780]"}`;

  const isHome = loc.pathname === base || loc.pathname === `${base}/`;
  const isCourse = loc.pathname.includes("/course") || loc.pathname.includes("/semester");
  const isMistakes = loc.pathname.includes("/mistakes");
  const isProfile = loc.pathname.includes("/profile") || loc.pathname.includes("/aihistory");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EEEAE0] bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg">
        <Link to={wp(base)} className={tab(isHome)}>
          <span className="text-xl">🏠</span>
          <span>首页</span>
        </Link>
        <Link to={wp(`${base}/course`)} className={tab(isCourse)}>
          <span className="text-xl">📚</span>
          <span>学习</span>
        </Link>
        <Link to={wp(`${base}/mistakes`)} className={tab(isMistakes)}>
          <span className="text-xl">📝</span>
          <span>错题本</span>
        </Link>
        <Link to={wp(`${base}/profile`)} className={tab(isProfile)}>
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
  const [sp] = useSearchParams();
  const publisher = readPublisherParam(sp);
  useStudySession(); // 学习时长埋点

  return (
    <GaokaoHubProvider grade={grade} publisher={publisher}>
      <div className="primary-hub-root mx-auto max-w-lg pb-20">
        <div className="border-b border-[#EEEAE0] bg-white px-4 py-2.5">
          <BackLink
            to={publisher === DEFAULT_PUBLISHER ? "/gaokao" : `/gaokao?publisher=${publisher}`}
            className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 active:scale-95"
          >
            ← 返回高中专区
          </BackLink>
        </div>
        <Outlet />
        <BottomNav grade={grade} publisher={publisher} />
      </div>
    </GaokaoHubProvider>
  );
}
