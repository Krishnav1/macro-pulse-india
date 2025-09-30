import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIipSeries } from '@/hooks/useIipSeries';
import { useIipComponents } from '@/hooks/useIipComponents';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';
import { TrendingUp, TrendingDown, BarChart3, Factory, Eye, EyeOff } from 'lucide-react';

export const IIPInsights = () => {
  const [showFullInsights, setShowFullInsights] = useState(false);
  const { data: seriesData, loading: seriesLoading } = useIipSeries({ limit: 12 });
  const { breakdown, loading: componentsLoading } = useIipComponents({
    classification: 'sectoral'
  });
  const { insights: adminInsights, loading: insightsLoading } = useIndicatorInsights('iip');

  if (seriesLoading || componentsLoading || insightsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading insights...</div>
        </CardContent>
      </Card>
    );
  }

  const latest = seriesData?.[0];
  const threeMonthsAgo = seriesData?.[2];
  const sixMonthsAgo = seriesData?.[5];

  // Calculate trends
  const getThreeMonthTrend = () => {
    if (!latest || !threeMonthsAgo) return null;
    return latest.index_value - threeMonthsAgo.index_value;
  };

  const getSixMonthTrend = () => {
    if (!latest || !sixMonthsAgo) return null;
    return latest.index_value - sixMonthsAgo.index_value;
  };

  // Get best and worst performing sectors (by latest index value)
  const getBestPerformingSector = () => {
    if (!breakdown || breakdown.length === 0) return null;
    return breakdown.reduce((best, current) => 
      (current.latest_value || 0) > (best.latest_value || 0) ? current : best
    );
  };

  const getWorstPerformingSector = () => {
    if (!breakdown || breakdown.length === 0) return null;
    return breakdown.reduce((worst, current) => 
      (current.latest_value || 0) < (worst.latest_value || 0) ? current : worst
    );
  };

  const threeMonthTrend = getThreeMonthTrend();
  const sixMonthTrend = getSixMonthTrend();
  const bestSector = getBestPerformingSector();
  const worstSector = getWorstPerformingSector();

  const insights = [
    // Current performance insight
    latest && {
      icon: latest.growth_yoy && latest.growth_yoy > 0 ? TrendingUp : TrendingDown,
      title: "Current Performance",
      description: `Industrial production is ${latest.growth_yoy && latest.growth_yoy > 0 ? 'expanding' : 'contracting'} at ${Math.abs(latest.growth_yoy || 0).toFixed(1)}% YoY`,
      color: latest.growth_yoy && latest.growth_yoy > 0 ? "text-green-600" : "text-red-600"
    },

    // Trend analysis
    threeMonthTrend !== null && {
      icon: threeMonthTrend > 0 ? TrendingUp : TrendingDown,
      title: "3-Month Trend",
      description: `Index ${threeMonthTrend > 0 ? 'increased' : 'decreased'} by ${Math.abs(threeMonthTrend).toFixed(1)} points over the last quarter`,
      color: threeMonthTrend > 0 ? "text-green-600" : "text-red-600"
    },

    // Medium-term trend
    sixMonthTrend !== null && {
      icon: sixMonthTrend > 0 ? TrendingUp : TrendingDown,
      title: "6-Month Outlook",
      description: `${sixMonthTrend > 0 ? 'Positive' : 'Negative'} momentum with ${Math.abs(sixMonthTrend).toFixed(1)} point change over 6 months`,
      color: sixMonthTrend > 0 ? "text-green-600" : "text-red-600"
    },

    // Best performing sector
    bestSector && {
      icon: Factory,
      title: "Top Performer",
      description: `${bestSector.component_name} leads with index value of ${bestSector.latest_value?.toFixed(1)}`,
      color: "text-blue-600"
    },

    // Volatility insight
    latest && {
      icon: BarChart3,
      title: "Growth Volatility",
      description: `MoM growth at ${Math.abs(latest.growth_mom || 0).toFixed(1)}% indicates ${Math.abs(latest.growth_mom || 0) > 2 ? 'high' : 'moderate'} volatility`,
      color: "text-purple-600"
    }
  ].filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Insights</CardTitle>
        <CardDescription>
          AI-powered analysis of industrial production trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              if (!insight) return null;
              const IconComponent = insight.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`mt-0.5 ${insight.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                <strong>Summary:</strong> Industrial production shows{' '}
                {latest?.growth_yoy && latest.growth_yoy > 0 ? 'positive' : 'challenging'} trends with{' '}
                {threeMonthTrend && threeMonthTrend > 0 ? 'improving' : 'declining'} momentum over recent months.
                {bestSector && ` ${bestSector.component_name} sector demonstrates strong performance.`}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No insights available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
