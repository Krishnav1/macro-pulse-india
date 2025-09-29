import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Target, Calendar, DollarSign } from 'lucide-react';
import { useGdpData } from '@/hooks/useGdpData';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Area, AreaChart } from 'recharts';

export const GdpInsightsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'3Y' | '5Y' | '10Y' | 'all'>('5Y');
  
  // Get both annual and quarterly data
  const { data: annualData } = useGdpData('value', 'constant', 'inr', 'annual', selectedPeriod, null);
  const { data: growthData } = useGdpData('growth', 'constant', 'inr', 'annual', selectedPeriod, null);
  const { data: quarterlyData } = useGdpData('value', 'constant', 'inr', 'quarterly', 'all', null);

  // Calculate key insights
  const insights = useMemo(() => {
    if (!annualData?.length || !growthData?.length) return null;

    const latest = annualData[annualData.length - 1];
    const previous = annualData[annualData.length - 2];
    const latestGrowth = growthData[growthData.length - 1];
    
    // Calculate averages
    const avgGrowth = growthData.reduce((sum, item) => sum + item.gdp, 0) / growthData.length;
    const avgPFCE = annualData.reduce((sum, item) => sum + item.pfce, 0) / annualData.length;
    const avgGFCE = annualData.reduce((sum, item) => sum + item.gfce, 0) / annualData.length;
    const avgGFCF = annualData.reduce((sum, item) => sum + item.gfcf, 0) / annualData.length;

    // Find highest and lowest growth years
    const maxGrowth = growthData.reduce((max, item) => item.gdp > max.gdp ? item : max);
    const minGrowth = growthData.reduce((min, item) => item.gdp < min.gdp ? item : min);

    return {
      latest,
      previous,
      latestGrowth,
      avgGrowth,
      avgPFCE,
      avgGFCE,
      avgGFCF,
      maxGrowth,
      minGrowth,
      totalGrowth: ((latest.gdp - annualData[0].gdp) / annualData[0].gdp) * 100,
      yearOverYearChange: previous ? ((latest.gdp - previous.gdp) / previous.gdp) * 100 : 0
    };
  }, [annualData, growthData]);

  // Prepare pie chart data for GDP composition
  const compositionData = useMemo(() => {
    if (!insights?.latest) return [];
    
    const latest = insights.latest;
    return [
      { name: 'PFCE (Consumption)', value: latest.pfce, color: '#22c55e', percentage: (latest.pfce / latest.gdp) * 100 },
      { name: 'GFCE (Government)', value: latest.gfce, color: '#f59e0b', percentage: (latest.gfce / latest.gdp) * 100 },
      { name: 'GFCF (Investment)', value: latest.gfcf, color: '#3b82f6', percentage: (latest.gfcf / latest.gdp) * 100 },
      { name: 'Exports', value: latest.exports, color: '#ef4444', percentage: (latest.exports / latest.gdp) * 100 },
      { name: 'Imports', value: -Math.abs(latest.imports), color: '#8b5cf6', percentage: (latest.imports / latest.gdp) * 100 }
    ].filter(item => Math.abs(item.value) > 0);
  }, [insights]);

  // Prepare trend data for growth analysis
  const trendData = useMemo(() => {
    if (!growthData?.length) return [];
    
    return growthData.map(item => ({
      year: item.year,
      gdp: item.gdp,
      pfce: item.pfce,
      gfce: item.gfce,
      gfcf: item.gfcf,
      exports: item.exports,
      imports: item.imports
    }));
  }, [growthData]);

  // Quarterly volatility analysis
  const quarterlyInsights = useMemo(() => {
    if (!quarterlyData?.length) return null;

    const recentQuarters = quarterlyData.slice(-8); // Last 2 years of quarterly data
    const growthRates = recentQuarters.map((item, index) => {
      if (index === 0) return 0;
      const prev = recentQuarters[index - 1];
      return ((item.gdp - prev.gdp) / prev.gdp) * 100;
    }).slice(1);

    const avgQuarterlyGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const volatility = Math.sqrt(growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgQuarterlyGrowth, 2), 0) / growthRates.length);

    return {
      avgQuarterlyGrowth,
      volatility,
      recentQuarters: recentQuarters.map((item, index) => ({
        ...item,
        quarterlyGrowth: index > 0 ? (((item.gdp - recentQuarters[index - 1].gdp) / recentQuarters[index - 1].gdp) * 100) : 0
      }))
    };
  }, [quarterlyData]);

  const formatValue = (value: number) => `₹${(value / 100000).toFixed(2)} Trillion`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="text-center">Loading insights...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to GDP Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Real GDP Growth - Comprehensive Analysis</h1>
            <p className="text-muted-foreground">Deep insights into India's economic performance</p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {['3Y', '5Y', '10Y', 'all'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period as any)}
            >
              {period === 'all' ? 'All Years' : period}
            </Button>
          ))}
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current GDP</p>
                  <p className="text-2xl font-bold">{formatValue(insights.latest.gdp)}</p>
                  <p className="text-xs text-muted-foreground">FY {insights.latest.year}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Latest Growth</p>
                  <p className="text-2xl font-bold text-green-600">{formatPercent(insights.latestGrowth.gdp)}</p>
                  <p className="text-xs text-muted-foreground">Annual growth rate</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Growth</p>
                  <p className="text-2xl font-bold">{formatPercent(insights.avgGrowth)}</p>
                  <p className="text-xs text-muted-foreground">Over {selectedPeriod === 'all' ? 'all years' : selectedPeriod}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Growth</p>
                  <p className="text-2xl font-bold text-purple-600">{formatPercent(insights.totalGrowth)}</p>
                  <p className="text-xs text-muted-foreground">Since {annualData[0]?.year}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* GDP Composition Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                GDP Composition Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={compositionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatValue(value as number)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {compositionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Growth Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Growth Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                    <Area 
                      type="monotone" 
                      dataKey="gdp" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                      name="GDP Growth"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Highest Growth</p>
                  <p className="font-semibold text-green-600">
                    {formatPercent(insights.maxGrowth.gdp)} in {insights.maxGrowth.year}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lowest Growth</p>
                  <p className="font-semibold text-red-600">
                    {formatPercent(insights.minGrowth.gdp)} in {insights.minGrowth.year}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component-wise Growth Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Component-wise Growth Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
                  <Line type="monotone" dataKey="gdp" stroke="#8884d8" strokeWidth={3} name="GDP" />
                  <Line type="monotone" dataKey="pfce" stroke="#22c55e" strokeWidth={2} name="PFCE" />
                  <Line type="monotone" dataKey="gfce" stroke="#f59e0b" strokeWidth={2} name="GFCE" />
                  <Line type="monotone" dataKey="gfcf" stroke="#3b82f6" strokeWidth={2} name="GFCF" />
                  <Line type="monotone" dataKey="exports" stroke="#ef4444" strokeWidth={2} name="Exports" />
                  <Line type="monotone" dataKey="imports" stroke="#8b5cf6" strokeWidth={2} name="Imports" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quarterly Volatility Analysis */}
        {quarterlyInsights && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quarterly Volatility Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Avg Quarterly Growth</p>
                  <p className="text-xl font-bold">{formatPercent(quarterlyInsights.avgQuarterlyGrowth)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Volatility</p>
                  <p className="text-xl font-bold">{formatPercent(quarterlyInsights.volatility)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Data Points</p>
                  <p className="text-xl font-bold">{quarterlyInsights.recentQuarters.length}</p>
                </div>
              </div>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterlyInsights.recentQuarters}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${(value as number).toFixed(2)}%`} />
                    <Bar dataKey="quarterlyGrowth" fill="#8884d8" name="Quarterly Growth %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Economic Insights & Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Key Economic Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Growth Drivers</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">Private Consumption (PFCE)</span>
                    <Badge variant="secondary">{((insights.avgPFCE / insights.latest.gdp) * 100).toFixed(1)}% of GDP</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">Investment (GFCF)</span>
                    <Badge variant="secondary">{((insights.avgGFCF / insights.latest.gdp) * 100).toFixed(1)}% of GDP</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm">Government Spending (GFCE)</span>
                    <Badge variant="secondary">{((insights.avgGFCE / insights.latest.gdp) * 100).toFixed(1)}% of GDP</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Performance Summary</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Economic Size</p>
                    <p className="font-semibold">{formatValue(insights.latest.gdp)}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Year-over-Year Growth</p>
                    <p className="font-semibold text-green-600">+{formatPercent(insights.yearOverYearChange)}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Growth Consistency</p>
                    <p className="font-semibold">
                      {quarterlyInsights ? 
                        `${quarterlyInsights.volatility < 2 ? 'Stable' : quarterlyInsights.volatility < 4 ? 'Moderate' : 'Volatile'} (${formatPercent(quarterlyInsights.volatility)} volatility)` 
                        : 'Calculating...'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
