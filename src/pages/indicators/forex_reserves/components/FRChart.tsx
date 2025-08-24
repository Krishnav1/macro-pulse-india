import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { useForexReserves } from '@/hooks/useForexReserves';

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
  { key: 'foreign_currency_assets', label: 'Foreign Currency Assets', color: '#8884d8' },
  { key: 'gold', label: 'Gold', color: '#82ca9d' },
  { key: 'sdrs', label: 'SDRs', color: '#ffc658' },
  { key: 'reserve_position_imf', label: 'IMF Position', color: '#ff7300' }
];

export const FRChart = ({ 
  timeframe, 
  setTimeframe, 
  unit, 
  setUnit, 
  selectedFY, 
  setSelectedFY 
}: FRChartProps) => {
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [showAsPercentage, setShowAsPercentage] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'stacked'>('line');
  
  const { data: forexData, availableFYs, loading } = useForexReserves(unit, timeframe, selectedFY);

  const toggleComponent = (componentKey: string) => {
    setSelectedComponents(prev => {
      const newSelection = prev.includes(componentKey) 
        ? prev.filter(key => key !== componentKey)
        : [...prev, componentKey];
      
      // Auto-switch to stacked chart when components are selected
      if (newSelection.length > 0) {
        setChartType('stacked');
      } else {
        setChartType('line');
      }
      
      return newSelection;
    });
  };

  const formatValue = (value: number) => {
    if (unit === 'usd') {
      return `$${(value / 1000).toFixed(1)}B`;
    } else {
      return `₹${(value / 100000).toFixed(1)}L Cr`;
    }
  };

  const getUnitLabel = () => unit === 'usd' ? 'USD Million' : 'INR Crore';

  const processedData = forexData?.map(item => {
    const processed: any = {
      ...item,
      date: new Date(item.week_ended).toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit',
        year: selectedFY ? undefined : '2-digit'
      })
    };

    if (showAsPercentage && selectedComponents.length > 0) {
      const total = item[`total_reserves_${unit}_${unit === 'usd' ? 'mn' : 'crore'}`];
      components.forEach(comp => {
        const fieldName = `${comp.key}_${unit}_${unit === 'usd' ? 'mn' : 'crore'}`;
        processed[fieldName] = ((item[fieldName] / total) * 100);
      });
    }

    return processed;
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Foreign Exchange Reserves
            </CardTitle>
            
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

          {/* FY Slicer */}
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Financial Year:</span>
            <Button
              variant={selectedFY === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFY(null)}
            >
              All Years
            </Button>
            {availableFYs?.map(fy => (
              <Button
                key={fy}
                variant={selectedFY === fy ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFY(fy)}
              >
                FY{fy}
              </Button>
            ))}
          </div>

          {/* Timeframe Options (only when no FY selected) */}
          {!selectedFY && (
            <div className="flex gap-2 flex-wrap">
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

          {/* Component Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Components:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {components.map(comp => (
                <Badge
                  key={comp.key}
                  variant={selectedComponents.includes(comp.key) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => toggleComponent(comp.key)}
                  style={{
                    backgroundColor: selectedComponents.includes(comp.key) ? comp.color : undefined,
                    borderColor: comp.color
                  }}
                >
                  {comp.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Chart Options (only when components selected) */}
          {selectedComponents.length > 0 && (
            <div className="flex items-center gap-4">
              <Button
                variant={showAsPercentage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowAsPercentage(!showAsPercentage)}
                className="flex items-center gap-2"
              >
                <PieChart className="h-4 w-4" />
                % Share
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading chart data...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatValue}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatValue(value), `Total Reserves (${getUnitLabel()})`]}
                    labelStyle={{ color: '#000' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={`total_reserves_${unit}_${unit === 'usd' ? 'mn' : 'crore'}`}
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={processedData} stackOffset={showAsPercentage ? 'expand' : undefined}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={showAsPercentage ? (value) => `${value}%` : formatValue}
                    domain={showAsPercentage ? [0, 100] : undefined}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      const component = components.find(c => name.includes(c.key));
                      const label = component?.label || name;
                      return [
                        showAsPercentage ? `${value.toFixed(1)}%` : formatValue(value), 
                        label
                      ];
                    }}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  {selectedComponents.map(compKey => {
                    const component = components.find(c => c.key === compKey);
                    if (!component) return null;
                    
                    return (
                      <Area
                        key={compKey}
                        type="monotone"
                        dataKey={`${compKey}_${unit}_${unit === 'usd' ? 'mn' : 'crore'}`}
                        stackId="1"
                        stroke={component.color}
                        fill={component.color}
                        fillOpacity={0.7}
                      />
                    );
                  })}
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
