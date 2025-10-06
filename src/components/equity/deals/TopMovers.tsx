// Top Movers Component - Shows stocks with highest activity

import { TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react';
import { Deal } from '@/hooks/equity/useDealsAnalysis';
import { formatDealValue } from '@/utils/currencyFormatter';

interface TopMoversProps {
  deals: Deal[];
  loading: boolean;
}

interface StockActivity {
  symbol: string;
  stock_name: string;
  buyValue: number;
  sellValue: number;
  netValue: number;
  dealCount: number;
  largestDeal: number;
}

export function TopMovers({ deals, loading }: TopMoversProps) {
  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Aggregate by stock
  const stockMap = new Map<string, StockActivity>();

  deals.forEach(deal => {
    const key = deal.symbol;
    if (!stockMap.has(key)) {
      stockMap.set(key, {
        symbol: deal.symbol,
        stock_name: deal.stock_name || deal.symbol,
        buyValue: 0,
        sellValue: 0,
        netValue: 0,
        dealCount: 0,
        largestDeal: 0
      });
    }

    const stock = stockMap.get(key)!;
    const isBuy = deal.deal_type?.toLowerCase() === 'buy';
    
    if (isBuy) {
      stock.buyValue += deal.value;
    } else {
      stock.sellValue += deal.value;
    }
    
    stock.netValue = stock.buyValue - stock.sellValue;
    stock.dealCount++;
    stock.largestDeal = Math.max(stock.largestDeal, deal.value);
  });

  const stocks = Array.from(stockMap.values());

  // Top buyers (highest net buying)
  const topBuyers = stocks
    .filter(s => s.netValue > 0)
    .sort((a, b) => b.netValue - a.netValue)
    .slice(0, 3);

  // Top sellers (highest net selling)
  const topSellers = stocks
    .filter(s => s.netValue < 0)
    .sort((a, b) => a.netValue - b.netValue)
    .slice(0, 3);

  // Most active (highest deal count)
  const mostActive = stocks
    .sort((a, b) => b.dealCount - a.dealCount)
    .slice(0, 3);

  // Largest deals
  const largestDeals = stocks
    .sort((a, b) => b.largestDeal - a.largestDeal)
    .slice(0, 3);

  const renderStockCard = (stock: StockActivity, type: 'buy' | 'sell' | 'active' | 'large') => {
    const isBuy = type === 'buy';
    const isSell = type === 'sell';
    const isActive = type === 'active';
    const isLarge = type === 'large';

    return (
      <div key={stock.symbol} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">{stock.symbol}</div>
            <div className="text-xs text-muted-foreground truncate">{stock.stock_name}</div>
          </div>
          {isBuy && (
            <div className="flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded text-xs font-medium ml-2">
              <TrendingUp className="h-3 w-3" />
              Buying
            </div>
          )}
          {isSell && (
            <div className="flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive rounded text-xs font-medium ml-2">
              <TrendingDown className="h-3 w-3" />
              Selling
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(isBuy || isSell) && (
            <>
              <div>
                <div className="text-muted-foreground">Net Value</div>
                <div className={`font-semibold ${stock.netValue >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatDealValue(Math.abs(stock.netValue))}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Deals</div>
                <div className="font-semibold text-foreground">{stock.dealCount}</div>
              </div>
            </>
          )}
          {isActive && (
            <>
              <div>
                <div className="text-muted-foreground">Total Deals</div>
                <div className="font-semibold text-primary">{stock.dealCount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Value</div>
                <div className="font-semibold text-foreground">
                  {formatDealValue(stock.buyValue + stock.sellValue)}
                </div>
              </div>
            </>
          )}
          {isLarge && (
            <>
              <div>
                <div className="text-muted-foreground">Largest Deal</div>
                <div className="font-semibold text-primary">{formatDealValue(stock.largestDeal)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Deals</div>
                <div className="font-semibold text-foreground">{stock.dealCount}</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Top Buyers */}
      <div className="dashboard-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-success" />
          <h3 className="text-lg font-semibold text-foreground">Top Buying Activity</h3>
        </div>
        <div className="space-y-3">
          {topBuyers.length > 0 ? (
            topBuyers.map(stock => renderStockCard(stock, 'buy'))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No net buying activity found
            </div>
          )}
        </div>
      </div>

      {/* Top Sellers */}
      <div className="dashboard-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-5 w-5 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground">Top Selling Activity</h3>
        </div>
        <div className="space-y-3">
          {topSellers.length > 0 ? (
            topSellers.map(stock => renderStockCard(stock, 'sell'))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No net selling activity found
            </div>
          )}
        </div>
      </div>

      {/* Most Active */}
      <div className="dashboard-card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Most Active Stocks</h3>
        </div>
        <div className="space-y-3">
          {mostActive.length > 0 ? (
            mostActive.map(stock => renderStockCard(stock, 'active'))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No activity found
            </div>
          )}
        </div>
      </div>

      {/* Largest Deals */}
      <div className="dashboard-card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-foreground">Largest Single Deals</h3>
        </div>
        <div className="space-y-3">
          {largestDeals.length > 0 ? (
            largestDeals.map(stock => renderStockCard(stock, 'large'))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No deals found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
