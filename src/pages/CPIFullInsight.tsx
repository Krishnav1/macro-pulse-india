import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, BarChart3, PieChart, GitCompare } from "lucide-react";
import { CPICombinedChart } from "@/components/cpi/CPICombinedChart";
import { CPIInflationChart } from "@/components/cpi/CPIInflationChart";
import { CPIComponentsChart } from "@/components/cpi/CPIComponentsChart";
import { ChartToolbar } from "@/components/cpi/ChartToolbar";
import { useCpiSeries } from "@/hooks/useCpiSeries";
import { useCpiComponents } from "@/hooks/useCpiComponents";
import { useCpiEvents } from "@/hooks/useCpiEvents";
import { useCpiInsights } from "@/hooks/useCpiInsights";
import { 
  ComposedChart, 
  Line, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Treemap,
  Cell
} from "recharts";

const CPIFullInsight = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState("5y");
  const [selectedGeography, setSelectedGeography] = useState<'rural' | 'urban' | 'combined'>('combined');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("trends");

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date();
    const cutoffDates: Record<string, Date> = {
      "1y": new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      "2y": new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()),
      "3y": new Date(now.getFullYear() - 3, now.getMonth(), now.getDate()),
      "5y": new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()),
      "10y": new Date(now.getFullYear() - 10, now.getMonth(), now.getDate()),
      "all": new Date(2000, 0, 1)
    };
    return {
      startDate: cutoffDates[selectedTimeframe].toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }, [selectedTimeframe]);

  // Fetch data
  const { data: seriesData, loading: seriesLoading } = useCpiSeries({
    geography: selectedGeography,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const { data: componentsData, loading: componentsLoading } = useCpiComponents({
    geography: selectedGeography,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const { data: eventsData } = useCpiEvents({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const { data: trendsInsights } = useCpiInsights({ section: 'trend' });
  const { data: componentsInsights } = useCpiInsights({ section: 'components' });
  const { data: compareInsights } = useCpiInsights({ section: 'compare' });

  const isLoading = seriesLoading || componentsLoading;

  // Calculate moving averages
  const seriesWithMA = useMemo(() => {
    if (seriesData.length === 0) return [];
    
    return seriesData.map((item, index) => {
      const ma3 = index >= 2 ? 
        seriesData.slice(index - 2, index + 1).reduce((sum, d) => sum + d.index_value, 0) / 3 : null;
      const ma6 = index >= 5 ? 
        seriesData.slice(index - 5, index + 1).reduce((sum, d) => sum + d.index_value, 0) / 6 : null;
      const ma12 = index >= 11 ? 
        seriesData.slice(index - 11, index + 1).reduce((sum, d) => sum + d.index_value, 0) / 12 : null;
      
      return {
        ...item,
        ma3,
        ma6,
        ma12
      };
    });
  }, [seriesData]);

  // Get treemap data for components
  const treemapData = useMemo(() => {
    const componentMap = new Map<string, any>();
    
    componentsData.forEach(item => {
      const existing = componentMap.get(item.component_code);
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        componentMap.set(item.component_code, {
          name: item.component_name,
          value: Math.abs(item.contribution_to_inflation || 0),
          contribution: item.contribution_to_inflation || 0,
          inflation: item.inflation_yoy || 0
        });
      }
    });

    return Array.from(componentMap.values()).filter(item => item.value > 0);
  }, [componentsData]);

  const InsightBlock = ({ insights, title }: { insights: any[], title: string }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className="p-3 rounded-lg bg-muted/50">
            <div className="font-medium text-sm mb-1">{insight.title}</div>
            <div className="text-sm text-muted-foreground">{insight.text}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const CustomTreemap = ({ data }: { data: any[] }) => (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          aspectRatio={4/3}
          stroke="#fff"
          fill="hsl(var(--primary))"
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.contribution > 0 ? "hsl(var(--destructive))" : "hsl(var(--success))"} 
            />
          ))}
        </Treemap>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/indicators/cpi')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to CPI Overview
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">CPI Full Insights</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive analysis of Consumer Price Index trends, components, and economic impacts
        </p>
      </div>

      {/* Global Controls */}
      <ChartToolbar
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        selectedGeography={selectedGeography}
        onGeographyChange={setSelectedGeography}
        chartView="combined"
        onChartViewChange={() => {}}
      />

      {/* Tabbed Analysis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends & Moving Averages
          </TabsTrigger>
          <TabsTrigger value="inflation" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Inflation Analysis
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Component Breakdown
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            Comparative Analysis
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>CPI Index with Moving Averages</CardTitle>
                  <CardDescription>
                    Long-term trends with 3, 6, and 12-month moving averages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-96 flex items-center justify-center">Loading...</div>
                  ) : (
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={seriesWithMA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="index_value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="CPI Index"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ma3" 
                            stroke="hsl(var(--secondary))" 
                            strokeWidth={1}
                            strokeDasharray="5 5"
                            name="3-Month MA"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ma6" 
                            stroke="hsl(var(--accent))" 
                            strokeWidth={1}
                            strokeDasharray="3 3"
                            name="6-Month MA"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ma12" 
                            stroke="hsl(var(--muted-foreground))" 
                            strokeWidth={1}
                            strokeDasharray="2 2"
                            name="12-Month MA"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div>
              <InsightBlock insights={trendsInsights} title="Trend Analysis" />
            </div>
          </div>
        </TabsContent>

        {/* Inflation Tab */}
        <TabsContent value="inflation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Inflation Rate Analysis</CardTitle>
                  <CardDescription>
                    Year-over-Year and Month-over-Month inflation trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CPIInflationChart
                    data={seriesData}
                    events={eventsData}
                    showYoY={true}
                    showMoM={true}
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <InsightBlock insights={trendsInsights} title="Inflation Insights" />
            </div>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Component Contributions</CardTitle>
                <CardDescription>
                  Contribution of each category to overall inflation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CPIComponentsChart
                  data={componentsData}
                  chartType="contribution"
                  selectedComponents={selectedComponents}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Component Treemap</CardTitle>
                <CardDescription>
                  Visual representation of component impact sizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomTreemap data={treemapData} />
              </CardContent>
            </Card>
          </div>
          
          <InsightBlock insights={componentsInsights} title="Component Analysis" />
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>CPI vs Inflation Comparison</CardTitle>
                  <CardDescription>
                    Dual-axis comparison of index values and inflation rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CPICombinedChart
                    data={seriesData}
                    events={eventsData}
                    showInflation={true}
                    inflationType="yoy"
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <InsightBlock insights={compareInsights} title="Comparative Insights" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CPIFullInsight;
