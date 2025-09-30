import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, BarChart3, Eye } from 'lucide-react';
import { useIipSeries } from '@/hooks/useIipSeries';
import { useIipComponents } from '@/hooks/useIipComponents';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';
import { format } from 'date-fns';

export const IIPMetrics = () => {
  const [showFullInsights, setShowFullInsights] = useState(false);
  const { data: seriesData, loading } = useIipSeries({ limit: 12 });
  const { breakdown: componentData, loading: componentsLoading } = useIipComponents({ 
    classification: 'sectoral' 
  });
  const { insights: adminInsights, loading: insightsLoading } = useIndicatorInsights('iip');

  if (loading) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">Loading metrics...</div>
          </CardContent>
        </Card>
      </>
    );
  }

  const latest = seriesData?.[0];
  const previous = seriesData?.[1];

  const getTrendIcon = () => {
    const lastChange = latest && previous ? latest.index_value - previous.index_value : 0;
    if (lastChange > 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (lastChange < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const lastChange = latest && previous ? ((latest.index_value - previous.index_value) / previous.index_value) * 100 : 0;

  return (
    <>
      {/* Main Indicator Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              IIP General Index
              {getTrendIcon()}
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-500/10 border-blue-500/20 border">
              Production Index
            </Badge>
          </div>
          <CardDescription>
            Source: MOSPI | Last Updated: {latest ? format(new Date(latest.date), 'dd MMMM yyyy') : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latest ? (
            <div className="space-y-4">
              {/* Main Metric - YoY Growth */}
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className={`text-3xl font-bold ${
                  (latest.growth_yoy || 0) > 0 ? 'text-green-600' : 
                  (latest.growth_yoy || 0) < 0 ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {latest.growth_yoy ? 
                    `${latest.growth_yoy > 0 ? '+' : ''}${latest.growth_yoy.toFixed(2)}%` : 
                    '--'
                  }
                </div>
                <div className="text-sm text-muted-foreground mt-1 font-medium">
                  Year-on-Year Growth
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(latest.date), 'MMMM yyyy')}
                </div>
              </div>

              {/* Secondary Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg font-bold text-foreground">
                    {latest.index_value ? latest.index_value.toFixed(1) : '--'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Index Value
                  </div>
                </div>
                
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className={`text-lg font-bold ${
                    (latest.growth_mom || 0) > 0 ? 'text-green-500' : 
                    (latest.growth_mom || 0) < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {latest.growth_mom ? 
                      `${latest.growth_mom > 0 ? '+' : ''}${latest.growth_mom.toFixed(2)}%` : 
                      '--'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    MoM Growth
                  </div>
                </div>

                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className={`text-lg font-bold ${
                    lastChange > 0 ? 'text-green-500' : lastChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {lastChange > 0 ? '+' : ''}{lastChange.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last Change
                  </div>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="flex items-center justify-center gap-2 p-2 bg-muted/20 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  (latest.growth_yoy || 0) > 2 ? 'bg-green-500' :
                  (latest.growth_yoy || 0) > 0 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-muted-foreground">
                  {(latest.growth_yoy || 0) > 2 ? 'Strong Growth' :
                   (latest.growth_yoy || 0) > 0 ? 'Moderate Growth' : 'Contraction'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">No data available</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-4 w-4" />
            Growth Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {componentsLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading component data...
            </div>
          ) : componentData.length > 0 ? (
            componentData.map((component, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{component.component_name}:</span>
                <span className={`font-semibold ${
                  (component.growth_yoy || 0) > 0 ? 'text-green-500' : 
                  (component.growth_yoy || 0) < 0 ? 'text-red-500' : 'text-foreground'
                }`}>
                  {component.growth_yoy ? 
                    `${component.growth_yoy > 0 ? '+' : ''}${component.growth_yoy.toFixed(2)}%` : 
                    '--'
                  }
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No component data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Full Insight Button */}
      {adminInsights && adminInsights.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowFullInsights(!showFullInsights)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full Insight
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Full Insights Modal/Expanded View */}
      {showFullInsights && adminInsights && adminInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Full Market Insights
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFullInsights(false)}
              >
                ×
              </Button>
            </CardTitle>
            <CardDescription>
              Expert analysis and market insights for Industrial Production
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminInsights.map((insight, index) => (
                <div key={insight.id} className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed">{insight.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
