import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { useExchangeRateData } from '@/hooks/useExchangeRateData';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { format } from 'date-fns';

interface ExchangeRateChartProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
}

// Currency colors for better visualization
const currencyColors = {
  USD: '#3b82f6',  // Blue
  EUR: '#10b981',  // Green
  GBP: '#f59e0b',  // Orange
  JPY: '#ef4444'   // Red
};

export const ExchangeRateChart = ({ timeframe, setTimeframe }: ExchangeRateChartProps) => {
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['USD']);
  const [showEvents, setShowEvents] = useState(true);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(['high', 'medium', 'low']);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [clickedEvent, setClickedEvent] = useState<any | null>(null);

  // Calculate date range based on timeframe
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate = new Date(1998, 11, 1); // Dec 1998 - earliest EUR data
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

  // Fetch exchange rate data
  const { data: exchangeData, loading } = useExchangeRateData({
    currencies: selectedCurrencies,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  // Fetch events
  const { data: eventsData, loading: eventsLoading } = useIndicatorEvents({
    indicatorSlug: 'inr_exchange_rate',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!exchangeData.length) return [];
    
    // Group data by date
    const dataByDate = new Map();
    
    exchangeData.forEach(item => {
      const dateKey = item.period_date;
      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, { date: dateKey });
      }
      
      const entry = dataByDate.get(dateKey);
      entry[item.currency] = item.value;
    });
    
    return Array.from(dataByDate.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exchangeData]);

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
    if (!chartData.length || selectedCurrencies.length === 0) return 0;
    
    const primaryCurrency = selectedCurrencies[0];
    
    // First try to find exact date match
    const exactMatch = chartData.find(item => item.date === eventDate);
    if (exactMatch && typeof exactMatch[primaryCurrency] === 'number') {
      return exactMatch[primaryCurrency];
    }
    
    // If no exact match, find closest date (same month/year)
    const eventDateObj = new Date(eventDate);
    const eventYear = eventDateObj.getFullYear();
    const eventMonth = eventDateObj.getMonth();
    
    const closestMatch = chartData.find(item => {
      const itemDate = new Date(item.date);
      return itemDate.getFullYear() === eventYear && itemDate.getMonth() === eventMonth;
    });
    
    if (closestMatch && typeof closestMatch[primaryCurrency] === 'number') {
      return closestMatch[primaryCurrency];
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
    
    if (closestItem && typeof closestItem[primaryCurrency] === 'number') {
      return closestItem[primaryCurrency];
    }
    
    // Final fallback: return middle of Y-axis range
    const allValues = chartData.flatMap(item => 
      selectedCurrencies.map(currency => item[currency]).filter(val => typeof val === 'number')
    );
    if (allValues.length > 0) {
      const min = Math.min(...allValues);
      const max = Math.max(...allValues);
      return (min + max) / 2;
    }
    
    return 0;
  };

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
  const formatTooltip = (value: any, name: string) => {
    const formattedValue = typeof value === 'number' ? value.toFixed(4) : value;
    return [`₹${formattedValue}`, name];
  };

  const customTooltipLabel = (label: string) => {
    const date = new Date(label);
    return format(date, 'MMM yyyy');
  };

  // Toggle currency selection
  const toggleCurrency = (currency: string) => {
    setSelectedCurrencies(prev => 
      prev.includes(currency) 
        ? prev.filter(c => c !== currency)
        : [...prev, currency]
    );
  };

  // Toggle impact filter
  const toggleImpact = (impact: string) => {
    setSelectedImpacts(prev => 
      prev.includes(impact) 
        ? prev.filter(i => i !== impact)
        : [...prev, impact]
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

  return (
    <Card>
      <CardHeader>
        {/* Single Row: Title + Events Toggle + Year Filter */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            INR Exchange Rate
          </CardTitle>
          
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
          INR exchange rate trends with major economic events highlighted
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading exchange rate data...</div>
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
                  label={{ value: 'INR per Unit', angle: -90, position: 'insideLeft' }}
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
                
                {/* Dynamic Lines for Selected Currencies */}
                {selectedCurrencies.map((currency) => (
                  <Line 
                    key={currency}
                    type="monotone" 
                    dataKey={currency}
                    stroke={currencyColors[currency as keyof typeof currencyColors]}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name={currency}
                  />
                ))}
                
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
        
        {/* Event Legend */}
        {showEvents && processedEvents.length > 0 && (
          <div className="mt-2 flex items-center justify-end gap-4 text-xs">
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
        
        {/* Currency Selection */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-medium text-muted-foreground">Select Currencies:</h4>
            <div className="flex gap-2">
              {Object.entries(currencyColors).map(([currency, color]) => (
                <button
                  key={currency}
                  className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                    selectedCurrencies.includes(currency)
                      ? 'text-white border-transparent'
                      : 'bg-background text-foreground border-border hover:bg-accent'
                  }`}
                  style={selectedCurrencies.includes(currency) ? { backgroundColor: color } : {}}
                  onClick={() => toggleCurrency(currency)}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Event Click Popup */}
      {renderEventPopup()}
    </Card>
  );
};
