import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIipSeries } from '@/hooks/useIipSeries';
import { format } from 'date-fns';

interface IIPChartProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  compareWith: 'none' | 'sectoral' | 'use_based';
  setCompareWith: (compare: 'none' | 'sectoral' | 'use_based') => void;
}

export const IIPChart = ({ timeframe, setTimeframe, compareWith, setCompareWith }: IIPChartProps) => {
  const [comparisonScrollIndex, setComparisonScrollIndex] = useState(0);
  const [dataType, setDataType] = useState<'index' | 'growth'>('growth');
  const [selectedComparisons, setSelectedComparisons] = useState<string[]>([]);
  const [showComparisonError, setShowComparisonError] = useState(false);

  const comparisonIndicators = [
    { id: 'mining', name: 'Mining' },
    { id: 'manufacturing', name: 'Manufacturing' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'primary', name: 'Primary Goods' },
    { id: 'capital', name: 'Capital Goods' },
    { id: 'intermediate', name: 'Intermediate Goods' },
    { id: 'consumer_durables', name: 'Consumer Durables' }
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

  // Fetch IIP data
  const { data: iipData, loading } = useIipSeries({
    startDate: dateRange.startDate,
    limit: timeframe === 'all' ? 500 : 100
  });

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!iipData?.length) return [];
    
    return iipData.map(item => ({
      date: item.date,
      iip: dataType === 'index' ? item.index_value : (item.growth_yoy || 0)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [iipData, dataType]);

  // Calculate Y-axis domain for better scaling
  const yAxisDomain = useMemo(() => {
    if (!chartData.length) return ['auto', 'auto'];
    
    const allValues = chartData.map(item => item.iip).filter(val => typeof val === 'number' && !isNaN(val));
    
    if (!allValues.length) return ['auto', 'auto'];
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;
    const padding = range * 0.1; // 10% padding
    
    // For 1-year timeframe, use tighter scaling for better trend visibility
    if (timeframe === '1y' && range > 0) {
      return [Math.max(0, min - padding), max + padding];
    }
    
    return ['auto', 'auto'];
  }, [chartData, timeframe]);

  // Custom tick formatter to show years only
  const formatXAxisTick = (tickItem: string, index: number) => {
    const date = new Date(tickItem);
    const year = date.getFullYear();
    
    // Show year for January dates and every few ticks
    if (date.getMonth() === 0 || index % 12 === 0) {
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
    
    return [`${formattedValue}${unit}`, name === 'iip' ? 'IIP' : name];
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

  // Toggle comparison selection
  const toggleComparison = (comparisonId: string) => {
    setSelectedComparisons(prev => 
      prev.includes(comparisonId) 
        ? prev.filter(id => id !== comparisonId)
        : [...prev, comparisonId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Index of Industrial Production
          </div>
          <div className="flex gap-2">
            <Button variant={timeframe === '1y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('1y')}>1Y</Button>
            <Button variant={timeframe === '5y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('5y')}>5Y</Button>
            <Button variant={timeframe === '10y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('10y')}>10Y</Button>
            <Button variant={timeframe === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('all')}>MAX</Button>
          </div>
        </CardTitle>
        <CardDescription>
          IIP growth trends with major economic events highlighted
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Data Type Toggle - Placed directly below timeframe buttons */}
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant={dataType === 'index' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDataType('index')}
          >
            Index
          </Button>
          <Button
            variant={dataType === 'growth' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDataType('growth')}
          >
            Growth Rate
          </Button>
        </div>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading IIP data...</div>
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
                  domain={yAxisDomain}
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
                  dataKey="iip"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                  name="IIP"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        

        {/* Base Year Note */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Data is based on Base: 2011-12 = 100
        </div>
        
        {/* Classification and Compare Options - More space */}
        <div className="mt-6 pt-4 border-t space-y-4">
          {/* Classification Toggle */}
          <div className="flex items-center justify-center gap-3">
            <h4 className="text-sm font-medium text-muted-foreground">Classification:</h4>
            <div className="flex gap-2">
              <Button
                variant={compareWith === 'none' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCompareWith('none')}
              >
                General Index
              </Button>
              <Button
                variant={compareWith === 'sectoral' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCompareWith('sectoral')}
              >
                Sectoral
              </Button>
              <Button
                variant={compareWith === 'use_based' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCompareWith('use_based')}
              >
                Use-based
              </Button>
            </div>
          </div>

          {/* Compare With Options */}
          <div className="flex items-center justify-center gap-3">
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
          
          {/* Comparison Indicators - Clickable */}
          <div className="flex gap-2 justify-center flex-wrap">
            {visibleComparisons.map((comparison) => (
              <Button
                key={comparison.id}
                variant={selectedComparisons.includes(comparison.id) ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-8"
                onClick={() => toggleComparison(comparison.id)}
              >
                {comparison.name}
              </Button>
            ))}
          </div>
          
          {/* Error Message */}
          {showComparisonError && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 text-center">
              Cannot select multiple classifications when comparing different IIP categories. Please select only one classification for comparisons.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
