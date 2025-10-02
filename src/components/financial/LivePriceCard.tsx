// Live Price Card Component - Shows real-time price with change

import { TrendingUp, TrendingDown } from 'lucide-react';
import { YahooQuote } from '@/types/financial-markets.types';

interface LivePriceCardProps {
  quote: YahooQuote | null;
  label: string;
  loading?: boolean;
}

export function LivePriceCard({ quote, label, loading }: LivePriceCardProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-1 animate-pulse">
        <div className="h-3 w-16 bg-muted rounded"></div>
        <div className="h-5 w-24 bg-muted rounded"></div>
        <div className="h-3 w-20 bg-muted rounded"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">N/A</span>
      </div>
    );
  }

  const isPositive = (quote.regularMarketChange ?? 0) >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-destructive';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold text-foreground">
          {quote.regularMarketPrice?.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${changeColor}`}>
        <Icon className="h-3 w-3" />
        <span>
          {isPositive ? '+' : ''}
          {quote.regularMarketChange?.toFixed(2)} (
          {isPositive ? '+' : ''}
          {quote.regularMarketChangePercent?.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
}
