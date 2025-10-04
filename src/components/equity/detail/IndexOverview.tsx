// Index Overview Tab - Shows index summary and key metrics

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import type { MarketIndex, IndexConstituent, StockPrice } from '@/types/equity-markets.types';

interface IndexOverviewProps {
  index: MarketIndex;
  constituents: IndexConstituent[];
  stockPrices: StockPrice[];
  loading: boolean;
}

export function IndexOverview({ index, constituents, stockPrices, loading }: IndexOverviewProps) {
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

  const gainers = stockPrices.filter(s => (s.change_percent || 0) > 0);
  const losers = stockPrices.filter(s => (s.change_percent || 0) < 0);
  const unchanged = stockPrices.filter(s => (s.change_percent || 0) === 0);

  const topGainers = [...gainers]
    .sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))
    .slice(0, 5);

  const topLosers = [...losers]
    .sort((a, b) => (a.change_percent || 0) - (b.change_percent || 0))
    .slice(0, 5);

  // Sector distribution (mock data - will be populated from actual sector data)
  const sectorData = constituents.reduce((acc, c) => {
    const sector = c.sector || 'Others';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectorChartData = Object.entries(sectorData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  // Market breadth data
  const breadthData = [
    { name: 'Gainers', value: gainers.length, color: 'hsl(142, 76%, 36%)' },
    { name: 'Losers', value: losers.length, color: 'hsl(0, 84%, 60%)' },
    { name: 'Unchanged', value: unchanged.length, color: 'hsl(0, 0%, 50%)' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dashboard-card bg-success/5 border-success/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div className="text-xs text-muted-foreground">Gainers</div>
          </div>
          <div className="text-2xl font-bold text-success">{gainers.length}</div>
        </div>

        <div className="dashboard-card bg-destructive/5 border-destructive/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div className="text-xs text-muted-foreground">Losers</div>
          </div>
          <div className="text-2xl font-bold text-destructive">{losers.length}</div>
        </div>

        <div className="dashboard-card bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="text-xs text-muted-foreground">Total Stocks</div>
          </div>
          <div className="text-2xl font-bold text-primary">{stockPrices.length}</div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-muted rounded-lg">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground">52W High</div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {index.year_high?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Breadth */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Market Breadth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={breadthData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {breadthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Advance/Decline Ratio: <span className="font-semibold text-foreground">
                {losers.length > 0 ? (gainers.length / losers.length).toFixed(2) : 'N/A'}
              </span>
            </p>
          </div>
        </div>

        {/* Sector Distribution */}
        {sectorChartData.length > 0 && (
          <div className="dashboard-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sector Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sectorChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Gainers</h3>
          <div className="space-y-3">
            {topGainers.map((stock) => (
              <div key={stock.id} className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                <div>
                  <div className="font-medium text-foreground">{stock.symbol}</div>
                  <div className="text-xs text-muted-foreground">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    ₹{stock.ltp?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm font-medium text-success">
                    +{stock.change_percent?.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Losers</h3>
          <div className="space-y-3">
            {topLosers.map((stock) => (
              <div key={stock.id} className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <div>
                  <div className="font-medium text-foreground">{stock.symbol}</div>
                  <div className="text-xs text-muted-foreground">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-foreground">
                    ₹{stock.ltp?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm font-medium text-destructive">
                    {stock.change_percent?.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="dashboard-card bg-primary/5 border-primary/20">
        <h3 className="text-lg font-semibold text-foreground mb-3">Market Interpretation</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Index Movement:</strong> {index.name} is{' '}
            {(index.change_percent || 0) >= 0 ? 'up' : 'down'} by{' '}
            {Math.abs(index.change_percent || 0).toFixed(2)}% today.
          </p>
          <p>
            <strong className="text-foreground">Market Breadth:</strong>{' '}
            {gainers.length > losers.length
              ? `Positive with ${gainers.length} gainers vs ${losers.length} losers, indicating broad-based buying.`
              : `Negative with ${losers.length} losers vs ${gainers.length} gainers, indicating selling pressure.`}
          </p>
          <p>
            <strong className="text-foreground">Participation:</strong>{' '}
            {((gainers.length + losers.length) / stockPrices.length * 100).toFixed(0)}% of stocks are actively moving,{' '}
            {((gainers.length + losers.length) / stockPrices.length) > 0.8
              ? 'showing strong market participation.'
              : 'showing moderate market participation.'}
          </p>
        </div>
      </div>
    </div>
  );
}
