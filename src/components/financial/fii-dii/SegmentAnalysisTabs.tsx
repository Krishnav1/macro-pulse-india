import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useFIICashData, useDIICashData, useFIIFOIndicesData, useFIIFOStocksData, useDIIFOIndicesData, useDIIFOStocksData } from '@/hooks/financial/useFIIDIIDataNew';
import { Info } from 'lucide-react';

interface SegmentAnalysisTabsProps {
  financialYear: string;
  view: 'yearly' | 'monthly' | 'weekly' | 'daily';
}

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#8B5CF6'];

export function SegmentAnalysisTabs({ financialYear, view }: SegmentAnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState('cash-market');

  const { data: fiiCashData = [], loading: fiiCashLoading } = useFIICashData({ financialYear });
  const { data: diiCashData = [], loading: diiCashLoading } = useDIICashData({ financialYear });
  const { data: fiiIndicesData = [], loading: fiiIndicesLoading } = useFIIFOIndicesData({ financialYear });
  const { data: fiiStocksData = [], loading: fiiStocksLoading } = useFIIFOStocksData({ financialYear });
  const { data: diiIndicesData = [], loading: diiIndicesLoading } = useDIIFOIndicesData({ financialYear });
  const { data: diiStocksData = [], loading: diiStocksLoading } = useDIIFOStocksData({ financialYear });

  const isLoading = fiiCashLoading || diiCashLoading || fiiIndicesLoading || fiiStocksLoading || diiIndicesLoading || diiStocksLoading;
  const hasData = fiiCashData.length > 0 && diiCashData.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading segment data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No data available for the selected period</p>
        </CardContent>
      </Card>
    );
  }

  // Cash Market Analysis
  const cashAnalysis = fiiCashData.slice(-30).map((fiiItem, idx) => {
    const diiItem = diiCashData[idx];
    const date = new Date(fiiItem.date);
    const label = view === 'monthly' ? date.getDate().toString() : 
                  view === 'yearly' ? fiiItem.month_name.split(' ')[0].substring(0, 3) :
                  fiiItem.month_name.split(' ')[0].substring(0, 3);
    
    return {
      period: label,
      fiiEquity: fiiItem.equity_net,
      fiiDebt: fiiItem.debt_net,
      diiEquity: diiItem?.equity_net || 0,
      diiDebt: diiItem?.debt_net || 0,
    };
  });

  // F&O Market Analysis
  const foAnalysis = fiiIndicesData.slice(-30).map((fiiIndItem, idx) => {
    const fiiStockItem = fiiStocksData[idx];
    const diiIndItem = diiIndicesData[idx];
    const diiStockItem = diiStocksData[idx];
    const date = new Date(fiiIndItem.date);
    const label = view === 'monthly' ? date.getDate().toString() : 
                  view === 'yearly' ? fiiIndItem.month_name.split(' ')[0].substring(0, 3) :
                  fiiIndItem.month_name.split(' ')[0].substring(0, 3);
    
    return {
      period: label,
      fiiIndices: fiiIndItem.futures_net_indices + fiiIndItem.options_net_indices,
      fiiStocks: fiiStockItem ? (fiiStockItem.futures_net + fiiStockItem.options_net) : 0,
      diiIndices: diiIndItem ? (diiIndItem.futures_net_indices + diiIndItem.options_net_indices) : 0,
      diiStocks: diiStockItem ? (diiStockItem.futures_net + diiStockItem.options_net) : 0,
    };
  });

  // Market Comparison (Cash vs F&O)
  const marketComparison = cashAnalysis.map((cashItem, idx) => {
    const foItem = foAnalysis[idx];
    const cashTotal = cashItem.fiiEquity + cashItem.fiiDebt + cashItem.diiEquity + cashItem.diiDebt;
    const foTotal = foItem.fiiIndices + foItem.fiiStocks + foItem.diiIndices + foItem.diiStocks;
    
    return {
      period: cashItem.period,
      cash: cashTotal,
      fo: foTotal,
      total: cashTotal + foTotal,
    };
  });

  // Segment Distribution (Pie Chart Data)
  const latestCash = cashAnalysis.length > 0 ? cashAnalysis[cashAnalysis.length - 1] : null;
  const latestFO = foAnalysis.length > 0 ? foAnalysis[foAnalysis.length - 1] : null;
  
  const segmentDistribution = latestCash && latestFO ? [
    { name: 'FII Equity', value: Math.abs(latestCash.fiiEquity || 0), color: COLORS[0] },
    { name: 'FII Debt', value: Math.abs(latestCash.fiiDebt || 0), color: COLORS[1] },
    { name: 'FII F&O', value: Math.abs((latestFO.fiiIndices || 0) + (latestFO.fiiStocks || 0)), color: COLORS[2] },
    { name: 'DII Total', value: Math.abs((latestCash.diiEquity || 0) + (latestCash.diiDebt || 0) + (latestFO.diiIndices || 0) + (latestFO.diiStocks || 0)), color: COLORS[3] },
  ].filter(item => item.value > 0) : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Segment Analysis</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Cash: Delivery-based | F&O: Derivatives</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cash-market">Cash Market</TabsTrigger>
            <TabsTrigger value="fo-market">F&O Market</TabsTrigger>
            <TabsTrigger value="comparison">Cash vs F&O</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="cash-market" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Cash Market:</strong> Delivery-based equity and debt transactions representing long-term investment flows
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cashAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toFixed(0)} Cr`, '']}
                  />
                  <Legend />
                  <Bar dataKey="fiiEquity" name="FII Equity" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fiiDebt" name="FII Debt" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="diiEquity" name="DII Equity" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="diiDebt" name="DII Debt" fill="#84CC16" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="fo-market" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                📈 <strong>F&O Market:</strong> Index and stock derivatives used for hedging and speculation
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={foAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toFixed(0)} Cr`, '']}
                  />
                  <Legend />
                  <Bar dataKey="fiiIndices" name="FII Indices" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fiiStocks" name="FII Stocks" fill="#EC4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="diiIndices" name="DII Indices" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="diiStocks" name="DII Stocks" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ⚖️ <strong>Market Comparison:</strong> Cash market vs derivatives market activity
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={marketComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toFixed(0)} Cr`, '']}
                  />
                  <Legend />
                  <Bar dataKey="cash" name="Cash Market" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="fo" name="F&O Market" fill="#F97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                🥧 <strong>Current Distribution:</strong> Latest period segment breakdown
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={segmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={160}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry) => `${((entry.value / segmentDistribution.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}
                  >
                    {segmentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`₹${value.toFixed(0)} Cr`, '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
