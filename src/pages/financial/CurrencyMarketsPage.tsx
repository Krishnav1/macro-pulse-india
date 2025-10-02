// Currency Markets Page - Forex Analysis

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Globe, ArrowUpDown, AlertCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CurrencyRate {
  id: number;
  date: string;
  from_currency: string;
  to_currency: string;
  rate: number;
}

const CURRENCY_INFO = {
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  JPY: { name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
};

export default function CurrencyMarketsPage() {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('currency_rates')
        .select('*')
        .eq('to_currency', 'INR')
        .order('date', { ascending: true });

      if (error) throw error;

      setRates(data || []);
    } catch (error) {
      console.error('Error fetching currency data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get latest rates for each currency
  const latestRates = Object.keys(CURRENCY_INFO).map(currency => {
    const currencyRates = rates.filter(r => r.from_currency === currency);
    const latest = currencyRates[currencyRates.length - 1];
    const previous = currencyRates[currencyRates.length - 2];
    
    const change = latest && previous ? ((latest.rate - previous.rate) / previous.rate) * 100 : 0;
    
    return {
      currency,
      ...CURRENCY_INFO[currency as keyof typeof CURRENCY_INFO],
      rate: latest?.rate || 0,
      change,
      date: latest?.date,
    };
  });

  // Prepare chart data
  const chartData = rates
    .filter(r => r.from_currency === selectedCurrency)
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      rate: parseFloat(r.rate.toString()),
    }));

  // All currencies comparison
  const comparisonData = rates.reduce((acc: any[], rate) => {
    const existingDate = acc.find(d => d.date === rate.date);
    if (existingDate) {
      existingDate[rate.from_currency] = parseFloat(rate.rate.toString());
    } else {
      acc.push({
        date: new Date(rate.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        [rate.from_currency]: parseFloat(rate.rate.toString()),
      });
    }
    return acc;
  }, []);

  // Calculate volatility
  const calculateVolatility = (currency: string) => {
    const currencyRates = rates.filter(r => r.from_currency === currency).map(r => parseFloat(r.rate.toString()));
    if (currencyRates.length < 2) return 0;
    
    const returns = currencyRates.slice(1).map((rate, i) => (rate - currencyRates[i]) / currencyRates[i]);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance) * 100;
  };

  const selectedCurrencyInfo = latestRates.find(r => r.currency === selectedCurrency);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading currency data...</p>
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
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Currency & Forex Markets</h1>
              <p className="text-muted-foreground mt-1">Real-time forex rates and currency analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Currency Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestRates.map((curr) => (
            <Card 
              key={curr.currency} 
              className={`dashboard-card cursor-pointer transition-all ${
                selectedCurrency === curr.currency ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCurrency(curr.currency)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="text-2xl">{curr.flag}</span>
                  {curr.currency}/INR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">₹{curr.rate.toFixed(2)}</div>
                <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                  curr.change >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {curr.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{curr.change >= 0 ? '+' : ''}{curr.change.toFixed(2)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{curr.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCurrencyInfo?.flag}</span>
                  {selectedCurrency}/INR Exchange Rate Trend
                </CardTitle>
                <CardDescription>Historical exchange rate movement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRate)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="dashboard-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Current Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">₹{selectedCurrencyInfo?.rate.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">As of {selectedCurrencyInfo?.date}</p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Daily Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    (selectedCurrencyInfo?.change || 0) >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {(selectedCurrencyInfo?.change || 0) >= 0 ? '+' : ''}{selectedCurrencyInfo?.change.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">From previous day</p>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Volatility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {calculateVolatility(selectedCurrency).toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Standard deviation</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Multi-Currency Comparison</CardTitle>
                <CardDescription>Compare all major currencies against INR</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={comparisonData}>
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
                    <Line type="monotone" dataKey="USD" stroke="#0088FE" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="EUR" stroke="#00C49F" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="GBP" stroke="#FFBB28" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="JPY" stroke="#FF8042" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Currency Strength Table */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle>Currency Strength Ranking</CardTitle>
                <CardDescription>Based on recent performance against INR</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Rank</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Currency</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Rate</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Change</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Volatility</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestRates
                        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                        .map((curr, index) => (
                        <tr key={curr.currency} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-primary">#{index + 1}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{curr.flag}</span>
                              <div>
                                <div className="font-medium text-foreground">{curr.currency}/INR</div>
                                <div className="text-xs text-muted-foreground">{curr.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-foreground">
                            ₹{curr.rate.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-semibold ${curr.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {curr.change >= 0 ? '+' : ''}{curr.change.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-orange-500 font-medium">
                            {calculateVolatility(curr.currency).toFixed(2)}%
                          </td>
                          <td className="py-3 px-4">
                            {curr.change >= 0 ? (
                              <TrendingUp className="h-5 w-5 text-success" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-destructive" />
                            )}
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
              {/* Market Insights */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">USD/INR Dynamics</h4>
                    <p className="text-sm text-muted-foreground">
                      The USD/INR pair remains the most traded currency pair in India. Recent movements are influenced by 
                      RBI interventions, FII flows, and global dollar strength.
                    </p>
                  </div>

                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h4 className="font-semibold text-success mb-2">EUR Strength</h4>
                    <p className="text-sm text-muted-foreground">
                      EUR/INR shows relative stability with ECB policy decisions playing a key role. 
                      Trade relations with EU countries impact this pair significantly.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <h4 className="font-semibold text-orange-500 mb-2">GBP Volatility</h4>
                    <p className="text-sm text-muted-foreground">
                      GBP/INR exhibits higher volatility due to Brexit aftermath and UK economic policies. 
                      Traders should monitor Bank of England decisions closely.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="font-semibold text-purple-500 mb-2">JPY Safe Haven</h4>
                    <p className="text-sm text-muted-foreground">
                      JPY/INR acts as a safe-haven indicator during global uncertainty. 
                      Lower rates reflect JPY's fractional value compared to INR.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Strategies */}
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5 text-primary" />
                    Trading Considerations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">For Importers</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Hedge currency risk through forward contracts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Monitor RBI policy announcements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        <span>Consider natural hedging strategies</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">For Exporters</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Benefit from INR depreciation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Lock in favorable rates during strength</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Diversify currency exposure</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">For Investors</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Currency diversification in portfolio</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Monitor global economic indicators</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>Use currency ETFs for exposure</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mt-4">
                    <h4 className="font-semibold text-destructive mb-2">⚠️ Risk Warning</h4>
                    <p className="text-sm text-muted-foreground">
                      Forex trading involves substantial risk. Past performance is not indicative of future results. 
                      Always consult with financial advisors before making currency trading decisions.
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
