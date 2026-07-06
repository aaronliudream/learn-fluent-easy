import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { stopSpeaking } from "@/lib/speak";
import { I18nProvider } from "@/i18n/I18nProvider";
import ChineseOnlyRoute from "@/components/ChineseOnlyRoute";
import TeacherRoute from "@/components/TeacherRoute";
import JuniorGradeQueryGate from "@/components/junior/JuniorGradeQueryGate";
import { GuestCardClaimer } from "@/components/GuestCardClaimer";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { saveRedirectPath, consumeRedirectPath } from "@/lib/authRedirect";
import { saveLastPath, readLastPath } from "@/lib/lastPath";
import { supabase } from "@/integrations/supabase/client";
// Eagerly load home + auth (most common entry points) to avoid first-paint chunk fetch
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Navigate } from "react-router-dom";

// Lazy-load everything else — each page becomes its own chunk
// 成人英语(CEFR)板块已下线,页面归档至 _archived/adult/。旧路由 301 → /american(见 Routes)。
const AmericanBooks = lazy(() => import("./pages/american/AmericanBooks.tsx"));
const AmericanHub = lazy(() => import("./pages/american/AmericanHub.tsx"));
const AmericanUnit = lazy(() => import("./pages/american/AmericanUnit.tsx"));
const AmericanLesson = lazy(() => import("./pages/american/AmericanLesson.tsx"));
const AmericanStage = lazy(() => import("./pages/american/AmericanStage.tsx"));
const AmericanReview = lazy(() => import("./pages/american/AmericanReview.tsx"));
const Stats = lazy(() => import("./pages/Stats.tsx"));
const WeeklyReport = lazy(() => import("./pages/WeeklyReport.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const AdminFeedback = lazy(() => import("./pages/AdminFeedback.tsx"));
const AdminGrammarContent = lazy(() => import("./pages/AdminGrammarContent.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Disclaimer = lazy(() => import("./pages/Disclaimer.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Gaokao = lazy(() => import("./pages/Gaokao.tsx"));
const GaokaoGrade = lazy(() => import("./pages/GaokaoGrade.tsx"));
const GaokaoBooks = lazy(() => import("./pages/GaokaoBooks.tsx"));
const GaokaoExam = lazy(() => import("./pages/GaokaoExam.tsx"));
const GaokaoDeepDiagnosis = lazy(() => import("./pages/GaokaoDeepDiagnosis.tsx"));
const China = lazy(() => import("./pages/China.tsx"));
const Primary = lazy(() => import("./pages/Primary.tsx"));
const PrimaryLegacyRedirect = lazy(() => import("./pages/PrimaryLegacyRedirect.tsx"));
const PrimaryHubLayout = lazy(() => import("./pages/primaryHub/PrimaryHubLayout.tsx"));
const JuniorHubLayout = lazy(() => import("./pages/juniorHub/JuniorHubLayout.tsx"));
const JuniorHubHome = lazy(() => import("./pages/juniorHub/JuniorHubHome.tsx"));
const JuniorHubCourse = lazy(() => import("./pages/juniorHub/JuniorHubCourse.tsx"));
const JuniorHubSemester = lazy(() => import("./pages/juniorHub/JuniorHubSemester.tsx"));
const JuniorHubUnit = lazy(() => import("./pages/juniorHub/JuniorHubUnit.tsx"));
const JuniorHubStage = lazy(() => import("./pages/juniorHub/JuniorHubStage.tsx"));
const JuniorHubMistakes = lazy(() => import("./pages/juniorHub/JuniorHubMistakes.tsx"));
const JuniorHubProfile = lazy(() => import("./pages/juniorHub/JuniorHubProfile.tsx"));
const JuniorHubAITest = lazy(() => import("./pages/juniorHub/JuniorHubAITest.tsx"));
const JuniorHubAIHistory = lazy(() => import("./pages/juniorHub/JuniorHubAIHistory.tsx"));
const JuniorHubFinalChallenge = lazy(() => import("./pages/juniorHub/JuniorHubFinalChallenge.tsx"));
const JuniorHubFinalChallengeLevel = lazy(() => import("./pages/juniorHub/JuniorHubFinalChallengeLevel.tsx"));
const GaokaoHubLayout = lazy(() => import("./pages/gaokaoHub/GaokaoHubLayout.tsx"));
const GaokaoHubHome = lazy(() => import("./pages/gaokaoHub/GaokaoHubHome.tsx"));
const GaokaoHubCourse = lazy(() => import("./pages/gaokaoHub/GaokaoHubCourse.tsx"));
const GaokaoHubSemester = lazy(() => import("./pages/gaokaoHub/GaokaoHubSemester.tsx"));
const GaokaoHubUnit = lazy(() => import("./pages/gaokaoHub/GaokaoHubUnit.tsx"));
const GaokaoHubStage = lazy(() => import("./pages/gaokaoHub/GaokaoHubStage.tsx"));
const GaokaoHubMistakes = lazy(() => import("./pages/gaokaoHub/GaokaoHubMistakes.tsx"));
const GaokaoHubProfile = lazy(() => import("./pages/gaokaoHub/GaokaoHubProfile.tsx"));
const GaokaoHubAITest = lazy(() => import("./pages/gaokaoHub/GaokaoHubAITest.tsx"));
const GaokaoHubAIHistory = lazy(() => import("./pages/gaokaoHub/GaokaoHubAIHistory.tsx"));
const PrimaryHubHome = lazy(() => import("./pages/primaryHub/PrimaryHubHome.tsx"));
const PrimaryHubCourse = lazy(() => import("./pages/primaryHub/PrimaryHubCourse.tsx"));
const PrimaryHubSemester = lazy(() => import("./pages/primaryHub/PrimaryHubSemester.tsx"));
const PrimaryHubUnitDispatch = lazy(() => import("./pages/primaryHub/PrimaryHubUnitDispatch.tsx"));
const PrimaryHubStage = lazy(() => import("./pages/primaryHub/PrimaryHubStage.tsx"));
const PrimaryHubPhonicsRoute = lazy(() => import("./pages/primaryHub/PrimaryHubPhonicsRoute.tsx"));
const PrimaryHubMistakes = lazy(() => import("./pages/primaryHub/PrimaryHubMistakes.tsx"));
const PrimaryHubProfile = lazy(() => import("./pages/primaryHub/PrimaryHubProfile.tsx"));
const PrimaryHubAITest = lazy(() => import("./pages/primaryHub/PrimaryHubAITest.tsx"));
const PrimaryHubAIHistory = lazy(() => import("./pages/primaryHub/PrimaryHubAIHistory.tsx"));
const PrimaryHubFinalChallenge = lazy(() => import("./pages/primaryHub/PrimaryHubFinalChallenge.tsx"));
const PrimaryHubFinalChallengeLevel = lazy(() => import("./pages/primaryHub/PrimaryHubFinalChallengeLevel.tsx"));
const PrimaryHubFinalChallengeStrengthen = lazy(() => import("./pages/primaryHub/PrimaryHubFinalChallengeStrengthen.tsx"));
const VocabGamesHome = lazy(() => import("./pages/primaryHub/vocabGames/VocabGamesHome.tsx"));
const VocabMatchGame = lazy(() => import("./pages/primaryHub/vocabGames/VocabMatchGame.tsx"));
const VocabRainGame = lazy(() => import("./pages/primaryHub/vocabGames/VocabRainGame.tsx"));
const VocabWhackGame = lazy(() => import("./pages/primaryHub/vocabGames/VocabWhackGame.tsx"));
const VocabSpellGame = lazy(() => import("./pages/primaryHub/vocabGames/VocabSpellGame.tsx"));
const VocabBubbleGame = lazy(() => import("./pages/primaryHub/vocabGames/VocabBubbleGame.tsx"));
const VocabQuizGame = lazy(() => import("./pages/primaryHub/vocabGames/VocabQuizGame.tsx"));
const VocabContextGame = lazy(() => import("./pages/primaryHub/vocabGames/VocabContextGame.tsx"));
const StageTests = lazy(() => import("./pages/StageTests.tsx"));
const StageTestPlay = lazy(() => import("./pages/StageTestPlay.tsx"));
const Junior = lazy(() => import("./pages/Junior.tsx"));
const JuniorVocab = lazy(() => import("./pages/JuniorVocab.tsx"));
const JuniorGrammar = lazy(() => import("./pages/JuniorGrammar.tsx"));
const JuniorGrammarUnits = lazy(() => import("./pages/JuniorGrammarUnits.tsx"));
const JuniorGrammarUnitDetail = lazy(() => import("./pages/JuniorGrammarUnitDetail.tsx"));
const JuniorGrammarPointTest = lazy(() => import("./pages/JuniorGrammarPointTest.tsx"));
const JuniorGrammarPoint = lazy(() => import("./pages/JuniorGrammarPoint.tsx"));
const JuniorGrammarKpQuiz = lazy(() => import("./pages/JuniorGrammarKpQuiz.tsx"));
const JuniorGrammarMastery = lazy(() => import("./pages/JuniorGrammarMastery.tsx"));
const JuniorUnitGrammarTest = lazy(() => import("./pages/JuniorUnitGrammarTest.tsx"));
const JuniorKpPractice = lazy(() => import("./pages/JuniorKpPractice.tsx"));
const JuniorGrammarLab = lazy(() => import("./pages/JuniorGrammarLab.tsx"));
const JuniorGrammarRevenge = lazy(() => import("./pages/JuniorGrammarRevenge.tsx"));
const JuniorReading = lazy(() => import("./pages/JuniorReading.tsx"));
const JuniorReadingPlay = lazy(() => import("./pages/JuniorReadingPlay.tsx"));
const JuniorClozePlay = lazy(() => import("./pages/JuniorClozePlay.tsx"));
const JuniorListening = lazy(() => import("./pages/JuniorListening.tsx"));
const JuniorListeningPlay = lazy(() => import("./pages/JuniorListeningPlay.tsx"));
const JuniorWriting = lazy(() => import("./pages/JuniorWriting.tsx"));
const JuniorWritingPlay = lazy(() => import("./pages/JuniorWritingPlay.tsx"));
const SuzhouExamList = lazy(() => import("./pages/junior/SuzhouExamList.tsx"));
const SuzhouExamModeSelect = lazy(() => import("./pages/junior/SuzhouExamModeSelect.tsx"));
const SuzhouExamPlay = lazy(() => import("./pages/junior/SuzhouExamPlay.tsx"));
const SuzhouExamReportView = lazy(() => import("./pages/junior/SuzhouExamReportView.tsx"));
const SuzhouFavorites = lazy(() => import("./pages/junior/SuzhouFavorites.tsx"));
const GaokaoGrammar = lazy(() => import("./pages/GaokaoGrammar.tsx"));
const GaokaoGrammarPoint = lazy(() => import("./pages/GaokaoGrammarPoint.tsx"));
const GaokaoGrammarQuiz = lazy(() => import("./pages/GaokaoGrammarQuiz.tsx"));
const GaokaoGrammarMastery = lazy(() => import("./pages/GaokaoGrammarMastery.tsx"));
const SubjunctiveLab = lazy(() => import("./pages/SubjunctiveLab.tsx"));
const GaokaoReading = lazy(() => import("./pages/GaokaoReading.tsx"));
const GaokaoReadingPlay = lazy(() => import("./pages/GaokaoReadingPlay.tsx"));
const GaokaoReadingArticle = lazy(() => import("./pages/GaokaoReadingArticle.tsx"));
const GaokaoReadingKnowledge = lazy(() => import("./pages/GaokaoReadingKnowledge.tsx"));
const GaokaoVocab = lazy(() => import("./pages/GaokaoVocab.tsx"));
const GaokaoUnitGrammarTest = lazy(() => import("./pages/gaokaoHub/GaokaoUnitGrammarTest.tsx"));
const GaokaoGrammarBoard = lazy(() => import("./pages/gaokaoHub/GaokaoGrammarBoard.tsx"));
const GaokaoVocabBoard = lazy(() => import("./pages/gaokaoHub/GaokaoVocabBoard.tsx"));
const GaokaoExerciseBoard = lazy(() => import("./pages/gaokaoHub/GaokaoExerciseBoard.tsx"));
const GaokaoWritingBoard = lazy(() => import("./pages/gaokaoHub/GaokaoWritingBoard.tsx"));
const GaokaoDiagnostic = lazy(() => import("./pages/GaokaoDiagnostic.tsx"));
const GaokaoCloze = lazy(() => import("./pages/GaokaoCloze.tsx"));
const GaokaoClozePlay = lazy(() => import("./pages/GaokaoClozePlay.tsx"));
const GaokaoWriting = lazy(() => import("./pages/GaokaoWriting.tsx"));
const GaokaoWritingPlay = lazy(() => import("./pages/GaokaoWritingPlay.tsx"));
const GaokaoListening = lazy(() => import("./pages/GaokaoListening.tsx"));
const GaokaoListeningPlay = lazy(() => import("./pages/GaokaoListeningPlay.tsx"));
const GaokaoMistakes = lazy(() => import("./pages/GaokaoMistakes.tsx"));
const Review = lazy(() => import("./pages/Review.tsx"));
const Mistakes = lazy(() => import("./pages/Mistakes.tsx"));
const ReviewToday = lazy(() => import("./pages/ReviewToday.tsx"));
const Leaderboard = lazy(() => import("./pages/Leaderboard.tsx"));
// 宠物养成展示层已下线,页面归档至 _archived/pet/。/pets /friends /friend/* 301 → /(见 Routes)。
const GlobalParent = lazy(() => import("./pages/GlobalParent.tsx"));
const Social = lazy(() => import("./pages/Social.tsx"));
const Ask = lazy(() => import("./pages/Ask.tsx"));
const Teacher = lazy(() => import("./pages/Teacher.tsx"));
const TeacherClass = lazy(() => import("./pages/TeacherClass.tsx"));
const TeacherStudent = lazy(() => import("./pages/TeacherStudent.tsx"));
const TeacherCards = lazy(() => import("./pages/TeacherCards.tsx"));
const TeacherCardStats = lazy(() => import("./pages/TeacherCardStats.tsx"));
const KnowledgeCard = lazy(() => import("./pages/KnowledgeCard.tsx"));
const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const LearningCenter = lazy(() => import("./pages/LearningCenter.tsx"));
const LearningCenterList = lazy(() => import("./pages/LearningCenterList.tsx"));
const MasteryList = lazy(() => import("./pages/MasteryList.tsx"));
const GrammarMastery = lazy(() => import("./pages/GrammarMastery.tsx"));
const Me = lazy(() => import("./pages/Me.tsx"));
const Cet = lazy(() => import("./pages/Cet.tsx"));
import { BottomTabBar } from "@/components/BottomTabBar";
import ResumeFab from "@/components/ResumeFab";
import FeedbackWidget from "@/components/FeedbackWidget";
import InstallPrompt from "@/components/InstallPrompt";
import QuizKeyboardShortcuts from "@/components/QuizKeyboardShortcuts";
import { GaokaoBreakReminder } from "@/components/GaokaoBreakReminder";
import useActiveHeartbeat from "@/hooks/useActiveHeartbeat";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import GlobalAIAssistant from "@/components/assistant/GlobalAIAssistant";
import RouteContextRegistrar from "@/components/assistant/RouteContextRegistrar";
import UserAvatarMenu from "@/components/UserAvatarMenu";
import GuestQuotaWall from "@/components/GuestQuotaWall";

// 可用性/性能默认:失败自动重试2次(弱网抖动可恢复)、指数退避封顶8s、
// 数据缓存5分钟(切页不重复打库)、不在窗口聚焦时重刷(省国内弱网请求)。
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (n) => Math.min(1000 * 2 ** n, 8000),
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const StopAudioOnRouteChange = () => {
  const location = useLocation();
  useEffect(() => {
    stopSpeaking();
  }, [location.pathname]);
  return null;
};

const HeartbeatGate = () => {
  useActiveHeartbeat();
  return null;
};

// 全站浮动伙伴（彩虹鲸/FloatingPet）已下线，组件归档至 _archived/pet/。
// /pets 详情页、伙伴养成/聊天等独立功能保留，仅移除右下角浮窗。

const FeedbackWidgetGate = () => {
  return <FeedbackWidget />;
};

// Branded skeleton shown while a lazy route chunk is loading
const RouteFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  </div>
);

/** 监听路由变化：当用户从非 auth 页面进入 /auth 时，自动保存上一页路径。 */
const AuthRedirectGuard = () => {
  const location = useLocation();
  const prevPath = useRef<string>("");
  useEffect(() => {
    if (location.pathname === "/auth" && prevPath.current && !prevPath.current.startsWith("/auth")) {
      saveRedirectPath(prevPath.current);
    }
    prevPath.current = location.pathname + location.search;
  }, [location]);
  return null;
};

/**
 * 已安装 PWA(standalone/全屏/minimal-ui,或 iOS navigator.standalone)判定。
 * 只有这种场景 start_url:"/" 才会在冷启动时把用户强拉回首页 —— 冷启动恢复只在此生效。
 */
const isStandalonePWA = (): boolean => {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia;
  const dm =
    !!mm &&
    (mm("(display-mode: standalone)").matches ||
      mm("(display-mode: fullscreen)").matches ||
      mm("(display-mode: minimal-ui)").matches);
  return dm || (navigator as { standalone?: boolean }).standalone === true;
};

/**
 * 「切走切回退回首页」第1层:每次导航存 lastPath;冷启动若落在首页且有 12h 内的
 * lastPath,自动恢复到那一页(主要救 standalone/加主屏 被 start_url:"/" 强拉回首页)。
 * 只做"存 path + 启动恢复",不碰做题组件/进度。
 */
const LastPathTracker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const restored = useRef(false);
  // 冷启动只跑一次:仅当此刻停在首页时才尝试恢复,避免打断用户主动导航。
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    // 仅在已安装 PWA 里做恢复:那才是 start_url:"/" 强拉首页的场景。
    // 普通浏览器标签刷新首页 → 停在首页,不劫持(修:刷新 / 被跳去 lastPath)。
    if (!isStandalonePWA()) return;
    if (window.location.pathname === "/" && !window.location.search) {
      const last = readLastPath();
      if (last) navigate(last, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 每次路由变化存当前完整 path(lib 内部会跳过 "/"、/auth 等)。
  useEffect(() => {
    saveLastPath(location.pathname + location.search);
  }, [location]);
  return null;
};

/** OAuth 外部跳转回来后（通常在非 /auth 页面触发 SIGNED_IN），自动跳回之前的页面。 */
const OAuthReturnRedirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && window.location.pathname !== "/auth") {
        const redirect = consumeRedirectPath();
        if (redirect) navigate(redirect, { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return null;
};

// 有闯关种子的年级（地图/关卡可进）。AI 强化训练目前仅四年级。
// 没种子的年级深链一律挡回该年级首页,避免做到别年级题。
const FC_GRADES_WITH_SEEDS = new Set(["3", "4", "5", "6"]);
function FinalChallengeGuard({
  allow,
  children,
}: {
  allow: Set<string>;
  children: ReactNode;
}) {
  const { grade } = useParams<{ grade: string }>();
  if (!allow.has(grade ?? "")) {
    return <Navigate to={`/primary/hub/${grade ?? "4"}`} replace />;
  }
  return <>{children}</>;
}

// 初中综合挑战目前只有七年级种子(期中 v1 / 期末 v2)。其余年级深链挡回该年级首页。
const JR_FC_GRADES_WITH_SEEDS = new Set(["7"]);
function JuniorFinalChallengeGuard({ children }: { children: ReactNode }) {
  const { grade } = useParams<{ grade: string }>();
  if (!JR_FC_GRADES_WITH_SEEDS.has(grade ?? "")) {
    return <Navigate to={`/junior/hub/${grade ?? "7"}`} replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
    <AIAssistantProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LastPathTracker />
        <AuthRedirectGuard />
        <OAuthReturnRedirect />
        <StopAudioOnRouteChange />
        <HeartbeatGate />
        <GuestCardClaimer />
        {/* LanguagePickerModal removed — first visit defaults to 简体中文;
            switchable via LangToggleEnZh / LanguageSwitcher in the header. */}
        <GaokaoBreakReminder />
        <div className="pb-tabbar md:pb-0">
        <RouteErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/weekly-report" element={<WeeklyReport />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          {/* 成人板块下线:旧路由 301 → /american */}
          <Route path="/placement" element={<Navigate to="/american" replace />} />
          <Route path="/slang" element={<Navigate to="/american" replace />} />
          <Route path="/account" element={<Account />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/about" element={<About />} />
          <Route path="/scenes" element={<Navigate to="/american" replace />} />
          <Route path="/review" element={<Review />} />
          <Route path="/mistakes" element={<Mistakes />} />
          <Route path="/review/today" element={<ReviewToday />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          {/* 宠物养成下线:旧路由 301 → 首页 */}
          <Route path="/pets" element={<Navigate to="/" replace />} />
          <Route path="/friends" element={<Navigate to="/" replace />} />
          <Route path="/friend/:id" element={<Navigate to="/" replace />} />
          <Route path="/parent" element={<GlobalParent />} />
          <Route path="/social" element={<Social />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/q/:slug" element={<KnowledgeCard />} />
          <Route path="/teacher" element={<TeacherRoute><Teacher /></TeacherRoute>} />
          <Route path="/teacher/class/:id" element={<TeacherRoute><TeacherClass /></TeacherRoute>} />
          <Route path="/teacher/class/:id/student/:studentId" element={<TeacherRoute><TeacherStudent /></TeacherRoute>} />
          <Route path="/teacher/cards" element={<TeacherRoute><TeacherCards /></TeacherRoute>} />
          <Route path="/teacher/cards/:slug" element={<TeacherRoute><TeacherCardStats /></TeacherRoute>} />
          <Route path="/scenes/:catKey" element={<Navigate to="/american" replace />} />
          <Route path="/scenes/:catKey/:dialogueId" element={<Navigate to="/american" replace />} />
          <Route path="/workplace" element={<Navigate to="/american" replace />} />
          <Route path="/workplace/:catKey" element={<Navigate to="/american" replace />} />
          <Route path="/workplace/:catKey/:dialogueId" element={<Navigate to="/american" replace />} />
          <Route path="/china" element={<ChineseOnlyRoute><China /></ChineseOnlyRoute>} />
          <Route path="/primary" element={<ChineseOnlyRoute><Primary /></ChineseOnlyRoute>} />
          <Route path="/primary/hub/:grade" element={<ChineseOnlyRoute><PrimaryHubLayout /></ChineseOnlyRoute>}>
            <Route index element={<PrimaryHubHome />} />
            <Route path="course" element={<PrimaryHubCourse />} />
            <Route path="semester/:semId" element={<PrimaryHubSemester />} />
            <Route path="semester/:semId/unit/:unitId" element={<PrimaryHubUnitDispatch />} />
            <Route path="semester/:semId/unit/:unitId/stage/:stageIdx" element={<PrimaryHubStage />} />
            <Route
              path="semester/:semId/unit/:unitId/stage/:stageIdx/phonics"
              element={<PrimaryHubPhonicsRoute />}
            />
            <Route path="mistakes" element={<PrimaryHubMistakes />} />
            <Route path="profile" element={<PrimaryHubProfile />} />
            <Route path="aitest" element={<PrimaryHubAITest />} />
            <Route path="aihistory" element={<PrimaryHubAIHistory />} />
            <Route
              path="final-challenge"
              element={
                <FinalChallengeGuard allow={FC_GRADES_WITH_SEEDS}>
                  <PrimaryHubFinalChallenge />
                </FinalChallengeGuard>
              }
            />
            <Route
              path="final-challenge/level/:levelId"
              element={
                <FinalChallengeGuard allow={FC_GRADES_WITH_SEEDS}>
                  <PrimaryHubFinalChallengeLevel />
                </FinalChallengeGuard>
              }
            />
            <Route
              path="final-challenge/strengthen"
              element={
                <FinalChallengeGuard allow={FC_GRADES_WITH_SEEDS}>
                  <PrimaryHubFinalChallengeStrengthen />
                </FinalChallengeGuard>
              }
            />
            <Route path="vocab-games" element={<VocabGamesHome />} />
            <Route path="vocab-games/match" element={<VocabMatchGame />} />
            <Route path="vocab-games/rain" element={<VocabRainGame />} />
            <Route path="vocab-games/whack" element={<VocabWhackGame />} />
            <Route path="vocab-games/spell" element={<VocabSpellGame />} />
            <Route path="vocab-games/bubble" element={<VocabBubbleGame />} />
            <Route path="vocab-games/quiz" element={<VocabQuizGame />} />
            <Route path="vocab-games/context" element={<VocabContextGame />} />
          </Route>
          <Route path="/primary/parent" element={<Navigate to="/parent" replace />} />
          <Route path="/primary/*" element={<ChineseOnlyRoute><PrimaryLegacyRedirect /></ChineseOnlyRoute>} />
          <Route path="/stage-tests/:segment/:grade" element={<StageTests />} />
          <Route path="/stage-test/:segment/:grade/:testId" element={<StageTestPlay />} />
          {/* 初中 /junior 开放:初一可用;初二/初三由 grade 守卫(JuniorHubLayout 内 + JuniorGradeQueryGate),仅管理员可进 */}
          <Route path="/junior/hub/:grade" element={<ChineseOnlyRoute><JuniorHubLayout /></ChineseOnlyRoute>}>
            <Route index element={<JuniorHubHome />} />
            <Route path="course" element={<JuniorHubCourse />} />
            <Route path="semester/:semId" element={<JuniorHubSemester />} />
            <Route path="semester/:semId/unit/:unitId" element={<JuniorHubUnit />} />
            <Route path="semester/:semId/unit/:unitId/stage/:stageIdx" element={<JuniorHubStage />} />
            <Route path="mistakes" element={<JuniorHubMistakes />} />
            <Route path="profile" element={<JuniorHubProfile />} />
            <Route path="aitest" element={<JuniorHubAITest />} />
            <Route path="aihistory" element={<JuniorHubAIHistory />} />
            <Route
              path="final-challenge"
              element={
                <JuniorFinalChallengeGuard>
                  <JuniorHubFinalChallenge />
                </JuniorFinalChallengeGuard>
              }
            />
            <Route
              path="final-challenge/level/:levelId"
              element={
                <JuniorFinalChallengeGuard>
                  <JuniorHubFinalChallengeLevel />
                </JuniorFinalChallengeGuard>
              }
            />
          </Route>
          <Route element={<JuniorGradeQueryGate />}>
          <Route path="/junior" element={<ChineseOnlyRoute><Junior /></ChineseOnlyRoute>} />
          <Route path="/junior/vocab" element={<ChineseOnlyRoute><JuniorVocab /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar" element={<ChineseOnlyRoute><JuniorGrammarUnits /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar/unit/:volume/:unit" element={<ChineseOnlyRoute><JuniorGrammarUnitDetail /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar/point/:pointId" element={<ChineseOnlyRoute><JuniorGrammarPointTest /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar-legacy" element={<ChineseOnlyRoute><JuniorGrammar /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar/revenge" element={<ChineseOnlyRoute><JuniorGrammarRevenge /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar/:id" element={<ChineseOnlyRoute><JuniorGrammarPoint /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar-lab/:id" element={<ChineseOnlyRoute><JuniorGrammarLab /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar/kp/:kpId" element={<ChineseOnlyRoute><JuniorKpPractice /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar/:id/mastery" element={<ChineseOnlyRoute><JuniorGrammarMastery /></ChineseOnlyRoute>} />
          <Route path="/junior/unit-grammar/:grade/:unitId" element={<ChineseOnlyRoute><JuniorUnitGrammarTest /></ChineseOnlyRoute>} />
          <Route path="/junior/kp/:id/practice" element={<ChineseOnlyRoute><JuniorGrammarKpQuiz /></ChineseOnlyRoute>} />
          <Route path="/junior/reading" element={<ChineseOnlyRoute><JuniorReading /></ChineseOnlyRoute>} />
          <Route path="/junior/reading/:id" element={<ChineseOnlyRoute><JuniorReadingPlay /></ChineseOnlyRoute>} />
          <Route path="/junior/cloze/:id" element={<ChineseOnlyRoute><JuniorClozePlay /></ChineseOnlyRoute>} />
          <Route path="/junior/listening" element={<ChineseOnlyRoute><JuniorListening /></ChineseOnlyRoute>} />
          <Route path="/junior/listening/:id" element={<ChineseOnlyRoute><JuniorListeningPlay /></ChineseOnlyRoute>} />
          <Route path="/junior/writing" element={<ChineseOnlyRoute><JuniorWriting /></ChineseOnlyRoute>} />
          <Route path="/junior/writing/:id" element={<ChineseOnlyRoute><JuniorWritingPlay /></ChineseOnlyRoute>} />
          <Route path="/junior/suzhou" element={<ChineseOnlyRoute><SuzhouExamList /></ChineseOnlyRoute>} />
          <Route path="/junior/suzhou/favorites" element={<ChineseOnlyRoute><SuzhouFavorites /></ChineseOnlyRoute>} />
          <Route path="/junior/suzhou/:examId/mode" element={<ChineseOnlyRoute><SuzhouExamModeSelect /></ChineseOnlyRoute>} />
          <Route path="/junior/suzhou/:examId" element={<ChineseOnlyRoute><SuzhouExamPlay /></ChineseOnlyRoute>} />
          <Route path="/junior/suzhou/report/:reportId" element={<ChineseOnlyRoute><SuzhouExamReportView /></ChineseOnlyRoute>} />
          </Route>
          {/* ✅ 高中 /gaokao + /senior 已开放(三社内容齐活)。游客 20 题配额在答题入口处控制。 */}
          <Route path="/gaokao/hub/:grade" element={<ChineseOnlyRoute><GaokaoHubLayout /></ChineseOnlyRoute>}>
            <Route index element={<GaokaoHubHome />} />
            <Route path="course" element={<GaokaoHubCourse />} />
            <Route path="semester/:semId" element={<GaokaoHubSemester />} />
            <Route path="semester/:semId/unit/:unitId" element={<GaokaoHubUnit />} />
            <Route path="semester/:semId/unit/:unitId/stage/:stageIdx" element={<GaokaoHubStage />} />
            <Route path="mistakes" element={<GaokaoHubMistakes />} />
            <Route path="profile" element={<GaokaoHubProfile />} />
            <Route path="aitest" element={<GaokaoHubAITest />} />
            <Route path="aihistory" element={<GaokaoHubAIHistory />} />
          </Route>
          <Route path="/gaokao" element={<ChineseOnlyRoute><Gaokao /></ChineseOnlyRoute>} />
          <Route path="/gaokao/books/:group" element={<ChineseOnlyRoute><GaokaoBooks /></ChineseOnlyRoute>} />
          <Route path="/gaokao/g/:grade" element={<ChineseOnlyRoute><GaokaoGrade /></ChineseOnlyRoute>} />
          <Route path="/gaokao/exam" element={<ChineseOnlyRoute><GaokaoExam /></ChineseOnlyRoute>} />
          <Route path="/gaokao/diagnostic" element={<ChineseOnlyRoute><GaokaoDiagnostic /></ChineseOnlyRoute>} />
          <Route path="/gaokao/deep-diagnosis" element={<ChineseOnlyRoute><GaokaoDeepDiagnosis /></ChineseOnlyRoute>} />
          {/* 语法板块 = 7册分册(选册→必修一读 junior_grammar 真题,练习写 junior_user_mastery 互通)。旧3500/虚拟语气壳留 grammar-legacy 备查。 */}
          <Route path="/gaokao/grammar" element={<ChineseOnlyRoute><GaokaoGrammarBoard /></ChineseOnlyRoute>} />
          <Route path="/gaokao/grammar-board-legacy" element={<ChineseOnlyRoute><GaokaoGrammar /></ChineseOnlyRoute>} />
          <Route path="/gaokao/grammar/:slug/mastery" element={<ChineseOnlyRoute><GaokaoGrammarMastery /></ChineseOnlyRoute>} />
          <Route path="/gaokao/grammar/:slug" element={<ChineseOnlyRoute><GaokaoGrammarPoint /></ChineseOnlyRoute>} />
          <Route path="/gaokao/grammar/:slug/quiz" element={<ChineseOnlyRoute><GaokaoGrammarPoint /></ChineseOnlyRoute>} />
          <Route path="/gaokao/grammar/:slug/quiz/:index" element={<ChineseOnlyRoute><GaokaoGrammarPoint /></ChineseOnlyRoute>} />
          <Route path="/grammar-lab/subjunctive" element={<ChineseOnlyRoute><SubjunctiveLab /></ChineseOnlyRoute>} />
          {/* 阅读板块 = 7册分册(选册→必修一读 junior_reading,链①镜像路由 play 写 mastery_progress 互通)。旧壳留 -legacy。 */}
          <Route path="/gaokao/reading" element={<ChineseOnlyRoute><GaokaoExerciseBoard boardTitle="阅读专项" boardEmoji="📖" basePath="/gaokao/reading" table="junior_reading" module="junior_reading" lessonSeg="reading" /></ChineseOnlyRoute>} />
          <Route path="/gaokao/reading-board-legacy" element={<ChineseOnlyRoute><GaokaoReading /></ChineseOnlyRoute>} />
          <Route path="/gaokao/reading/knowledge" element={<ChineseOnlyRoute><GaokaoReadingKnowledge /></ChineseOnlyRoute>} />
          <Route path="/gaokao/reading/article/:id" element={<ChineseOnlyRoute><GaokaoReadingArticle /></ChineseOnlyRoute>} />
          <Route path="/gaokao/reading/:id" element={<ChineseOnlyRoute><GaokaoReadingPlay /></ChineseOnlyRoute>} />
          {/* 词汇板块 = 7册分册(选册→必修一读 junior_vocab 真实单元词汇,测一测写 junior_word_mastery 互通)。旧3500壳留 vocab-board-legacy。 */}
          <Route path="/gaokao/vocab" element={<ChineseOnlyRoute><GaokaoVocabBoard /></ChineseOnlyRoute>} />
          <Route path="/gaokao/vocab-board-legacy" element={<ChineseOnlyRoute><GaokaoVocab /></ChineseOnlyRoute>} />
          {/* 完形板块 = 7册分册(junior_cloze + ①镜像路由 /gaokao/lesson/cloze)。旧壳留 -legacy。 */}
          <Route path="/gaokao/cloze" element={<ChineseOnlyRoute><GaokaoExerciseBoard boardTitle="完形专项" boardEmoji="🧩" basePath="/gaokao/cloze" table="junior_cloze" module="junior_cloze" lessonSeg="cloze" /></ChineseOnlyRoute>} />
          <Route path="/gaokao/cloze-board-legacy" element={<ChineseOnlyRoute><GaokaoCloze /></ChineseOnlyRoute>} />
          <Route path="/gaokao/cloze/:id" element={<ChineseOnlyRoute><GaokaoClozePlay /></ChineseOnlyRoute>} />
          {/* 写作板块 = 7册分册(junior_writing_prompts,提交制无掌握表互通)。旧壳留 -legacy。 */}
          <Route path="/gaokao/writing" element={<ChineseOnlyRoute><GaokaoWritingBoard /></ChineseOnlyRoute>} />
          <Route path="/gaokao/writing-board-legacy" element={<ChineseOnlyRoute><GaokaoWriting /></ChineseOnlyRoute>} />
          <Route path="/gaokao/writing/:id" element={<ChineseOnlyRoute><GaokaoWritingPlay /></ChineseOnlyRoute>} />
          {/* 听力板块 = 7册分册(junior_listening_exercises + ①镜像路由 /gaokao/lesson/listening)。旧壳留 -legacy。 */}
          <Route path="/gaokao/listening" element={<ChineseOnlyRoute><GaokaoExerciseBoard boardTitle="听力专项" boardEmoji="🎧" basePath="/gaokao/listening" table="junior_listening_exercises" module="junior_listening" lessonSeg="listening" /></ChineseOnlyRoute>} />
          <Route path="/gaokao/listening-board-legacy" element={<ChineseOnlyRoute><GaokaoListening /></ChineseOnlyRoute>} />
          <Route path="/gaokao/listening/:id" element={<ChineseOnlyRoute><GaokaoListeningPlay /></ChineseOnlyRoute>} />
          {/* 课本同步 9关 子页(高中壳镜像,basePath=/gaokao/lesson):复用 junior 子页组件(returnTo 回 /gaokao/hub),
              全程不掉初中。与上方 /gaokao/reading|cloze|listening(旧专项play)路径区分,避免冲突。语法综合测试用高中孪生。
              掌握度全部题级写 junior_user_mastery → 与课本同步/未来专项板块自动互通。见 docs/高中专区架构方案.md §①。 */}
          <Route path="/gaokao/lesson/unit-grammar/:grade/:unitId" element={<ChineseOnlyRoute><GaokaoUnitGrammarTest /></ChineseOnlyRoute>} />
          <Route path="/gaokao/lesson/grammar/kp/:kpId" element={<ChineseOnlyRoute><JuniorKpPractice /></ChineseOnlyRoute>} />
          <Route path="/gaokao/lesson/grammar/:id/mastery" element={<ChineseOnlyRoute><JuniorGrammarMastery /></ChineseOnlyRoute>} />
          <Route path="/gaokao/lesson/reading/:id" element={<ChineseOnlyRoute><JuniorReadingPlay /></ChineseOnlyRoute>} />
          <Route path="/gaokao/lesson/cloze/:id" element={<ChineseOnlyRoute><JuniorClozePlay /></ChineseOnlyRoute>} />
          <Route path="/gaokao/lesson/listening/:id" element={<ChineseOnlyRoute><JuniorListeningPlay /></ChineseOnlyRoute>} />
          <Route path="/gaokao/mistakes" element={<ChineseOnlyRoute><GaokaoMistakes /></ChineseOnlyRoute>} />
          <Route path="/gaokao/g/:grade/mistakes" element={<ChineseOnlyRoute><GaokaoMistakes /></ChineseOnlyRoute>} />
          {/* end 高中(已开放)*/}
          {/* 美语课程(/american 四册 → book/:bookNo 单元 → 本课 10 关 → 关卡) */}
          <Route path="/american" element={<AmericanBooks />} />
          <Route path="/american/book/:bookNo" element={<AmericanHub />} />
          <Route path="/american/review" element={<AmericanReview />} />
          <Route path="/american/book/:bookNo/hub/:unit" element={<AmericanUnit />} />
          <Route path="/american/hub/:unit" element={<AmericanUnit />} />
          <Route path="/american/lesson/:lessonId" element={<AmericanLesson />} />
          <Route path="/american/lesson/:lessonId/stage/:stage" element={<AmericanStage />} />
          {/* 成人板块旧课程路由 301 → /american */}
          <Route path="/level/:levelId" element={<Navigate to="/american" replace />} />
          <Route path="/levels" element={<Navigate to="/american" replace />} />
          <Route path="/level/:levelId/unit/:unitId" element={<Navigate to="/american" replace />} />
          <Route path="/level/:levelId/unit/:unitId/lesson/:lessonId" element={<Navigate to="/american" replace />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="/admin/grammar-content" element={<AdminGrammarContent />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* /dashboard is the canonical Student Hub (redesigned 2026-05). */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* /hub kept as an alias so any existing bookmarks still resolve. */}
          <Route path="/hub" element={<Navigate to="/dashboard" replace />} />
          {/* LearningCenter remains reachable at its own URL for users who
              prefer the AI-diagnosis + time-travel slider view. */}
          <Route path="/learning-center" element={<LearningCenter />} />
          <Route path="/learning-center/list" element={<LearningCenterList />} />
          <Route path="/dashboard/list/:stage/:state" element={<MasteryList />} />
          <Route path="/dashboard/grammar" element={<GrammarMastery />} />
          <Route path="/me" element={<Me />} />
          {/* Sub-brand entry redirects (母品牌 → 子品牌内部已有的实现) */}
          <Route path="/kids" element={<Navigate to="/primary" replace />} />
          <Route path="/senior" element={<Navigate to="/gaokao" replace />} />
          <Route path="/cet" element={<Cet />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </RouteErrorBoundary>
        </div>
        <BottomTabBar />
        <ResumeFab />
        {/* FeedbackWidget temporarily hidden per user request — re-enable when needed. */}
        {/* <FeedbackWidgetGate /> */}
        <InstallPrompt />
        <QuizKeyboardShortcuts />
        <GlobalAIAssistant />
        <RouteContextRegistrar />
        <UserAvatarMenu />
        <GuestQuotaWall />
      </BrowserRouter>
    </TooltipProvider>
    </AIAssistantProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
