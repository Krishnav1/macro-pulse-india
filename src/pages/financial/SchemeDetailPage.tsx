// Scheme Detail Page - Deep Dive into Individual Scheme

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, AlertCircle, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Scheme {
  id: number;
  scheme_code: string;
  scheme_name: string;
  category: string;
  sub_category: string;
  scheme_type: string;
  current_nav: number;
  nav_date: string;
  aum: number;
  expense_ratio: number;
  fund_manager_name: string;
  risk_grade: string;
  benchmark: string;
  launch_date: string;
  min_investment: number;
  min_sip: number;
  exit_load: string;
  isin_growth: string;
  isin_dividend: string;
}

interface NAVHistory {
  date: string;
  nav: number;
}

export default function SchemeDetailPage() {
  const { schemeCode } = useParams<{ schemeCode: string }>();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [navHistory, setNavHistory] = useState<NAVHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (schemeCode) {
      fetchSchemeData();
    }
  }, [schemeCode]);

  const fetchSchemeData = async () => {
    try {
      setLoading(true);

      // Fetch scheme details
      const { data: schemeData, error: schemeError } = await (supabase as any)
        .from('mutual_fund_schemes_new')
        .select('*')
        .eq('scheme_code', schemeCode)
        .single();

      if (schemeError) throw schemeError;

      // Fetch NAV history (last 90 days)
      const { data: navData, error: navError } = await (supabase as any)
        .from('scheme_nav_history')
        .select('date, nav')
        .eq('scheme_id', schemeData.id)
        .order('date', { ascending: true })
        .limit(90);

      if (navError) console.error('NAV history error:', navError);

      setScheme(schemeData);
      setNavHistory(navData || []);
    } catch (error) {
      console.error('Error fetching scheme data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading scheme details...</p>
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Scheme not found</p>
          <Link to="/financial-markets/mutual-funds">
            <Button className="mt-4">Back to Mutual Funds</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Prepare NAV chart data
  const navChartData = navHistory.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    nav: parseFloat(item.nav.toString()),
  }));

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
            <Award className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{scheme.scheme_name}</h1>
              <p className="text-muted-foreground mt-1">Scheme Code: {scheme.scheme_code}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Scheme Basics */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Scheme Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-base font-medium text-foreground">{scheme.category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sub-Category</p>
                <p className="text-base font-medium text-foreground">{scheme.sub_category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheme Type</p>
                <p className="text-base font-medium text-foreground">{scheme.scheme_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Launch Date</p>
                <p className="text-base font-medium text-foreground">
                  {scheme.launch_date ? new Date(scheme.launch_date).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Benchmark</p>
                <p className="text-base font-medium text-foreground">{scheme.benchmark || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Grade</p>
                <p className={`text-base font-medium ${
                  scheme.risk_grade === 'Very High' ? 'text-destructive' :
                  scheme.risk_grade === 'High' ? 'text-orange-500' :
                  scheme.risk_grade === 'Moderately High' ? 'text-primary' :
                  'text-success'
                }`}>
                  {scheme.risk_grade || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NAV & AUM Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current NAV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{scheme.current_nav?.toFixed(2) || 'N/A'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                As of {scheme.nav_date ? new Date(scheme.nav_date).toLocaleDateString('en-IN') : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">AUM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{parseFloat(scheme.aum?.toString() || '0').toFixed(0)} Cr
              </div>
              <p className="text-xs text-muted-foreground mt-1">Assets under management</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expense Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{scheme.expense_ratio?.toFixed(2) || 'N/A'}%</div>
              <p className="text-xs text-muted-foreground mt-1">Annual fee</p>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Exit Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold text-foreground">{scheme.exit_load || 'N/A'}</div>
              <p className="text-xs text-muted-foreground mt-1">Redemption fee</p>
            </CardContent>
          </Card>
        </div>

        {/* NAV History Chart */}
        {navHistory.length > 0 && (
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>NAV History</CardTitle>
              <CardDescription>Last {navHistory.length} days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={navChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="nav" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Investment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Investment Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Minimum Investment</span>
                <span className="font-semibold text-foreground">
                  ₹{scheme.min_investment?.toLocaleString('en-IN') || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Minimum SIP</span>
                <span className="font-semibold text-foreground">
                  ₹{scheme.min_sip?.toLocaleString('en-IN') || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ISIN (Growth)</span>
                <span className="font-mono text-sm text-foreground">{scheme.isin_growth || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ISIN (Dividend)</span>
                <span className="font-mono text-sm text-foreground">{scheme.isin_dividend || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Fund Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Fund Manager</p>
                <p className="text-base font-medium text-foreground">{scheme.fund_manager_name || 'N/A'}</p>
              </div>
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">ℹ️ Note</h4>
                <p className="text-sm text-muted-foreground">
                  Performance data and portfolio holdings will be available once historical data is synced.
                  Check back later for detailed analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Card className="dashboard-card bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Investment Disclaimer</h4>
                <p className="text-sm text-muted-foreground">
                  Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully
                  before investing. Past performance is not indicative of future returns. The information provided is for
                  informational purposes only and should not be construed as investment advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
