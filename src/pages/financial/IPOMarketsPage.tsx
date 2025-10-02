// IPO Markets Page - IPO Pipeline & Performance Analysis

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Rocket, Calendar, Award, AlertCircle, Target } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IPO {
  id: number;
  company_name: string;
  issue_size: number;
  price_band: string;
  sector: string;
  open_date: string;
  close_date: string;
  listing_date: string | null;
  qib_subscription: number | null;
  nii_subscription: number | null;
  retail_subscription: number | null;
  total_subscription: number | null;
  listing_gain_percent: number | null;
  current_price: number | null;
  status: string;
}

const STATUS_COLORS = {
  upcoming: '#FFBB28',
  listed: '#00C49F',
  closed: '#0088FE',
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function IPOMarketsPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('ipo_data')
        .select('*')
        .order('open_date', { ascending: false });

      if (error) throw error;

      setIpos(data || []);
    } catch (error) {
      console.error('Error fetching IPO data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter IPOs
  const upcomingIPOs = ipos.filter(ipo => ipo.status === 'upcoming');
  const listedIPOs = ipos.filter(ipo => ipo.status === 'listed');
  
  const filteredIPOs = filter === 'all' ? ipos : 
                       filter === 'upcoming' ? upcomingIPOs : 
                       listedIPOs;

  // Calculate metrics
  const totalIssueSize = ipos.reduce((sum, ipo) => sum + parseFloat(ipo.issue_size.toString()), 0);
  const avgListingGain = listedIPOs.reduce((sum, ipo) => sum + (ipo.listing_gain_percent || 0), 0) / listedIPOs.length;
  const successRate = (listedIPOs.filter(ipo => (ipo.listing_gain_percent || 0) > 0).length / listedIPOs.length) * 100;

  // Sector distribution
  const sectorData = ipos.reduce((acc: any, ipo) => {
    const sector = ipo.sector;
    if (!acc[sector]) {
      acc[sector] = { name: sector, count: 0, value: 0 };
    }
    acc[sector].count++;
    acc[sector].value += parseFloat(ipo.issue_size.toString());
    return acc;
  }, {});

  const sectorChartData = Object.values(sectorData).sort((a: any, b: any) => b.value - a.value);

  // Performance data
  const performanceData = listedIPOs.map(ipo => ({
    name: ipo.company_name.substring(0, 15) + (ipo.company_name.length > 15 ? '...' : ''),
    listingGain: ipo.listing_gain_percent || 0,
    currentReturn: ipo.current_price && ipo.listing_gain_percent 
      ? ((ipo.current_price - (parseFloat(ipo.price_band.split('-')[1]) * (1 + ipo.listing_gain_percent / 100))) / (parseFloat(ipo.price_band.split('-')[1]) * (1 + ipo.listing_gain_percent / 100))) * 100
      : 0,
  })).sort((a, b) => b.listingGain - a.listingGain).slice(0, 10);

  // Subscription analysis
  const subscriptionData = listedIPOs.filter(ipo => ipo.total_subscription).map(ipo => ({
    name: ipo.company_name.substring(0, 15),
    qib: ipo.qib_subscription || 0,
    nii: ipo.nii_subscription || 0,
    retail: ipo.retail_subscription || 0,
    total: ipo.total_subscription || 0,
  })).sort((a, b) => b.total - a.total).slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading IPO data...</p>
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
            <Rocket className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">IPO Markets</h1>
              <p className="text-muted-foreground mt-1">IPO Pipeline, Performance & Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total IPOs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{ipos.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {upcomingIPOs.length} upcoming, {listedIPOs.length} listed
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issue Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{(totalIssueSize / 1000).toFixed(1)}K Cr</div>
              <p className="text-xs text-muted-foreground mt-1">Combined market value</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Listing Gain</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${avgListingGain >= 0 ? 'text-success' : 'text-destructive'}`}>
                {avgListingGain.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">First day returns</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{successRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Positive listing gains</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All IPOs ({ipos.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Upcoming ({upcomingIPOs.length})
          </button>
          <button
            onClick={() => setFilter('listed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'listed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Listed ({listedIPOs.length})
          </button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>IPO Pipeline</CardTitle>
                <CardDescription>Upcoming and recent IPOs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Company</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Sector</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Issue Size</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Price Band</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Open Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Listing Gain</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIPOs.map((ipo) => (
                        <tr key={ipo.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-foreground">{ipo.company_name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {ipo.sector}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-foreground">
                            ₹{parseFloat(ipo.issue_size.toString()).toLocaleString('en-IN')} Cr
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">₹{ipo.price_band}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(ipo.open_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize`}
                              style={{ 
                                backgroundColor: `${STATUS_COLORS[ipo.status as keyof typeof STATUS_COLORS]}20`,
                                color: STATUS_COLORS[ipo.status as keyof typeof STATUS_COLORS]
                              }}>
                              {ipo.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {ipo.listing_gain_percent !== null ? (
                              <span className={`font-semibold ${
                                ipo.listing_gain_percent >= 0 ? 'text-success' : 'text-destructive'
                              }`}>
                                {ipo.listing_gain_percent >= 0 ? '+' : ''}{ipo.listing_gain_percent.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Sector Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Sector Distribution</CardTitle>
                  <CardDescription>IPOs by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sectorChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {sectorChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Issue Size by Sector</CardTitle>
                  <CardDescription>Total capital raised (₹ Crores)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sectorChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Listing Performance</CardTitle>
                <CardDescription>Top 10 IPOs by listing day gains</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="listingGain" name="Listing Gain %" fill="hsl(var(--success))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="dashboard-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Best Performer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-success mb-1">
                    {listedIPOs.sort((a, b) => (b.listing_gain_percent || 0) - (a.listing_gain_percent || 0))[0]?.company_name}
                  </div>
                  <p className="text-2xl font-bold text-success">
                    +{listedIPOs.sort((a, b) => (b.listing_gain_percent || 0) - (a.listing_gain_percent || 0))[0]?.listing_gain_percent?.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Median Gain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {(() => {
                      const sorted = listedIPOs.map(ipo => ipo.listing_gain_percent || 0).sort((a, b) => a - b);
                      const mid = Math.floor(sorted.length / 2);
                      return sorted.length % 2 !== 0 ? sorted[mid].toFixed(1) : ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1);
                    })()}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Middle value</p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Worst Performer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-destructive mb-1">
                    {listedIPOs.sort((a, b) => (a.listing_gain_percent || 0) - (b.listing_gain_percent || 0))[0]?.company_name}
                  </div>
                  <p className="text-2xl font-bold text-destructive">
                    {listedIPOs.sort((a, b) => (a.listing_gain_percent || 0) - (b.listing_gain_percent || 0))[0]?.listing_gain_percent?.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Subscription Analysis</CardTitle>
                <CardDescription>Category-wise subscription data</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={subscriptionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="qib" name="QIB" stackId="a" fill="#0088FE" />
                    <Bar dataKey="nii" name="NII" stackId="a" fill="#00C49F" />
                    <Bar dataKey="retail" name="Retail" stackId="a" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subscription Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Highest Subscribed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {listedIPOs
                      .filter(ipo => ipo.total_subscription)
                      .sort((a, b) => (b.total_subscription || 0) - (a.total_subscription || 0))
                      .slice(0, 5)
                      .map((ipo, index) => (
                        <div key={ipo.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">#{index + 1}</span>
                            <span className="text-sm font-medium text-foreground">{ipo.company_name}</span>
                          </div>
                          <span className="text-sm font-bold text-success">{ipo.total_subscription?.toFixed(1)}x</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Category Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">QIB Interest</h4>
                    <p className="text-sm text-muted-foreground">
                      Qualified Institutional Buyers show strong interest with average subscription of{' '}
                      {(listedIPOs.reduce((sum, ipo) => sum + (ipo.qib_subscription || 0), 0) / listedIPOs.filter(ipo => ipo.qib_subscription).length).toFixed(1)}x
                    </p>
                  </div>

                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h4 className="font-semibold text-success mb-2">Retail Participation</h4>
                    <p className="text-sm text-muted-foreground">
                      Retail investors average{' '}
                      {(listedIPOs.reduce((sum, ipo) => sum + (ipo.retail_subscription || 0), 0) / listedIPOs.filter(ipo => ipo.retail_subscription).length).toFixed(1)}x subscription,
                      showing healthy participation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Insights */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h4 className="font-semibold text-success mb-2">Strong IPO Market</h4>
                    <p className="text-sm text-muted-foreground">
                      With {successRate.toFixed(0)}% of IPOs delivering positive listing gains, the market shows 
                      strong appetite for new issues and healthy primary market conditions.
                    </p>
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Sector Trends</h4>
                    <p className="text-sm text-muted-foreground">
                      {(sectorChartData[0] as any)?.name} sector leads with {(sectorChartData[0] as any)?.count} IPOs, 
                      indicating investor preference for this segment.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <h4 className="font-semibold text-orange-500 mb-2">Valuation Caution</h4>
                    <p className="text-sm text-muted-foreground">
                      Not all IPOs maintain listing gains. Conduct thorough due diligence on business 
                      fundamentals, financials, and valuations before investing.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Strategy */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Investment Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">For Conservative Investors</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Focus on established companies with proven track records</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Check QIB subscription levels (higher is better)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Avoid overvalued IPOs with high P/E ratios</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">For Aggressive Investors</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Consider high-growth sectors like tech and EV</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Monitor grey market premiums for sentiment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Be prepared for volatility post-listing</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mt-4">
                    <h4 className="font-semibold text-destructive mb-2">⚠️ Risk Warning</h4>
                    <p className="text-sm text-muted-foreground">
                      IPO investments carry significant risk. Past performance doesn't guarantee future returns. 
                      Invest only after reading the prospectus and consulting financial advisors.
                    </p>
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
