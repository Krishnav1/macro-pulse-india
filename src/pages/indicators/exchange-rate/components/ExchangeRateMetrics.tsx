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
    currencies: ['USD', 'EUR', 'GBP', 'JPY'],
    enabled: true
  });

  // Calculate metrics for all currencies
  const metrics = useMemo(() => {
    if (!exchangeData || exchangeData.length === 0) {
      return {
        currencies: {},
        lastUpdated: null
      };
    }

    // Group by currency
    const byCurrency: { [key: string]: any[] } = {};
    exchangeData.forEach(item => {
      if (!byCurrency[item.currency]) {
        byCurrency[item.currency] = [];
      }
      byCurrency[item.currency].push(item);
    });

    // Calculate metrics for each currency
    const currencyMetrics: { [key: string]: any } = {};
    let latestDate: string | null = null;

    Object.keys(byCurrency).forEach(curr => {
      const sortedData = byCurrency[curr].sort((a, b) => 
        new Date(b.period_date).getTime() - new Date(a.period_date).getTime()
      );

      const latest = sortedData[0];
      const previous = sortedData[1];

      if (!latestDate || new Date(latest.period_date) > new Date(latestDate)) {
        latestDate = latest.period_date;
      }

      currencyMetrics[curr] = {
        currentRate: latest?.value || null,
        lastChange: previous ? (latest.value - previous.value) : null,
        lastChangePercent: previous ? ((latest.value - previous.value) / previous.value * 100) : null,
      };
    });

    return {
      currencies: currencyMetrics,
      lastUpdated: latestDate
    };
  }, [exchangeData]);

  const getCurrencySymbol = (curr: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥'
    };
    return symbols[curr] || curr;
  };

  const getCurrencyColor = (curr: string) => {
    const colors: { [key: string]: string } = {
      'USD': 'from-blue-500 to-blue-600',
      'EUR': 'from-green-500 to-green-600',
      'GBP': 'from-orange-500 to-orange-600',
      'JPY': 'from-red-500 to-red-600'
    };
    return colors[curr] || 'from-gray-500 to-gray-600';
  };

  return (
    <>
      {/* Latest Exchange Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Latest Exchange Rates
          </CardTitle>
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
            <div className="space-y-3">
              {['USD', 'EUR', 'GBP', 'JPY'].map(curr => {
                const currMetrics = metrics.currencies[curr];
                if (!currMetrics) return null;
                
                return (
                  <div key={curr} className={`p-4 rounded-lg bg-gradient-to-r ${getCurrencyColor(curr)} text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{getCurrencySymbol(curr)}</span>
                        <span className="text-lg font-semibold">INR/{curr}</span>
                      </div>
                      {currMetrics.lastChange !== null && (
                        <div className="flex items-center gap-1">
                          {currMetrics.lastChange > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : currMetrics.lastChange < 0 ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold">
                          ₹{currMetrics.currentRate ? currMetrics.currentRate.toFixed(4) : '--'}
                        </div>
                        <div className="text-sm opacity-90 mt-1">
                          Current Rate
                        </div>
                      </div>
                      {currMetrics.lastChange !== null && (
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            {currMetrics.lastChange > 0 ? '+' : ''}{currMetrics.lastChange.toFixed(4)}
                          </div>
                          {currMetrics.lastChangePercent !== null && (
                            <div className="text-sm opacity-90">
                              ({currMetrics.lastChangePercent > 0 ? '+' : ''}{currMetrics.lastChangePercent.toFixed(2)}%)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
