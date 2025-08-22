import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, BarChart3, PieChart, LineChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, ComposedChart, Line, Area, AreaChart } from 'recharts';
import { useCpiSeries } from '@/hooks/useCpiSeries';
import { format } from 'date-fns';

// Sample component breakdown data for analysis
const componentData = [
  { name: 'Food & Beverages', weight: 45.86, inflation: 2.1, contribution: 0.96 },
  { name: 'Housing', weight: 10.07, inflation: 3.2, contribution: 0.32 },
  { name: 'Fuel & Light', weight: 6.84, inflation: -2.1, contribution: -0.14 },
  { name: 'Clothing & Footwear', weight: 6.53, inflation: 1.8, contribution: 0.12 },
  { name: 'Transport & Communication', weight: 8.59, inflation: -0.8, contribution: -0.07 },
  { name: 'Recreation & Amusement', weight: 1.68, inflation: 4.2, contribution: 0.07 },
  { name: 'Education', weight: 4.46, inflation: 3.8, contribution: 0.17 },
  { name: 'Health', weight: 5.89, inflation: 2.9, contribution: 0.17 },
  { name: 'Personal Care', weight: 3.54, inflation: 1.5, contribution: 0.05 },
  { name: 'Miscellaneous', weight: 6.54, inflation: 2.7, contribution: 0.18 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

interface CPIInsightsProps {
  geography?: 'rural' | 'urban' | 'combined';
}

export const CPIInsights = ({ geography = 'combined' }: CPIInsightsProps) => {
  const [activeChart, setActiveChart] = useState<'overview' | 'components' | 'trends' | 'comparison'>('overview');
  
  // Fetch real CPI data for analysis
  const { data: cpiData, loading } = useCpiSeries({
    geography,
    seriesCodes: ['headline', 'core', 'food', 'fuel'],
    startDate: '2020-01-01',
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Process data for trend analysis
  const trendData = useMemo(() => {
    if (!cpiData?.length) return [];
    
    const dataByDate = new Map();
    cpiData.forEach(item => {
      const dateKey = item.date;
      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, { date: dateKey, month: format(new Date(dateKey), 'MMM yy') });
      }
      const entry = dataByDate.get(dateKey);
      entry[item.series_code] = item.inflation_yoy || 0;
    });
    
    return Array.from(dataByDate.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12); // Last 12 months
  }, [cpiData]);
  
  // Geography comparison data
  const { data: ruralData } = useCpiSeries({ geography: 'rural', seriesCodes: ['headline'], startDate: '2023-01-01', endDate: new Date().toISOString().split('T')[0] });
  const { data: urbanData } = useCpiSeries({ geography: 'urban', seriesCodes: ['headline'], startDate: '2023-01-01', endDate: new Date().toISOString().split('T')[0] });
  const { data: combinedData } = useCpiSeries({ geography: 'combined', seriesCodes: ['headline'], startDate: '2023-01-01', endDate: new Date().toISOString().split('T')[0] });
  
  const geoComparisonData = useMemo(() => {
    const dataMap = new Map();
    [ruralData, urbanData, combinedData].forEach((data, index) => {
      const geoType = ['rural', 'urban', 'combined'][index];
      data?.slice(-6).forEach(item => { // Last 6 months
        const dateKey = item.date;
        if (!dataMap.has(dateKey)) {
          dataMap.set(dateKey, { date: dateKey, month: format(new Date(dateKey), 'MMM yy') });
        }
        dataMap.get(dateKey)[geoType] = item.inflation_yoy || 0;
      });
    });
    return Array.from(dataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [ruralData, urbanData, combinedData]);
  
  const getInsights = () => {
    const latest = trendData[trendData.length - 1];
    if (!latest) return [];
    
    const insights = [];
    
    if (latest.headline > 4) {
      insights.push({
        type: 'warning',
        text: `Current inflation at ${latest.headline?.toFixed(1)}% is above RBI's target of 4%, indicating persistent price pressures.`
      });
    }
    
    if (latest.core && latest.core < latest.headline) {
      insights.push({
        type: 'positive',
        text: `Core inflation at ${latest.core?.toFixed(1)}% is below headline inflation, suggesting food and fuel are key drivers.`
      });
    }
    
    if (latest.food > 6) {
      insights.push({
        type: 'concern',
        text: `Food inflation at ${latest.food?.toFixed(1)}% remains elevated, impacting rural households disproportionately.`
      });
    }
    
    return insights;
  };
  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getInsights().map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                insight.type === 'warning' ? 'bg-red-50 border-red-200' :
                insight.type === 'positive' ? 'bg-green-50 border-green-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <p className="text-sm">{insight.text}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Economic Outlook
            </h4>
            <p className="text-sm text-muted-foreground">
              Current inflation dynamics show mixed signals with food price volatility remaining a key concern. 
              Core inflation moderation suggests monetary policy transmission is effective. 
              Monitor seasonal patterns and global commodity price movements for policy guidance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
