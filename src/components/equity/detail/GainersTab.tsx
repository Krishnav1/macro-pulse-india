// Gainers Tab - Shows top gaining stocks

import { TrendingUp, Award } from 'lucide-react';
import type { StockPrice } from '@/types/equity-markets.types';

interface GainersTabProps {
  stockPrices: StockPrice[];
  loading: boolean;
}

export function GainersTab({ stockPrices, loading }: GainersTabProps) {
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

  const sortedGainers = [...stockPrices].sort(
    (a, b) => (b.change_percent || 0) - (a.change_percent || 0)
  );

  if (sortedGainers.length === 0) {
    return (
      <div className="dashboard-card text-center py-12">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No gainers found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top 3 Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedGainers.slice(0, 3).map((stock, index) => (
          <div
            key={stock.id}
            className="dashboard-card bg-success/5 border-success/20 relative overflow-hidden"
          >
            {index === 0 && (
              <div className="absolute top-2 right-2">
                <Award className="h-6 w-6 text-warning" />
              </div>
            )}
            <div className="mb-3">
              <div className="text-sm text-muted-foreground mb-1">#{index + 1} Gainer</div>
              <div className="text-xl font-bold text-foreground">{stock.symbol}</div>
              <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Price</div>
                <div className="text-lg font-semibold text-foreground">
                  ₹{stock.ltp?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Gain</div>
                <div className="text-2xl font-bold text-success">
                  +{stock.change_percent?.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Gainers List */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">All Gainers</h3>
        <div className="space-y-2">
          {sortedGainers.map((stock, index) => (
            <div
              key={stock.id}
              className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg hover:bg-success/10 transition-colors"
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
                  <div className="text-sm text-muted-foreground">Price</div>
                  <div className="font-medium text-foreground">
                    ₹{stock.ltp?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Change</div>
                  <div className="font-semibold text-success">
                    +{stock.change_percent?.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Volume</div>
                  <div className="text-sm font-medium text-foreground">
                    {stock.volume ? (stock.volume / 1000).toLocaleString('en-IN', { maximumFractionDigits: 0 }) + 'K' : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis */}
      <div className="dashboard-card bg-success/5 border-success/20">
        <h3 className="text-lg font-semibold text-foreground mb-3">Gainers Analysis</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Top Gainer:</strong> {sortedGainers[0]?.symbol} is up by{' '}
            {sortedGainers[0]?.change_percent?.toFixed(2)}%, leading the index.
          </p>
          <p>
            <strong className="text-foreground">Average Gain:</strong>{' '}
            {(sortedGainers.reduce((sum, s) => sum + (s.change_percent || 0), 0) / sortedGainers.length).toFixed(2)}%
            across {sortedGainers.length} gaining stocks.
          </p>
          <p>
            <strong className="text-foreground">Strong Performers:</strong>{' '}
            {sortedGainers.filter(s => (s.change_percent || 0) >= 3).length} stocks gained 3% or more,
            showing strong buying interest.
          </p>
        </div>
      </div>
    </div>
  );
}
