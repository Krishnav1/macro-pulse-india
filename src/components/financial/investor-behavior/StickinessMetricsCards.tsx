// =====================================================
// STICKINESS METRICS CARDS
// Key metrics for investor behavior
// =====================================================

import { TrendingUp, TrendingDown, Clock, AlertTriangle, Users, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLatestQuarterMetrics } from '@/hooks/investor-behavior/useInvestorBehaviorData';
import { Skeleton } from '@/components/ui/skeleton';

export function StickinessMetricsCards() {
  const { metrics, isLoading } = useLatestQuarterMetrics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No data available. Please upload investor behavior data from the admin panel.</p>
      </div>
    );
  }

  const getChurnRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Average Holding Period */}
      <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg Holding Period
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">
            {metrics.avg_holding_period.toFixed(1)} months
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Weighted average across all investors
          </p>
        </CardContent>
      </Card>

      {/* Long-term Holdings */}
      <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Long-term Holdings
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {metrics.long_term_percentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            AUM held for &gt;24 months (sticky investors)
          </p>
        </CardContent>
      </Card>

      {/* Short-term Holdings */}
      <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Short-term Holdings
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {metrics.short_term_percentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            AUM held for 0-3 months (potential churn)
          </p>
        </CardContent>
      </Card>

      {/* Churn Risk Level */}
      <Card className={`border-l-4 ${
        metrics.churn_risk_level === 'Low' ? 'border-l-green-500' :
        metrics.churn_risk_level === 'Medium' ? 'border-l-yellow-500' :
        'border-l-red-500'
      } hover:shadow-lg transition-shadow`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Churn Risk Level
          </CardTitle>
          <AlertTriangle className={`h-4 w-4 ${getChurnRiskColor(metrics.churn_risk_level)}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getChurnRiskColor(metrics.churn_risk_level)}`}>
            {metrics.churn_risk_level}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on short-term holding patterns
          </p>
        </CardContent>
      </Card>

      {/* Equity Allocation */}
      <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Equity Allocation
          </CardTitle>
          <PieChart className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600">
            {metrics.equity_percentage.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.non_equity_percentage.toFixed(1)}% in non-equity
          </p>
        </CardContent>
      </Card>

      {/* Total AUM */}
      <Card className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total AUM
          </CardTitle>
          <Users className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-600">
            ₹{(metrics.total_aum / 100000).toFixed(2)}L Cr
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            As of {new Date(metrics.quarter_end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
