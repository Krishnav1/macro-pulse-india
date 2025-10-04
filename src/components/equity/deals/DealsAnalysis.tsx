// Deals Analysis Component - Analyzes accumulation/distribution patterns

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import type { BulkDeal, BlockDeal } from '@/types/equity-markets.types';

interface DealsAnalysisProps {
  bulkDeals: BulkDeal[];
  blockDeals: BlockDeal[];
  loading: boolean;
}

export function DealsAnalysis({ bulkDeals, blockDeals, loading }: DealsAnalysisProps) {
  // Stock-wise accumulation/distribution
  const stockAnalysis = useMemo(() => {
    const stockMap = new Map<string, { symbol: string; buyQty: number; sellQty: number; buyValue: number; sellValue: number }>();

    bulkDeals.forEach(deal => {
      const key = deal.symbol;
      if (!stockMap.has(key)) {
        stockMap.set(key, { symbol: deal.symbol, buyQty: 0, sellQty: 0, buyValue: 0, sellValue: 0 });
      }
      const stock = stockMap.get(key)!;
      
      if (deal.deal_type === 'buy') {
        stock.buyQty += deal.quantity || 0;
        stock.buyValue += (deal.quantity || 0) * (deal.avg_price || 0);
      } else {
        stock.sellQty += deal.quantity || 0;
        stock.sellValue += (deal.quantity || 0) * (deal.avg_price || 0);
      }
    });

    return Array.from(stockMap.values())
      .map(stock => ({
        ...stock,
        netQty: stock.buyQty - stock.sellQty,
        netValue: (stock.buyValue - stock.sellValue) / 10000000, // in Cr
      }))
      .sort((a, b) => Math.abs(b.netValue) - Math.abs(a.netValue))
      .slice(0, 10);
  }, [bulkDeals]);

  // Sector-wise distribution (mock - would need sector mapping)
  const sectorAnalysis = useMemo(() => {
    const sectors = ['Banking', 'IT', 'Auto', 'Pharma', 'FMCG', 'Energy', 'Others'];
    return sectors.map(sector => ({
      sector,
      deals: Math.floor(Math.random() * 20) + 5, // Mock data
      value: Math.floor(Math.random() * 500) + 100,
    }));
  }, []);

  // Deal type distribution
  const dealTypeData = useMemo(() => {
    const bulkBuyCount = bulkDeals.filter(d => d.deal_type === 'buy').length;
    const bulkSellCount = bulkDeals.filter(d => d.deal_type === 'sell').length;
    const blockCount = blockDeals.length;

    return [
      { name: 'Bulk Buy', value: bulkBuyCount, color: 'hsl(142, 76%, 36%)' },
      { name: 'Bulk Sell', value: bulkSellCount, color: 'hsl(0, 84%, 60%)' },
      { name: 'Block Deals', value: blockCount, color: 'hsl(200, 98%, 39%)' },
    ];
  }, [bulkDeals, blockDeals]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="dashboard-card animate-pulse">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dashboard-card bg-success/5 border-success/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="text-xs text-muted-foreground">Accumulation</div>
          </div>
          <div className="text-2xl font-bold text-success">
            {stockAnalysis.filter(s => s.netValue > 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Stocks with net buying</div>
        </div>

        <div className="dashboard-card bg-destructive/5 border-destructive/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-xs text-muted-foreground">Distribution</div>
          </div>
          <div className="text-2xl font-bold text-destructive">
            {stockAnalysis.filter(s => s.netValue < 0).length}
          </div>
          <div className="text-sm text-muted-foreground">Stocks with net selling</div>
        </div>

        <div className="dashboard-card bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground">Total Deals</div>
          </div>
          <div className="text-2xl font-bold text-primary">
            {bulkDeals.length + blockDeals.length}
          </div>
          <div className="text-sm text-muted-foreground">Bulk + Block deals</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Accumulation/Distribution */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top 10 Stocks - Net Position</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockAnalysis} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <YAxis dataKey="symbol" type="category" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value: number) => [`₹${value.toFixed(2)} Cr`, 'Net Value']}
              />
              <Bar dataKey="netValue" radius={[0, 4, 4, 0]}>
                {stockAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.netValue >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Deal Type Distribution */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Deal Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dealTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dealTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Accumulation Stocks */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Accumulation Stocks</h3>
        <div className="space-y-2">
          {stockAnalysis
            .filter(s => s.netValue > 0)
            .slice(0, 5)
            .map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-muted-foreground w-8">#{index + 1}</div>
                  <div className="font-medium text-foreground">{stock.symbol}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Net Qty</div>
                    <div className="font-medium text-foreground">
                      +{stock.netQty.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Net Value</div>
                    <div className="font-semibold text-success">
                      +₹{stock.netValue.toFixed(2)} Cr
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Top Distribution Stocks */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Distribution Stocks</h3>
        <div className="space-y-2">
          {stockAnalysis
            .filter(s => s.netValue < 0)
            .slice(0, 5)
            .map((stock, index) => (
              <div key={stock.symbol} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-muted-foreground w-8">#{index + 1}</div>
                  <div className="font-medium text-foreground">{stock.symbol}</div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Net Qty</div>
                    <div className="font-medium text-foreground">
                      {stock.netQty.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Net Value</div>
                    <div className="font-semibold text-destructive">
                      ₹{stock.netValue.toFixed(2)} Cr
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Interpretation */}
      <div className="dashboard-card bg-primary/5 border-primary/20">
        <h3 className="text-lg font-semibold text-foreground mb-3">Analysis Interpretation</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Accumulation Pattern:</strong>{' '}
            {stockAnalysis.filter(s => s.netValue > 0).length} stocks show net institutional buying,
            indicating positive sentiment and potential upside.
          </p>
          <p>
            <strong className="text-foreground">Distribution Pattern:</strong>{' '}
            {stockAnalysis.filter(s => s.netValue < 0).length} stocks show net institutional selling,
            suggesting profit booking or negative outlook.
          </p>
          <p>
            <strong className="text-foreground">Smart Money Flow:</strong>{' '}
            Track these patterns over time to identify institutional conviction and potential trend reversals.
            Consistent accumulation often precedes price appreciation.
          </p>
        </div>
      </div>
    </div>
  );
}
