import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Info } from 'lucide-react';
import { sampleIndicators, economicEvents, categoryConfig } from '@/data/sampleIndicators';

const IndicatorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [indicator, setIndicator] = useState<any>(null);

  useEffect(() => {
    const foundIndicator = sampleIndicators.find(ind => ind.id === id);
    if (foundIndicator) {
      setIndicator(foundIndicator);
    }
  }, [id]);

  if (!indicator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Indicator Not Found</h2>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Generate historical data (last 2 years)
  const generateHistoricalData = () => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      // Simulate realistic data variations
      const baseValue = parseFloat(indicator.value.replace(/[^0-9.-]/g, ''));
      const variation = (Math.random() - 0.5) * 0.3 * baseValue;
      const value = Math.max(0, baseValue + variation);
      
      data.push({
        date: date.toISOString().substr(0, 7), // YYYY-MM format
        value: Math.round(value * 100) / 100,
        fullDate: date
      });
    }
    
    return data;
  };

  const historicalData = generateHistoricalData();
  const categoryStyle = categoryConfig[indicator.category as keyof typeof categoryConfig];

  const getTrendIcon = () => {
    if (indicator.change > 0) {
      return <TrendingUp className="h-5 w-5 status-positive" />;
    } else if (indicator.change < 0) {
      return <TrendingDown className="h-5 w-5 status-negative" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getChangeColor = () => {
    if (indicator.change > 0) return 'status-positive';
    if (indicator.change < 0) return 'status-negative';
    return 'text-muted-foreground';
  };

  // Sample insights based on indicator
  const generateInsights = () => {
    return [
      `The ${indicator.name} shows ${indicator.change > 0 ? 'positive' : indicator.change < 0 ? 'negative' : 'stable'} momentum with a ${Math.abs(indicator.change)}% change.`,
      `Current value of ${indicator.value} indicates ${indicator.change > 5 ? 'strong growth' : indicator.change > 0 ? 'modest growth' : indicator.change < -5 ? 'significant decline' : 'stable performance'} in this sector.`,
      `Historical analysis suggests this indicator is ${Math.random() > 0.5 ? 'above' : 'below'} its long-term average, indicating ${Math.random() > 0.5 ? 'favorable' : 'challenging'} economic conditions.`,
      `Seasonal patterns typically show ${Math.random() > 0.5 ? 'stronger' : 'weaker'} performance during ${['Q1', 'Q2', 'Q3', 'Q4'][Math.floor(Math.random() * 4)]}.`,
      `Policy implications suggest continued monitoring of this indicator for ${Math.random() > 0.5 ? 'inflationary' : 'deflationary'} pressures.`
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1400px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Badge 
            variant="secondary" 
            className={`${categoryStyle?.bgColor} ${categoryStyle?.borderColor} border`}
          >
            {indicator.category}
          </Badge>
        </div>

        {/* Indicator Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-3">
                  {indicator.name}
                  {getTrendIcon()}
                </CardTitle>
                <CardDescription>
                  Source: {indicator.source} | Last Updated: {indicator.lastUpdated || 'Today'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="metric-value text-3xl">
                      {indicator.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Current Value
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className={`text-2xl font-bold ${getChangeColor()}`}>
                      {indicator.change > 0 ? '+' : ''}{indicator.change}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Change
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {indicator.unit || 'Units'}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Unit
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {Math.round(Math.random() * 50 + 50)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Confidence Score
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24M High:</span>
                  <span className="font-semibold">
                    {(parseFloat(indicator.value.replace(/[^0-9.-]/g, '')) * 1.15).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24M Low:</span>
                  <span className="font-semibold">
                    {(parseFloat(indicator.value.replace(/[^0-9.-]/g, '')) * 0.85).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volatility:</span>
                  <span className="font-semibold">{(Math.random() * 20 + 5).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trend:</span>
                  <span className={`font-semibold ${getChangeColor()}`}>
                    {indicator.change > 2 ? 'Bullish' : indicator.change < -2 ? 'Bearish' : 'Neutral'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Historical Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historical Performance (24 Months)
            </CardTitle>
            <CardDescription>
              Chart shows historical trends with key economic events marked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  
                  {/* Event markers */}
                  {economicEvents.map((event, index) => (
                    <ReferenceLine 
                      key={index}
                      x={event.date} 
                      stroke={event.impact === 'high' ? 'hsl(var(--destructive))' : 'hsl(var(--warning))'}
                      strokeDasharray="2 2"
                      label={{ value: event.description, position: 'top' }}
                    />
                  ))}
                  
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Economic Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Economic Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Key Economic Events
              </CardTitle>
              <CardDescription>
                Major events that impacted this indicator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {economicEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      event.impact === 'high' ? 'bg-destructive' : 
                      event.impact === 'medium' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <div>
                      <div className="font-semibold text-sm">{event.date}</div>
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
                {generateInsights().map((insight, index) => (
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
                  Based on current trends and historical patterns, this indicator is expected to 
                  {indicator.change > 0 ? ' continue its positive trajectory' : indicator.change < 0 ? ' show signs of recovery' : ' maintain stability'} 
                  in the near term, subject to global economic conditions and domestic policy measures.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetailPage;