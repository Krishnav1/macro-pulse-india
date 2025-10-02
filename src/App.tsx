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
const IIPIndicator = lazy(() => import('./pages/IIPIndicator'));
const IIPPage = lazy(() => import('./pages/indicators/iip'));
const RealGdpGrowthPage = lazy(() => import('./pages/indicators/real_gdp_growth'));
const RealGdpGrowthInsights = lazy(() => import('./pages/indicators/real_gdp_growth/insights'));
const ForexReservesInsights = lazy(() => import('./pages/indicators/forex_reserves/insights'));
const RepoRatePage = lazy(() => import('./pages/indicators/repo_rate'));
const RepoRateInsights = lazy(() => import('./pages/indicators/repo_rate/insights'));
const ExchangeRatePage = lazy(() => import('./pages/indicators/exchange-rate'));
const IndiaHeatMap = lazy(() => import('./pages/india-heat-map'));
const FinancialMarketsPage = lazy(() => import('./pages/financial_markets/FinancialMarketsPage'));
const SectoralHeatmapPage = lazy(() => import('./pages/financial_markets/equity/SectoralHeatmapPage'));
const MutualFundsPage = lazy(() => import('./pages/financial/MutualFundsPage'));
const AMCDetailPage = lazy(() => import('./pages/financial/AMCDetailPage'));
const SchemeDetailPage = lazy(() => import('./pages/financial/SchemeDetailPage'));
const IndustryTrendsPage = lazy(() => import('./pages/financial/IndustryTrendsPage'));
const CurrencyMarketsPage = lazy(() => import('./pages/financial/CurrencyMarketsPage'));
const FIIDIIActivityPage = lazy(() => import('./pages/financial/FIIDIIActivityPage'));
const IPOMarketsPage = lazy(() => import('./pages/financial/IPOMarketsPage'));
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
              <Route path="/india-heat-map" element={<IndiaHeatMap />} />
              <Route path="/indicators/cpi" element={<CPIPage />} />
              <Route path="/indicators/cpi/insights" element={<CPIFullInsight />} />
              <Route path="/indicators/iip" element={<IIPPage />} />
              <Route path="/indicators/forex_reserves" element={<IndicatorRouter />} />
              <Route path="/indicators/forex_reserves/insights" element={<ForexReservesInsights />} />
              <Route path="/indicators/real_gdp_growth" element={<RealGdpGrowthPage />} />
              <Route path="/indicators/real-gdp-growth/insights" element={<RealGdpGrowthInsights />} />
              <Route path="/indicators/repo-rate" element={<RepoRatePage />} />
              <Route path="/indicators/repo-rate/insights" element={<RepoRateInsights />} />
              <Route path="/indicators/exchange-rate" element={<ExchangeRatePage />} />
              <Route path="/indicator/iip" element={<IIPPage />} />
              <Route path="/indicator/:id" element={<IndicatorRouter />} />
              <Route path="/events" element={<Events />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/indicator/:slug" element={<Admin />} />
              <Route path="/financial-markets" element={<FinancialMarketsPage />} />
              <Route path="/financial-markets/equity-markets" element={<SectoralHeatmapPage />} />
              <Route path="/financial-markets/mutual-funds" element={<MutualFundsPage />} />
              <Route path="/financial-markets/mutual-funds/amc/:amcCode" element={<AMCDetailPage />} />
              <Route path="/financial-markets/mutual-funds/scheme/:schemeCode" element={<SchemeDetailPage />} />
              <Route path="/financial-markets/industry-trends" element={<IndustryTrendsPage />} />
              <Route path="/financial-markets/currency-markets" element={<CurrencyMarketsPage />} />
              <Route path="/financial-markets/fii-dii-activity" element={<FIIDIIActivityPage />} />
              <Route path="/financial-markets/ipo-markets" element={<IPOMarketsPage />} />
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
