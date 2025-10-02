// Mutual Funds & AMC Page - Comprehensive Analysis

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, PieChart, Building2, Award, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AMC {
  id: number;
  amc_code: string;
  amc_name: string;
  total_aum: number;
  num_schemes: number;
}

interface MutualFundScheme {
  id: number;
  scheme_code: string;
  scheme_name: string;
  category: string;
  sub_category: string;
  aum: number;
  current_nav: number;
  expense_ratio: number;
  fund_manager_name: string;
  risk_grade: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D', '#C084FC', '#34D399'];

export default function MutualFundsPage() {
  const [amcs, setAmcs] = useState<AMC[]>([]);
  const [schemes, setSchemes] = useState<MutualFundScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch AMCs
      const { data: amcData, error: amcError } = await (supabase as any)
        .from('mutual_fund_amcs')
        .select('*')
        .order('total_aum', { ascending: false });

      if (amcError) throw amcError;

      // Fetch Schemes from new table
      const { data: schemeData, error: schemeError } = await (supabase as any)
        .from('mutual_fund_schemes_new')
        .select('*')
        .order('current_nav', { ascending: false })
        .limit(100);

      if (schemeError) throw schemeError;

      setAmcs(amcData || []);
      setSchemes(schemeData || []);
    } catch (error) {
      console.error('Error fetching mutual fund data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalAUM = amcs.reduce((sum, amc) => sum + parseFloat(amc.total_aum.toString()), 0);
  const totalSchemes = schemes.length;
  const avgNAV = schemes.reduce((sum, s) => sum + (s.current_nav || 0), 0) / (schemes.length || 1);
  const topScheme = schemes[0];

  // Prepare chart data
  const amcChartData = amcs.slice(0, 10).map(amc => ({
    name: amc.amc_name.replace(' Mutual Fund', ''),
    aum: parseFloat(amc.total_aum.toString()) / 1000, // Convert to thousands of crores
    schemes: amc.num_schemes,
  }));

  const categoryData = schemes.reduce((acc: any, scheme) => {
    const cat = scheme.category || 'Other';
    if (!acc[cat]) {
      acc[cat] = { name: cat, count: 0, avgNAV: 0, totalNAV: 0 };
    }
    acc[cat].count++;
    acc[cat].totalNAV += (scheme.current_nav || 0);
    acc[cat].avgNAV = acc[cat].totalNAV / acc[cat].count;
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryData);

  const navDistribution = [
    { range: '0-50', count: schemes.filter(s => (s.current_nav || 0) >= 0 && (s.current_nav || 0) < 50).length },
    { range: '50-100', count: schemes.filter(s => (s.current_nav || 0) >= 50 && (s.current_nav || 0) < 100).length },
    { range: '100-200', count: schemes.filter(s => (s.current_nav || 0) >= 100 && (s.current_nav || 0) < 200).length },
    { range: '200-500', count: schemes.filter(s => (s.current_nav || 0) >= 200 && (s.current_nav || 0) < 500).length },
    { range: '500+', count: schemes.filter(s => (s.current_nav || 0) >= 500).length },
  ];

  const filteredSchemes = selectedCategory === 'all' 
    ? schemes 
    : schemes.filter(s => s.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mutual fund data...</p>
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
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mutual Funds & AMC</h1>
              <p className="text-muted-foreground mt-1">Comprehensive analysis of Indian mutual fund industry</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total AUM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{(totalAUM / 1000).toFixed(2)}L Cr</div>
              <p className="text-xs text-muted-foreground mt-1">Across {amcs.length} AMCs</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Schemes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalSchemes}</div>
              <p className="text-xs text-muted-foreground mt-1">Active mutual fund schemes</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg NAV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-primary">₹{avgNAV.toFixed(2)}</div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Industry average</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Scheme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-success">₹{topScheme?.current_nav?.toFixed(2) || 0}</div>
                <Award className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{topScheme?.scheme_name?.substring(0, 25) || 'N/A'}...</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="amcs">Top AMCs</TabsTrigger>
            <TabsTrigger value="schemes">Top Schemes</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AMC Market Share */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Top 10 AMCs by AUM</CardTitle>
                  <CardDescription>Assets Under Management (in ₹000 Crores)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={amcChartData}>
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
                      <Bar dataKey="aum" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Category-wise Performance</CardTitle>
                  <CardDescription>Average 1Y returns by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="avgNAV" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* NAV Distribution */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>NAV Distribution</CardTitle>
                <CardDescription>Number of schemes by NAV range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={navDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top AMCs Tab */}
          <TabsContent value="amcs" className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Top Asset Management Companies</CardTitle>
                <CardDescription>Ranked by Assets Under Management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Rank</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">AMC Name</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">AUM (₹ Cr)</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Schemes</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Avg AUM/Scheme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amcs.map((amc, index) => (
                        <tr key={amc.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              to={`/financial-markets/mutual-funds/amc/${amc.amc_code}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {amc.amc_name}
                            </Link>
                            <div className="text-xs text-muted-foreground">{amc.amc_code}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-foreground">
                            ₹{parseFloat(amc.total_aum.toString()).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{amc.num_schemes}</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            ₹{(parseFloat(amc.total_aum.toString()) / amc.num_schemes).toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Schemes Tab */}
          <TabsContent value="schemes" className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All Categories
              </button>
              {Array.from(new Set(schemes.map(s => s.category))).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Top Performing Schemes</CardTitle>
                <CardDescription>Based on 1-year returns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Scheme Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Category</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">NAV</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">1Y</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">3Y</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">5Y</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Exp Ratio</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchemes.slice(0, 20).map((scheme) => (
                        <tr key={scheme.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-foreground max-w-xs truncate">{scheme.scheme_name}</div>
                            <div className="text-xs text-muted-foreground">{scheme.fund_manager_name || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {scheme.sub_category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">₹{scheme.current_nav?.toFixed(2) || 'N/A'}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="font-semibold text-muted-foreground">
                              Coming Soon
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">-</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">-</td>
                          <td className="py-3 px-4 text-right text-muted-foreground">{scheme.expense_ratio.toFixed(2)}%</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-medium ${
                              scheme.risk_grade === 'Very High' ? 'text-destructive' :
                              scheme.risk_grade === 'High' ? 'text-orange-500' :
                              scheme.risk_grade === 'Moderately High' ? 'text-primary' :
                              'text-success'
                            }`}>
                              {scheme.risk_grade}
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
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h4 className="font-semibold text-success mb-2">Growing Industry</h4>
                    <p className="text-sm text-muted-foreground">
                      The mutual fund industry has {totalSchemes.toLocaleString()} active schemes across {amcs.length} AMCs, 
                      providing diverse investment options for all risk profiles.
                    </p>
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Market Concentration</h4>
                    <p className="text-sm text-muted-foreground">
                      Top 3 AMCs (SBI, ICICI, HDFC) control {((amcs.slice(0, 3).reduce((sum, amc) => sum + parseFloat(amc.total_aum.toString()), 0) / totalAUM) * 100).toFixed(1)}% 
                      of total industry AUM, showing significant market concentration.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <h4 className="font-semibold text-orange-500 mb-2">Risk-Return Trade-off</h4>
                    <p className="text-sm text-muted-foreground">
                      Mid-cap and small-cap funds show higher returns but come with increased volatility. 
                      Investors should align choices with risk appetite.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="font-semibold text-purple-500 mb-2">Expense Ratio Impact</h4>
                    <p className="text-sm text-muted-foreground">
                      Direct plans show lower expense ratios (avg {(schemes.reduce((sum, s) => sum + s.expense_ratio, 0) / schemes.length).toFixed(2)}%), 
                      leading to better long-term wealth creation.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Recommendations */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Investment Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">For Conservative Investors</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Large-cap funds with consistent 10-12% returns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Lower expense ratios (below 1.5%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Proven track record over 5+ years</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">For Aggressive Investors</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Mid-cap and small-cap funds with 20%+ returns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Sectoral funds for concentrated bets</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Higher risk tolerance for volatility</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Diversification Strategy</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Mix of large-cap (60%), mid-cap (30%), small-cap (10%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Rebalance portfolio annually</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>SIP for rupee cost averaging</span>
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
