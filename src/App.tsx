import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Level from "./pages/Level.tsx";
import Unit from "./pages/Unit.tsx";
import Lesson from "./pages/Lesson.tsx";
import Auth from "./pages/Auth.tsx";
import Stats from "./pages/Stats.tsx";
import Placement from "./pages/Placement.tsx";
import Slang from "./pages/Slang.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/placement" element={<Placement />} />
          <Route path="/slang" element={<Slang />} />
          <Route path="/level/:levelId" element={<Level />} />
          <Route path="/level/:levelId/unit/:unitId" element={<Unit />} />
          <Route path="/level/:levelId/unit/:unitId/lesson/:lessonId" element={<Lesson />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
