// Stock Deep Dive Modal - Detailed analysis for individual stocks

import { X, TrendingUp, TrendingDown, Calendar, Users, BarChart3 } from 'lucide-react';
import { Deal } from '@/hooks/equity/useDealsAnalysis';
import { formatDealValue, formatQuantity } from '@/utils/currencyFormatter';

interface StockDeepDiveModalProps {
  symbol: string;
  deals: Deal[];
  isOpen: boolean;
  onClose: () => void;
}

export function StockDeepDiveModal({ symbol, deals, isOpen, onClose }: StockDeepDiveModalProps) {
  if (!isOpen) return null;

  // Filter deals for this stock
  const stockDeals = deals.filter(d => d.symbol === symbol);
  
  if (stockDeals.length === 0) {
    return null;
  }

  const stockName = stockDeals[0].stock_name || symbol;

  // Calculate metrics
  const buyDeals = stockDeals.filter(d => d.deal_type?.toLowerCase() === 'buy');
  const sellDeals = stockDeals.filter(d => d.deal_type?.toLowerCase() === 'sell');
  
  const totalBuyValue = buyDeals.reduce((sum, d) => sum + d.value, 0);
  const totalSellValue = sellDeals.reduce((sum, d) => sum + d.value, 0);
  const netValue = totalBuyValue - totalSellValue;
  
  const totalQuantity = stockDeals.reduce((sum, d) => sum + (d.quantity || 0), 0);
  const avgPrice = stockDeals.reduce((sum, d) => sum + (d.price || 0), 0) / stockDeals.length;

  // Top buyers and sellers
  const clientMap = new Map<string, { buyValue: number; sellValue: number; deals: number }>();
  
  stockDeals.forEach(deal => {
    if (!clientMap.has(deal.client_name)) {
      clientMap.set(deal.client_name, { buyValue: 0, sellValue: 0, deals: 0 });
    }
    const client = clientMap.get(deal.client_name)!;
    if (deal.deal_type?.toLowerCase() === 'buy') {
      client.buyValue += deal.value;
    } else {
      client.sellValue += deal.value;
    }
    client.deals++;
  });

  const topBuyers = Array.from(clientMap.entries())
    .filter(([_, data]) => data.buyValue > 0)
    .sort((a, b) => b[1].buyValue - a[1].buyValue)
    .slice(0, 5);

  const topSellers = Array.from(clientMap.entries())
    .filter(([_, data]) => data.sellValue > 0)
    .sort((a, b) => b[1].sellValue - a[1].sellValue)
    .slice(0, 5);

  // Recent deals (last 10)
  const recentDeals = [...stockDeals]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-lg shadow-2xl border border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{symbol}</h2>
              <p className="text-sm text-muted-foreground mt-1">{stockName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="dashboard-card p-4 bg-primary/5 border-l-4 border-primary">
              <div className="text-xs text-muted-foreground mb-1">Total Deals</div>
              <div className="text-2xl font-bold text-foreground">{stockDeals.length}</div>
            </div>
            <div className="dashboard-card p-4 bg-success/5 border-l-4 border-success">
              <div className="text-xs text-muted-foreground mb-1">Buy Deals</div>
              <div className="text-2xl font-bold text-success">{buyDeals.length}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatDealValue(totalBuyValue)}</div>
            </div>
            <div className="dashboard-card p-4 bg-destructive/5 border-l-4 border-destructive">
              <div className="text-xs text-muted-foreground mb-1">Sell Deals</div>
              <div className="text-2xl font-bold text-destructive">{sellDeals.length}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatDealValue(totalSellValue)}</div>
            </div>
            <div className={`dashboard-card p-4 ${netValue >= 0 ? 'bg-success/5 border-l-4 border-success' : 'bg-destructive/5 border-l-4 border-destructive'}`}>
              <div className="text-xs text-muted-foreground mb-1">Net Flow</div>
              <div className={`text-2xl font-bold ${netValue >= 0 ? 'text-success' : 'text-destructive'}`}>
                {netValue >= 0 ? '+' : ''}{formatDealValue(netValue)}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="dashboard-card p-4">
              <div className="text-sm text-muted-foreground mb-2">Total Quantity Traded</div>
              <div className="text-xl font-bold text-foreground">{formatQuantity(totalQuantity)}</div>
            </div>
            <div className="dashboard-card p-4">
              <div className="text-sm text-muted-foreground mb-2">Average Price</div>
              <div className="text-xl font-bold text-foreground">₹{avgPrice.toFixed(2)}</div>
            </div>
          </div>

          {/* Top Buyers & Sellers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Buyers */}
            <div className="dashboard-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-success" />
                <h3 className="font-semibold text-foreground">Top Buyers</h3>
              </div>
              <div className="space-y-2">
                {topBuyers.length > 0 ? (
                  topBuyers.map(([client, data], index) => (
                    <div key={client} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{client}</div>
                        <div className="text-xs text-muted-foreground">{data.deals} deals</div>
                      </div>
                      <div className="text-sm font-semibold text-success ml-2">
                        {formatDealValue(data.buyValue)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">No buying activity</div>
                )}
              </div>
            </div>

            {/* Top Sellers */}
            <div className="dashboard-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Top Sellers</h3>
              </div>
              <div className="space-y-2">
                {topSellers.length > 0 ? (
                  topSellers.map(([client, data], index) => (
                    <div key={client} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{client}</div>
                        <div className="text-xs text-muted-foreground">{data.deals} deals</div>
                      </div>
                      <div className="text-sm font-semibold text-destructive ml-2">
                        {formatDealValue(data.sellValue)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">No selling activity</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Deals */}
          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Recent Deals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground">Client</th>
                    <th className="py-2 px-3 text-center text-xs font-semibold text-muted-foreground">Type</th>
                    <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">Quantity</th>
                    <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">Price</th>
                    <th className="py-2 px-3 text-right text-xs font-semibold text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDeals.map((deal, index) => {
                    const isBuy = deal.deal_type?.toLowerCase() === 'buy';
                    return (
                      <tr key={index} className="border-b border-border hover:bg-muted/30">
                        <td className="py-2 px-3 text-foreground">
                          {new Date(deal.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-foreground truncate max-w-[150px]">
                          {deal.client_name}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isBuy ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                          }`}>
                            {isBuy ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {isBuy ? 'Buy' : 'Sell'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-foreground">
                          {formatQuantity(deal.quantity || 0)}
                        </td>
                        <td className="py-2 px-3 text-right text-foreground">
                          ₹{deal.price?.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          <span className={isBuy ? 'text-success' : 'text-destructive'}>
                            {formatDealValue(deal.value)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
