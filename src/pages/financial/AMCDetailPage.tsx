// AMC Detail Page - Complete AMC Analysis

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AMC {
  id: number;
  amc_code: string;
  amc_name: string;
  total_aum: number;
  num_schemes: number;
  market_share: number;
  rank: number;
  established_year: number;
  headquarters: string;
  ceo_name: string;
}

interface Scheme {
  id: number;
  scheme_code: string;
  scheme_name: string;
  category: string;
  sub_category: string;
  current_nav: number;
  aum: number;
  expense_ratio: number;
  fund_manager_name: string;
  risk_grade: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AMCDetailPage() {
  const { amcCode } = useParams<{ amcCode: string }>();
  const [amc, setAmc] = useState<AMC | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (amcCode) {
      fetchAMCData();
    }
  }, [amcCode]);

  const fetchAMCData = async () => {
    try {
      setLoading(true);

      // Fetch AMC details
      const { data: amcData, error: amcError } = await (supabase as any)
        .from('mutual_fund_amcs')
        .select('*')
        .eq('amc_code', amcCode)
        .single();

      if (amcError) throw amcError;

      // Fetch schemes for this AMC
      const { data: schemesData, error: schemesError } = await (supabase as any)
        .from('mutual_fund_schemes_new')
        .select('*')
        .eq('amc_id', amcData.id)
        .order('current_nav', { ascending: false });

      if (schemesError) throw schemesError;

      setAmc(amcData);
      setSchemes(schemesData || []);
    } catch (error) {
      console.error('Error fetching AMC data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AMC details...</p>
        </div>
      </div>
    );
  }

  if (!amc) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">AMC not found</p>
          <Link to="/financial-markets/mutual-funds">
            <Button className="mt-4">Back to Mutual Funds</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate category breakdown
  const categoryBreakdown = schemes.reduce((acc: any, scheme) => {
    const cat = scheme.category || 'Other';
    if (!acc[cat]) {
      acc[cat] = { name: cat, count: 0, aum: 0 };
    }
    acc[cat].count++;
    acc[cat].aum += parseFloat(scheme.aum?.toString() || '0');
    return acc;
  }, {});

  const categoryChartData = Object.values(categoryBreakdown);

  const filteredSchemes = selectedCategory === 'all'
    ? schemes
    : schemes.filter(s => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/financial-markets/mutual-funds">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Mutual Funds
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{amc.amc_name}</h1>
              <p className="text-muted-foreground mt-1">Complete AMC Analysis</p>
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
              <div className="text-2xl font-bold text-foreground">
                ₹{(parseFloat(amc.total_aum?.toString() || '0') / 1000).toFixed(2)}K Cr
              </div>
              <p className="text-xs text-muted-foreground mt-1">Assets under management</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Schemes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{schemes.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active schemes</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Market Share</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {amc.market_share?.toFixed(2) || '0.00'}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Industry share</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Industry Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">#{amc.rank || 'N/A'}</div>
              <p className="text-xs text-muted-foreground mt-1">By AUM</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Schemes by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AUM by Category */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>AUM by Category</CardTitle>
              <CardDescription>Assets distribution (₹ Crores)</CardDescription>
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
                  <Bar dataKey="aum" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

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
            All Schemes ({schemes.length})
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
              {cat} ({schemes.filter(s => s.category === cat).length})
            </button>
          ))}
        </div>

        {/* Schemes Table */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>All Schemes</CardTitle>
            <CardDescription>Complete list of schemes managed by {amc.amc_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Scheme Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Category</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">NAV</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">AUM</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Exp Ratio</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchemes.map((scheme) => (
                    <tr key={scheme.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          to={`/financial-markets/mutual-funds/scheme/${scheme.scheme_code}`}
                          className="font-medium text-primary hover:underline max-w-md truncate block"
                        >
                          {scheme.scheme_name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{scheme.fund_manager_name || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {scheme.sub_category || scheme.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-foreground">
                        ₹{scheme.current_nav?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        ₹{parseFloat(scheme.aum?.toString() || '0').toFixed(0)} Cr
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {scheme.expense_ratio?.toFixed(2) || 'N/A'}%
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium ${
                          scheme.risk_grade === 'Very High' ? 'text-destructive' :
                          scheme.risk_grade === 'High' ? 'text-orange-500' :
                          scheme.risk_grade === 'Moderately High' ? 'text-primary' :
                          'text-success'
                        }`}>
                          {scheme.risk_grade || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
