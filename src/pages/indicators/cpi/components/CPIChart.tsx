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
  geography: ('rural' | 'urban' | 'combined')[];
  setGeography: (geography: ('rural' | 'urban' | 'combined')[]) => void;
}

export const CPIChart = ({ timeframe, setTimeframe, geography, setGeography }: CPIChartProps) => {
  const [comparisonScrollIndex, setComparisonScrollIndex] = useState(0);
  const [dataType, setDataType] = useState<'index' | 'inflation'>('inflation');
  const [selectedComparisons, setSelectedComparisons] = useState<string[]>([]);
  const [showComparisonError, setShowComparisonError] = useState(false);

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

  // Get all series codes for multi-geography fetch
  const allSeriesCodes = useMemo(() => {
    return ['headline', ...selectedComparisons];
  }, [selectedComparisons]);

  // Fetch CPI data for all selected geographies
  const fetchQueries = geography.map(geo => ({
    geography: geo,
    seriesCodes: allSeriesCodes,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  }));

  const { data: ruralData, loading: ruralLoading } = useCpiSeries(
    geography.includes('rural') ? fetchQueries.find(q => q.geography === 'rural') : { geography: 'rural', seriesCodes: [], startDate: '', endDate: '' }
  );
  const { data: urbanData, loading: urbanLoading } = useCpiSeries(
    geography.includes('urban') ? fetchQueries.find(q => q.geography === 'urban') : { geography: 'urban', seriesCodes: [], startDate: '', endDate: '' }
  );
  const { data: combinedData, loading: combinedLoading } = useCpiSeries(
    geography.includes('combined') ? fetchQueries.find(q => q.geography === 'combined') : { geography: 'combined', seriesCodes: [], startDate: '', endDate: '' }
  );

  const loading = ruralLoading || urbanLoading || combinedLoading;
  const cpiData = [...(ruralData || []), ...(urbanData || []), ...(combinedData || [])];

  // Transform data for chart with geography separation
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
      
      // Create keys with geography suffix for multi-geography display
      const keyPrefix = item.series_code === 'headline' ? 'cpi' : item.series_code;
      const geoKey = `${keyPrefix}_${item.geography}`;
      
      entry[geoKey] = value;
    });
    
    return Array.from(dataByDate.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [cpiData, dataType]);

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

  // Toggle comparison selection
  const toggleComparison = (comparisonId: string) => {
    if (geography.length > 1 && selectedComparisons.length === 0) {
      setShowComparisonError(true);
      setTimeout(() => setShowComparisonError(false), 3000);
      return;
    }
    
    setSelectedComparisons(prev => 
      prev.includes(comparisonId) 
        ? prev.filter(id => id !== comparisonId)
        : [...prev, comparisonId]
    );
  };

  // Toggle geography selection
  const toggleGeography = (geo: 'rural' | 'urban' | 'combined') => {
    if (selectedComparisons.length > 0 && geography.length === 1 && geography[0] !== geo) {
      setShowComparisonError(true);
      setTimeout(() => setShowComparisonError(false), 3000);
      return;
    }
    
    const newGeography = geography.includes(geo) 
      ? geography.filter(g => g !== geo)
      : [...geography, geo];
    setGeography(newGeography);
  };

  // Geography colors
  const geoColors = {
    rural: '#22c55e',    // Green
    urban: '#3b82f6',    // Blue  
    combined: '#f59e0b'  // Orange
  };

  // Render lines for each geography and series combination
  const renderLines = () => {
    const lines = [];
    
    // Main CPI lines for each geography
    geography.forEach((geo, geoIndex) => {
      lines.push(
        <Line 
          key={`cpi_${geo}`}
          type="monotone" 
          dataKey={`cpi_${geo}`}
          stroke={geoColors[geo]}
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6 }}
          name={`CPI ${geo.charAt(0).toUpperCase() + geo.slice(1)}`}
        />
      );
    });
    
    // Comparison lines for each selected comparison and geography
    selectedComparisons.forEach((comparison, compIndex) => {
      geography.forEach((geo, geoIndex) => {
        const color = geoColors[geo];
        const opacity = 0.7;
        lines.push(
          <Line 
            key={`${comparison}_${geo}`}
            type="monotone" 
            dataKey={`${comparison}_${geo}`}
            stroke={color}
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
            strokeOpacity={opacity}
            name={`${comparisonIndicators.find(c => c.id === comparison)?.name} ${geo.charAt(0).toUpperCase() + geo.slice(1)}`}
          />
        );
      });
    });
    
    return lines;
  };

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
                
                {/* Dynamic Lines for Geography and Comparisons */}
                {renderLines()}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Geography and Compare Options */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            {/* Geography Toggle - Multi-select */}
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium text-muted-foreground">Geography:</h4>
              <div className="flex gap-2">
                <Button
                  variant={geography.includes('rural') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleGeography('rural')}
                  style={geography.includes('rural') ? { backgroundColor: geoColors.rural, borderColor: geoColors.rural } : {}}
                >
                  Rural
                </Button>
                <Button
                  variant={geography.includes('urban') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleGeography('urban')}
                  style={geography.includes('urban') ? { backgroundColor: geoColors.urban, borderColor: geoColors.urban } : {}}
                >
                  Urban
                </Button>
                <Button
                  variant={geography.includes('combined') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleGeography('combined')}
                  style={geography.includes('combined') ? { backgroundColor: geoColors.combined, borderColor: geoColors.combined } : {}}
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
          
          {/* Comparison Indicators - Clickable */}
          <div className="flex gap-2 justify-end flex-wrap">
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
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              Cannot select multiple geographies when comparing different CPI categories. Please select only one geography for comparisons.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
