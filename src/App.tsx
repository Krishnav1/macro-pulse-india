import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import React, { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const IndicatorRouter = lazy(() => import("./pages/IndicatorRouter"));
const Indicators = lazy(() => import("./pages/Indicators"));
const Events = lazy(() => import("./pages/Events"));
const About = lazy(() => import("./pages/About"));
const Admin = lazy(() => import("./pages/Admin"));
const CPIPage = lazy(() => import("./pages/indicators/cpi"));
const CPIFullInsight = lazy(() => import("./pages/CPIFullInsight"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/indicators" element={<Indicators />} />
              <Route path="/indicators/cpi" element={<CPIPage />} />
              <Route path="/indicators/cpi/insights" element={<CPIFullInsight />} />
              <Route path="/indicator/:id" element={<IndicatorRouter />} />
              <Route path="/events" element={<Events />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/indicator/:slug" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
