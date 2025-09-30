import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
import { useExchangeRateData } from '@/hooks/useExchangeRateData';
import { format } from 'date-fns';

interface ExchangeRateMetricsProps {
  currency?: string;
}

export const ExchangeRateMetrics = ({ currency = 'USD' }: ExchangeRateMetricsProps) => {
  const { data: exchangeData, loading, error } = useExchangeRateData({
    currencies: [currency],
    enabled: true
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!exchangeData || exchangeData.length === 0) {
      return {
        currentRate: null,
        lastChange: null,
        lastChangePercent: null,
        weekHigh: null,
        weekLow: null,
        monthHigh: null,
        monthLow: null,
        lastUpdated: null
      };
    }

    // Sort by date descending
    const sortedData = [...exchangeData].sort((a, b) => 
      new Date(b.period_date).getTime() - new Date(a.period_date).getTime()
    );

    const latest = sortedData[0];
    const previous = sortedData[1];
    
    const currentRate = latest?.value || null;
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

    return {
      currentRate,
      lastChange,
      lastChangePercent,
      weekHigh,
      weekLow,
      monthHigh,
      monthLow,
      lastUpdated: latest?.period_date || null
    };
  }, [exchangeData]);

  const getTrendIcon = () => {
    if (!metrics.lastChange) return <Minus className="h-5 w-5 text-muted-foreground" />;
    if (metrics.lastChange > 0) {
      return <TrendingUp className="h-5 w-5 text-red-500" />;
    } else if (metrics.lastChange < 0) {
      return <TrendingDown className="h-5 w-5 text-green-500" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥'
    };
    return symbols[curr] || curr;
  };

  return (
    <>
      {/* Main Indicator Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              INR/{currency}
              {getTrendIcon()}
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-500/10 border-blue-500/20 border">
              Exchange Rate
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
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">
                  ₹{metrics.currentRate ? metrics.currentRate.toFixed(4) : '--'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Current Rate
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className={`text-lg font-bold ${
                  (metrics.lastChange || 0) > 0 ? 'text-red-500' : (metrics.lastChange || 0) < 0 ? 'text-green-500' : 'text-muted-foreground'
                }`}>
                  {(metrics.lastChange || 0) > 0 ? '+' : ''}{metrics.lastChange ? metrics.lastChange.toFixed(4) : '--'}
                  {metrics.lastChangePercent && ` (${metrics.lastChangePercent > 0 ? '+' : ''}${metrics.lastChangePercent.toFixed(2)}%)`}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last Change
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  ₹{metrics.weekHigh ? metrics.weekHigh.toFixed(4) : '--'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Week High
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  ₹{metrics.weekLow ? metrics.weekLow.toFixed(4) : '--'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Week Low
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Period Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-4 w-4" />
            Period Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading statistics...
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Month High:</span>
                <span className="font-semibold">
                  ₹{metrics.monthHigh ? metrics.monthHigh.toFixed(4) : '--'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Month Low:</span>
                <span className="font-semibold">
                  ₹{metrics.monthLow ? metrics.monthLow.toFixed(4) : '--'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Month Range:</span>
                <span className="font-semibold">
                  {metrics.monthHigh && metrics.monthLow ? 
                    `₹${(metrics.monthHigh - metrics.monthLow).toFixed(4)}` : 
                    '--'
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Volatility:</span>
                <span className="font-semibold">
                  {metrics.monthHigh && metrics.monthLow && metrics.currentRate ? 
                    `${(((metrics.monthHigh - metrics.monthLow) / metrics.currentRate) * 100).toFixed(2)}%` : 
                    '--'
                  }
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};
