import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign, Shield, Activity, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, LineChart, Line, ComposedChart, Bar } from 'recharts';
import { useForexReserves } from '@/hooks/useForexReserves';
import { useMonthlyImports } from '@/hooks/useMonthlyImports';
import { useUsdInrRates } from '@/hooks/useUsdInrRates';
import { generateForexInterpretation } from '@/services/aiInterpretation';
import { format, subWeeks, subYears } from 'date-fns';

const ForexReservesInsights = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('5Y');
  const [unit, setUnit] = useState<'usd' | 'inr'>('usd');
  const [selectedYear, setSelectedYear] = useState<string>('latest');
  const [dataType, setDataType] = useState<'latest' | 'year-end'>('latest');

  // Fetch data
  const { data: forexData, loading: forexLoading, availableFYs } = useForexReserves(unit, 'all');
  const { data: importsData, averageMonthlyImports, loading: importsLoading } = useMonthlyImports(12);
  const { data: usdInrData, loading: ratesLoading } = useUsdInrRates(timeframe);

  // AI Interpretation states
  const [interpretations, setInterpretations] = useState({
    kpis: '',
    composition: '',
    importCover: '',
    volatility: '',
    comparison: ''
  });

  // Get filtered data based on selected year and data type
  const filteredData = useMemo(() => {
    if (!forexData.length) return [];
    
    if (selectedYear === 'latest') {
      return forexData;
    }
    
    // Filter data for specific year
    const targetYear = parseInt(selectedYear);
    const yearData = forexData.filter(item => {
      const itemDate = new Date(item.week_ended);
      const fyYear = itemDate.getMonth() >= 3 ? itemDate.getFullYear() : itemDate.getFullYear() - 1;
      return fyYear === targetYear;
    });
    
    if (dataType === 'year-end') {
      // Get last entry of the financial year (March data)
      const marchData = yearData.filter(item => {
        const itemDate = new Date(item.week_ended);
        return itemDate.getMonth() === 2; // March (0-indexed)
      });
      return marchData.length > 0 ? [marchData[marchData.length - 1]] : yearData.slice(0, 1);
    }
    
    return yearData;
  }, [forexData, selectedYear, dataType]);
  
  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!filteredData.length) return null;

    const latest = filteredData[0]; // Data is sorted DESC
    const previousWeek = filteredData[1];
    const yearAgo = filteredData.find(item => {
      const itemDate = new Date(item.week_ended);
      const targetDate = subYears(new Date(latest.week_ended), 1);
      const diffDays = Math.abs((itemDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // Within a week of year ago
    });

    const latestTotal = unit === 'usd' ? latest.total_reserves_usd_mn : latest.total_reserves_inr_crore;
    const prevTotal = unit === 'usd' ? previousWeek?.total_reserves_usd_mn : previousWeek?.total_reserves_inr_crore;
    const yearAgoTotal = unit === 'usd' ? yearAgo?.total_reserves_usd_mn : yearAgo?.total_reserves_inr_crore;

    const weeklyChange = prevTotal ? latestTotal - prevTotal : 0;
    const weeklyChangePercent = prevTotal ? ((weeklyChange / prevTotal) * 100) : 0;
    const yearlyChange = yearAgoTotal ? latestTotal - yearAgoTotal : 0;
    const yearlyChangePercent = yearAgoTotal ? ((yearlyChange / yearAgoTotal) * 100) : 0;

    return {
      latest: latestTotal,
      weeklyChange,
      weeklyChangePercent,
      yearlyChange,
      yearlyChangePercent,
      date: latest.week_ended
    };
  }, [filteredData, unit]);

  // Prepare composition data for donut chart
  const compositionData = useMemo(() => {
    if (!filteredData.length) return [];

    const latest = filteredData[0];
    const suffix = unit === 'usd' ? 'usd_mn' : 'inr_crore';

    return [
      {
        name: 'Foreign Currency Assets',
        value: latest[`foreign_currency_assets_${suffix}`],
        color: 'hsl(var(--chart-1))'
      },
      {
        name: 'Gold',
        value: latest[`gold_${suffix}`],
        color: 'hsl(var(--chart-2))'
      },
      {
        name: 'SDRs',
        value: latest[`sdrs_${suffix}`],
        color: 'hsl(var(--chart-3))'
      },
      {
        name: 'IMF Position',
        value: latest[`reserve_position_imf_${suffix}`],
        color: 'hsl(var(--chart-4))'
      }
    ];
  }, [filteredData, unit]);

  // Calculate import cover
  const importCover = useMemo(() => {
    if (!kpis || !averageMonthlyImports) return 0;
    return kpis.latest / averageMonthlyImports;
  }, [kpis, averageMonthlyImports]);

  // Prepare volatility heatmap data
  const volatilityData = useMemo(() => {
    if (!forexData.length) return [];

    const heatmapData = [];
    for (let i = 1; i < Math.min(forexData.length, 104); i++) { // Last 2 years
      const current = forexData[i - 1];
      const previous = forexData[i];
      
      const currentValue = unit === 'usd' ? current.total_reserves_usd_mn : current.total_reserves_inr_crore;
      const previousValue = unit === 'usd' ? previous.total_reserves_usd_mn : previous.total_reserves_inr_crore;
      
      const changePercent = ((currentValue - previousValue) / previousValue) * 100;
      
      heatmapData.push({
        date: current.week_ended,
        change: changePercent,
        month: format(new Date(current.week_ended), 'MMM yyyy'),
        week: format(new Date(current.week_ended), 'MMM dd')
      });
    }

    return heatmapData.reverse(); // Chronological order
  }, [forexData, unit]);

  // Prepare comparison data (Reserves vs USD/INR)
  const comparisonData = useMemo(() => {
    if (!forexData.length || !usdInrData.length) return [];

    const alignedData = [];
    
    forexData.forEach(forexItem => {
      const matchingRate = usdInrData.find(rateItem => {
        const forexDate = new Date(forexItem.week_ended);
        const rateDate = new Date(rateItem.date);
        const diffDays = Math.abs((forexDate.getTime() - rateDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7; // Within a week
      });

      if (matchingRate) {
        alignedData.push({
          date: forexItem.week_ended,
          reserves: forexItem.total_reserves_usd_mn,
          usdInrRate: matchingRate.rate,
          displayDate: format(new Date(forexItem.week_ended), 'MMM yy')
        });
      }
    });

    return alignedData.reverse().slice(-52); // Last year
  }, [forexData, usdInrData]);

  // Generate AI interpretations when data changes
  useEffect(() => {
    const generateInterpretations = async () => {
      if (!kpis || !compositionData.length || !volatilityData.length) return;

      try {
        const [kpisInterpretation, compositionInterpretation, importCoverInterpretation, volatilityInterpretation, comparisonInterpretation] = await Promise.all([
          generateForexInterpretation({ type: 'kpis', data: kpis, unit }),
          generateForexInterpretation({ type: 'composition', data: compositionData, unit, additionalContext: { total: kpis.latest } }),
          generateForexInterpretation({ type: 'importCover', data: importCover, additionalContext: { averageImports: averageMonthlyImports } }),
          generateForexInterpretation({ type: 'volatility', data: volatilityData }),
          generateForexInterpretation({ type: 'comparison', data: comparisonData })
        ]);

        setInterpretations({
          kpis: kpisInterpretation,
          composition: compositionInterpretation,
          importCover: importCoverInterpretation,
          volatility: volatilityInterpretation,
          comparison: comparisonInterpretation
        });
      } catch (error) {
        console.error('Error generating interpretations:', error);
      }
    };

    generateInterpretations();
  }, [kpis, compositionData, importCover, volatilityData, comparisonData, unit, averageMonthlyImports]);

  const formatValue = (value: number) => {
    if (unit === 'usd') {
      return `$${(value / 1000).toFixed(1)}B`;
    } else {
      return `₹${(value / 100000).toFixed(1)}L Cr`;
    }
  };

  const formatChange = (value: number, percent: number) => {
    const sign = value >= 0 ? '+' : '';
    const arrow = value >= 0 ? '▲' : '▼';
    const color = value >= 0 ? 'text-green-600' : 'text-red-600';
    
    return (
      <span className={`flex items-center gap-1 ${color}`}>
        {sign}{formatValue(Math.abs(value))} ({sign}{percent.toFixed(2)}%) {arrow}
      </span>
    );
  };

  if (forexLoading || importsLoading || ratesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-muted-foreground">Loading comprehensive insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/indicators/forex_reserves')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Foreign Exchange Reserves</h1>
              <p className="text-muted-foreground">Comprehensive Analysis & Insights</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Year Selection */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-background border border-input rounded-md px-3 py-1 text-sm"
              >
                <option value="latest">Latest Data</option>
                {availableFYs?.map(fy => (
                  <option key={fy} value={fy}>FY {fy}</option>
                ))}
              </select>
            </div>
            
            {/* Data Type Toggle (only show when year is selected) */}
            {selectedYear !== 'latest' && (
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setDataType('latest')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    dataType === 'latest' 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setDataType('year-end')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    dataType === 'year-end' 
                      ? 'bg-background shadow-sm text-foreground' 
                      : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Year End
                </button>
              </div>
            )}
            
            {/* Unit Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setUnit('usd')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  unit === 'usd' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setUnit('inr')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  unit === 'inr' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                INR
              </button>
            </div>
          </div>
        </div>

        {/* KPIs Row */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latest Total Reserves</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatValue(kpis.latest)}</div>
                <p className="text-xs text-muted-foreground">
                  Week ended {format(new Date(kpis.date), 'MMM dd, yyyy')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Change</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatChange(kpis.weeklyChange, kpis.weeklyChangePercent)}
                </div>
                <p className="text-xs text-muted-foreground">From previous week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Year-over-Year</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatChange(kpis.yearlyChange, kpis.yearlyChangePercent)}
                </div>
                <p className="text-xs text-muted-foreground">From same week last year</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Interpretation for KPIs */}
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Key Performance Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interpretations.kpis || 'Analyzing key performance indicators...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Second Row: Composition & Import Cover */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Composition Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Reserve Composition
                </div>
                {kpis && (
                  <div className="text-xs text-muted-foreground">
                    As of {format(new Date(kpis.date), 'MMM dd, yyyy')}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={compositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {compositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: string) => {
                        const total = compositionData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [`${formatValue(value)} (${percentage}%)`, name];
                      }}
                      labelFormatter={(label) => label}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Import Cover */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Months of Import Cover
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-80">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={importCover >= 6 ? "hsl(var(--chart-2))" : importCover >= 3 ? "hsl(var(--chart-3))" : "hsl(var(--chart-4))"}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${Math.min(importCover * 20, 251.2)} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold">{importCover.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">months</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className={`text-sm font-medium ${importCover >= 6 ? 'text-green-600' : importCover >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {importCover >= 6 ? 'Healthy' : importCover >= 3 ? 'Adequate' : 'Low'} Coverage
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Interpretation for Composition & Import Cover */}
        <Card className="mb-8 border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Composition & Adequacy Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interpretations.composition || 'Analyzing reserve composition...'} {interpretations.importCover || 'Evaluating import cover adequacy...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Third Row: Volatility Heatmap */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Volatility Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-1 mb-4">
              {volatilityData.slice(-48).map((item, index) => {
                const intensity = Math.min(Math.abs(item.change), 2) / 2;
                const color = item.change >= 0 
                  ? `rgba(34, 197, 94, ${0.2 + intensity * 0.8})` 
                  : `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`;
                
                return (
                  <div
                    key={index}
                    className="aspect-square rounded-sm border border-border/50 flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={`${item.week}: ${item.change.toFixed(2)}%`}
                  >
                    {Math.abs(item.change) > 1 ? (item.change > 0 ? '+' : '-') : ''}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last 48 weeks</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500/60 rounded-sm"></div>
                  <span>Increase</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500/60 rounded-sm"></div>
                  <span>Decrease</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Interpretation for Volatility */}
        <Card className="mb-8 border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Volatility Pattern Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interpretations.volatility || 'Analyzing volatility patterns...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fourth Row: Reserves vs USD/INR Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Reserves vs USD/INR Exchange Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="reserves"
                    orientation="left"
                    stroke="hsl(var(--chart-1))"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}B`}
                  />
                  <YAxis 
                    yAxisId="rate"
                    orientation="right"
                    stroke="hsl(var(--chart-2))"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value.toFixed(1)}`}
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === 'reserves') return [`$${(value / 1000).toFixed(1)}B`, 'Reserves'];
                      return [`₹${value.toFixed(2)}`, 'USD/INR Rate'];
                    }}
                  />
                  <Area
                    yAxisId="reserves"
                    type="monotone"
                    dataKey="reserves"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                    name="reserves"
                  />
                  <Line
                    yAxisId="rate"
                    type="monotone"
                    dataKey="usdInrRate"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                    name="usdInrRate"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Interpretation for Comparison */}
        <Card className="mb-8 border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Currency Relationship Analysis</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {interpretations.comparison || 'Analyzing currency relationship patterns...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForexReservesInsights;
