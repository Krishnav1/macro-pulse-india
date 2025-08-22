import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Mock data for CPI
const mockCpiData = [
  { date: '2024-01', inflation: 5.1 },
  { date: '2023-12', inflation: 5.7 },
  { date: '2023-11', inflation: 5.5 },
  { date: '2023-10', inflation: 4.9 },
  { date: '2023-09', inflation: 5.0 },
  { date: '2023-08', inflation: 6.8 },
  { date: '2023-07', inflation: 7.4 },
  { date: '2023-06', inflation: 4.8 },
  { date: '2023-05', inflation: 4.3 },
  { date: '2023-04', inflation: 4.7 },
];

const mockEvents = [
  { date: '2023-12', description: 'Food price surge due to supply disruptions', impact: 'high' },
  { date: '2023-08', description: 'Monsoon impact on vegetable prices', impact: 'medium' },
  { date: '2023-06', description: 'Base effect normalization', impact: 'low' },
];

interface CPIChartProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  geography: 'rural' | 'urban' | 'combined';
  setGeography: (geography: 'rural' | 'urban' | 'combined') => void;
}

export const CPIChart = ({ timeframe, setTimeframe, geography, setGeography }: CPIChartProps) => {
  const [comparisonScrollIndex, setComparisonScrollIndex] = useState(0);
  const [dataType, setDataType] = useState<'index' | 'inflation'>('inflation');

  const comparisonIndicators = [
    { id: 'wpi', name: 'WPI Inflation' },
    { id: 'core_cpi', name: 'Core CPI' },
    { id: 'food_cpi', name: 'Food CPI' },
    { id: 'fuel_cpi', name: 'Fuel CPI' },
    { id: 'housing_cpi', name: 'Housing CPI' },
    { id: 'transport_cpi', name: 'Transport CPI' }
  ];

  const getFilteredData = () => {
    const now = new Date();
    let startDate = new Date(0);
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
      default:
        break;
    }
    return mockCpiData.filter(d => new Date(d.date) >= startDate);
  };

  const scrollComparisons = (direction: 'left' | 'right') => {
    const maxIndex = Math.max(0, comparisonIndicators.length - 4);
    if (direction === 'left') {
      setComparisonScrollIndex(Math.max(0, comparisonScrollIndex - 1));
    } else {
      setComparisonScrollIndex(Math.min(maxIndex, comparisonScrollIndex + 1));
    }
  };

  const chartData = getFilteredData();
  const visibleComparisons = comparisonIndicators.slice(comparisonScrollIndex, comparisonScrollIndex + 4);

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
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                unit="%"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}%`, 'CPI Inflation']}
              />
              
              {/* Event markers */}
              {mockEvents.map((event, index) => (
                <ReferenceLine 
                  key={index}
                  x={event.date} 
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="2 2"
                  label={{ value: event.description.substring(0, 15) + "...", position: 'top' }}
                />
              ))}
              
              <Line 
                type="monotone" 
                dataKey="inflation"
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Geography and Compare Options */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            {/* Geography Toggle */}
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium text-muted-foreground">Geography:</h4>
              <div className="flex gap-2">
                <Button
                  variant={geography === 'rural' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGeography('rural')}
                >
                  Rural
                </Button>
                <Button
                  variant={geography === 'urban' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGeography('urban')}
                >
                  Urban
                </Button>
                <Button
                  variant={geography === 'combined' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setGeography('combined')}
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
          
          {/* Comparison Indicators */}
          <div className="flex gap-2 justify-end">
            {visibleComparisons.map((comparison) => (
              <Button
                key={comparison.id}
                variant="outline"
                size="sm"
                className="text-xs h-8"
              >
                {comparison.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
