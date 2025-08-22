import { useState } from 'react';
import { repoRateData as repoRateDataStatic, repoRateEvents as repoRateEventsStatic, repoRateInsights as repoRateInsightsStatic, repoRateComparisons as repoRateComparisonsStatic } from '@/data/repoRateData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIndicatorData } from '@/hooks/useIndicatorData';

const RepoRatePage = () => {
  const [timeframe, setTimeframe] = useState('all');
  const [selectedComparisons, setSelectedComparisons] = useState<string[]>([]);
  const [comparisonScrollIndex, setComparisonScrollIndex] = useState(0);

  // Use generic indicator data hook with fallback to static data
  const { series, events, insights, comparisons, loading, error } = useIndicatorData('repo_rate');
  
  // Transform data to match existing component expectations
  const repoRateData = series.length > 0 
    ? series.map(s => ({ date: s.period_date, rate: s.value }))
    : repoRateDataStatic;
  
  const repoRateEvents = events.length > 0 ? events : repoRateEventsStatic;
  
  const repoRateInsights = insights.length > 0 
    ? insights.map(i => i.content)
    : repoRateInsightsStatic;
  
  const repoRateComparisons = comparisons.length > 0
    ? comparisons.map(c => ({ 
        id: c.compare_indicator_slug, 
        name: c.display_name, 
        category: 'Comparison' 
      }))
    : repoRateComparisonsStatic;

  const getFilteredData = () => {
    const now = new Date();
    let startDate = new Date(0);
    switch (timeframe) {
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '5y':
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        break;
      case '10y':
        startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
        break;
      default:
        break;
    }
    return repoRateData.filter(d => new Date(d.date) >= startDate);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getTrendIcon = () => {
    const currentRate = latestData.rate;
    const previousRate = repoRateData[1]?.rate || currentRate;
    const change = currentRate - previousRate;
    
    if (change > 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (change < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const scrollComparisons = (direction: 'left' | 'right') => {
    const maxIndex = Math.max(0, repoRateComparisons.length - 4);
    if (direction === 'left') {
      setComparisonScrollIndex(Math.max(0, comparisonScrollIndex - 1));
    } else {
      setComparisonScrollIndex(Math.min(maxIndex, comparisonScrollIndex + 1));
    }
  };

  const chartData = getFilteredData();
  const latestData = repoRateData[0] || { date: '', rate: 0 };
  const visibleComparisons = repoRateComparisons.slice(comparisonScrollIndex, comparisonScrollIndex + 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">

        {/* Main Layout - Chart on Left, Details on Right */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Historical Repo Rate
                  </div>
                  <div className="flex gap-2">
                    <Button variant={timeframe === '1y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('1y')}>1Y</Button>
                    <Button variant={timeframe === '5y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('5y')}>5Y</Button>
                    <Button variant={timeframe === '10y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('10y')}>10Y</Button>
                    <Button variant={timeframe === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('all')}>MAX</Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  RBI policy rate changes with major economic events highlighted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        unit="%"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`${value}%`, 'Repo Rate']}
                      />
                      
                      {/* Event markers */}
                      {repoRateEvents.map((event, index) => (
                        <ReferenceLine 
                          key={index}
                          x={event.date} 
                          stroke="hsl(var(--destructive))"
                          strokeDasharray="2 2"
                          label={{ value: event.description.substring(0, 15) + "...", position: 'top' }}
                        />
                      ))}
                      
                      <Line 
                        type="stepAfter" 
                        dataKey="rate"
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Comparison Indicators Below Chart */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Compare with:</h4>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => scrollComparisons('left')}
                        disabled={comparisonScrollIndex === 0}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => scrollComparisons('right')}
                        disabled={comparisonScrollIndex >= repoRateComparisons.length - 4}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {visibleComparisons.map((comparison) => (
                      <Button
                        key={comparison.id}
                        variant={selectedComparisons.includes(comparison.id) ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => {
                          setSelectedComparisons(prev => 
                            prev.includes(comparison.id) 
                              ? prev.filter(id => id !== comparison.id)
                              : [...prev, comparison.id]
                          );
                        }}
                      >
                        {comparison.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            {/* Main Indicator Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Repo Rate
                    {getTrendIcon()}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-blue-500/10 border-blue-500/20 border">
                    Monetary Policy
                  </Badge>
                </div>
                <CardDescription>
                  Source: RBI | Last Updated: {new Date(latestData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold">
                      {latestData.rate?.toFixed(2) || '—'}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Current Rate
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-muted-foreground">
                      {((repoRateData[0]?.rate ?? 0) - (repoRateData[1]?.rate ?? 0)) > 0 ? '+' : ''}{(((repoRateData[0]?.rate ?? 0) - (repoRateData[1]?.rate ?? 0))).toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last Change
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {repoRateData.length ? Math.max(...repoRateData.map(d => d.rate)).toFixed(2) : '—'}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      24M High
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {repoRateData.length ? Math.min(...repoRateData.map(d => d.rate)).toFixed(2) : '—'}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      24M Low
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policy Stance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-4 w-4" />
                  Policy Stance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Cycle:</span>
                  <span className="font-semibold">Easing</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Real Rate:</span>
                  <span className="font-semibold">3.95%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Neutral Rate:</span>
                  <span className="font-semibold">~5.0%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next Meeting:</span>
                  <span className="font-semibold">Dec 2025</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Economic Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Economic Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Key Economic Events
              </CardTitle>
              <CardDescription>
                Major events that impacted the repo rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repoRateEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      event.impact === 'high' ? 'bg-destructive' : 
                      event.impact === 'medium' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <div>
                      <div className="font-semibold text-sm">{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-sm text-muted-foreground">{event.description}</div>
                      <Badge 
                        variant={event.impact === 'high' ? 'destructive' : event.impact === 'medium' ? 'secondary' : 'default'}
                        className="mt-1 text-xs"
                      >
                        {event.impact} impact
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Key Insights
              </CardTitle>
              <CardDescription>
                AI-generated analysis and economic implications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repoRateInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Outlook
                </h4>
                <p className="text-sm text-muted-foreground">
                  Based on current inflation trends and economic indicators, RBI is likely to maintain an accommodative stance 
                  with potential for further rate cuts if inflation remains below target and growth shows signs of moderation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RepoRatePage;
