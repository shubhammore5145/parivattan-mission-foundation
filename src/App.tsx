
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ContentPage from "./pages/ContentPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import DonationCheckoutPage from "./pages/DonationCheckoutPage";
import { LiveVisitorsProvider } from "@/context/LiveVisitorsContext";

import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import RegistrationPage from "./pages/RegistrationPage";
import RulesPage from "./pages/RulesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ContactPage from "./pages/ContactPage";
import StudentPortalPage from "./pages/StudentPortalPage";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <LiveVisitorsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/donate" element={<DonationCheckoutPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/register" element={<Navigate to="/admissions#admission-form" replace />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/rules-and-regulations" element={<RulesPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/student" element={<StudentPortalPage />} />
          <Route path="/student/*" element={<StudentPortalPage />} />
          <Route path="/student-portal" element={<StudentPortalPage />} />
          <Route path="/student-section" element={<StudentPortalPage />} />
          <Route path="/about" element={<ContentPage />} />
          <Route path="/team" element={<ContentPage />} />
          <Route path="/our-team" element={<ContentPage />} />
          <Route path="/initiatives" element={<ContentPage />} />
          <Route path="/campaigns" element={<ContentPage />} />
          <Route path="/story" element={<ContentPage />} />
          <Route path="/gallery" element={<ContentPage />} />
          <Route path="/blogs" element={<ContentPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
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
