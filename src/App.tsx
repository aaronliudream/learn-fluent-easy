import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { stopSpeaking } from "@/lib/speak";
import { I18nProvider } from "@/i18n/I18nProvider";
import ChineseOnlyRoute from "@/components/ChineseOnlyRoute";
import { GuestCardClaimer } from "@/components/GuestCardClaimer";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
// Eagerly load home + auth (most common entry points) to avoid first-paint chunk fetch
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import { Navigate } from "react-router-dom";

// Lazy-load everything else — each page becomes its own chunk
const Level = lazy(() => import("./pages/Level.tsx"));
const Levels = lazy(() => import("./pages/Levels.tsx"));
const Unit = lazy(() => import("./pages/Unit.tsx"));
const Lesson = lazy(() => import("./pages/Lesson.tsx"));
const Stats = lazy(() => import("./pages/Stats.tsx"));
const WeeklyReport = lazy(() => import("./pages/WeeklyReport.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const AdminFeedback = lazy(() => import("./pages/AdminFeedback.tsx"));
const AdminGrammarContent = lazy(() => import("./pages/AdminGrammarContent.tsx"));
const Placement = lazy(() => import("./pages/Placement.tsx"));
const Slang = lazy(() => import("./pages/Slang.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Disclaimer = lazy(() => import("./pages/Disclaimer.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Scenes = lazy(() => import("./pages/Scenes.tsx"));
const ScenesCategory = lazy(() => import("./pages/ScenesCategory.tsx"));
const ScenesPlay = lazy(() => import("./pages/ScenesPlay.tsx"));
const Workplace = lazy(() => import("./pages/Workplace.tsx"));
const WorkplaceCategory = lazy(() => import("./pages/WorkplaceCategory.tsx"));
const WorkplacePlay = lazy(() => import("./pages/WorkplacePlay.tsx"));
const Talk = lazy(() => import("./pages/Talk.tsx"));
const Gaokao = lazy(() => import("./pages/Gaokao.tsx"));
const GaokaoGrade = lazy(() => import("./pages/GaokaoGrade.tsx"));
const GaokaoExam = lazy(() => import("./pages/GaokaoExam.tsx"));
const China = lazy(() => import("./pages/China.tsx"));
const Primary = lazy(() => import("./pages/Primary.tsx"));
const PrimaryLetters = lazy(() => import("./pages/PrimaryLetters.tsx"));
const PrimaryPhonics = lazy(() => import("./pages/PrimaryPhonics.tsx"));
const PrimaryPhonicsLearn = lazy(() => import("./pages/PrimaryPhonicsLearn.tsx"));
const PrimaryPhonicsQuiz = lazy(() => import("./pages/PrimaryPhonicsQuiz.tsx"));
const PrimarySightWords = lazy(() => import("./pages/PrimarySightWords.tsx"));
const PrimarySightWordsLearn = lazy(() => import("./pages/PrimarySightWordsLearn.tsx"));
const PrimarySightWordsQuiz = lazy(() => import("./pages/PrimarySightWordsQuiz.tsx"));
const PrimaryRolePlays = lazy(() => import("./pages/PrimaryRolePlays.tsx"));
const PrimaryVocab = lazy(() => import("./pages/PrimaryVocab.tsx"));
const PrimaryChat = lazy(() => import("./pages/PrimaryChat.tsx"));
const PrimaryGrade = lazy(() => import("./pages/PrimaryGrade.tsx"));
const PrimaryAssessment = lazy(() => import("./pages/PrimaryAssessment.tsx"));
const PrimaryGames = lazy(() => import("./pages/PrimaryGames.tsx"));
const PrimaryLesson = lazy(() => import("./pages/PrimaryLesson.tsx"));
const PrimaryAdventure = lazy(() => import("./pages/PrimaryAdventure.tsx"));
const PrimaryCulture = lazy(() => import("./pages/PrimaryCulture.tsx"));
const PrimaryReading = lazy(() => import("./pages/PrimaryReading.tsx"));
const PrimaryReadingPlay = lazy(() => import("./pages/PrimaryReadingPlay.tsx"));
const StageTests = lazy(() => import("./pages/StageTests.tsx"));
const StageTestPlay = lazy(() => import("./pages/StageTestPlay.tsx"));
const Junior = lazy(() => import("./pages/Junior.tsx"));
const JuniorGrade = lazy(() => import("./pages/JuniorGrade.tsx"));
const JuniorVocab = lazy(() => import("./pages/JuniorVocab.tsx"));
const JuniorGrammar = lazy(() => import("./pages/JuniorGrammar.tsx"));
const JuniorGrammarPoint = lazy(() => import("./pages/JuniorGrammarPoint.tsx"));
const JuniorGrammarLab = lazy(() => import("./pages/JuniorGrammarLab.tsx"));
const JuniorReading = lazy(() => import("./pages/JuniorReading.tsx"));
const JuniorReadingPlay = lazy(() => import("./pages/JuniorReadingPlay.tsx"));
const JuniorListening = lazy(() => import("./pages/JuniorListening.tsx"));
const JuniorListeningPlay = lazy(() => import("./pages/JuniorListeningPlay.tsx"));
const JuniorWriting = lazy(() => import("./pages/JuniorWriting.tsx"));
const JuniorWritingPlay = lazy(() => import("./pages/JuniorWritingPlay.tsx"));
const GaokaoGrammar = lazy(() => import("./pages/GaokaoGrammar.tsx"));
const GaokaoGrammarPoint = lazy(() => import("./pages/GaokaoGrammarPoint.tsx"));
const GaokaoGrammarQuiz = lazy(() => import("./pages/GaokaoGrammarQuiz.tsx"));
const SubjunctiveLab = lazy(() => import("./pages/SubjunctiveLab.tsx"));
const GaokaoReading = lazy(() => import("./pages/GaokaoReading.tsx"));
const GaokaoReadingPlay = lazy(() => import("./pages/GaokaoReadingPlay.tsx"));
const GaokaoReadingArticle = lazy(() => import("./pages/GaokaoReadingArticle.tsx"));
const GaokaoReadingKnowledge = lazy(() => import("./pages/GaokaoReadingKnowledge.tsx"));
const GaokaoVocab = lazy(() => import("./pages/GaokaoVocab.tsx"));
const GaokaoDiagnostic = lazy(() => import("./pages/GaokaoDiagnostic.tsx"));
const GaokaoCloze = lazy(() => import("./pages/GaokaoCloze.tsx"));
const GaokaoClozePlay = lazy(() => import("./pages/GaokaoClozePlay.tsx"));
const GaokaoMistakes = lazy(() => import("./pages/GaokaoMistakes.tsx"));
const SavedPhrases = lazy(() => import("./pages/SavedPhrases.tsx"));
const Review = lazy(() => import("./pages/Review.tsx"));
const Mistakes = lazy(() => import("./pages/Mistakes.tsx"));
const ReviewToday = lazy(() => import("./pages/ReviewToday.tsx"));
const Leaderboard = lazy(() => import("./pages/Leaderboard.tsx"));
const Pets = lazy(() => import("./pages/Pets.tsx"));
const Friends = lazy(() => import("./pages/Friends.tsx"));
const FriendPet = lazy(() => import("./pages/FriendPet.tsx"));
const GlobalParent = lazy(() => import("./pages/GlobalParent.tsx"));
const Social = lazy(() => import("./pages/Social.tsx"));
const Ask = lazy(() => import("./pages/Ask.tsx"));
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
import FeedbackWidget from "@/components/FeedbackWidget";
import InstallPrompt from "@/components/InstallPrompt";
import QuizKeyboardShortcuts from "@/components/QuizKeyboardShortcuts";
import { GaokaoBreakReminder } from "@/components/GaokaoBreakReminder";
import { FloatingPet } from "@/components/pet/FloatingPet";
import { DigestionAnimation } from "@/components/pet/DigestionAnimation";
import { EvolutionCelebration } from "@/components/pet/EvolutionCelebration";
import GrowthLetter from "@/components/pet/GrowthLetter";
import useActiveHeartbeat from "@/hooks/useActiveHeartbeat";
import { AIAssistantProvider } from "@/contexts/AIAssistantContext";
import GlobalAIAssistant from "@/components/assistant/GlobalAIAssistant";
import RouteContextRegistrar from "@/components/assistant/RouteContextRegistrar";
import UserAvatarMenu from "@/components/UserAvatarMenu";

const queryClient = new QueryClient();

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

// 全站浮动伙伴：除了少数干扰场景（登录/落地英雄区/全屏对话）外都显示。
// 未登录访客也会看到 demo 蛋，点击引导到注册→领养。
const FloatingPetGate = () => {
  const { pathname } = useLocation();
  const hide =
    pathname === "/" ||                  // 首页已有英雄伙伴，避免重复
    pathname.startsWith("/auth") ||
    pathname.startsWith("/talk") ||      // 全屏语音对话
    pathname.startsWith("/pets") ||      // 宠物详情页本身
    pathname.startsWith("/placement");   // 评测专注模式
  if (hide) return null;
  return <FloatingPet />;
};

const FeedbackWidgetGate = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/talk")) return null;
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
    <AIAssistantProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StopAudioOnRouteChange />
        <HeartbeatGate />
        <GuestCardClaimer />
        {/* LanguagePickerModal removed — language is auto-defaulted to English
            and switchable via the header LanguageSwitcher. Forcing a 23+ option
            modal on first visit was a major bounce driver for global users. */}
        <GaokaoBreakReminder />
        <FloatingPetGate />
        <EvolutionCelebration />
        <DigestionAnimation />
        <GrowthLetter />
        <div className="pb-tabbar lg:pb-0">
        <RouteErrorBoundary>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/weekly-report" element={<WeeklyReport />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/slang" element={<Slang />} />
          <Route path="/account" element={<Account />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/about" element={<About />} />
          <Route path="/scenes" element={<Scenes />} />
          <Route path="/saved" element={<SavedPhrases />} />
          <Route path="/review" element={<Review />} />
          <Route path="/mistakes" element={<Mistakes />} />
          <Route path="/review/today" element={<ReviewToday />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friend/:id" element={<FriendPet />} />
          <Route path="/parent" element={<GlobalParent />} />
          <Route path="/social" element={<Social />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/q/:slug" element={<KnowledgeCard />} />
          <Route path="/teacher/cards" element={<TeacherCards />} />
          <Route path="/teacher/cards/:slug" element={<TeacherCardStats />} />
          <Route path="/scenes/:catKey" element={<ScenesCategory />} />
          <Route path="/scenes/:catKey/:dialogueId" element={<ScenesPlay />} />
          <Route path="/workplace" element={<Workplace />} />
          <Route path="/workplace/:catKey" element={<WorkplaceCategory />} />
          <Route path="/workplace/:catKey/:dialogueId" element={<WorkplacePlay />} />
          <Route path="/talk" element={<Talk />} />
          <Route path="/china" element={<ChineseOnlyRoute><China /></ChineseOnlyRoute>} />
          <Route path="/primary" element={<ChineseOnlyRoute><Primary /></ChineseOnlyRoute>} />
          <Route path="/primary/letters" element={<ChineseOnlyRoute><PrimaryLetters /></ChineseOnlyRoute>} />
          <Route path="/primary/phonics" element={<ChineseOnlyRoute><PrimaryPhonics /></ChineseOnlyRoute>} />
          <Route path="/primary/phonics/learn/:phonicsId" element={<ChineseOnlyRoute><PrimaryPhonicsLearn /></ChineseOnlyRoute>} />
          <Route path="/primary/phonics/quiz/:groupId" element={<ChineseOnlyRoute><PrimaryPhonicsQuiz /></ChineseOnlyRoute>} />
          {/* New canonical hyphenated paths */}
          <Route path="/primary/sight-words" element={<ChineseOnlyRoute><PrimarySightWords /></ChineseOnlyRoute>} />
          <Route path="/primary/sight-words/learn/:wordId" element={<ChineseOnlyRoute><PrimarySightWordsLearn /></ChineseOnlyRoute>} />
          <Route path="/primary/sight-words/quiz/:groupId" element={<ChineseOnlyRoute><PrimarySightWordsQuiz /></ChineseOnlyRoute>} />
          {/* Legacy redirects */}
          <Route path="/primary/sightwords" element={<Navigate to="/primary/sight-words" replace />} />
          <Route path="/primary/sightwords/learn/:wordId" element={<ChineseOnlyRoute><PrimarySightWordsLearn /></ChineseOnlyRoute>} />
          <Route path="/primary/sightwords/quiz/:groupId" element={<ChineseOnlyRoute><PrimarySightWordsQuiz /></ChineseOnlyRoute>} />
          <Route path="/primary/vocab" element={<ChineseOnlyRoute><PrimaryVocab /></ChineseOnlyRoute>} />
         <Route path="/primary/vocab/:grade" element={<ChineseOnlyRoute><PrimaryVocab /></ChineseOnlyRoute>} />
          <Route path="/primary/chat" element={<ChineseOnlyRoute><PrimaryChat /></ChineseOnlyRoute>} />
          <Route path="/primary/grade/:grade" element={<ChineseOnlyRoute><PrimaryGrade /></ChineseOnlyRoute>} />
         <Route path="/primary/challenge/:grade/:unitId" element={<ChineseOnlyRoute><PrimaryAssessment /></ChineseOnlyRoute>} />
         <Route path="/primary/checkup/:grade" element={<ChineseOnlyRoute><PrimaryAssessment /></ChineseOnlyRoute>} />
          <Route path="/primary/games" element={<ChineseOnlyRoute><PrimaryGames /></ChineseOnlyRoute>} />
          <Route path="/primary/games/:grade" element={<ChineseOnlyRoute><PrimaryGames /></ChineseOnlyRoute>} />
          <Route path="/primary/games/:grade/:type" element={<ChineseOnlyRoute><PrimaryGames /></ChineseOnlyRoute>} />
          <Route path="/primary/lesson/:id" element={<ChineseOnlyRoute><PrimaryLesson /></ChineseOnlyRoute>} />
          <Route path="/primary/adventure" element={<ChineseOnlyRoute><PrimaryAdventure /></ChineseOnlyRoute>} />
          <Route path="/primary/adventure/:grade" element={<ChineseOnlyRoute><PrimaryAdventure /></ChineseOnlyRoute>} />
         <Route path="/primary/parent" element={<Navigate to="/parent" replace />} />
          <Route path="/primary/culture/:grade" element={<ChineseOnlyRoute><PrimaryCulture /></ChineseOnlyRoute>} />
          <Route path="/primary/reading/grade/:grade" element={<ChineseOnlyRoute><PrimaryReading /></ChineseOnlyRoute>} />
          <Route path="/primary/reading/:id" element={<ChineseOnlyRoute><PrimaryReadingPlay /></ChineseOnlyRoute>} />
          <Route path="/stage-tests/:segment/:grade" element={<StageTests />} />
          <Route path="/stage-test/:segment/:grade/:testId" element={<StageTestPlay />} />
          <Route path="/junior" element={<ChineseOnlyRoute><Junior /></ChineseOnlyRoute>} />
          <Route path="/junior/g/:grade" element={<ChineseOnlyRoute><JuniorGrade /></ChineseOnlyRoute>} />
          <Route path="/junior/vocab" element={<ChineseOnlyRoute><JuniorVocab /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar" element={<ChineseOnlyRoute><JuniorGrammar /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar/:id" element={<ChineseOnlyRoute><JuniorGrammarPoint /></ChineseOnlyRoute>} />
          <Route path="/junior/grammar-lab/:id" element={<ChineseOnlyRoute><JuniorGrammarLab /></ChineseOnlyRoute>} />
          <Route path="/junior/reading" element={<ChineseOnlyRoute><JuniorReading /></ChineseOnlyRoute>} />
          <Route path="/junior/reading/:id" element={<ChineseOnlyRoute><JuniorReadingPlay /></ChineseOnlyRoute>} />
          <Route path="/junior/listening" element={<ChineseOnlyRoute><JuniorListening /></ChineseOnlyRoute>} />
          <Route path="/junior/listening/:id" element={<ChineseOnlyRoute><JuniorListeningPlay /></ChineseOnlyRoute>} />
          <Route path="/junior/writing" element={<ChineseOnlyRoute><JuniorWriting /></ChineseOnlyRoute>} />
          <Route path="/junior/writing/:id" element={<ChineseOnlyRoute><JuniorWritingPlay /></ChineseOnlyRoute>} />
          <Route path="/gaokao" element={<ChineseOnlyRoute><Gaokao /></ChineseOnlyRoute>} />
          <Route path="/gaokao/g/:grade" element={<ChineseOnlyRoute><GaokaoGrade /></ChineseOnlyRoute>} />
          <Route path="/gaokao/exam" element={<ChineseOnlyRoute><GaokaoExam /></ChineseOnlyRoute>} />
          <Route path="/gaokao/diagnostic" element={<ChineseOnlyRoute><GaokaoDiagnostic /></ChineseOnlyRoute>} />
          <Route path="/gaokao/grammar" element={<ChineseOnlyRoute><GaokaoGrammar /></ChineseOnlyRoute>} />
          <Route path="/gaokao/grammar/:slug" element={<ChineseOnlyRoute><GaokaoGrammarPoint /></ChineseOnlyRoute>} />
          <Route path="/gaokao/grammar/:slug/quiz" element={<ChineseOnlyRoute><GaokaoGrammarQuiz /></ChineseOnlyRoute>} />
          <Route path="/gaokao/grammar/:slug/quiz/:index" element={<ChineseOnlyRoute><GaokaoGrammarQuiz /></ChineseOnlyRoute>} />
          <Route path="/grammar-lab/subjunctive" element={<ChineseOnlyRoute><SubjunctiveLab /></ChineseOnlyRoute>} />
          <Route path="/gaokao/reading" element={<ChineseOnlyRoute><GaokaoReading /></ChineseOnlyRoute>} />
          <Route path="/gaokao/reading/knowledge" element={<ChineseOnlyRoute><GaokaoReadingKnowledge /></ChineseOnlyRoute>} />
          <Route path="/gaokao/reading/article/:id" element={<ChineseOnlyRoute><GaokaoReadingArticle /></ChineseOnlyRoute>} />
          <Route path="/gaokao/reading/:id" element={<ChineseOnlyRoute><GaokaoReadingPlay /></ChineseOnlyRoute>} />
          <Route path="/gaokao/vocab" element={<ChineseOnlyRoute><GaokaoVocab /></ChineseOnlyRoute>} />
          <Route path="/gaokao/cloze" element={<ChineseOnlyRoute><GaokaoCloze /></ChineseOnlyRoute>} />
          <Route path="/gaokao/cloze/:id" element={<ChineseOnlyRoute><GaokaoClozePlay /></ChineseOnlyRoute>} />
          <Route path="/gaokao/mistakes" element={<ChineseOnlyRoute><GaokaoMistakes /></ChineseOnlyRoute>} />
          <Route path="/level/:levelId" element={<Level />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/level/:levelId/unit/:unitId" element={<Unit />} />
          <Route path="/level/:levelId/unit/:unitId/lesson/:lessonId" element={<Lesson />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          <Route path="/admin/grammar-content" element={<AdminGrammarContent />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<LearningCenter />} />
          <Route path="/learning-center" element={<Navigate to="/dashboard" replace />} />
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
        {/* FeedbackWidget temporarily hidden per user request — re-enable when needed. */}
        {/* <FeedbackWidgetGate /> */}
        <InstallPrompt />
        <QuizKeyboardShortcuts />
        <GlobalAIAssistant />
        <RouteContextRegistrar />
        <UserAvatarMenu />
      </BrowserRouter>
    </TooltipProvider>
    </AIAssistantProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
