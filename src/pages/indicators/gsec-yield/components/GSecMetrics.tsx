import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { useIndicatorData } from '@/hooks/useIndicatorData';
import { format } from 'date-fns';

export const GSecMetrics = () => {
  const { series: gsecData, loading, error } = useIndicatorData('gsec_yield_10y');

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!gsecData || gsecData.length === 0) {
      return {
        currentYield: null,
        lastChange: null,
        lastChangePercent: null,
        weekHigh: null,
        weekLow: null,
        monthHigh: null,
        monthLow: null,
        yearHigh: null,
        yearLow: null,
        lastUpdated: null
      };
    }

    // Sort by date descending
    const sortedData = [...gsecData].sort((a, b) => 
      new Date(b.period_date).getTime() - new Date(a.period_date).getTime()
    );

    const latest = sortedData[0];
    const previous = sortedData[1];
    
    const currentYield = latest?.value || null;
    const lastChange = previous ? (latest.value - previous.value) : null;
    const lastChangePercent = previous ? ((latest.value - previous.value) / previous.value * 100) : null;

    // Calculate week high/low (last 7 entries)
    const weekData = sortedData.slice(0, 7);
    const weekHigh = weekData.length > 0 ? Math.max(...weekData.map(d => d.value)) : null;
    const weekLow = weekData.length > 0 ? Math.min(...weekData.map(d => d.value)) : null;

    // Calculate month high/low (last 30 entries)
    const monthData = sortedData.slice(0, 30);
    const monthHigh = monthData.length > 0 ? Math.max(...monthData.map(d => d.value)) : null;
    const monthLow = monthData.length > 0 ? Math.min(...monthData.map(d => d.value)) : null;

    // Calculate year high/low (last 365 entries)
    const yearData = sortedData.slice(0, 365);
    const yearHigh = yearData.length > 0 ? Math.max(...yearData.map(d => d.value)) : null;
    const yearLow = yearData.length > 0 ? Math.min(...yearData.map(d => d.value)) : null;

    return {
      currentYield,
      lastChange,
      lastChangePercent,
      weekHigh,
      weekLow,
      monthHigh,
      monthLow,
      yearHigh,
      yearLow,
      lastUpdated: latest?.period_date || null
    };
  }, [gsecData]);

  const getTrendIcon = () => {
    if (!metrics.lastChange) return <Minus className="h-5 w-5 text-muted-foreground" />;
    if (metrics.lastChange > 0) {
      return <TrendingUp className="h-5 w-5 text-red-500" />;
    } else if (metrics.lastChange < 0) {
      return <TrendingDown className="h-5 w-5 text-green-500" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <>
      {/* Main Indicator Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              10Y G-Sec
              {getTrendIcon()}
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-500/10 border-blue-500/20 border">
              Yield
            </Badge>
          </div>
          <CardDescription>
            Source: RBI | Last Updated: {metrics.lastUpdated ? format(new Date(metrics.lastUpdated), 'dd MMMM yyyy') : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading metrics...</div>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-muted-foreground">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="text-3xl font-bold text-blue-600">
                  {metrics.currentYield ? metrics.currentYield.toFixed(2) : '--'}%
                </div>
                <div className="text-xs text-gray-600 mt-1 font-medium">
                  Current Yield
                </div>
              </div>
              
              <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                <div className={`text-lg font-bold ${
                  (metrics.lastChange || 0) > 0 ? 'text-red-500' : (metrics.lastChange || 0) < 0 ? 'text-green-500' : 'text-gray-600'
                }`}>
                  {(metrics.lastChange || 0) > 0 ? '+' : ''}{metrics.lastChange ? metrics.lastChange.toFixed(2) : '--'}
                  {metrics.lastChangePercent && ` (${metrics.lastChangePercent > 0 ? '+' : ''}${metrics.lastChangePercent.toFixed(2)}%)`}
                </div>
                <div className="text-xs text-gray-600 mt-1 font-medium">
                  Last Change
                </div>
              </div>
              
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="text-lg font-bold text-green-600">
                  {metrics.weekHigh ? metrics.weekHigh.toFixed(2) : '--'}%
                </div>
                <div className="text-xs text-gray-600 mt-1 font-medium">
                  Week High
                </div>
              </div>
              
              <div className="text-center p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-100">
                <div className="text-lg font-bold text-red-600">
                  {metrics.weekLow ? metrics.weekLow.toFixed(2) : '--'}%
                </div>
                <div className="text-xs text-gray-600 mt-1 font-medium">
                  Week Low
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Metrics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-4 w-4" />
            Latest Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading metrics...
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Month High:</span>
                <span className="font-semibold text-green-600">
                  {metrics.monthHigh ? metrics.monthHigh.toFixed(2) : '--'}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Month Low:</span>
                <span className="font-semibold text-red-600">
                  {metrics.monthLow ? metrics.monthLow.toFixed(2) : '--'}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Year High:</span>
                <span className="font-semibold text-blue-600">
                  {metrics.yearHigh ? metrics.yearHigh.toFixed(2) : '--'}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Year Low:</span>
                <span className="font-semibold text-purple-600">
                  {metrics.yearLow ? metrics.yearLow.toFixed(2) : '--'}%
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};
