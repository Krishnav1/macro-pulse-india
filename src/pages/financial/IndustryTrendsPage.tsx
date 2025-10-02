// =====================================================
// INDUSTRY TRENDS PAGE
// Comprehensive analysis of mutual fund industry trends
// =====================================================

import { useState } from 'react';
import { TrendingUp, PieChart, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AUMGrowthChart } from '@/components/financial/industry-trends/AUMGrowthChart';
import { AssetClassDistribution } from '@/components/financial/industry-trends/AssetClassDistribution';
import { CategoryBreakdownChart } from '@/components/financial/industry-trends/CategoryBreakdownChart';
import { FundFlowHeatmap } from '@/components/financial/industry-trends/FundFlowHeatmap';
import { ActiveVsPassiveChart } from '@/components/financial/industry-trends/ActiveVsPassiveChart';
import { InvestorBehaviorInsights } from '@/components/financial/industry-trends/InvestorBehaviorInsights';
import { KeyMetricsCards } from '@/components/financial/industry-trends/KeyMetricsCards';
import { useLatestQuarterData } from '@/hooks/quarterly-aum/useQuarterlyAUMData';

export default function IndustryTrendsPage() {
  const [viewMode, setViewMode] = useState<'quarterly' | 'annual'>('quarterly');
  const { latestQuarter } = useLatestQuarterData();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Industry Trends</h1>
        <p className="text-muted-foreground">
          Comprehensive analysis of mutual fund industry growth, composition, and investor behavior
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">View Mode:</span>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'quarterly' | 'annual')}>
          <TabsList>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics Cards */}
      <KeyMetricsCards viewMode={viewMode} />

      {/* Main Charts Section */}
      <div className="grid gap-6">
        {/* AUM Growth Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Total AUM Growth Trend
            </CardTitle>
            <CardDescription>
              Industry-wide Assets Under Management from 2011 to present
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AUMGrowthChart viewMode={viewMode} />
          </CardContent>
        </Card>

        {/* Asset Class Distribution */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Asset Class Distribution
              </CardTitle>
              <CardDescription>
                Composition over time: Equity, Debt, Hybrid, Others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetClassDistribution viewMode={viewMode} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Current Quarter Breakdown
              </CardTitle>
              <CardDescription>
                Latest quarter asset allocation ({latestQuarter ? new Date(latestQuarter).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Loading...'})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBreakdownChart />
            </CardContent>
          </Card>
        </div>

        {/* Active vs Passive Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active vs Passive Investment Trend
            </CardTitle>
            <CardDescription>
              Growth of passive funds (Index Funds & ETFs) vs actively managed funds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActiveVsPassiveChart viewMode={viewMode} />
          </CardContent>
        </Card>

        {/* Fund Flow Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance Heatmap</CardTitle>
            <CardDescription>
              Quarter-over-quarter growth rates across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FundFlowHeatmap />
          </CardContent>
        </Card>

        {/* Investor Behavior Insights */}
        <InvestorBehaviorInsights />
      </div>
    </div>
  );
}
