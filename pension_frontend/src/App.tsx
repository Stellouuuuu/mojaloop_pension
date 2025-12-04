import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pensioners from "./pages/Pensioners";
import PensionersHistory from "./pages/PensionersHistory";
import PensionerProfile from "./pages/PensionerProfile";
import Payments from "./pages/Payments";
import History from "./pages/History";
import Reports from "./pages/Reports";
import PaymentsHistory from './pages/Lot.tsx';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pensioners" element={<Pensioners />} />
            <Route path="/payments/history" element={<History />} />
            <Route path="/lot/history" element={<PaymentsHistory />} />  
            <Route path="/pensioners/history" element={<PensionersHistory />} />
            <Route path="/pensioners/:id" element={<PensionerProfile />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
