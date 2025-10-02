6// =====================================================
// INVESTOR BEHAVIOR PAGE - REDESIGNED
// Interactive, comprehensive, single-view analysis
// =====================================================

import { useState } from 'react';
import { Users, TrendingUp, BarChart3, Activity, Layers, Target, Info, HelpCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StickinessMetricsCards } from '@/components/financial/investor-behavior/StickinessMetricsCards';
import { HoldingPeriodDistribution } from '@/components/financial/investor-behavior/HoldingPeriodDistribution';
import { LiquidityPreferenceHeatmap } from '@/components/financial/investor-behavior/LiquidityPreferenceHeatmap';
import { RiskAppetiteChart } from '@/components/financial/investor-behavior/RiskAppetiteChart';
import { HoldingPeriodTrendChart } from '@/components/financial/investor-behavior/HoldingPeriodTrendChart';
import { AgeGroupCompositionChart } from '@/components/financial/investor-behavior/AgeGroupCompositionChart';

// Terminology definitions
const TERMINOLOGY = [
  {
    term: "Stickiness",
    definition: "Measure of how long investors hold their investments. Higher stickiness (>24 months) = stable, committed investors."
  },
  {
    term: "Churn Risk",
    definition: "Percentage of AUM in 0-1 month bucket. High churn risk (>25%) indicates potential mass redemptions."
  },
  {
    term: "Holding Period",
    definition: "Duration for which investors hold their mutual fund investments before redeeming."
  },
  {
    term: "Age Group",
    definition: "Investor classification: Corporates (companies), Banks/FIs (financial institutions), HNI (high net worth), Retail (individual investors), NRI (non-resident Indians)."
  },
  {
    term: "AUM (Assets Under Management)",
    definition: "Total market value of investments managed. Measured in crores (1 crore = 10 million)."
  },
  {
    term: "Liquidity Preference",
    definition: "How investors distribute their investments across different time horizons. Shows risk tolerance and investment goals."
  }
];

export default function InvestorBehaviorPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTerminology, setShowTerminology] = useState(false);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header + Terminology in Single Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            Investor Behavior Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            Stickiness, holding patterns, and risk appetite insights
          </p>
        </div>
        <button
          onClick={() => setShowTerminology(!showTerminology)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Terminology</span>
        </button>
      </div>

      {/* Tabs - Right after header */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="overview" className="text-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="behavior" className="text-sm">
            <Layers className="h-4 w-4 mr-2" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="risk" className="text-sm">
            <Target className="h-4 w-4 mr-2" />
            Risk Profile
          </TabsTrigger>
          <TabsTrigger value="trends" className="text-sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Terminology Panel */}
        {showTerminology && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                Key Terminology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TERMINOLOGY.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">{item.term}</h4>
                    <p className="text-xs text-muted-foreground">{item.definition}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs - Single Row, Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-blue-200">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Avg Holding Period</div>
                <div className="text-2xl font-bold text-blue-600">21.1 months</div>
                <div className="text-xs text-muted-foreground mt-1">Weighted average</div>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Long-term Holdings</div>
                <div className="text-2xl font-bold text-green-600">46.7%</div>
                <div className="text-xs text-muted-foreground mt-1">AUM &gt;24 months</div>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Short-term Holdings</div>
                <div className="text-2xl font-bold text-orange-600">19.1%</div>
                <div className="text-xs text-muted-foreground mt-1">AUM 0-3 months</div>
              </CardContent>
            </Card>
            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground mb-1">Total AUM</div>
                <div className="text-2xl font-bold text-purple-600">₹48.74L Cr</div>
                <div className="text-xs text-muted-foreground mt-1">As of Jun 2025</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts - Side by Side */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Holding Period Distribution</CardTitle>
                <CardDescription className="text-xs">
                  AUM distribution across holding periods by age group
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[450px]">
                <HoldingPeriodDistribution />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Risk Appetite Analysis</CardTitle>
                <CardDescription className="text-xs">
                  Equity vs Non-Equity allocation by age group
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[450px]">
                <RiskAppetiteChart />
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Quick Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="font-semibold text-green-600 mb-1">✓ Sticky Investors</div>
                  <p className="text-xs text-muted-foreground">Investors with &gt;24 month holdings show strong conviction and market confidence</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="font-semibold text-orange-600 mb-1">⚠ Churn Risk</div>
                  <p className="text-xs text-muted-foreground">High 0-3 month holdings indicate potential redemption pressure</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                  <div className="font-semibold text-purple-600 mb-1">📊 Risk Appetite</div>
                  <p className="text-xs text-muted-foreground">Equity allocation reveals investor risk tolerance and market sentiment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab - Heatmap Focus */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liquidity Preference Heatmap</CardTitle>
              <CardDescription className="text-sm">
                Percentage allocation across holding periods - darker colors indicate higher concentration
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <LiquidityPreferenceHeatmap />
            </CardContent>
          </Card>

          {/* Behavioral Insights */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">🎯</span> Long-term Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Right-heavy rows</strong> (green on right) = Long-term oriented investors</p>
                <p className="text-xs text-muted-foreground">• High stickiness score<br/>• Stable fund flows<br/>• Low redemption risk</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-2xl">⚡</span> Short-term Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Left-heavy rows</strong> (green on left) = Short-term oriented investors</p>
                <p className="text-xs text-muted-foreground">• High churn risk<br/>• Volatile fund flows<br/>• Requires monitoring</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Tab - Risk Analysis */}
        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Equity vs Non-Equity Allocation</CardTitle>
              <CardDescription className="text-sm">
                Asset allocation revealing risk tolerance by investor type
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <RiskAppetiteChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Holding Period Distribution</CardTitle>
              <CardDescription className="text-sm">
                Holding periods by investor type
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <HoldingPeriodDistribution />
            </CardContent>
          </Card>

          {/* Risk Interpretation */}
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-green-600" />
                Risk Profile Interpretation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                  <div className="font-semibold text-green-600 mb-2">High Risk (&gt;50% Equity)</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Aggressive investors</li>
                    <li>• Growth-focused</li>
                    <li>• Higher volatility tolerance</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                  <div className="font-semibold text-blue-600 mb-2">Medium Risk (30-50% Equity)</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Balanced investors</li>
                    <li>• Growth + stability</li>
                    <li>• Moderate volatility</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg">
                  <div className="font-semibold text-purple-600 mb-2">Low Risk (&lt;30% Equity)</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Conservative investors</li>
                    <li>• Stability-focused</li>
                    <li>• Low volatility preference</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab - Time Series */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Holding Period Evolution Over Time</CardTitle>
              <CardDescription className="text-sm">
                How investor behavior changes across quarters
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <HoldingPeriodTrendChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Age Group Composition Trends</CardTitle>
              <CardDescription className="text-sm">
                Growth trajectory of different investor segments
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <AgeGroupCompositionChart />
            </CardContent>
          </Card>

          {/* Trend Insights */}
          <Card className="bg-gradient-to-br from-orange-50 to-indigo-50 dark:from-orange-950/20 dark:to-indigo-950/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-orange-600" />
                Trend Analysis Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-semibold text-green-600">Positive Signals</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Growing green area (long-term holdings)</li>
                    <li>• Increasing retail participation</li>
                    <li>• Rising average holding period</li>
                    <li>• Stable or declining churn risk</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold text-red-600">Warning Signals</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Growing red area (short-term holdings)</li>
                    <li>• Declining retail participation</li>
                    <li>• Decreasing average holding period</li>
                    <li>• Rising churn risk</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
  );
}
