import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import Dashboard from "./pages/Dashboard";
import LearningPath from "./pages/LearningPath";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CareerPathSelector from '@/pages/CareerPathSelector';
import VRCareerPath from "@/pages/VRCareerPath";
import SelfAssessment from "@/pages/SelfAssessment";
import LearnWithAI from "@/pages/LearnWithAI";
import StandardRoadmap from "@/pages/StandardRoadmap";
import StandardRoadmaps from "@/pages/StandardRoadmaps";
import { SessionProvider } from "./providers/SessionProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/assessment" element={<Assessment />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/career-paths" element={<CareerPathSelector />} />
                <Route path="/vr-career-path/:pathId" element={<VRCareerPath />} />
                <Route path="/standard-roadmap/:pathId" element={<StandardRoadmap />} />
                <Route path="/standard-roadmaps" element={<StandardRoadmaps />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/learning" element={
                  <ProtectedRoute>
                    <SelfAssessment />
                  </ProtectedRoute>
                } />
                <Route path="/self-assessment" element={
                  <ProtectedRoute>
                    <SelfAssessment />
                  </ProtectedRoute>
                } />
                <Route path="/learn-with-ai" element={
                  <ProtectedRoute>
                    <LearnWithAI />
                  </ProtectedRoute>
                } />
                <Route path="/learning-path/:assessmentId" element={
                  <ProtectedRoute>
                    <LearningPath />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
