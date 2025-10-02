// =====================================================
// INVESTOR BEHAVIOR INSIGHTS
// Analyzes investor behavior patterns
// =====================================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvestorBehavior } from '@/hooks/quarterly-aum/useCategoryAnalysis';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Droplets, TrendingUp, Gauge } from 'lucide-react';

export function InvestorBehaviorInsights() {
  const { metrics, isLoading } = useInvestorBehavior();

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!metrics) {
    return null;
  }

  const getRiskAppetiteLevel = (score: number) => {
    if (score >= 75) return { label: 'Very High', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (score >= 50) return { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    if (score >= 25) return { label: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { label: 'Low', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const riskLevel = getRiskAppetiteLevel(metrics.risk_appetite_score);

  const insights = [
    {
      title: 'Risk Appetite',
      value: riskLevel.label,
      subtitle: `Score: ${metrics.risk_appetite_score.toFixed(0)}/100`,
      description: `Equity/Debt Ratio: ${metrics.equity_debt_ratio.toFixed(2)}`,
      icon: Gauge,
      color: riskLevel.color,
      bgColor: riskLevel.bgColor,
      interpretation: metrics.equity_debt_ratio > 1 
        ? 'Investors are favoring equity over debt, indicating higher risk appetite'
        : 'Investors prefer debt instruments, showing conservative approach'
    },
    {
      title: 'Liquidity Preference',
      value: `${metrics.liquidity_preference_percent.toFixed(1)}%`,
      subtitle: 'of total AUM',
      description: 'Overnight + Liquid + Money Market',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      interpretation: metrics.liquidity_preference_percent > 15
        ? 'High liquidity preference suggests cautious investor sentiment'
        : 'Moderate liquidity levels indicate balanced portfolio allocation'
    },
    {
      title: 'Passive Adoption',
      value: `${metrics.passive_penetration_percent.toFixed(1)}%`,
      subtitle: 'Index Funds + ETFs',
      description: 'Passive fund market share',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      interpretation: metrics.passive_penetration_percent > 10
        ? 'Growing passive adoption reflects cost-conscious investing trend'
        : 'Active management still dominates investor preferences'
    },
    {
      title: 'Market Sentiment',
      value: metrics.equity_debt_ratio > 1 ? 'Bullish' : 'Cautious',
      subtitle: 'Based on asset allocation',
      description: `Equity: ${(metrics.equity_debt_ratio / (1 + metrics.equity_debt_ratio) * 100).toFixed(0)}%`,
      icon: TrendingUp,
      color: metrics.equity_debt_ratio > 1 ? 'text-green-600' : 'text-orange-600',
      bgColor: metrics.equity_debt_ratio > 1 ? 'bg-green-50' : 'bg-orange-50',
      interpretation: metrics.equity_debt_ratio > 1.5
        ? 'Strong bullish sentiment with heavy equity allocation'
        : 'Balanced approach with diversified asset allocation'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investor Behavior Insights</CardTitle>
        <CardDescription>
          Analysis of investor preferences and market sentiment based on fund allocation patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div key={idx} className="space-y-3">
                <div className={`p-4 rounded-lg ${insight.bgColor}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        {insight.title}
                      </div>
                      <div className={`text-2xl font-bold ${insight.color}`}>
                        {insight.value}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {insight.subtitle}
                      </div>
                    </div>
                    <Icon className={`h-5 w-5 ${insight.color}`} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {insight.description}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {insight.interpretation}
                </p>
              </div>
            );
          })}
        </div>

        {/* Overall Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <h4 className="font-semibold mb-2">Overall Market Interpretation</h4>
          <p className="text-sm text-muted-foreground">
            {(() => {
              if (metrics.equity_debt_ratio > 1.5 && metrics.passive_penetration_percent > 12) {
                return 'Investors show strong bullish sentiment with high equity allocation, while also embracing cost-effective passive strategies. This indicates confidence in market growth combined with smart cost management.';
              } else if (metrics.equity_debt_ratio < 0.8 && metrics.liquidity_preference_percent > 15) {
                return 'Conservative investor behavior is evident with preference for debt and liquid funds. This suggests cautious market sentiment, possibly due to economic uncertainty or profit booking.';
              } else if (metrics.passive_penetration_percent > 15) {
                return 'Rapid adoption of passive funds indicates a maturing market where investors prioritize low-cost, diversified exposure over active stock picking.';
              } else {
                return 'Balanced investor behavior with diversified allocation across asset classes. The market shows healthy mix of risk-taking and prudent investing.';
              }
            })()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
