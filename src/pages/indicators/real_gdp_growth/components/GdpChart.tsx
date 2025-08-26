import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGdpData, DataType, PriceType, CurrencyType } from '@/hooks/useGdpData';

interface GdpChartProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  dataType: DataType;
  setDataType: (type: DataType) => void;
  priceType: PriceType;
  setPriceType: (type: PriceType) => void;
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
  selectedFY: string | null;
  setSelectedFY: (fy: string | null) => void;
  selectedComponents: string[];
  setSelectedComponents: (components: string[]) => void;
}

const timeframeOptions = [
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
  { value: '10Y', label: '10Y' },
  { value: 'all', label: 'All' }
];

const components = [
  { key: 'gdp', label: 'Total GDP', color: '#8884d8' },
  { key: 'pfce', label: 'PFCE (Consumption)', color: '#22c55e' },
  { key: 'gfce', label: 'GFCE (Government)', color: '#f59e0b' },
  { key: 'gfcf', label: 'GFCF (Investment)', color: '#3b82f6' },
  { key: 'exports', label: 'Exports', color: '#ef4444' },
  { key: 'imports', label: 'Imports', color: '#8b5cf6' },
  { key: 'valuables', label: 'Valuables', color: '#06b6d4' }
];

export const GdpChart = ({ 
  timeframe, 
  setTimeframe, 
  dataType,
  setDataType,
  priceType,
  setPriceType,
  currency, 
  setCurrency, 
  selectedFY, 
  setSelectedFY,
  selectedComponents,
  setSelectedComponents
}: GdpChartProps) => {
  const { data: gdpData, availableFYs, loading } = useGdpData(dataType, priceType, currency, timeframe, selectedFY);

  // Process data for chart display
  const chartData = useMemo(() => {
    if (!gdpData?.length) return [];
    
    return gdpData.map(item => {
      const processed: any = {
        ...item,
        displayDate: selectedFY 
          ? item.quarter
          : `${item.year} ${item.quarter}`,
        period: `${item.year}-${item.quarter}`
      };

      // Add component values with proper field names
      const suffix = `_${priceType}_price${dataType === 'growth' ? '_growth' : ''}`;
      processed.gdp = item[`gdp${suffix}`];
      processed.pfce = item[`pfce${suffix}`];
      processed.gfce = item[`gfce${suffix}`];
      processed.gfcf = item[`gfcf${suffix}`];
      processed.exports = item[`exports${suffix}`];
      processed.imports = item[`imports${suffix}`];
      processed.valuables = item[`valuables${suffix}`];
      processed.changes_in_stocks = item[`changes_in_stocks${suffix}`];
      processed.discrepancies = item[`discrepancies${suffix}`];

      return processed;
    });
  }, [gdpData, selectedFY, dataType, priceType]);

  const formatValue = (value: number) => {
    if (dataType === 'growth') {
      return `${value.toFixed(1)}%`;
    }
    
    if (currency === 'usd') {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else {
      return `₹${(value / 10000000).toFixed(1)}L Cr`;
    }
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Real GDP {dataType === 'growth' ? 'Growth' : 'Value'}
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
        </CardTitle>

        {/* Control Toggles */}
        <div className="flex flex-wrap gap-4 mt-2">
          {/* Price Type Toggle */}
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

          {/* Timeline Options (only when no FY selected) */}
          {!selectedFY && (
            <div className="flex gap-2">
              {timeframeOptions.map(option => (
                <Button
                  key={option.value}
                  variant={timeframe === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading GDP data...</div>
            </div>
          ) : selectedFY && pieChartData.length > 0 ? (
            // Show pie chart for FY selection
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
                  ))}
                </Pie>
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
