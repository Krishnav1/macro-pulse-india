// Investor Tracker Component - Track specific institutional investors

import { useMemo, useState } from 'react';
import { Users, TrendingUp, TrendingDown, Star } from 'lucide-react';
import type { BulkDeal, BlockDeal } from '@/types/equity-markets.types';

interface InvestorTrackerProps {
  bulkDeals: BulkDeal[];
  blockDeals: BlockDeal[];
  loading: boolean;
}

export function InvestorTracker({ bulkDeals, blockDeals, loading }: InvestorTrackerProps) {
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null);

  // Investor analysis
  const investorAnalysis = useMemo(() => {
    const investorMap = new Map<string, {
      name: string;
      totalDeals: number;
      buyDeals: number;
      sellDeals: number;
      totalValue: number;
      stocks: Set<string>;
    }>();

    bulkDeals.forEach(deal => {
      const name = deal.client_name || 'Unknown';
      if (!investorMap.has(name)) {
        investorMap.set(name, {
          name,
          totalDeals: 0,
          buyDeals: 0,
          sellDeals: 0,
          totalValue: 0,
          stocks: new Set(),
        });
      }
      
      const investor = investorMap.get(name)!;
      investor.totalDeals++;
      investor.stocks.add(deal.symbol);
      investor.totalValue += (deal.quantity || 0) * (deal.avg_price || 0);
      
      if (deal.deal_type === 'buy') {
        investor.buyDeals++;
      } else {
        investor.sellDeals++;
      }
    });

    return Array.from(investorMap.values())
      .map(inv => ({
        ...inv,
        favoriteStocks: Array.from(inv.stocks),
        netPosition: inv.buyDeals - inv.sellDeals,
      }))
      .sort((a, b) => b.totalDeals - a.totalDeals)
      .slice(0, 20);
  }, [bulkDeals]);

  // Selected investor details
  const selectedInvestorData = useMemo(() => {
    if (!selectedInvestor) return null;

    const deals = bulkDeals.filter(d => d.client_name === selectedInvestor);
    const stockMap = new Map<string, { buyQty: number; sellQty: number; buyValue: number; sellValue: number }>();

    deals.forEach(deal => {
      if (!stockMap.has(deal.symbol)) {
        stockMap.set(deal.symbol, { buyQty: 0, sellQty: 0, buyValue: 0, sellValue: 0 });
      }
      const stock = stockMap.get(deal.symbol)!;
      
      if (deal.deal_type === 'buy') {
        stock.buyQty += deal.quantity || 0;
        stock.buyValue += (deal.quantity || 0) * (deal.avg_price || 0);
      } else {
        stock.sellQty += deal.quantity || 0;
        stock.sellValue += (deal.quantity || 0) * (deal.avg_price || 0);
      }
    });

    return {
      deals,
      stocks: Array.from(stockMap.entries()).map(([symbol, data]) => ({
        symbol,
        ...data,
        netQty: data.buyQty - data.sellQty,
        netValue: (data.buyValue - data.sellValue) / 10000000,
      })).sort((a, b) => Math.abs(b.netValue) - Math.abs(a.netValue)),
    };
  }, [selectedInvestor, bulkDeals]);

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

  return (
    <div className="space-y-6">
      {/* Top Investors */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Institutional Investors</h3>
        <div className="space-y-2">
          {investorAnalysis.slice(0, 10).map((investor, index) => {
            const isPositive = investor.netPosition > 0;
            const isSelected = selectedInvestor === investor.name;
            
            return (
              <button
                key={investor.name}
                onClick={() => setSelectedInvestor(isSelected ? null : investor.name)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-sm font-medium text-muted-foreground w-8">#{index + 1}</div>
                    <div className="flex items-center gap-2 flex-1">
                      <Users className="h-4 w-4 text-primary" />
                      <div className="font-medium text-foreground truncate max-w-[300px]">
                        {investor.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Deals</div>
                      <div className="font-medium text-foreground">{investor.totalDeals}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Stocks</div>
                      <div className="font-medium text-foreground">{investor.favoriteStocks.length}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Net Position</div>
                      <div className={`font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                        {isPositive ? '+' : ''}{investor.netPosition}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Value</div>
                      <div className="font-semibold text-primary">
                        ₹{(investor.totalValue / 10000000).toFixed(2)} Cr
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Investor Details */}
      {selectedInvestorData && (
        <div className="space-y-4">
          <div className="dashboard-card bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {selectedInvestor} - Portfolio
              </h3>
              <button
                onClick={() => setSelectedInvestor(null)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear Selection
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{selectedInvestorData.deals.length}</div>
                <div className="text-sm text-muted-foreground">Total Deals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {selectedInvestorData.deals.filter(d => d.deal_type === 'buy').length}
                </div>
                <div className="text-sm text-muted-foreground">Buy Deals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {selectedInvestorData.deals.filter(d => d.deal_type === 'sell').length}
                </div>
                <div className="text-sm text-muted-foreground">Sell Deals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedInvestorData.stocks.length}</div>
                <div className="text-sm text-muted-foreground">Unique Stocks</div>
              </div>
            </div>
          </div>

          {/* Favorite Stocks */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Stock-wise Activity</h3>
            <div className="space-y-2">
              {selectedInvestorData.stocks.map((stock) => {
                const isAccumulating = stock.netValue > 0;
                
                return (
                  <div
                    key={stock.symbol}
                    className={`p-3 rounded-lg border ${
                      isAccumulating 
                        ? 'bg-success/5 border-success/20' 
                        : 'bg-destructive/5 border-destructive/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Star className={`h-4 w-4 ${isAccumulating ? 'text-success' : 'text-destructive'}`} />
                        <div className="font-medium text-foreground">{stock.symbol}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Buy Qty</div>
                          <div className="text-sm font-medium text-success">
                            {stock.buyQty.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Sell Qty</div>
                          <div className="text-sm font-medium text-destructive">
                            {stock.sellQty.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Net Position</div>
                          <div className={`text-sm font-semibold ${isAccumulating ? 'text-success' : 'text-destructive'}`}>
                            {isAccumulating ? '+' : ''}₹{stock.netValue.toFixed(2)} Cr
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Deals */}
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Deals</h3>
            <div className="space-y-2">
              {selectedInvestorData.deals.slice(0, 5).map((deal) => {
                const isBuy = deal.deal_type === 'buy';
                
                return (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      {isBuy ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <div>
                        <div className="font-medium text-foreground">{deal.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(deal.date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Qty</div>
                        <div className="text-sm font-medium text-foreground">
                          {deal.quantity?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Price</div>
                        <div className="text-sm font-medium text-foreground">
                          ₹{deal.avg_price?.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Value</div>
                        <div className={`text-sm font-semibold ${isBuy ? 'text-success' : 'text-destructive'}`}>
                          ₹{((deal.quantity || 0) * (deal.avg_price || 0) / 10000000).toFixed(2)} Cr
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {!selectedInvestor && (
        <div className="dashboard-card bg-primary/10 border-primary/20">
          <p className="text-sm text-foreground">
            <strong>Investor Tracking:</strong> Click on any investor to see their detailed portfolio, stock-wise activity,
            and recent deals. Track institutional conviction by monitoring repeat transactions in specific stocks.
          </p>
        </div>
      )}
    </div>
  );
}
