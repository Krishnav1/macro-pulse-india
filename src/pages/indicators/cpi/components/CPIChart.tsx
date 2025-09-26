import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { useCpiSeries } from '@/hooks/useCpiSeries';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
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
  const [showEvents, setShowEvents] = useState(true);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(['high', 'medium', 'low']);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [clickedEvent, setClickedEvent] = useState<any | null>(null);

  const comparisonIndicators = [
    { id: 'cfpi', name: 'Consumer Food Price Index' },
    { id: 'A.1', name: 'Food and beverages' },
    { id: 'A.2', name: 'Pan, tobacco and intoxicants' },
    { id: 'A.3', name: 'Clothing and footwear' },
    { id: 'A.4', name: 'Housing' },
    { id: 'A.5', name: 'Fuel and light' },
    { id: 'A.6', name: 'Miscellaneous' }
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

  const { data: ruralData, loading: ruralLoading } = useCpiSeries({
    ...(fetchQueries.find(q => q.geography === 'rural') || { geography: 'rural', seriesCodes: [], startDate: '', endDate: '' }),
    enabled: geography.includes('rural')
  });
  const { data: urbanData, loading: urbanLoading } = useCpiSeries({
    ...(fetchQueries.find(q => q.geography === 'urban') || { geography: 'urban', seriesCodes: [], startDate: '', endDate: '' }),
    enabled: geography.includes('urban')
  });
  const { data: combinedData, loading: combinedLoading } = useCpiSeries({
    ...(fetchQueries.find(q => q.geography === 'combined') || { geography: 'combined', seriesCodes: [], startDate: '', endDate: '' }),
    enabled: geography.includes('combined')
  });

  // Fetch CPI events for the current timeframe
  const { data: eventsData, loading: eventsLoading } = useIndicatorEvents({
    indicatorSlug: 'cpi_inflation',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

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

  // Process events for display
  const processedEvents = useMemo(() => {
    if (!eventsData || !showEvents) return [];
    
    return eventsData
      .filter(event => selectedImpacts.includes(event.impact))
      .map(event => ({
        ...event,
        displayDate: event.date,
        color: event.impact === 'high' ? '#ef4444' : 
               event.impact === 'medium' ? '#f59e0b' : '#22c55e',
        icon: event.impact === 'high' ? AlertCircle : 
              event.impact === 'medium' ? TrendingUp : Zap
      }));
  }, [eventsData, showEvents, selectedImpacts]);

  // Get Y position for event markers on the trend line
  const getEventYPosition = (eventDate: string) => {
    if (!chartData.length) return 0;
    
    // Get available geography keys from chart data
    const availableKeys = chartData.length > 0 ? Object.keys(chartData[0]).filter(key => key !== 'date') : [];
    const primaryKey = availableKeys.find(key => key.includes('combined')) || 
                      availableKeys.find(key => key.includes('cpi')) || 
                      availableKeys[0];
    
    if (!primaryKey) return 0;
    
    // First try to find exact date match
    const exactMatch = chartData.find(item => item.date === eventDate);
    if (exactMatch && typeof exactMatch[primaryKey] === 'number' && !isNaN(exactMatch[primaryKey])) {
      return exactMatch[primaryKey];
    }
    
    // If no exact match, find closest date (same month/year)
    const eventDateObj = new Date(eventDate);
    const eventYear = eventDateObj.getFullYear();
    const eventMonth = eventDateObj.getMonth();
    
    const closestMatch = chartData.find(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === eventYear && itemDate.getMonth() === eventMonth;
    });
    
    if (closestMatch && typeof closestMatch[primaryKey] === 'number' && !isNaN(closestMatch[primaryKey])) {
      return closestMatch[primaryKey];
    }
    
    // If still no match, find the closest date overall
    const eventTime = eventDateObj.getTime();
    let closestItem = chartData[0];
    let minDiff = Math.abs(new Date(chartData[0].date).getTime() - eventTime);
    
    for (const item of chartData) {
      const diff = Math.abs(new Date(item.date).getTime() - eventTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestItem = item;
      }
    }
    
    if (closestItem && typeof closestItem[primaryKey] === 'number' && !isNaN(closestItem[primaryKey])) {
      return closestItem[primaryKey];
    }
    
    // Final fallback: return middle of Y-axis range
    const allValues = chartData.flatMap(item => 
      Object.keys(item)
        .filter(key => key !== 'date')
        .map(key => item[key])
        .filter(val => typeof val === 'number' && !isNaN(val))
    );
    if (allValues.length > 0) {
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      return (min + max) / 2;
    }
    
    return 0;
  };

  // Calculate Y-axis domain for better scaling
  const yAxisDomain = useMemo(() => {
    if (!chartData.length) return ['auto', 'auto'];
    
    const allValues = chartData.flatMap(item => 
      Object.keys(item)
        .filter(key => key !== 'date')
        .map(key => item[key])
        .filter(val => typeof val === 'number' && !isNaN(val))
    );
    
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

  // Toggle impact filter
  const toggleImpact = (impact: string) => {
    setSelectedImpacts(prev => 
      prev.includes(impact) 
        ? prev.filter(i => i !== impact)
        : [...prev, impact]
    );
  };

  // Custom event tooltip
  const renderEventTooltip = (event: any) => {
    if (!hoveredEvent || hoveredEvent !== event.id) return null;
    
    return (
      <div className="absolute z-50 p-3 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: event.color }}
          />
          <span className="text-xs font-medium text-gray-500 uppercase">
            {event.impact} Impact
          </span>
        </div>
        <h4 className="font-medium text-sm mb-1">{event.title}</h4>
        <p className="text-xs text-gray-600 mb-2">
          {format(new Date(event.date), 'MMM dd, yyyy')}
        </p>
        <p className="text-xs text-gray-500">Click for details</p>
      </div>
    );
  };

  // Event click popup
  const renderEventPopup = () => {
    if (!clickedEvent) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: clickedEvent.color }}
              />
              <span className="text-sm font-medium text-gray-500 uppercase">
                {clickedEvent.impact} Impact Event
              </span>
            </div>
            <button
              onClick={() => setClickedEvent(null)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">{clickedEvent.title}</h3>
          
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <span>{format(new Date(clickedEvent.date), 'MMM dd, yyyy')}</span>
            {clickedEvent.tag && (
              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                {clickedEvent.tag}
              </span>
            )}
          </div>
          
          {clickedEvent.description && (
            <p className="text-gray-700 mb-4">{clickedEvent.description}</p>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={() => setClickedEvent(null)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
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
        
        {/* Data Type and Events Toggle */}
        <div className="flex gap-2 mt-2 flex-wrap">
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                dataType === 'index' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background text-foreground border-border hover:bg-accent'
              }`}
              onClick={() => setDataType('index')}
            >
              Index
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                dataType === 'inflation' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background text-foreground border-border hover:bg-accent'
              }`}
              onClick={() => setDataType('inflation')}
            >
              Inflation Rate
            </button>
          </div>
          
          {/* Events Toggle */}
          <div className="flex gap-2 items-center">
            <button
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                showEvents 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-background text-foreground border-border hover:bg-accent'
              }`}
              onClick={() => setShowEvents(!showEvents)}
            >
              📅 Events
            </button>
            
            {/* Impact Filters */}
            {showEvents && (
              <div className="flex gap-1">
                {[{ key: 'high', label: 'High', color: '#ef4444' }, 
                  { key: 'medium', label: 'Med', color: '#f59e0b' }, 
                  { key: 'low', label: 'Low', color: '#22c55e' }].map(impact => (
                  <button
                    key={impact.key}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      selectedImpacts.includes(impact.key)
                        ? 'text-white border-transparent'
                        : 'bg-background text-foreground border-border hover:bg-accent'
                    }`}
                    style={selectedImpacts.includes(impact.key) ? { backgroundColor: impact.color } : {}}
                    onClick={() => toggleImpact(impact.key)}
                  >
                    {impact.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
                
                {/* Dynamic Lines for Geography and Comparisons */}
                {renderLines()}
                
                {/* Event Markers */}
                {showEvents && processedEvents.map((event) => (
                  <ReferenceDot
                    key={event.id}
                    x={event.displayDate}
                    y={getEventYPosition(event.date)}
                    r={4}
                    fill={event.color}
                    stroke="white"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredEvent(event.id)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    onClick={() => setClickedEvent(event)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Event Tooltip */}
        {hoveredEvent && processedEvents.find(e => e.id === hoveredEvent) && 
          renderEventTooltip(processedEvents.find(e => e.id === hoveredEvent))
        }
        
        {/* Base Year Note and Event Legend */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Data is based on Base: 2012 = 100
          </div>
          {showEvents && processedEvents.length > 0 && (
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">Events:</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Low</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Geography and Compare Options */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            {/* Geography Toggle - Multi-select */}
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium text-muted-foreground">Geography:</h4>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                    geography.includes('rural')
                      ? 'text-white border-transparent'
                      : 'bg-background text-foreground border-border hover:bg-accent'
                  }`}
                  style={geography.includes('rural') ? { backgroundColor: geoColors.rural } : {}}
                  onClick={() => toggleGeography('rural')}
                >
                  Rural
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                    geography.includes('urban')
                      ? 'text-white border-transparent'
                      : 'bg-background text-foreground border-border hover:bg-accent'
                  }`}
                  style={geography.includes('urban') ? { backgroundColor: geoColors.urban } : {}}
                  onClick={() => toggleGeography('urban')}
                >
                  Urban
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                    geography.includes('combined')
                      ? 'text-white border-transparent'
                      : 'bg-background text-foreground border-border hover:bg-accent'
                  }`}
                  style={geography.includes('combined') ? { backgroundColor: geoColors.combined } : {}}
                  onClick={() => toggleGeography('combined')}
                >
                  Combined
                </button>
              </div>
            </div>

            {/* Compare With Options */}
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium text-muted-foreground">Compare with:</h4>
              <div className="flex gap-1">
                <button
                  className="h-7 w-7 p-0 rounded border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={() => scrollComparisons('left')}
                  disabled={comparisonScrollIndex === 0}
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button
                  className="h-7 w-7 p-0 rounded border border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={() => scrollComparisons('right')}
                  disabled={comparisonScrollIndex >= comparisonIndicators.length - 4}
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Comparison Indicators - Clickable */}
          <div className="flex gap-2 justify-end flex-wrap">
            {visibleComparisons.map((comparison) => (
              <button
                key={comparison.id}
                className={`px-3 py-1 text-xs h-8 rounded-md border transition-colors ${
                  selectedComparisons.includes(comparison.id)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:bg-accent'
                }`}
                onClick={() => toggleComparison(comparison.id)}
              >
                {comparison.name}
              </button>
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
      
      {/* Event Click Popup */}
      {renderEventPopup()}
    </Card>
  );
};
