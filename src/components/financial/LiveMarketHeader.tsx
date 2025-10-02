// Live Market Header - Ticker bar showing live prices

import { Activity, RefreshCw } from 'lucide-react';
import { useLiveMarketData } from '@/hooks/financial/useLiveMarketData';
import { LivePriceCard } from './LivePriceCard';
import { MAJOR_INDICES, CURRENCY_PAIRS } from '@/services/financial/yahooFinanceService';

export function LiveMarketHeader() {
  const { indices, currencies, loading, lastUpdated, isLive } = useLiveMarketData();

  const niftyQuote = indices.get(MAJOR_INDICES.nifty50);
  const sensexQuote = indices.get(MAJOR_INDICES.sensex);
  const bankNiftyQuote = indices.get(MAJOR_INDICES.niftyBank);
  const usdInrQuote = currencies.get(CURRENCY_PAIRS['USD-INR']);

  return (
    <div className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-lg bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${isLive ? 'text-success animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-xs font-medium text-muted-foreground">
              {isLive ? 'LIVE' : 'MARKET CLOSED'}
            </span>
          </div>

          {/* Price Cards */}
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto">
            <LivePriceCard quote={niftyQuote} label="NIFTY 50" loading={loading} />
            <div className="h-10 w-px bg-border"></div>
            <LivePriceCard quote={sensexQuote} label="SENSEX" loading={loading} />
            <div className="h-10 w-px bg-border"></div>
            <LivePriceCard quote={bankNiftyQuote} label="BANK NIFTY" loading={loading} />
            <div className="h-10 w-px bg-border"></div>
            <LivePriceCard quote={usdInrQuote} label="USD/INR" loading={loading} />
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            <span>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
