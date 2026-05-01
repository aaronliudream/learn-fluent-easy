import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { stopSpeaking } from "@/lib/speak";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LanguagePickerModal } from "@/i18n/LanguagePickerModal";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Level from "./pages/Level.tsx";
import Levels from "./pages/Levels.tsx";
import Unit from "./pages/Unit.tsx";
import Lesson from "./pages/Lesson.tsx";
import Auth from "./pages/Auth.tsx";
import Stats from "./pages/Stats.tsx";
import WeeklyReport from "./pages/WeeklyReport.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import Placement from "./pages/Placement.tsx";
import Slang from "./pages/Slang.tsx";
import Account from "./pages/Account.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Scenes from "./pages/Scenes.tsx";
import ScenesCategory from "./pages/ScenesCategory.tsx";
import ScenesPlay from "./pages/ScenesPlay.tsx";
import Workplace from "./pages/Workplace.tsx";
import WorkplaceCategory from "./pages/WorkplaceCategory.tsx";
import WorkplacePlay from "./pages/WorkplacePlay.tsx";
import Talk from "./pages/Talk.tsx";
import Gaokao from "./pages/Gaokao.tsx";
import GaokaoGrammar from "./pages/GaokaoGrammar.tsx";
import GaokaoGrammarPoint from "./pages/GaokaoGrammarPoint.tsx";
import GaokaoReading from "./pages/GaokaoReading.tsx";
import GaokaoReadingPlay from "./pages/GaokaoReadingPlay.tsx";
import GaokaoVocab from "./pages/GaokaoVocab.tsx";
import GaokaoDiagnostic from "./pages/GaokaoDiagnostic.tsx";
import SavedPhrases from "./pages/SavedPhrases.tsx";
import Review from "./pages/Review.tsx";
import { BottomTabBar } from "@/components/BottomTabBar";

const queryClient = new QueryClient();

const StopAudioOnRouteChange = () => {
  const location = useLocation();
  useEffect(() => {
    stopSpeaking();
  }, [location.pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StopAudioOnRouteChange />
        <LanguagePickerModal />
        <div className="pb-tabbar lg:pb-0">
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
          <Route path="/scenes/:catKey" element={<ScenesCategory />} />
          <Route path="/scenes/:catKey/:dialogueId" element={<ScenesPlay />} />
          <Route path="/workplace" element={<Workplace />} />
          <Route path="/workplace/:catKey" element={<WorkplaceCategory />} />
          <Route path="/workplace/:catKey/:dialogueId" element={<WorkplacePlay />} />
          <Route path="/talk" element={<Talk />} />
          <Route path="/gaokao" element={<Gaokao />} />
          <Route path="/gaokao/diagnostic" element={<GaokaoDiagnostic />} />
          <Route path="/gaokao/grammar" element={<GaokaoGrammar />} />
          <Route path="/gaokao/grammar/:slug" element={<GaokaoGrammarPoint />} />
          <Route path="/gaokao/reading" element={<GaokaoReading />} />
          <Route path="/gaokao/reading/:id" element={<GaokaoReadingPlay />} />
          <Route path="/gaokao/vocab" element={<GaokaoVocab />} />
          <Route path="/level/:levelId" element={<Level />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/level/:levelId/unit/:unitId" element={<Unit />} />
          <Route path="/level/:levelId/unit/:unitId/lesson/:lessonId" element={<Lesson />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
        <BottomTabBar />
      </BrowserRouter>
    </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
