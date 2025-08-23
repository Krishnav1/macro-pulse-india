import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { useIipSeries } from '@/hooks/useIipSeries';
import { useIipComponents } from '@/hooks/useIipComponents';
import { format } from 'date-fns';

export const IIPMetrics = () => {
  const { data: seriesData, loading } = useIipSeries({ limit: 12 });
  const { breakdown: componentData, loading: componentsLoading } = useIipComponents({ 
    classification: 'sectoral' 
  });

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
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">
                  {latest.growth_yoy ? latest.growth_yoy.toFixed(2) : '--'}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  YoY Growth
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
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {latest.index_value ? latest.index_value.toFixed(1) : '--'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  IIP Index
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {latest.growth_mom ? latest.growth_mom.toFixed(2) : '--'}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  MoM Growth
                </div>
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
    </>
  );
};
