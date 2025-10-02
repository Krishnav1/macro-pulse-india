// =====================================================
// INVESTOR BEHAVIOR PAGE
// Comprehensive analysis of investor behavior patterns
// =====================================================

import { Users, TrendingUp, BarChart3, Activity, Layers, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StickinessMetricsCards } from '@/components/financial/investor-behavior/StickinessMetricsCards';
import { HoldingPeriodDistribution } from '@/components/financial/investor-behavior/HoldingPeriodDistribution';
import { LiquidityPreferenceHeatmap } from '@/components/financial/investor-behavior/LiquidityPreferenceHeatmap';
import { RiskAppetiteChart } from '@/components/financial/investor-behavior/RiskAppetiteChart';
import { HoldingPeriodTrendChart } from '@/components/financial/investor-behavior/HoldingPeriodTrendChart';
import { AgeGroupCompositionChart } from '@/components/financial/investor-behavior/AgeGroupCompositionChart';

export default function InvestorBehaviorPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Investor Behavior Analysis
            </h1>
            <p className="text-muted-foreground">
              Understanding investor stickiness, holding patterns, and risk appetite across age groups
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <StickinessMetricsCards />

      {/* Main Analysis Section */}
      <div className="grid gap-6">
        {/* Holding Period Distribution */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Holding Period Distribution by Age Group
            </CardTitle>
            <CardDescription>
              How different investor types hold their investments across time periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoldingPeriodDistribution />
          </CardContent>
        </Card>

        {/* Liquidity Preference Heatmap */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              Liquidity Preference Heatmap
            </CardTitle>
            <CardDescription>
              Percentage allocation across holding periods for each age group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LiquidityPreferenceHeatmap />
          </CardContent>
        </Card>

        {/* Risk Appetite Analysis */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Risk Appetite: Equity vs Non-Equity
            </CardTitle>
            <CardDescription>
              Asset allocation preferences revealing risk tolerance by age group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskAppetiteChart />
          </CardContent>
        </Card>

        {/* Holding Period Trend Over Time */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Holding Period Evolution Over Time
            </CardTitle>
            <CardDescription>
              Quarterly trends showing how investor behavior changes over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HoldingPeriodTrendChart />
          </CardContent>
        </Card>

        {/* Age Group Composition Trend */}
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Age Group Composition Over Time
            </CardTitle>
            <CardDescription>
              Growth trajectory of different investor segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgeGroupCompositionChart />
          </CardContent>
        </Card>

        {/* Key Insights Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              Key Insights & Takeaways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-green-600">✓</span> Positive Indicators
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span><strong>High long-term holdings (&gt;24 months)</strong> indicate investor confidence and market stability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span><strong>Growing retail participation</strong> shows market democratization and financial inclusion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span><strong>Increasing average holding period</strong> reflects maturing investor behavior</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span><strong>Balanced equity allocation</strong> suggests healthy risk appetite without excessive speculation</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-red-600">⚠</span> Risk Indicators
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span><strong>High short-term holdings (0-3 months)</strong> signal potential redemption pressure and volatility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span><strong>Declining average holding period</strong> may indicate weakening investor conviction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span><strong>Excessive equity concentration</strong> in certain segments could amplify market corrections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span><strong>Sudden shifts in holding patterns</strong> often precede market turning points</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span>📊</span> How to Use This Data
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <strong className="text-foreground">For AMCs:</strong>
                  <p className="mt-1">Design products targeting specific holding periods; focus retention efforts on high-churn segments</p>
                </div>
                <div>
                  <strong className="text-foreground">For Investors:</strong>
                  <p className="mt-1">Benchmark your behavior against peers; understand if you're too aggressive or conservative</p>
                </div>
                <div>
                  <strong className="text-foreground">For Analysts:</strong>
                  <p className="mt-1">Predict fund flows; identify early warning signs of market sentiment shifts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
