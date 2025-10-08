import { Activity } from 'lucide-react';
import { useWebSocketMarketData } from '@/hooks/financial/useWebSocketMarketData';

const SYMBOL_LABELS: Record<string, string> = {
  '^NSEI': 'NIFTY 50',
  '^BSESN': 'SENSEX',
  '^NSEBANK': 'BANK NIFTY',
  'INR=X': 'USD/INR',
};

export function CompactMarketTicker() {
  const { quotes, isLive } = useWebSocketMarketData();

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'INR=X') {
      return `₹${price.toFixed(2)}`;
    }
    return price.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  const formatChange = (changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  const getChangeColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-success';
    if (changePercent < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center gap-4 overflow-x-auto">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Activity className={`h-3 w-3 ${isLive ? 'text-success animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {isLive ? 'LIVE' : 'CLOSED'}
            </span>
          </div>

          {/* Ticker Items */}
          <div className="flex items-center gap-6 ticker-scroll">
            {Array.from(quotes.entries()).map(([symbol, quote]) => (
              <div key={symbol} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium text-foreground">
                  {SYMBOL_LABELS[symbol] || symbol}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {formatPrice(quote.price, symbol)}
                </span>
                <span className={`text-xs font-medium ${getChangeColor(quote.changePercent)}`}>
                  {formatChange(quote.changePercent)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
