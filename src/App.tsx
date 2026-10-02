
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ContentPage from "./pages/ContentPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import DonationCheckoutPage from "./pages/DonationCheckoutPage";
import { LiveVisitorsProvider } from "@/context/LiveVisitorsContext";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <LiveVisitorsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/donate" element={<DonationCheckoutPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/about" element={<ContentPage />} />
          <Route path="/initiatives" element={<ContentPage />} />
          <Route path="/campaigns" element={<ContentPage />} />
          <Route path="/story" element={<ContentPage />} />
          <Route path="/gallery" element={<ContentPage />} />
          <Route path="/blogs" element={<ContentPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/parivattan-admin/login/kishor" element={<AdminLogin />} />
          <Route path="/parivattan-admin/dashboard" element={<AdminDashboard />} />
    
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LiveVisitorsProvider>
  </TooltipProvider>
); 

export default App;
