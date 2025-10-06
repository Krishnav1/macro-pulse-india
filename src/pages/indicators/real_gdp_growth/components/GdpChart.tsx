import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';
import { useGdpData, DataType, PriceType, CurrencyType, ViewType } from '@/hooks/useGdpData';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { useUsdConversion } from '@/hooks/useUsdConversion';

interface GdpChartProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  dataType: DataType;
  setDataType: (dataType: DataType) => void;
  priceType: PriceType;
  setPriceType: (priceType: PriceType) => void;
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  viewType: ViewType;
  setViewType: (viewType: ViewType) => void;
  selectedFY: string | null;
  setSelectedFY: (fy: string | null) => void;
  selectedComponents: string[];
  setSelectedComponents: (components: string[]) => void;
}

export const GdpChart = ({
  timeframe,
  setTimeframe,
  dataType,
  setDataType,
  priceType,
  setPriceType,
  currency,
  setCurrency,
  viewType,
  setViewType,
  selectedFY, 
  setSelectedFY,
  selectedComponents,
  setSelectedComponents
}: GdpChartProps) => {
  const { data: gdpData, loading, availableFYs } = useGdpData(
    dataType,
    priceType,
    currency,
    viewType,
    selectedFY ? 'all' : timeframe,
    selectedFY
  );
  const { data: events } = useIndicatorEvents('real_gdp_growth');
  const { convertToUsd, getUnitLabel, getCurrencySymbol } = useUsdConversion();
  
  // State for event filtering
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(['high', 'medium', 'low']);

  // Define available components for selection
  const components = [
    { key: 'gdp', label: 'Total GDP', color: '#8884d8' },
    { key: 'pfce', label: 'PFCE (C)', color: '#22c55e' },
    { key: 'gfce', label: 'GFCE (G)', color: '#f59e0b' },
    { key: 'gfcf', label: 'GFCF (I)', color: '#3b82f6' },
    { key: 'exports', label: 'Exports (X)', color: '#ef4444' },
    { key: 'imports', label: 'Imports (M)', color: '#8b5cf6' },
    { key: 'valuables', label: 'Valuables', color: '#06b6d4' }
  ];

  // Process data for chart display
  const chartData = useMemo(() => {
    if (!gdpData?.length) return [];
    return gdpData.map(item => ({
      ...item,
      displayDate: viewType === 'quarterly' 
        ? (selectedFY ? item.quarter : `${item.year} ${item.quarter}`)
        : item.year,
      period: `${item.year}-${item.quarter}`
    }));
  }, [gdpData, selectedFY, viewType]);

  // Filter and process events for display
  const filteredEvents = useMemo(() => {
    if (!events?.length) return [];
    
    return events.filter(event => {
      // Filter by impact
      if (!selectedImpacts.includes(event.impact)) return false;
      
      if (timeframe === 'all') return true;
      
      const eventDate = new Date(event.date);
      const now = new Date();
      const yearsBack = timeframe === '1Y' ? 1 : timeframe === '5Y' ? 5 : timeframe === '10Y' ? 10 : 0;
      
      if (yearsBack > 0) {
        const cutoffDate = new Date(now.getFullYear() - yearsBack, now.getMonth(), now.getDate());
        return eventDate >= cutoffDate;
      }
      
      return true;
    });
  }, [events, timeframe, selectedImpacts]);

  // Function to get Y position for event markers on the trend line
  const getEventYPosition = (eventDate: string) => {
    if (!chartData.length) return 0;
    
    const eventDateObj = new Date(eventDate);
    
    // Try to find exact date match first
    let matchingDataPoint = chartData.find(item => {
      const itemDate = new Date(`${item.year}-${getQuarterEndMonth(item.quarter)}-01`);
      return Math.abs(itemDate.getTime() - eventDateObj.getTime()) < 24 * 60 * 60 * 1000; // Within 1 day
    });
    
    // If no exact match, find closest date
    if (!matchingDataPoint) {
      let closestDistance = Infinity;
      chartData.forEach(item => {
        const itemDate = new Date(`${item.year}-${getQuarterEndMonth(item.quarter)}-01`);
        const distance = Math.abs(itemDate.getTime() - eventDateObj.getTime());
        if (distance < closestDistance) {
          closestDistance = distance;
          matchingDataPoint = item;
        }
      });
    }
    
    // Return GDP value for the primary component (GDP total)
    return matchingDataPoint ? matchingDataPoint.gdp || 0 : 0;
  };

  // Helper function to get quarter end month
  const getQuarterEndMonth = (quarter: string) => {
    switch (quarter) {
      case 'Q1': return '06'; // April-June
      case 'Q2': return '09'; // July-September  
      case 'Q3': return '12'; // October-December
      case 'Q4': return '03'; // January-March
      default: return '06';
    }
  };

  // Helper function to get event quarter from date
  const getEventQuarter = (eventDate: string) => {
    const date = new Date(eventDate);
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    
    if (month >= 4 && month <= 6) return 'Q1';
    if (month >= 7 && month <= 9) return 'Q2';
    if (month >= 10 && month <= 12) return 'Q3';
    return 'Q4'; // Jan-Mar
  };

  // Helper function to get event display date for chart
  const getEventDisplayDate = (eventDate: string) => {
    const date = new Date(eventDate);
    const year = date.getFullYear();
    const quarter = getEventQuarter(eventDate);
    
    // Convert to financial year format
    const fyYear = quarter === 'Q4' ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
    
    return `${fyYear} ${quarter}`;
  };

  const formatValue = (value: number, dateForConversion?: string) => {
    if (dataType === 'growth') {
      return `${value.toFixed(1)}%`;
    }
    
    if (currency === 'usd' && dateForConversion) {
      const usdValue = convertToUsd(value, dateForConversion, 'trillion');
      return usdValue !== null ? `$${usdValue.toFixed(2)}T` : `$0.00`;
    }
    
    return `${getCurrencySymbol(currency)}${(value / 100000).toFixed(2)}T`;
  };

  // Format Y-axis values - convert to appropriate scale
  const formatYAxis = (value: number) => {
    if (dataType === 'growth') {
      return value.toFixed(0);
    }
    // Convert crores to trillions for display
    return (value / 100000).toFixed(1);
  };

  const toggleImpact = (impact: string) => {
    setSelectedImpacts(prev => 
      prev.includes(impact) 
        ? prev.filter(i => i !== impact)
        : [...prev, impact]
    );
  };

  const formatTooltip = (value: any, name: string) => {
    const formattedValue = typeof value === 'number' ? formatValue(value) : value;
    let label = name;
    
    if (name === 'gdp') label = 'Total GDP';
    else if (name === 'pfce') label = 'PFCE (Consumption)';
    else if (name === 'gfce') label = 'GFCE (Government)';
    else if (name === 'gfcf') label = 'GFCF (Investment)';
    else if (name === 'exports') label = 'Exports';
    else if (name === 'imports') label = 'Imports';
    else if (name === 'valuables') label = 'Valuables';
    
    return [formattedValue, label];
  };

  const toggleComponent = (componentKey: string) => {
    const newComponents = selectedComponents.includes(componentKey) 
      ? selectedComponents.filter(key => key !== componentKey)
      : [...selectedComponents, componentKey];
    setSelectedComponents(newComponents);
  };

  // Render lines for selected components only
  const renderLines = () => {
    const lines = [];
    
    // Show GDP line only if selected
    if (selectedComponents.includes('gdp')) {
      lines.push(
        <Line 
          key="gdp"
          type="monotone" 
          dataKey="gdp"
          stroke="#8884d8"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6 }}
          name="Total GDP"
        />
      );
    }
    
    // Add other selected component lines
    selectedComponents.forEach(componentKey => {
      if (componentKey === 'gdp') return; // Already handled above
      
      const component = components.find(c => c.key === componentKey);
      if (component) {
        lines.push(
          <Line 
            key={componentKey}
            type="monotone" 
            dataKey={componentKey}
            stroke={component.color}
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
            name={component.label}
          />
        );
      }
    });
    
    return lines;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-4">
          {/* Left: Title + Growth/Value + Price Type */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Real GDP Growth
            </div>
            
            {/* Growth/Value Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={dataType === 'growth' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDataType('growth')}
                className="h-8 px-3"
              >
                Growth
              </Button>
              <Button
                variant={dataType === 'value' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDataType('value')}
                className="h-8 px-3"
              >
                Value
              </Button>
            </div>

            {/* Price Type (no label) */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={priceType === 'constant' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPriceType('constant')}
                className="h-8 px-3"
              >
                Constant
              </Button>
              <Button
                variant={priceType === 'current' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPriceType('current')}
                className="h-8 px-3"
              >
                Current
              </Button>
            </div>
          </div>
          
          {/* Right: Timeline Options */}
          <div className="flex gap-2 items-center">
            <Button variant={timeframe === '1Y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('1Y')}>1Y</Button>
            <Button variant={timeframe === '5Y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('5Y')}>5Y</Button>
            <Button variant={timeframe === '10Y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('10Y')}>10Y</Button>
            <Button variant={timeframe === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('all')}>MAX</Button>
          </div>
        </CardTitle>

        {/* Row 2: FY Dropdown + Period Toggle + Currency + Event Filters */}
        <div className="flex justify-between items-center mt-3 flex-wrap gap-3">
          {/* Left: FY + Period + Currency */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* FY Dropdown */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedFY || 'all'}
                onChange={(e) => {
                  const newFY = e.target.value === 'all' ? null : e.target.value;
                  setSelectedFY(newFY);
                  // Auto-switch to quarterly when FY is selected
                  if (newFY) {
                    setViewType('quarterly');
                  }
                }}
                className="bg-background border border-input rounded-md px-2 py-1 text-sm h-8 min-w-[120px]"
              >
                <option value="all">All Years</option>
                {availableFYs?.map(fy => (
                  <option key={fy} value={fy}>FY {fy}</option>
                ))}
              </select>
            </div>

            {/* Period Toggle (no label) */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewType === 'annual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('annual')}
                className="h-8 px-3"
                disabled={!!selectedFY || priceType === 'current'}
              >
                Annual
              </Button>
              <Button
                variant={viewType === 'quarterly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('quarterly')}
                className="h-8 px-3"
                disabled={priceType === 'current'}
              >
                Quarterly
              </Button>
            </div>

            {/* Currency Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={currency === 'inr' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrency('inr')}
                className="h-8 px-3"
              >
                INR
              </Button>
              <Button
                variant={currency === 'usd' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrency('usd')}
                className="h-8 px-3"
              >
                USD
              </Button>
            </div>
          </div>

          {/* Right: Event Filters */}
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-sm text-muted-foreground">Show Events:</span>
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
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80 relative">
          {/* Corner Data Note */}
          <div className="absolute top-2 left-2 z-10 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded border">
            {dataType === 'growth' 
              ? 'Growth Rate (%)' 
              : `Data in ${currency === 'inr' ? '₹ Trillion' : '$ Trillion'}`
            }
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading GDP data...</div>
            </div>
          ) : (
            // Always show line chart - for both FY selection and all years
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
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
                  tickFormatter={formatYAxis}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={formatTooltip}
                />
                
                {renderLines()}
                
                {/* Event Markers */}
                {filteredEvents.map((event, index) => {
                  const eventDisplayDate = selectedFY 
                    ? getEventQuarter(event.date)
                    : getEventDisplayDate(event.date);
                  
                  const eventColor = event.impact === 'high' ? '#ef4444' : 
                                   event.impact === 'medium' ? '#f59e0b' : '#22c55e';
                  
                  return (
                    <ReferenceDot
                      key={`event-${event.id || index}`}
                      x={eventDisplayDate}
                      y={getEventYPosition(event.date)}
                      r={5}
                      fill={eventColor}
                      stroke="#ffffff"
                      strokeWidth={2}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        {/* Component Selection */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-3 flex-wrap">
            <h4 className="text-sm font-medium text-muted-foreground">Components:</h4>
            <div className="flex gap-2 flex-wrap">
              {components.map((component) => (
                <Button
                  key={component.key}
                  variant={selectedComponents.includes(component.key) ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => toggleComponent(component.key)}
                  style={selectedComponents.includes(component.key) ? { 
                    backgroundColor: component.color, 
                    borderColor: component.color 
                  } : {}}
                >
                  {component.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* GDP Formula and Full Forms - moved here */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GDP Formula */}
            <div className="p-3 bg-muted/50 rounded-lg border">
              <h4 className="text-sm font-medium mb-2">GDP Formula</h4>
              <div className="text-xs text-muted-foreground">
                GDP = C + G + I + ΔS + (X - M) + Discrepancies
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                C: Consumption, G: Government, I: Investment, ΔS: Stock Changes, X: Exports, M: Imports
              </div>
            </div>

            {/* Full Forms */}
            <div className="p-3 bg-muted/50 rounded-lg border">
              <h4 className="text-sm font-medium mb-2">Component Full Forms</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>PFCE: Private Final Consumption Expenditure</div>
                <div>GFCE: Government Final Consumption Expenditure</div>
                <div>GFCF: Gross Fixed Capital Formation</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
