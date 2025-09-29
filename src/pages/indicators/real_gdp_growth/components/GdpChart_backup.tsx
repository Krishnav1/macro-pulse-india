import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, ReferenceDot } from 'recharts';
import { Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGdpData, DataType, PriceType, CurrencyType, ViewType } from '@/hooks/useGdpData';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';

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
    'inr', // Always use INR since we removed currency toggle
    viewType,
    selectedFY ? 'all' : timeframe,
    selectedFY
  );
  const { data: events } = useIndicatorEvents('real_gdp_growth');

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
    
    return gdpData.map(item => {
      const processed: any = {
        ...item,
        displayDate: viewType === 'quarterly' 
          ? (selectedFY ? item.quarter : `${item.year} ${item.quarter}`)
          : item.year,
        period: `${item.year}-${item.quarter}`
      };

      // Add component values with simplified field names
      processed.gdp = item.gdp;
      processed.pfce = item.pfce;
      processed.gfce = item.gfce;
      processed.gfcf = item.gfcf;
      processed.exports = item.exports;
      processed.imports = item.imports;
      processed.valuables = item.valuables;
      processed.changes_in_stocks = item.changes_in_stocks;
      processed.discrepancies = item.discrepancies;

      return processed;
    });
  }, [gdpData, selectedFY, dataType, priceType]);

  // Filter and process events for display
  const filteredEvents = useMemo(() => {
    if (!events?.length) return [];
    
    return events.filter(event => {
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
  }, [events, timeframe]);

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

  const formatValue = (value: number) => {
    if (dataType === 'growth') {
      return `${value.toFixed(1)}%`;
    }
    
    return `₹${(value / 1000000000000).toFixed(1)} Trillion`;
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

  // Prepare pie chart data for FY selection
  const pieChartData = useMemo(() => {
    if (!selectedFY || !chartData.length) return [];
    
    // Get the latest quarter data for the selected FY
    const latestData = chartData[chartData.length - 1];
    
    return [
      { name: 'PFCE', value: Math.abs(latestData.pfce || 0), color: '#22c55e' },
      { name: 'GFCE', value: Math.abs(latestData.gfce || 0), color: '#f59e0b' },
      { name: 'GFCF', value: Math.abs(latestData.gfcf || 0), color: '#3b82f6' },
      { name: 'Exports', value: Math.abs(latestData.exports || 0), color: '#ef4444' },
      { name: 'Imports', value: Math.abs(latestData.imports || 0), color: '#8b5cf6' },
      { name: 'Valuables', value: Math.abs(latestData.valuables || 0), color: '#06b6d4' }
    ].filter(item => item.value > 0);
  }, [selectedFY, chartData]);

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Real GDP Growth
            </div>
            
            {/* Growth/Value Toggle - moved to title area */}
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
          </div>
          
          {/* Timeline Options */}
          <div className="flex gap-2">
            <Button variant={timeframe === '1Y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('1Y')}>1Y</Button>
            <Button variant={timeframe === '5Y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('5Y')}>5Y</Button>
            <Button variant={timeframe === '10Y' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('10Y')}>10Y</Button>
            <Button variant={timeframe === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('all')}>MAX</Button>
            
            {/* Financial Year Dropdown - moved here */}
            <div className="flex items-center gap-2 ml-4">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedFY || 'all'}
                onChange={(e) => setSelectedFY(e.target.value === 'all' ? null : e.target.value)}
                className="bg-background border border-input rounded-md px-2 py-1 text-xs h-7 min-w-[100px]"
              >
                <option value="all">All Years</option>
                {availableFYs?.map(fy => (
                  <option key={fy} value={fy}>FY{fy}</option>
                ))}
        </CardTitle>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
                <Tooltip formatter={(value) => formatValue(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            // Show line chart for all other cases
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
                  tickFormatter={formatValue}
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
                  
                  return (
                    <ReferenceDot
                      key={`event-${event.id || index}`}
                      x={eventDisplayDate}
                      y={getEventYPosition(event.date)}
                      r={6}
                      fill="#ef4444"
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
      </CardContent>
    </Card>
  );
};
