import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { useIipSeries } from '@/hooks/useIipSeries';
import { useIipComponents } from '@/hooks/useIipComponents';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
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

  // Define component mappings for each classification
  const sectoralComponents = [
    { id: 'mining', name: 'Mining', code: 'mining' },
    { id: 'manufacturing', name: 'Manufacturing', code: 'manufacturing' },
    { id: 'electricity', name: 'Electricity', code: 'electricity' }
  ];
  
  const useBasedComponents = [
    { id: 'primary_goods', name: 'Primary Goods', code: 'primary_goods' },
    { id: 'capital_goods', name: 'Capital Goods', code: 'capital_goods' },
    { id: 'intermediate_goods', name: 'Intermediate Goods', code: 'intermediate_goods' },
    { id: 'infrastructure_construction', name: 'Infrastructure/Construction', code: 'infrastructure_construction' },
    { id: 'consumer_durables', name: 'Consumer Durables', code: 'consumer_durables' },
    { id: 'consumer_non_durables', name: 'Consumer Non-Durables', code: 'consumer_non_durables' }
  ];
  
  const comparisonIndicators = compareWith === 'sectoral' ? sectoralComponents : 
                              compareWith === 'use_based' ? useBasedComponents : [];

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
  
  // Fetch component data for comparisons
  const { data: componentData, loading: componentLoading } = useIipComponents({
    classification: compareWith === 'none' ? undefined : compareWith,
    startDate: dateRange.startDate
  });

  // Fetch events data
  const { data: eventsData, loading: eventsLoading } = useIndicatorEvents({
    indicatorSlug: 'iip',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!iipData?.length) return [];
    
    // Start with main IIP series data
    const seriesData = iipData.map(item => ({
      date: item.date,
      iip: dataType === 'index' ? item.index_value : (item.growth_yoy || 0)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // If no comparisons selected or compareWith is 'none', return series data only
    if (compareWith === 'none' || selectedComparisons.length === 0) {
      return seriesData;
    }
    
    // Add component data for selected comparisons
    if (componentData?.length) {
      const componentsByDate = new Map();
      
      componentData.forEach(comp => {
        if (!componentsByDate.has(comp.date)) {
          componentsByDate.set(comp.date, {});
        }
        const value = dataType === 'index' ? comp.index_value : comp.growth_yoy;
        if (value !== null) {
          componentsByDate.get(comp.date)[comp.component_code] = value;
        }
      });
      
      return seriesData.map(item => {
        const componentValues = componentsByDate.get(item.date) || {};
        const result = { ...item };
        
        selectedComparisons.forEach(compId => {
          const component = comparisonIndicators.find(c => c.id === compId);
          if (component && componentValues[component.code] !== undefined) {
            result[compId] = componentValues[component.code];
          }
        });
        
        return result;
      });
    }
    
    return seriesData;
  }, [iipData, componentData, dataType, compareWith, selectedComparisons, comparisonIndicators]);

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

  // Function to get Y position for event markers on the trend line
  const getEventYPosition = (eventDate: string) => {
    if (!chartData.length) return 0;
    
    // Try to find exact date match first
    const exactMatch = chartData.find(item => item.date === eventDate);
    if (exactMatch) {
      return exactMatch.iip;
    }
    
    // Try to find same month/year
    const eventDateObj = new Date(eventDate);
    const sameMonthYear = chartData.find(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === eventDateObj.getFullYear() && 
             itemDate.getMonth() === eventDateObj.getMonth();
    });
    if (sameMonthYear) {
      return sameMonthYear.iip;
    }
    
    // Find closest date
    const eventTime = eventDateObj.getTime();
    let closestItem = chartData[0];
    let minDiff = Math.abs(new Date(closestItem.date).getTime() - eventTime);
    
    for (const item of chartData) {
      const diff = Math.abs(new Date(item.date).getTime() - eventTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestItem = item;
      }
    }
    
    return closestItem.iip;
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
        {/* Data Type Toggle - Moved below year filters */}
        <div className="flex justify-center gap-2 mb-6">
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
          {(loading || componentLoading || eventsLoading) ? (
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
                  name="General Index"
                />
                
                {/* Render lines for selected comparisons */}
                {selectedComparisons.map((compId, index) => {
                  const component = comparisonIndicators.find(c => c.id === compId);
                  const colors = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];
                  return (
                    <Line
                      key={compId}
                      type="monotone"
                      dataKey={compId}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                      name={component?.name || compId}
                    />
                  );
                })}

                {/* Event Markers */}
                {eventsData?.map((event, index) => (
                  <ReferenceDot
                    key={`event-${event.id || index}`}
                    x={event.date}
                    y={getEventYPosition(event.date)}
                    r={6}
                    fill={event.impact === 'high' ? '#ef4444' : event.impact === 'medium' ? '#f59e0b' : '#10b981'}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        

        {/* Base Year Note */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Data is based on Base: 2011-12 = 100
        </div>
        
        {/* Classification and Compare Options - Reorganized */}
        <div className="mt-6 pt-4 border-t space-y-4">
          {/* Classification and Compare in same row */}
          <div className="flex items-center justify-between">
            {/* Classification Toggle - Left side */}
            <div className="flex items-center gap-3">
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

            {/* Compare With Options - Right side */}
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
