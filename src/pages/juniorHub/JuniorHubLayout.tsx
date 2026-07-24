import { Link, Outlet, useLocation, useParams, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import BackLink from "@/components/BackLink";
import { readJuniorPublisherParam, withJuniorPublisher, type JuniorPublisher } from "@/lib/juniorHub/publisher";
import { JuniorHubProvider } from "@/lib/juniorHub/context";
import "@/lib/juniorHub/styles";
import { resolveJuniorHubGrade } from "@/lib/juniorHub/resolveGrade";
import { isJuniorGradeOpen } from "@/lib/juniorHub/access";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import JuniorComingSoon from "@/components/junior/JuniorComingSoon";
import { useStudySession } from "@/hooks/useStudySession";
import type { JuniorHubGrade } from "@/lib/juniorHub/types";

const GRADE_LABEL: Record<number, string> = { 8: "初二", 9: "初三" };

function BottomNav({ grade, pub }: { grade: JuniorHubGrade; pub: JuniorPublisher }) {
  const loc = useLocation();
  const base = `/junior/hub/${grade}`;
  const wp = (p: string) => withJuniorPublisher(p, pub);
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
        {/* 错题本已统一到全站 DB 版 /mistakes(不再读 localStorage);离开 hub 外壳,靠页面自带返回。 */}
        <Link to="/mistakes" className={tab(isMistakes)}>
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

export default function JuniorHubLayout() {
  const { grade: g } = useParams<{ grade: string }>();
  const grade = resolveJuniorHubGrade(g);
  const [sp] = useSearchParams();
  const pub = readJuniorPublisherParam(sp);
  const { isAdmin, loading } = useIsAdmin();
  useStudySession(); // 学习时长埋点
  const loc = useLocation();
  const base = `/junior/hub/${grade}`;
  const isHubHome = loc.pathname === base || loc.pathname === `${base}/`;

  // 初二/初三整理中:非管理员拦截(覆盖闯关 hub 及全部子路由),防直链访问。
  if (!isJuniorGradeOpen(grade)) {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      );
    }
    if (!isAdmin) return <JuniorComingSoon gradeLabel={GRADE_LABEL[grade]} />;
  }

  return (
    <JuniorHubProvider grade={grade}>
      <div className="primary-hub-root mx-auto max-w-lg pb-20">
        <div className="border-b border-[#EEEAE0] bg-white px-4 py-2">
          <BackLink to={withJuniorPublisher(isHubHome ? "/junior" : base, pub)} className="text-sm text-muted-foreground">
            {isHubHome ? "← 返回初中专区" : "← 返回首页"}
          </BackLink>
        </div>
        <Outlet />
        <BottomNav grade={grade} pub={pub} />
      </div>
    </JuniorHubProvider>
  );
}
