// Analysis Tab - Comprehensive market insights and trends

import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Repeat, Target, AlertTriangle } from 'lucide-react';
import { 
  KPIData, 
  SectorData, 
  StockData, 
  TrendData, 
  RepeatActivity,
  Deal
} from '@/hooks/equity/useDealsAnalysis';
import { DateRange } from '@/utils/financialYearUtils';
import { DealSizeBreakdown } from './DealSizeBreakdown';
import { TopMovers } from './TopMovers';
import { UnusualActivityAlerts } from './UnusualActivityAlerts';
import { SectorMomentumTracker } from './SectorMomentumTracker';

interface DealsAnalysisTabProps {
  kpiData: KPIData;
  sectorData: SectorData[];
  stockData: StockData[];
  trendData: TrendData[];
  repeatActivity: RepeatActivity[];
  loading: boolean;
  dateRange: DateRange;
  allDeals?: Deal[];
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280'  // Gray
];

export function DealsAnalysisTab({
  kpiData,
  sectorData,
  stockData,
  trendData,
  repeatActivity,
  loading,
  dateRange,
  allDeals = []
}: DealsAnalysisTabProps) {
  const [selectedChart, setSelectedChart] = useState<'stocks' | 'sectors'>('stocks');

  const formatValue = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else {
      return `₹${value.toFixed(0)}`;
    }
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-IN');
  };

  // Prepare data for charts
  const topStocksData = stockData.slice(0, 10).map(stock => ({
    name: stock.symbol,
    buyValue: stock.buyValue / 10000000, // Convert to crores
    sellValue: stock.sellValue / 10000000,
    netFlow: stock.netFlow / 10000000,
    fullName: stock.stock_name
  }));

  const sectorChartData = sectorData.map(sector => ({
    name: sector.sector,
    value: (sector.buyValue + sector.sellValue) / 10000000,
    buyValue: sector.buyValue / 10000000,
    sellValue: sector.sellValue / 10000000,
    netFlow: sector.netFlow / 10000000,
    percentage: sector.percentage
  }));

  const trendChartData = trendData.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    }),
    buyValue: trend.buyValue / 10000000,
    sellValue: trend.sellValue / 10000000,
    netFlow: trend.netFlow / 10000000,
    deals: trend.dealCount
  }));

  // Top buyers and sellers
  const topBuyers = stockData
    .flatMap(stock => stock.topBuyers.map(buyer => ({ buyer, stock: stock.symbol, value: stock.buyValue })))
    .reduce((acc, curr) => {
      if (!acc[curr.buyer]) {
        acc[curr.buyer] = { buyer: curr.buyer, totalValue: 0, stocks: new Set() };
      }
      acc[curr.buyer].totalValue += curr.value;
      acc[curr.buyer].stocks.add(curr.stock);
      return acc;
    }, {} as Record<string, any>);

  const topSellers = stockData
    .flatMap(stock => stock.topSellers.map(seller => ({ seller, stock: stock.symbol, value: stock.sellValue })))
    .reduce((acc, curr) => {
      if (!acc[curr.seller]) {
        acc[curr.seller] = { seller: curr.seller, totalValue: 0, stocks: new Set() };
      }
      acc[curr.seller].totalValue += curr.value;
      acc[curr.seller].stocks.add(curr.stock);
      return acc;
    }, {} as Record<string, any>);

  const topBuyersList = Object.values(topBuyers)
    .sort((a: any, b: any) => b.totalValue - a.totalValue)
    .slice(0, 5);

  const topSellersList = Object.values(topSellers)
    .sort((a: any, b: any) => b.totalValue - a.totalValue)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="dashboard-card animate-pulse">
            <div className="h-64 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Selection */}
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">Market Analysis</h3>
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setSelectedChart('stocks')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedChart === 'stocks'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Top Stocks
          </button>
          <button
            onClick={() => setSelectedChart('sectors')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedChart === 'sectors'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sectors
          </button>
        </div>
      </div>

      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart - Stocks or Sectors */}
        <div className="dashboard-card">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-foreground">
              {selectedChart === 'stocks' ? 'Top 10 Stocks by Deal Value' : 'Sector Distribution'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {selectedChart === 'stocks' ? 'Buy vs Sell activity' : 'Total activity by sector'}
            </p>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {selectedChart === 'stocks' ? (
                <BarChart data={topStocksData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value}Cr`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: any, name: string) => [
                      `₹${value.toFixed(1)}Cr`,
                      name === 'buyValue' ? 'Buying' : name === 'sellValue' ? 'Selling' : 'Net Flow'
                    ]}
                    labelFormatter={(label) => {
                      const stock = topStocksData.find(s => s.name === label);
                      return stock?.fullName || label;
                    }}
                  />
                  <Bar dataKey="buyValue" fill="#10B981" name="buyValue" />
                  <Bar dataKey="sellValue" fill="#EF4444" name="sellValue" />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={sectorChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sectorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`₹${value.toFixed(1)}Cr`, 'Total Value']}
                  />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="dashboard-card">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-foreground">Buy vs Sell Trend</h4>
            <p className="text-sm text-muted-foreground">Daily activity over time</p>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `₹${value}Cr`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string) => [
                    `₹${value.toFixed(1)}Cr`,
                    name === 'buyValue' ? 'Buying' : name === 'sellValue' ? 'Selling' : 'Net Flow'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="buyValue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="buyValue"
                />
                <Line 
                  type="monotone" 
                  dataKey="sellValue" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="sellValue"
                />
                <Line 
                  type="monotone" 
                  dataKey="netFlow" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="netFlow"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Buyers and Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Buyers */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success" />
            <h4 className="text-base font-semibold text-foreground">Top 5 Buyers</h4>
          </div>
          
          <div className="space-y-3">
            {topBuyersList.map((buyer: any, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {buyer.buyer}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {buyer.stocks.size} stocks traded
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-success">
                    {formatValue(buyer.totalValue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sellers */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <h4 className="text-base font-semibold text-foreground">Top 5 Sellers</h4>
          </div>
          
          <div className="space-y-3">
            {topSellersList.map((seller: any, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {seller.seller}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {seller.stocks.size} stocks traded
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-destructive">
                    {formatValue(seller.totalValue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repeat Activity */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <Repeat className="h-5 w-5 text-primary" />
            <h4 className="text-base font-semibold text-foreground">Repeat Activity</h4>
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              Conviction Signals
            </span>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {repeatActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">
                    {activity.investor}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.dealType === 'buy' ? 'Buying' : 'Selling'} {activity.stock}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Price: ₹{activity.avgPrice.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    activity.dealType === 'buy' ? 'text-success' : 'text-destructive'
                  }`}>
                    {activity.dealCount}x
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatValue(activity.totalValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Rotation Analysis */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-purple-500" />
            <h4 className="text-base font-semibold text-foreground">Sector Rotation</h4>
            <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded-full">
              Smart Money Flow
            </span>
          </div>
          
          <div className="space-y-3">
            {sectorData.slice(0, 6).map((sector, index) => {
              const isAccumulation = sector.netFlow > 0;
              return (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  isAccumulation ? 'bg-success/5' : 'bg-destructive/5'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      isAccumulation ? 'bg-success' : 'bg-destructive'
                    }`} />
                    <div>
                      <div className="font-medium text-foreground">{sector.sector}</div>
                      <div className="text-sm text-muted-foreground">
                        {sector.dealCount} deals
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      isAccumulation ? 'text-success' : 'text-destructive'
                    }`}>
                      {isAccumulation ? '+' : ''}{formatValue(sector.netFlow)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isAccumulation ? 'Accumulation' : 'Distribution'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Enhanced Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Size Breakdown */}
        <DealSizeBreakdown deals={allDeals} loading={loading} />
        
        {/* Unusual Activity Alerts */}
        <UnusualActivityAlerts deals={allDeals} loading={loading} />
      </div>

      {/* Top Movers - Full Width */}
      <TopMovers deals={allDeals} loading={loading} />

      {/* Sector Momentum Tracker */}
      <SectorMomentumTracker deals={allDeals} loading={loading} />

      {/* Market Insights */}
      <div className="dashboard-card">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h4 className="text-base font-semibold text-foreground">Market Insights</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="text-sm font-medium text-primary mb-1">Smart Money Signal</div>
            <div className="text-lg font-bold text-foreground">
              {kpiData.netFlow >= 0 ? '🟢 BULLISH' : '🔴 BEARISH'}
            </div>
            <div className="text-xs text-muted-foreground">
              Net {kpiData.netFlow >= 0 ? 'buying' : 'selling'} indicates institutional sentiment
            </div>
          </div>
          
          <div className="p-4 bg-amber-500/5 rounded-lg">
            <div className="text-sm font-medium text-amber-600 mb-1">Activity Level</div>
            <div className="text-lg font-bold text-foreground">
              {kpiData.totalDeals > 100 ? 'HIGH' : kpiData.totalDeals > 50 ? 'MEDIUM' : 'LOW'}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatNumber(kpiData.totalDeals)} total deals in {dateRange.label.toLowerCase()}
            </div>
          </div>
          
          <div className="p-4 bg-purple-500/5 rounded-lg">
            <div className="text-sm font-medium text-purple-600 mb-1">Market Focus</div>
            <div className="text-lg font-bold text-foreground">
              {sectorData[0]?.sector || 'Diversified'}
            </div>
            <div className="text-xs text-muted-foreground">
              Most active sector by deal value
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
