import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useCpiSeries } from '@/hooks/useCpiSeries';
import { format } from 'date-fns';

interface CPIChartProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  geography: 'rural' | 'urban' | 'combined';
  setGeography: (geography: 'rural' | 'urban' | 'combined') => void;
}

export const CPIChart = ({ timeframe, setTimeframe, geography, setGeography }: CPIChartProps) => {
  const [comparisonScrollIndex, setComparisonScrollIndex] = useState(0);
  const [dataType, setDataType] = useState<'index' | 'inflation'>('inflation');

  const comparisonIndicators = [
    { id: 'wpi', name: 'WPI Inflation' },
    { id: 'core', name: 'Core CPI' },
    { id: 'food', name: 'Food CPI' },
    { id: 'fuel', name: 'Fuel CPI' },
    { id: 'housing', name: 'Housing CPI' },
    { id: 'transport', name: 'Transport CPI' }
  ];

  // Calculate date range based on timeframe
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate = new Date(2000, 0, 1); // Default to all data
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
    }
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }, [timeframe]);

  // Get selected comparison series
  const selectedComparisons = useMemo(() => {
    return ['headline', ...visibleComparisons.map(c => c.id)];
  }, [comparisonScrollIndex]);

  // Fetch CPI data from Supabase
  const { data: cpiData, loading } = useCpiSeries({
    geography,
    seriesCodes: selectedComparisons,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!cpiData.length) return [];
    
    // Group data by date
    const dataByDate = new Map();
    
    cpiData.forEach(item => {
      const dateKey = item.date;
      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, { date: dateKey });
      }
      
      const entry = dataByDate.get(dateKey);
      const value = dataType === 'index' ? item.index_value : (item.inflation_yoy || item.inflation_mom || 0);
      
      if (item.series_code === 'headline') {
        entry.value = value;
      } else {
        entry[item.series_code] = value;
      }
    });
    
    return Array.from(dataByDate.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [cpiData, dataType]);

  // Custom tick formatter to show years only
  const formatXAxisTick = (tickItem: string, index: number) => {
    const date = new Date(tickItem);
    const year = date.getFullYear();
    
    // Show year only if it's January or first occurrence of the year
    if (index === 0 || date.getMonth() === 0) {
      return year.toString();
    }
    
    return '';
  };

  // Custom tooltip formatter
  const formatTooltip = (value: any, name: string, props: any) => {
    const date = new Date(props.payload.date);
    const monthYear = format(date, 'MMM yyyy');
    const unit = dataType === 'index' ? '' : '%';
    const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
    
    return [`${formattedValue}${unit}`, name === 'value' ? 'CPI' : name];
  };

  const customTooltipLabel = (label: string) => {
    const date = new Date(label);
    return format(date, 'MMM yyyy');
  };

  const scrollComparisons = (direction: 'left' | 'right') => {
    const maxIndex = Math.max(0, comparisonIndicators.length - 4);
    if (direction === 'left') {
      setComparisonScrollIndex(Math.max(0, comparisonScrollIndex - 1));
    } else {
      setComparisonScrollIndex(Math.min(maxIndex, comparisonScrollIndex + 1));
    }
  };

  const visibleComparisons = comparisonIndicators.slice(comparisonScrollIndex, comparisonScrollIndex + 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Consumer Price Index
          </div>
          <div className="flex gap-2">
            <Button variant={timeframe === '1y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('1y')}>1Y</Button>
            <Button variant={timeframe === '5y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('5y')}>5Y</Button>
            <Button variant={timeframe === '10y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('10y')}>10Y</Button>
            <Button variant={timeframe === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('all')}>MAX</Button>
          </div>
        </CardTitle>
        
        {/* Data Type Toggle */}
        <div className="flex gap-2 mt-2">
          <Button
            variant={dataType === 'index' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDataType('index')}
          >
            Index
          </Button>
          <Button
            variant={dataType === 'inflation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDataType('inflation')}
          >
            Inflation Rate
          </Button>
        </div>
        <CardDescription>
          CPI inflation trends with major economic events highlighted
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading CPI data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={formatXAxisTick}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  unit={dataType === 'index' ? '' : '%'}
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
                
                {/* Main CPI Line */}
                <Line 
                  type="monotone" 
                  dataKey="value"
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="CPI"
                />
                
                {/* Comparison Lines */}
                {visibleComparisons.slice(1).map((comparison, index) => (
                  <Line 
                    key={comparison.id}
                    type="monotone" 
                    dataKey={comparison.id}
                    stroke={`hsl(${200 + index * 40}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="3 3"
                    name={comparison.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Geography and Compare Options */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            {/* Geography Toggle */}
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium text-muted-foreground">Geography:</h4>
              <div className="flex gap-2">
                <Button
                  variant={geography === 'rural' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGeography('rural')}
                >
                  Rural
                </Button>
                <Button
                  variant={geography === 'urban' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGeography('urban')}
                >
                  Urban
                </Button>
                <Button
                  variant={geography === 'combined' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGeography('combined')}
                >
                  Combined
                </Button>
              </div>
            </div>

            {/* Compare With Options */}
            <div className="flex items-center gap-3">
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
                  disabled={comparisonScrollIndex >= comparisonIndicators.length - 4}
                  className="h-7 w-7 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Comparison Indicators */}
          <div className="flex gap-2 justify-end">
            {visibleComparisons.map((comparison) => (
              <Button
                key={comparison.id}
                variant="outline"
                size="sm"
                className="text-xs h-8"
              >
                {comparison.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
