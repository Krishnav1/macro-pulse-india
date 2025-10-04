// Most Active Tab - Shows stocks with highest trading volume

import { Activity, Zap } from 'lucide-react';
import type { StockPrice } from '@/types/equity-markets.types';

interface MostActiveTabProps {
  stockPrices: StockPrice[];
  loading: boolean;
}

export function MostActiveTab({ stockPrices, loading }: MostActiveTabProps) {
  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Sort by turnover (volume * price)
  const sortedByActivity = [...stockPrices].sort((a, b) => {
    const aValue = (a.volume || 0) * (a.ltp || 0);
    const bValue = (b.volume || 0) * (b.ltp || 0);
    return bValue - aValue;
  });

  if (sortedByActivity.length === 0) {
    return (
      <div className="dashboard-card text-center py-12">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No activity data available</p>
      </div>
    );
  }

  const formatValue = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-4">
      {/* Top 3 Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedByActivity.slice(0, 3).map((stock, index) => {
          const turnover = (stock.volume || 0) * (stock.ltp || 0);
          const isPositive = (stock.change_percent || 0) >= 0;
          
          return (
            <div
              key={stock.id}
              className="dashboard-card bg-primary/5 border-primary/20 relative overflow-hidden"
            >
              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <Zap className="h-6 w-6 text-warning" />
                </div>
              )}
              <div className="mb-3">
                <div className="text-sm text-muted-foreground mb-1">#{index + 1} Most Active</div>
                <div className="text-xl font-bold text-foreground">{stock.symbol}</div>
                <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Turnover</div>
                  <div className="text-lg font-bold text-primary">
                    {formatValue(turnover)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Volume</div>
                  <div className="text-sm font-medium text-foreground">
                    {(stock.volume || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Change</div>
                  <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {isPositive ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All Active Stocks List */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">All Active Stocks</h3>
        <div className="space-y-2">
          {sortedByActivity.map((stock, index) => {
            const turnover = (stock.volume || 0) * (stock.ltp || 0);
            const isPositive = (stock.change_percent || 0) >= 0;
            
            return (
              <div
                key={stock.id}
                className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {stock.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Turnover</div>
                    <div className="font-semibold text-primary">
                      {formatValue(turnover)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Volume</div>
                    <div className="text-sm font-medium text-foreground">
                      {stock.volume ? (stock.volume / 1000).toLocaleString('en-IN', { maximumFractionDigits: 0 }) + 'K' : 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="text-sm font-medium text-foreground">
                      ₹{stock.ltp?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Change</div>
                    <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{stock.change_percent?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis */}
      <div className="dashboard-card bg-primary/5 border-primary/20">
        <h3 className="text-lg font-semibold text-foreground mb-3">Activity Analysis</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Most Active:</strong> {sortedByActivity[0]?.symbol} leads with{' '}
            {formatValue((sortedByActivity[0]?.volume || 0) * (sortedByActivity[0]?.ltp || 0))} in turnover,
            indicating high institutional interest.
          </p>
          <p>
            <strong className="text-foreground">Total Turnover:</strong>{' '}
            {formatValue(sortedByActivity.reduce((sum, s) => sum + ((s.volume || 0) * (s.ltp || 0)), 0))}
            across all stocks in the index.
          </p>
          <p>
            <strong className="text-foreground">High Activity Stocks:</strong>{' '}
            {sortedByActivity.filter(s => ((s.volume || 0) * (s.ltp || 0)) >= 10000000).length} stocks
            have turnover above ₹1 Cr, showing strong participation.
          </p>
        </div>
      </div>
    </div>
  );
}
