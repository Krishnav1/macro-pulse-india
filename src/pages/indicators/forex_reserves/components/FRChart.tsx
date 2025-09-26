import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={formatTooltip}
                  labelFormatter={customTooltipLabel}
                />
                <Legend />
                {
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
                }
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
};
