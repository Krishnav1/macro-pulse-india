import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { useIndicatorData } from '@/hooks/useIndicatorData';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { format } from 'date-fns';

interface GSecChartProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
}

export const GSecChart = ({ timeframe, setTimeframe }: GSecChartProps) => {
  // Calculate date range based on timeframe
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate = new Date(2000, 0, 1); // Start from 2000
    switch (timeframe) {
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '3y':
        startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
        break;
      case '5y':
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        break;
      case '10y':
        startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
        break;
    }
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }, [timeframe]);

  // Fetch G-Sec yield data
  const { series: gsecData, loading } = useIndicatorData('gsec_yield_10y');

  // Fetch events
  const { data: eventsData } = useIndicatorEvents({
    indicatorSlug: 'gsec_yield_10y',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  // Transform data for chart - filter by date range
  const chartData = useMemo(() => {
    if (!gsecData.length) return [];
    
    return gsecData
      .filter(item => {
        const itemDate = new Date(item.period_date);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        return itemDate >= start && itemDate <= end;
      })
      .map(item => ({
        date: item.period_date,
        yield: item.value
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [gsecData, dateRange]);

  // Get event Y position on the trend line
  const getEventYPosition = (eventDate: string): number => {
    if (!chartData.length) return 0;
    
    // Find exact date match
    const exactMatch = chartData.find(item => item.date === eventDate);
    if (exactMatch && typeof exactMatch.yield === 'number') {
      return exactMatch.yield;
    }
    
    // Find closest date
    const eventTime = new Date(eventDate).getTime();
    let closestItem = chartData[0];
    let minDiff = Math.abs(new Date(chartData[0].date).getTime() - eventTime);
    
    for (const item of chartData) {
      const diff = Math.abs(new Date(item.date).getTime() - eventTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestItem = item;
      }
    }
    
    if (closestItem && typeof closestItem.yield === 'number') {
      return closestItem.yield;
    }
    
    // Fallback: return middle of Y-axis range
    const allValues = chartData.map(item => item.yield).filter(val => typeof val === 'number');
    if (allValues.length > 0) {
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      return (min + max) / 2;
    }
    
    return 0;
  };

  // Custom tooltip formatter
  const formatTooltip = (value: any) => {
    const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
    return [`${formattedValue}%`, '10Y G-Sec Yield'];
  };

  const customTooltipLabel = (label: string) => {
    const date = new Date(label);
    return format(date, 'dd MMM yyyy');
  };

  return (
    <Card>
      <CardHeader>
        {/* Single Row: Title + Year Filter */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            10-Year G-Sec Yield
          </CardTitle>
          
          {/* Year Filter */}
          <div className="flex gap-2">
            <button className={`px-3 py-1 text-sm rounded-md border transition-colors ${timeframe === '1y' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent'}`} onClick={() => setTimeframe('1y')}>1Y</button>
            <button className={`px-3 py-1 text-sm rounded-md border transition-colors ${timeframe === '3y' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent'}`} onClick={() => setTimeframe('3y')}>3Y</button>
            <button className={`px-3 py-1 text-sm rounded-md border transition-colors ${timeframe === '5y' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent'}`} onClick={() => setTimeframe('5y')}>5Y</button>
            <button className={`px-3 py-1 text-sm rounded-md border transition-colors ${timeframe === '10y' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent'}`} onClick={() => setTimeframe('10y')}>10Y</button>
            <button className={`px-3 py-1 text-sm rounded-md border transition-colors ${timeframe === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-accent'}`} onClick={() => setTimeframe('all')}>MAX</button>
          </div>
        </div>
        
        <CardDescription className="mt-2">
          10-Year Government Securities Yield - benchmark for long-term interest rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading yield data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return format(date, 'MMM yy');
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: 'Yield (%)', angle: -90, position: 'insideLeft' }}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={formatTooltip}
                  labelFormatter={customTooltipLabel}
                />
                <Line 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                  name="10Y G-Sec Yield"
                />
                
                {/* Event markers */}
                {eventsData && eventsData.map((event, index) => (
                  <ReferenceDot
                    key={index}
                    x={event.date}
                    y={getEventYPosition(event.date)}
                    r={6}
                    fill={event.impact === 'high' ? '#ef4444' : event.impact === 'medium' ? '#f59e0b' : '#22c55e'}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
