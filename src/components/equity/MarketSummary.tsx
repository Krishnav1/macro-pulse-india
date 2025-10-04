// Market Summary Component - Shows overall market statistics

import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface MarketSummaryProps {
  gainers: number;
  losers: number;
  avgChange: number;
  totalIndices: number;
  loading: boolean;
}

export function MarketSummary({ gainers, losers, avgChange, totalIndices, loading }: MarketSummaryProps) {
  const isPositive = avgChange >= 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="dashboard-card animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Gainers */}
      <div className="dashboard-card bg-success/5 border-success/20">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-success/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <div className="text-xs text-muted-foreground">Advancing</div>
        </div>
        <div className="text-3xl font-bold text-success mb-1">{gainers}</div>
        <div className="text-sm text-muted-foreground">Indices in green</div>
      </div>

      {/* Losers */}
      <div className="dashboard-card bg-destructive/5 border-destructive/20">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div className="text-xs text-muted-foreground">Declining</div>
        </div>
        <div className="text-3xl font-bold text-destructive mb-1">{losers}</div>
        <div className="text-sm text-muted-foreground">Indices in red</div>
      </div>

      {/* Average Change */}
      <div className={`dashboard-card ${isPositive ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <Activity className={`h-5 w-5 ${isPositive ? 'text-success' : 'text-destructive'}`} />
          </div>
          <div className="text-xs text-muted-foreground">Avg Change</div>
        </div>
        <div className={`text-3xl font-bold mb-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}{avgChange.toFixed(2)}%
        </div>
        <div className="text-sm text-muted-foreground">Market sentiment</div>
      </div>

      {/* Total Indices */}
      <div className="dashboard-card bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="text-3xl font-bold text-primary mb-1">{totalIndices}</div>
        <div className="text-sm text-muted-foreground">Indices tracked</div>
      </div>
    </div>
  );
}
