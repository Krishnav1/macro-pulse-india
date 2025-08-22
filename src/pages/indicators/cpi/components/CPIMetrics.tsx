import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { useCpiSeries } from '@/hooks/useCpiSeries';
import { format } from 'date-fns';

interface CPIMetricsProps {
  geography: 'rural' | 'urban' | 'combined';
}

export const CPIMetrics = ({ geography }: CPIMetricsProps) => {
  // Fetch latest CPI data for the selected geography
  const { data: cpiData, loading } = useCpiSeries({
    geography,
    seriesCodes: ['headline'],
    startDate: '2020-01-01',
    endDate: new Date().toISOString().split('T')[0]
  });

  // Get latest and previous data points
  const sortedData = cpiData?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];
  const latestData = sortedData[0];
  const previousData = sortedData[1];
  
  const lastChange = latestData && previousData ? 
    (latestData.inflation_yoy || 0) - (previousData.inflation_yoy || 0) : 0;

  const getTrendIcon = () => {
    if (lastChange > 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (lastChange < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
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
              CPI {geography.charAt(0).toUpperCase() + geography.slice(1)}
              {getTrendIcon()}
            </CardTitle>
            <Badge variant="secondary" className="bg-orange-500/10 border-orange-500/20 border">
              Price Index
            </Badge>
          </div>
          <CardDescription>
            Source: MOSPI | Last Updated: {latestData ? format(new Date(latestData.date), 'dd MMMM yyyy') : 'Loading...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading metrics...</div>
            </div>
          ) : latestData ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">
                  {(latestData.inflation_yoy || 0).toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  YoY Inflation
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className={`text-lg font-bold ${
                  lastChange > 0 ? 'text-red-500' : lastChange < 0 ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  {lastChange > 0 ? '+' : ''}{lastChange.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last Change
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {(latestData.index_value || 0).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  CPI Index
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {(latestData.inflation_mom || 0).toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  MoM Inflation
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No data available for {geography} geography
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inflation Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-4 w-4" />
            Inflation Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Food & Beverages:</span>
            <span className="font-semibold">2.1%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Housing:</span>
            <span className="font-semibold">3.2%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transport:</span>
            <span className="font-semibold">-0.8%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Core CPI:</span>
            <span className="font-semibold">3.1%</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
