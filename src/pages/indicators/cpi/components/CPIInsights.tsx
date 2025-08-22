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
      {/* Chart Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            CPI Analysis Dashboard - {geography.charAt(0).toUpperCase() + geography.slice(1)}
          </CardTitle>
          <CardDescription>
            Comprehensive inflation analysis with multiple perspectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button 
              variant={activeChart === 'overview' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveChart('overview')}
            >
              <PieChart className="h-4 w-4 mr-2" />
              Overview
            </Button>
            <Button 
              variant={activeChart === 'components' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveChart('components')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Components
            </Button>
            <Button 
              variant={activeChart === 'trends' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveChart('trends')}
            >
              <LineChart className="h-4 w-4 mr-2" />
              Trends
            </Button>
            <Button 
              variant={activeChart === 'comparison' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveChart('comparison')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Geography
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading analysis...</div>
            </div>
          ) : (
            <div className="h-80">
              {activeChart === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <div>
                    <h3 className="font-semibold mb-4">CPI Component Weights</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={componentData.slice(0, 6)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="weight"
                          nameKey="name"
                        >
                          {componentData.slice(0, 6).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Weight']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Inflation Contribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={componentData.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} />
                        <YAxis fontSize={12} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Contribution']} />
                        <Bar dataKey="contribution" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {activeChart === 'components' && (
                <div>
                  <h3 className="font-semibold mb-4">Component-wise Inflation Rates</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={componentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={10} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Inflation']} />
                      <Bar dataKey="inflation" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {activeChart === 'trends' && (
                <div>
                  <h3 className="font-semibold mb-4">12-Month Inflation Trends</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="headline" fill="#8884d8" fillOpacity={0.3} />
                      <Line type="monotone" dataKey="headline" stroke="#8884d8" strokeWidth={2} name="Headline CPI" />
                      <Line type="monotone" dataKey="core" stroke="#82ca9d" strokeWidth={2} name="Core CPI" />
                      <Line type="monotone" dataKey="food" stroke="#ffc658" strokeWidth={2} name="Food CPI" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              {activeChart === 'comparison' && (
                <div>
                  <h3 className="font-semibold mb-4">Geography-wise Inflation Comparison</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geoComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="rural" fill="#22c55e" name="Rural" />
                      <Bar dataKey="urban" fill="#3b82f6" name="Urban" />
                      <Bar dataKey="combined" fill="#f59e0b" name="Combined" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
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
