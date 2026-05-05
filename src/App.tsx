import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SafeBiteProvider } from "@/context/SafeBiteContext";
import Index from "./pages/Index.tsx";
import InputPage from "./pages/InputPage.tsx";
import ResultPage from "./pages/ResultPage.tsx";
import DetailPage from "./pages/DetailPage.tsx";
import SavedPage from "./pages/SavedPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SafeBiteProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/input" element={<InputPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/detail" element={<DetailPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SafeBiteProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
