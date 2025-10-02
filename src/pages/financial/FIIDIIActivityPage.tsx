// FII/DII Activity Page - Institutional Flow Analysis

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, Building, BarChart3, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

interface FIIDIIFlow {
  id: number;
  date: string;
  fii_equity_buy: number;
  fii_equity_sell: number;
  fii_equity_net: number;
  dii_equity_buy: number;
  dii_equity_sell: number;
  dii_equity_net: number;
  fii_debt_buy: number;
  fii_debt_sell: number;
  fii_debt_net: number;
}

export default function FIIDIIActivityPage() {
  const [flows, setFlows] = useState<FIIDIIFlow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('fii_dii_flows')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      setFlows(data || []);
    } catch (error) {
      console.error('Error fetching FII/DII data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const latestFlow = flows[flows.length - 1];
  const totalFIIEquityNet = flows.reduce((sum, f) => sum + parseFloat(f.fii_equity_net.toString()), 0);
  const totalDIIEquityNet = flows.reduce((sum, f) => sum + parseFloat(f.dii_equity_net.toString()), 0);
  const avgFIIDaily = totalFIIEquityNet / flows.length;
  const avgDIIDaily = totalDIIEquityNet / flows.length;

  // Prepare chart data
  const chartData = flows.map(f => ({
    date: new Date(f.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    fiiNet: parseFloat(f.fii_equity_net.toString()),
    diiNet: parseFloat(f.dii_equity_net.toString()),
    fiiBuy: parseFloat(f.fii_equity_buy.toString()),
    fiiSell: parseFloat(f.fii_equity_sell.toString()),
    diiBuy: parseFloat(f.dii_equity_buy.toString()),
    diiSell: parseFloat(f.dii_equity_sell.toString()),
  }));

  // Cumulative flows
  let fiiCumulative = 0;
  let diiCumulative = 0;
  const cumulativeData = flows.map(f => {
    fiiCumulative += parseFloat(f.fii_equity_net.toString());
    diiCumulative += parseFloat(f.dii_equity_net.toString());
    return {
      date: new Date(f.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      fiiCumulative,
      diiCumulative,
    };
  });

  // Buy vs Sell analysis
  const buySellData = flows.slice(-10).map(f => ({
    date: new Date(f.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    fiiBuy: parseFloat(f.fii_equity_buy.toString()),
    fiiSell: -parseFloat(f.fii_equity_sell.toString()), // Negative for visual clarity
    diiBuy: parseFloat(f.dii_equity_buy.toString()),
    diiSell: -parseFloat(f.dii_equity_sell.toString()),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading FII/DII data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">FII/DII Activity</h1>
              <p className="text-muted-foreground mt-1">Foreign & Domestic Institutional Investment Flows</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building className="h-4 w-4" />
                FII Net (Today)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                parseFloat(latestFlow?.fii_equity_net?.toString() || '0') >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                ₹{parseFloat(latestFlow?.fii_equity_net?.toString() || '0').toFixed(2)} Cr
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {parseFloat(latestFlow?.fii_equity_net?.toString() || '0') >= 0 ? 'Net Inflow' : 'Net Outflow'}
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                DII Net (Today)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                parseFloat(latestFlow?.dii_equity_net?.toString() || '0') >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                ₹{parseFloat(latestFlow?.dii_equity_net?.toString() || '0').toFixed(2)} Cr
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {parseFloat(latestFlow?.dii_equity_net?.toString() || '0') >= 0 ? 'Net Buying' : 'Net Selling'}
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">FII Cumulative</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalFIIEquityNet >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{totalFIIEquityNet.toFixed(0)} Cr
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last {flows.length} days</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">DII Cumulative</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalDIIEquityNet >= 0 ? 'text-success' : 'text-destructive'}`}>
                ₹{totalDIIEquityNet.toFixed(0)} Cr
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last {flows.length} days</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="netflow" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="netflow">Net Flow</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
            <TabsTrigger value="buysell">Buy vs Sell</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Net Flow Tab */}
          <TabsContent value="netflow" className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Daily Net Equity Flows</CardTitle>
                <CardDescription>FII and DII net investment in equity markets (₹ Crores)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="fiiNet" name="FII Net" fill="#0088FE" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="diiNet" name="DII Net" fill="#00C49F" radius={[8, 8, 0, 0]} />
                    <Line type="monotone" dataKey="fiiNet" stroke="#0088FE" strokeWidth={0} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity Table */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 10 trading days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Date</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">FII Buy</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">FII Sell</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">FII Net</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">DII Buy</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">DII Sell</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">DII Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flows.slice(-10).reverse().map((flow) => (
                        <tr key={flow.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium text-foreground">
                            {new Date(flow.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            ₹{parseFloat(flow.fii_equity_buy.toString()).toFixed(0)}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            ₹{parseFloat(flow.fii_equity_sell.toString()).toFixed(0)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-semibold ${
                              parseFloat(flow.fii_equity_net.toString()) >= 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              ₹{parseFloat(flow.fii_equity_net.toString()).toFixed(0)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            ₹{parseFloat(flow.dii_equity_buy.toString()).toFixed(0)}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            ₹{parseFloat(flow.dii_equity_sell.toString()).toFixed(0)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-semibold ${
                              parseFloat(flow.dii_equity_net.toString()) >= 0 ? 'text-success' : 'text-destructive'
                            }`}>
                              ₹{parseFloat(flow.dii_equity_net.toString()).toFixed(0)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cumulative Tab */}
          <TabsContent value="cumulative" className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Cumulative Flows</CardTitle>
                <CardDescription>Running total of FII and DII equity investments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={cumulativeData}>
                    <defs>
                      <linearGradient id="colorFII" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDII" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C49F" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="fiiCumulative" 
                      name="FII Cumulative"
                      stroke="#0088FE" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorFII)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="diiCumulative" 
                      name="DII Cumulative"
                      stroke="#00C49F" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorDII)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>FII Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Net Flow</span>
                    <span className={`font-bold ${totalFIIEquityNet >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{totalFIIEquityNet.toFixed(0)} Cr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Daily Average</span>
                    <span className={`font-bold ${avgFIIDaily >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{avgFIIDaily.toFixed(0)} Cr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Positive Days</span>
                    <span className="font-bold text-foreground">
                      {flows.filter(f => parseFloat(f.fii_equity_net.toString()) > 0).length} / {flows.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>DII Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Net Flow</span>
                    <span className={`font-bold ${totalDIIEquityNet >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{totalDIIEquityNet.toFixed(0)} Cr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Daily Average</span>
                    <span className={`font-bold ${avgDIIDaily >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ₹{avgDIIDaily.toFixed(0)} Cr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Positive Days</span>
                    <span className="font-bold text-foreground">
                      {flows.filter(f => parseFloat(f.dii_equity_net.toString()) > 0).length} / {flows.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Buy vs Sell Tab */}
          <TabsContent value="buysell" className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Buy vs Sell Activity</CardTitle>
                <CardDescription>Last 10 trading days - Gross buy and sell volumes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={buySellData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => `₹${Math.abs(value).toFixed(0)} Cr`}
                    />
                    <Legend />
                    <Bar dataKey="fiiBuy" name="FII Buy" fill="#00C49F" stackId="fii" />
                    <Bar dataKey="fiiSell" name="FII Sell" fill="#FF8042" stackId="fii" />
                    <Bar dataKey="diiBuy" name="DII Buy" fill="#0088FE" stackId="dii" />
                    <Bar dataKey="diiSell" name="DII Sell" fill="#FFBB28" stackId="dii" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Insights */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">FII vs DII Dynamics</h4>
                    <p className="text-sm text-muted-foreground">
                      {totalFIIEquityNet > 0 && totalDIIEquityNet > 0 
                        ? 'Both FIIs and DIIs are net buyers, indicating strong market sentiment and liquidity.'
                        : totalFIIEquityNet < 0 && totalDIIEquityNet > 0
                        ? 'DIIs are absorbing FII selling, providing market stability and preventing sharp corrections.'
                        : totalFIIEquityNet > 0 && totalDIIEquityNet < 0
                        ? 'FIIs are buying while DIIs are selling, possibly indicating profit booking by domestic institutions.'
                        : 'Both FIIs and DIIs are net sellers, indicating cautious market sentiment.'}
                    </p>
                  </div>

                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h4 className="font-semibold text-success mb-2">Market Impact</h4>
                    <p className="text-sm text-muted-foreground">
                      Institutional flows are a leading indicator of market direction. Sustained FII inflows typically 
                      correlate with market rallies, while DII support provides a cushion during corrections.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <h4 className="font-semibold text-orange-500 mb-2">Volatility Indicator</h4>
                    <p className="text-sm text-muted-foreground">
                      Large swings in FII flows often precede increased market volatility. Monitor daily flows 
                      exceeding ₹2,000 Cr for potential market moves.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Implications */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Investment Implications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">For Retail Investors</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Follow institutional trends but avoid knee-jerk reactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Use SIP to average out volatility from FII flows</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Focus on fundamentals over short-term flows</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Market Timing</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Sustained FII buying (5+ days) signals bullish momentum</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>DII buying during FII selling creates buying opportunities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Monitor cumulative flows for trend confirmation</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Risk Management</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Heavy FII selling may trigger stop losses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Maintain cash reserves during volatile periods</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Diversify across sectors to reduce impact</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
