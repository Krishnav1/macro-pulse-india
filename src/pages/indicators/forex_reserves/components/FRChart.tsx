import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForexReserves } from '@/hooks/useForexReserves';
import { format } from 'date-fns';

interface FRChartProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  unit: 'usd' | 'inr';
  setUnit: (unit: 'usd' | 'inr') => void;
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
  { key: 'foreign_currency_assets', label: 'Foreign Currency Assets', color: '#22c55e' },
  { key: 'gold', label: 'Gold', color: '#f59e0b' },
  { key: 'sdrs', label: 'SDRs', color: '#3b82f6' },
  { key: 'reserve_position_imf', label: 'IMF Position', color: '#ef4444' }
];

export const FRChart = ({ 
  timeframe, 
  setTimeframe, 
  unit, 
  setUnit, 
  selectedFY, 
  setSelectedFY,
  selectedComponents,
  setSelectedComponents
}: FRChartProps) => {
  const [componentScrollIndex, setComponentScrollIndex] = useState(0);
  
  const { data: forexData, availableFYs, loading } = useForexReserves(unit, timeframe, selectedFY);

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
      const suffix = unit === 'usd' ? 'mn' : 'crore';
      processed.total_reserves = item[`total_reserves_${unit}_${suffix}`];
      processed.foreign_currency_assets = item[`foreign_currency_assets_${unit}_${suffix}`];
      processed.gold = item[`gold_${unit}_${suffix}`];
      processed.sdrs = item[`sdrs_${unit}_${suffix}`];
      processed.reserve_position_imf = item[`reserve_position_imf_${unit}_${suffix}`];

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

  const formatTooltip = (value: any, name: string) => {
    const formattedValue = typeof value === 'number' ? formatValue(value) : value;
    let label = name;
    
    if (name === 'total_reserves') label = 'Total Reserves';
    else if (name === 'foreign_currency_assets') label = 'Foreign Currency Assets';
    else if (name === 'gold') label = 'Gold';
    else if (name === 'sdrs') label = 'SDRs';
    else if (name === 'reserve_position_imf') label = 'IMF Position';
    
    return [formattedValue, label];
  };

  const customTooltipLabel = (label: string) => {
    if (selectedFY) return label;
    return label;
  };

  const scrollComponents = (direction: 'left' | 'right') => {
    const maxIndex = Math.max(0, components.length - 3);
    if (direction === 'left') {
      setComponentScrollIndex(Math.max(0, componentScrollIndex - 1));
    } else {
      setComponentScrollIndex(Math.min(maxIndex, componentScrollIndex + 1));
    }
  };

  const visibleComponents = components.slice(componentScrollIndex, componentScrollIndex + 3);

  const toggleComponent = (componentKey: string) => {
    const newComponents = selectedComponents.includes(componentKey) 
      ? selectedComponents.filter(key => key !== componentKey)
      : [...selectedComponents, componentKey];
    setSelectedComponents(newComponents);
  };

  // Render lines for total reserves and selected components
  const renderLines = () => {
    const lines = [];
    
    // Always show total reserves line
    lines.push(
      <Line 
        key="total_reserves"
        type="monotone" 
        dataKey="total_reserves"
        stroke="#8884d8"
        strokeWidth={3}
        dot={false}
        activeDot={{ r: 6 }}
        name="Total Reserves"
      />
    );
    
    // Add selected component lines
    selectedComponents.forEach(componentKey => {
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
              <Button
                variant={unit === 'usd' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUnit('usd')}
                className="h-8 px-3"
              >
                USD
              </Button>
              <Button
                variant={unit === 'inr' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUnit('inr')}
                className="h-8 px-3"
              >
                INR
              </Button>
            </div>
          </div>
        </CardTitle>

        {/* Timeline Options (only when no FY selected) */}
        {!selectedFY && (
          <div className="flex gap-2 mt-2">
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
      </CardHeader>

      <CardContent>
        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading forex reserves data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aggregatedData}>
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
                  labelFormatter={customTooltipLabel}
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
