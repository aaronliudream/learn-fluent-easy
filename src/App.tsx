import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { stopSpeaking } from "@/lib/speak";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LanguagePickerModal } from "@/i18n/LanguagePickerModal";
// Eagerly load home + auth (most common entry points) to avoid first-paint chunk fetch
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

// Lazy-load everything else — each page becomes its own chunk
const Level = lazy(() => import("./pages/Level.tsx"));
const Levels = lazy(() => import("./pages/Levels.tsx"));
const Unit = lazy(() => import("./pages/Unit.tsx"));
const Lesson = lazy(() => import("./pages/Lesson.tsx"));
const Stats = lazy(() => import("./pages/Stats.tsx"));
const WeeklyReport = lazy(() => import("./pages/WeeklyReport.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const Placement = lazy(() => import("./pages/Placement.tsx"));
const Slang = lazy(() => import("./pages/Slang.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
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
const PrimaryVocab = lazy(() => import("./pages/PrimaryVocab.tsx"));
const PrimaryChat = lazy(() => import("./pages/PrimaryChat.tsx"));
const PrimaryGrade = lazy(() => import("./pages/PrimaryGrade.tsx"));
const PrimaryGames = lazy(() => import("./pages/PrimaryGames.tsx"));
const PrimaryLesson = lazy(() => import("./pages/PrimaryLesson.tsx"));
const PrimaryParent = lazy(() => import("./pages/PrimaryParent.tsx"));
const PrimaryReading = lazy(() => import("./pages/PrimaryReading.tsx"));
const PrimaryReadingPlay = lazy(() => import("./pages/PrimaryReadingPlay.tsx"));
const StageTests = lazy(() => import("./pages/StageTests.tsx"));
const StageTestPlay = lazy(() => import("./pages/StageTestPlay.tsx"));
const Junior = lazy(() => import("./pages/Junior.tsx"));
const JuniorGrade = lazy(() => import("./pages/JuniorGrade.tsx"));
const JuniorVocab = lazy(() => import("./pages/JuniorVocab.tsx"));
const JuniorGrammar = lazy(() => import("./pages/JuniorGrammar.tsx"));
const JuniorGrammarPoint = lazy(() => import("./pages/JuniorGrammarPoint.tsx"));
const JuniorReading = lazy(() => import("./pages/JuniorReading.tsx"));
const JuniorReadingPlay = lazy(() => import("./pages/JuniorReadingPlay.tsx"));
const JuniorListening = lazy(() => import("./pages/JuniorListening.tsx"));
const JuniorListeningPlay = lazy(() => import("./pages/JuniorListeningPlay.tsx"));
const JuniorWriting = lazy(() => import("./pages/JuniorWriting.tsx"));
const JuniorWritingPlay = lazy(() => import("./pages/JuniorWritingPlay.tsx"));
const GaokaoGrammar = lazy(() => import("./pages/GaokaoGrammar.tsx"));
const GaokaoGrammarPoint = lazy(() => import("./pages/GaokaoGrammarPoint.tsx"));
const GaokaoGrammarQuiz = lazy(() => import("./pages/GaokaoGrammarQuiz.tsx"));
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
const Leaderboard = lazy(() => import("./pages/Leaderboard.tsx"));
const Pets = lazy(() => import("./pages/Pets.tsx"));
const Friends = lazy(() => import("./pages/Friends.tsx"));
const FriendPet = lazy(() => import("./pages/FriendPet.tsx"));
const GlobalParent = lazy(() => import("./pages/GlobalParent.tsx"));
const Social = lazy(() => import("./pages/Social.tsx"));
import { BottomTabBar } from "@/components/BottomTabBar";
import { GaokaoBreakReminder } from "@/components/GaokaoBreakReminder";
import { FloatingPet } from "@/components/pet/FloatingPet";
import { DigestionAnimation } from "@/components/pet/DigestionAnimation";
import { EvolutionCelebration } from "@/components/pet/EvolutionCelebration";
import GrowthLetter from "@/components/pet/GrowthLetter";
import useActiveHeartbeat from "@/hooks/useActiveHeartbeat";

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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StopAudioOnRouteChange />
        <HeartbeatGate />
        <LanguagePickerModal />
        <GaokaoBreakReminder />
        <FloatingPetGate />
        <EvolutionCelebration />
        <DigestionAnimation />
        <GrowthLetter />
        <div className="pb-tabbar lg:pb-0">
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
          <Route path="/scenes" element={<Scenes />} />
          <Route path="/saved" element={<SavedPhrases />} />
          <Route path="/review" element={<Review />} />
          <Route path="/mistakes" element={<Mistakes />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friend/:id" element={<FriendPet />} />
          <Route path="/parent" element={<GlobalParent />} />
          <Route path="/social" element={<Social />} />
          <Route path="/scenes/:catKey" element={<ScenesCategory />} />
          <Route path="/scenes/:catKey/:dialogueId" element={<ScenesPlay />} />
          <Route path="/workplace" element={<Workplace />} />
          <Route path="/workplace/:catKey" element={<WorkplaceCategory />} />
          <Route path="/workplace/:catKey/:dialogueId" element={<WorkplacePlay />} />
          <Route path="/talk" element={<Talk />} />
          <Route path="/china" element={<China />} />
          <Route path="/primary" element={<Primary />} />
          <Route path="/primary/letters" element={<PrimaryLetters />} />
          <Route path="/primary/vocab" element={<PrimaryVocab />} />
         <Route path="/primary/vocab/:grade" element={<PrimaryVocab />} />
          <Route path="/primary/chat" element={<PrimaryChat />} />
          <Route path="/primary/grade/:grade" element={<PrimaryGrade />} />
          <Route path="/primary/games" element={<PrimaryGames />} />
          <Route path="/primary/games/:grade" element={<PrimaryGames />} />
          <Route path="/primary/games/:grade/:type" element={<PrimaryGames />} />
          <Route path="/primary/lesson/:id" element={<PrimaryLesson />} />
         <Route path="/primary/parent" element={<PrimaryParent />} />
          <Route path="/primary/reading/grade/:grade" element={<PrimaryReading />} />
          <Route path="/primary/reading/:id" element={<PrimaryReadingPlay />} />
          <Route path="/stage-tests/:segment/:grade" element={<StageTests />} />
          <Route path="/stage-test/:segment/:grade/:testId" element={<StageTestPlay />} />
          <Route path="/junior" element={<Junior />} />
          <Route path="/junior/g/:grade" element={<JuniorGrade />} />
          <Route path="/junior/vocab" element={<JuniorVocab />} />
          <Route path="/junior/grammar" element={<JuniorGrammar />} />
          <Route path="/junior/grammar/:id" element={<JuniorGrammarPoint />} />
          <Route path="/junior/reading" element={<JuniorReading />} />
          <Route path="/junior/reading/:id" element={<JuniorReadingPlay />} />
          <Route path="/junior/listening" element={<JuniorListening />} />
          <Route path="/junior/listening/:id" element={<JuniorListeningPlay />} />
          <Route path="/junior/writing" element={<JuniorWriting />} />
          <Route path="/junior/writing/:id" element={<JuniorWritingPlay />} />
          <Route path="/gaokao" element={<Gaokao />} />
          <Route path="/gaokao/g/:grade" element={<GaokaoGrade />} />
          <Route path="/gaokao/exam" element={<GaokaoExam />} />
          <Route path="/gaokao/diagnostic" element={<GaokaoDiagnostic />} />
          <Route path="/gaokao/grammar" element={<GaokaoGrammar />} />
          <Route path="/gaokao/grammar/:slug" element={<GaokaoGrammarPoint />} />
          <Route path="/gaokao/grammar/:slug/quiz" element={<GaokaoGrammarQuiz />} />
          <Route path="/gaokao/grammar/:slug/quiz/:index" element={<GaokaoGrammarQuiz />} />
          <Route path="/gaokao/reading" element={<GaokaoReading />} />
          <Route path="/gaokao/reading/knowledge" element={<GaokaoReadingKnowledge />} />
          <Route path="/gaokao/reading/article/:id" element={<GaokaoReadingArticle />} />
          <Route path="/gaokao/reading/:id" element={<GaokaoReadingPlay />} />
          <Route path="/gaokao/vocab" element={<GaokaoVocab />} />
          <Route path="/gaokao/cloze" element={<GaokaoCloze />} />
          <Route path="/gaokao/cloze/:id" element={<GaokaoClozePlay />} />
          <Route path="/gaokao/mistakes" element={<GaokaoMistakes />} />
          <Route path="/level/:levelId" element={<Level />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/level/:levelId/unit/:unitId" element={<Unit />} />
          <Route path="/level/:levelId/unit/:unitId/lesson/:lessonId" element={<Lesson />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </div>
        <BottomTabBar />
      </BrowserRouter>
    </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
