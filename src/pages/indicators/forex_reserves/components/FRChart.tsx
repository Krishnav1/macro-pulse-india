import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot } from 'recharts';
import { Calendar, TrendingUp, ChevronLeft, ChevronRight, AlertCircle, Zap } from 'lucide-react';
import { useForexReserves } from '@/hooks/useForexReserves';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { format } from 'date-fns';

interface FRChartProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  unit: 'usd' | 'inr';
  setUnit: (unit: 'usd' | 'inr') => void;
  selectedFY: string | null;
  setSelectedFY: (fy: string | null) => void;
}

const timeframeOptions = [
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
  { value: '10Y', label: '10Y' },
  { value: 'all', label: 'All' }
];

const components = [
  { key: 'foreign_currency_assets', label: 'FCA', color: 'hsl(var(--chart-1))' },
  { key: 'gold', label: 'Gold', color: 'hsl(var(--chart-2))' },
  { key: 'sdrs', label: 'SDRs', color: 'hsl(var(--chart-3))' },
  { key: 'reserve_position_imf', label: 'IMF Position', color: 'hsl(var(--chart-4))' }
];

export const FRChart = ({ 
  timeframe, 
  setTimeframe, 
  unit, 
  setUnit, 
  selectedFY, 
  setSelectedFY,
}: FRChartProps) => {
  const [showEvents, setShowEvents] = useState(true);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(['high', 'medium', 'low']);
  const [hoveredEvent, setHoveredEvent] = useState<any | null>(null);
  const [clickedEvent, setClickedEvent] = useState<any | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['foreign_currency_assets', 'gold', 'sdrs', 'reserve_position_imf']);
  
  const { data: forexData, availableFYs, loading } = useForexReserves(unit, timeframe, selectedFY);
  
  // Calculate date range for events based on timeframe
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate = new Date(2000, 0, 1); // Default to all data
    switch (timeframe) {
      case '1Y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '5Y':
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        break;
      case '10Y':
        startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
        break;
    }
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }, [timeframe]);
  
  // Fetch events data
  const { data: eventsData } = useIndicatorEvents({
    indicatorSlug: 'foreign-exchange-reserves',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  // Process events for display
  const processedEvents = useMemo(() => {
    if (!eventsData || !showEvents) return [];
    
    return eventsData
      .filter(event => selectedImpacts.includes(event.impact || 'low'))
      .map(event => ({
        ...event,
        displayDate: selectedFY 
          ? format(new Date(event.date), 'MMM')
          : timeframe === 'all' || timeframe === '10Y' || timeframe === '5Y'
            ? format(new Date(event.date), 'yyyy')
            : format(new Date(event.date), 'MMM yy'),
        color: event.impact === 'high' ? '#dc2626' : 
               event.impact === 'medium' ? '#ea580c' : '#16a34a'
      }));
  }, [eventsData, showEvents, selectedImpacts, selectedFY, timeframe]);
  
  // Get Y position for event markers on the trend line
  const getEventYPosition = (eventDate: string) => {
    if (!chartData.length) return 0;
    
    // Use total_reserves as the primary value for positioning
    const primaryKey = 'total_reserves';
    
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
    
    // Fallback to middle of Y-axis range
    const values = chartData.map(item => item[primaryKey]).filter(val => typeof val === 'number' && !isNaN(val));
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      return (min + max) / 2;
    }
    
    return 0;
  };

  // Process data for chart display
  const chartData = useMemo(() => {
    if (!forexData?.length) return [];
    
    return forexData.map(item => {
      const processed: any = {
        ...item,
        date: item.week_ended,
        displayDate: selectedFY 
          ? format(new Date(item.week_ended), 'MMM')
          : timeframe === 'all' || timeframe === '10Y' || timeframe === '5Y'
            ? format(new Date(item.week_ended), 'yyyy')
            : format(new Date(item.week_ended), 'MMM yy')
      };

      // Add component values with proper field names
      const suffix = unit === 'usd' ? 'usd_mn' : 'inr_crore';
      processed.total_reserves = item[`total_reserves_${suffix}`];
      processed.foreign_currency_assets = item[`foreign_currency_assets_${suffix}`];
      processed.gold = item[`gold_${suffix}`];
      processed.sdrs = item[`sdrs_${suffix}`];
      processed.reserve_position_imf = item[`reserve_position_imf_${suffix}`];

      return processed;
    });
  }, [forexData, selectedFY, timeframe, unit]);

  // Aggregate data based on timeframe and FY
  const aggregatedData = useMemo(() => {
    if (!chartData.length) return [];

    if (selectedFY) {
      // For FY view, aggregate by month (sum weekly data within each month)
      const monthlyData = new Map();
      
      chartData.forEach(item => {
        const date = new Date(item.date);
        const monthKey = format(date, 'yyyy-MM');
        const displayMonth = format(date, 'MMM');
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            displayDate: displayMonth,
            date: monthKey,
            total_reserves: 0,
            foreign_currency_assets: 0,
            gold: 0,
            sdrs: 0,
            reserve_position_imf: 0,
            count: 0
          });
        }
        
        const monthData = monthlyData.get(monthKey);
        // Sum the values instead of averaging for FY view
        monthData.total_reserves += item.total_reserves || 0;
        monthData.foreign_currency_assets += item.foreign_currency_assets || 0;
        monthData.gold += item.gold || 0;
        monthData.sdrs += item.sdrs || 0;
        monthData.reserve_position_imf += item.reserve_position_imf || 0;
        monthData.count++;
      });
      
      // Use the sum values (representing total for the month)
      return Array.from(monthlyData.values()).sort((a, b) => a.date.localeCompare(b.date));
    }

    if (timeframe === 'all' || timeframe === '10Y' || timeframe === '5Y') {
      // For long timeframes, aggregate by year
      const yearlyData = new Map();
      
      chartData.forEach(item => {
        const date = new Date(item.date);
        const year = date.getFullYear().toString();
        
        if (!yearlyData.has(year)) {
          yearlyData.set(year, {
            displayDate: year,
            date: year,
            total_reserves: 0,
            foreign_currency_assets: 0,
            gold: 0,
            sdrs: 0,
            reserve_position_imf: 0,
            count: 0
          });
        }
        
        const yearData = yearlyData.get(year);
        yearData.total_reserves += item.total_reserves || 0;
        yearData.foreign_currency_assets += item.foreign_currency_assets || 0;
        yearData.gold += item.gold || 0;
        yearData.sdrs += item.sdrs || 0;
        yearData.reserve_position_imf += item.reserve_position_imf || 0;
        yearData.count++;
      });
      
      // Average the values
      return Array.from(yearlyData.values()).map(item => ({
        ...item,
        total_reserves: item.total_reserves / item.count,
        foreign_currency_assets: item.foreign_currency_assets / item.count,
        gold: item.gold / item.count,
        sdrs: item.sdrs / item.count,
        reserve_position_imf: item.reserve_position_imf / item.count
      })).sort((a, b) => a.date.localeCompare(b.date));
    }

    return chartData;
  }, [chartData, selectedFY, timeframe]);

  const formatValue = (value: number) => {
    if (unit === 'usd') {
      return `$${(value / 1000).toFixed(1)}B`;
    } else {
      return `₹${(value / 100000).toFixed(1)}L Cr`;
    }
  };

  const formatTooltip = (value: any, name: string, props: any) => {
    const { payload } = props;
    const total = payload.total_reserves;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    const formattedValue = typeof value === 'number' ? formatValue(value) : value;
    let label = name;

    const component = components.find(c => c.key === name);
    if (component) label = component.label;
    
    return [`${formattedValue} (${percentage}%)`, label];
  };

  const customTooltipLabel = (label: string) => {
    if (selectedFY) return label;
    return label;
  };

  // Custom tooltip that hides when hovering over events
  const CustomTooltip = ({ active, payload, label }: any) => {
    // Don't show tooltip if we're hovering over an event marker
    if (hoveredEvent) return null;
    
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const component = components.find(c => c.key === entry.dataKey);
            const formattedValue = typeof entry.value === 'number' ? formatValue(entry.value) : entry.value;
            const total = payload.find((p: any) => p.dataKey === 'total_reserves')?.value || 0;
            const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
            
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span>{component?.label || entry.dataKey}: {formattedValue} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Event tooltip for markers
  const EventTooltip = ({ event }: { event: any }) => {
    if (!event) return null;
    
    return (
      <div className="absolute z-50 bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: event.color }} />
          <span className="font-medium text-sm">{event.title}</span>
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          {new Date(event.date).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })}
        </div>
        {event.description && (
          <div className="text-sm">{event.description}</div>
        )}
        {event.tag && (
          <div className="mt-2">
            <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
              {event.tag}
            </span>
          </div>
        )}
      </div>
    );
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Foreign Exchange Reserves
          </div>
          
          <div className="flex items-center gap-3">
            {/* Financial Year Dropdown */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedFY || 'all'}
                onChange={(e) => setSelectedFY(e.target.value === 'all' ? null : e.target.value)}
                className="bg-background border border-input rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Years</option>
                {availableFYs?.map(fy => (
                  <option key={fy} value={fy}>FY{fy}</option>
                ))}
              </select>
            </div>
            
            {/* Unit Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setUnit('usd')}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 ${
                  unit === 'usd' 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setUnit('inr')}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 px-3 ${
                  unit === 'inr' 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                INR
              </button>
            </div>
          </div>
        </CardTitle>

        {/* Timeline Options (only when no FY selected) */}
        {!selectedFY && (
          <div className="flex gap-2 mt-2">
            {timeframeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value)}
                className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3 ${
                  timeframe === option.value
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading forex reserves data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={formatValue}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                />
                <Legend />
                {
                  compareMode ? (
                    // In compare mode, show selected components as lines instead of stacked areas
                    selectedComponents.map(compKey => {
                      const comp = components.find(c => c.key === compKey);
                      if (!comp) return null;
                      return (
                        <Area 
                          key={comp.key} 
                          type="monotone" 
                          dataKey={comp.key} 
                          stackId={undefined}
                          stroke={comp.color} 
                          fill="none"
                          strokeWidth={2}
                          name={comp.label} 
                        />
                      );
                    })
                  ) : (
                    // Normal mode - show all components as stacked areas
                    components.map(comp => (
                      <Area 
                        key={comp.key} 
                        type="monotone" 
                        dataKey={comp.key} 
                        stackId="1" 
                        stroke={comp.color} 
                        fill={comp.color} 
                        name={comp.label} 
                      />
                    ))
                  )
                }
                {/* Event Markers */}
                {processedEvents.map((event) => (
                  <ReferenceDot
                    key={event.id}
                    x={event.displayDate}
                    y={getEventYPosition(event.date)}
                    r={hoveredEvent?.id === event.id ? 6 : 4}
                    fill={event.color}
                    stroke="white"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredEvent(event)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    onClick={() => setClickedEvent(clickedEvent?.id === event.id ? null : event)}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Chart Controls */}
        <div className="mt-4 space-y-3">
          {/* Events Toggle */}
          {eventsData && eventsData.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showEvents}
                    onChange={(e) => setShowEvents(e.target.checked)}
                    className="rounded"
                  />
                  Show Events
                </label>
                
                {showEvents && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Impact:</span>
                    {['high', 'medium', 'low'].map(impact => (
                      <label key={impact} className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedImpacts.includes(impact)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedImpacts([...selectedImpacts, impact]);
                            } else {
                              setSelectedImpacts(selectedImpacts.filter(i => i !== impact));
                            }
                          }}
                          className="rounded"
                        />
                        <span className={`w-2 h-2 rounded-full ${
                          impact === 'high' ? 'bg-red-500' : 
                          impact === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                        }`} />
                        {impact}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {showEvents && processedEvents.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {processedEvents.length} event{processedEvents.length !== 1 ? 's' : ''} shown
                </div>
              )}
            </div>
          )}
          
          {/* Compare Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={compareMode}
                  onChange={(e) => setCompareMode(e.target.checked)}
                  className="rounded"
                />
                Compare Components
              </label>
              
              {compareMode && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Select:</span>
                  {components.map(comp => (
                    <label key={comp.key} className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedComponents.includes(comp.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedComponents([...selectedComponents, comp.key]);
                          } else {
                            setSelectedComponents(selectedComponents.filter(c => c !== comp.key));
                          }
                        }}
                        className="rounded"
                      />
                      <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: comp.color }} />
                      {comp.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {compareMode && (
              <div className="text-xs text-muted-foreground">
                {selectedComponents.length} component{selectedComponents.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </div>
        
        {/* Event Details Popup */}
        {(hoveredEvent || clickedEvent) && (
          <div className="relative">
            <EventTooltip event={hoveredEvent || clickedEvent} />
          </div>
        )}
        
      </CardContent>
      
      {/* Clicked Event Modal */}
      {clickedEvent && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setClickedEvent(null)}
        >
          <div 
            className="bg-card border border-border rounded-lg p-6 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: clickedEvent.color }} />
                <h3 className="font-semibold">{clickedEvent.title}</h3>
              </div>
              <button 
                onClick={() => setClickedEvent(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Date:</span>
                <div className="text-sm">
                  {new Date(clickedEvent.date).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
              
              {clickedEvent.description && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Description:</span>
                  <div className="text-sm mt-1">{clickedEvent.description}</div>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Impact:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: clickedEvent.color }} />
                    <span className="text-sm capitalize">{clickedEvent.impact}</span>
                  </div>
                </div>
                
                {clickedEvent.tag && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                    <div className="mt-1">
                      <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                        {clickedEvent.tag}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
