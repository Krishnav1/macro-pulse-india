import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, ExternalLink, AlertCircle, Info } from "lucide-react";
import { useIipSeries } from "@/hooks/useIipSeries";
import { useIipComponents } from "@/hooks/useIipComponents";
import { useIipEvents } from "@/hooks/useIipEvents";
import { IIPCombinedChart } from "@/components/iip/IIPCombinedChart";
import { IIPGrowthChart } from "@/components/iip/IIPGrowthChart";
import { IIPComponentsChart } from "@/components/iip/IIPComponentsChart";
import { ChartToolbar } from "@/components/iip/ChartToolbar";

const IIPIndicator = () => {
  // Chart controls
  const [chartType, setChartType] = useState<'combined' | 'growth' | 'components'>('combined');
  const [showGrowth, setShowGrowth] = useState(false);
  const [growthType, setGrowthType] = useState<'yoy' | 'mom'>('yoy');
  const [componentChartType, setComponentChartType] = useState<'index' | 'growth'>('growth');
  const [compareWith, setCompareWith] = useState<'none' | 'sectoral' | 'use_based'>('none');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState('1y');

  // Data fetching
  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      '1y': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0],
      '2y': new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()).toISOString().split('T')[0],
      '5y': new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()).toISOString().split('T')[0],
      'all': undefined
    };
    return ranges[timePeriod as keyof typeof ranges];
  };

  const { data: seriesData, loading: seriesLoading } = useIipSeries({
    startDate: getDateRange(),
    limit: timePeriod === 'all' ? 500 : 100
  });

  const { data: componentsData, breakdown, loading: componentsLoading } = useIipComponents({
    classification: compareWith === 'none' ? undefined : compareWith,
    startDate: getDateRange()
  });

  const { data: eventsData, loading: eventsLoading } = useIipEvents({
    startDate: getDateRange()
  });

  // Component definitions
  const sectoralComponents = [
    { code: 'S1', name: 'Mining' },
    { code: 'S2', name: 'Manufacturing' },
    { code: 'S3', name: 'Electricity' }
  ];

  const useBasedComponents = [
    { code: 'U1', name: 'Primary Goods' },
    { code: 'U2', name: 'Capital Goods' },
    { code: 'U3', name: 'Intermediate Goods' },
    { code: 'U4', name: 'Infrastructure/Construction Goods' },
    { code: 'U5', name: 'Consumer Durables' },
    { code: 'U6', name: 'Consumer Non-Durables' }
  ];

  const getAvailableComponents = () => {
    return compareWith === 'sectoral' ? sectoralComponents : useBasedComponents;
  };

  const handleComponentToggle = (componentCode: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentCode) 
        ? prev.filter(c => c !== componentCode)
        : [...prev, componentCode]
    );
  };

  // Get latest values for display
  const latestSeries = seriesData[0];
  const latestGrowth = latestSeries?.growth_yoy || 0;
  const latestIndex = latestSeries?.index_value || 0;

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-success";
    if (value < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "bg-destructive/20 text-destructive border-destructive/30",
      medium: "bg-warning/20 text-warning border-warning/30", 
      low: "bg-success/20 text-success border-success/30"
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const renderChart = () => {
    if (chartType === 'combined') {
      return (
        <IIPCombinedChart
          data={seriesData}
          events={eventsData}
          showGrowth={showGrowth}
          growthType={growthType}
        />
      );
    }
    
    if (chartType === 'growth') {
      return (
        <IIPGrowthChart
          data={seriesData}
          events={eventsData}
          showYoY={growthType === 'yoy'}
          showMoM={growthType === 'mom'}
        />
      );
    }

    if (chartType === 'components') {
      return (
        <IIPComponentsChart
          data={componentsData}
          chartType={componentChartType}
          growthType={growthType}
          selectedComponents={selectedComponents}
        />
      );
    }
  };

  const keyInsights = [
    `Current IIP index value of ${latestIndex.toFixed(1)} represents a ${Math.abs(latestGrowth).toFixed(1)}% ${latestGrowth >= 0 ? 'growth' : 'contraction'} year-on-year.`,
    `Industrial production has been ${latestGrowth >= 0 ? 'expanding' : 'contracting'} in recent periods, indicating ${latestGrowth >= 0 ? 'positive' : 'challenging'} economic momentum.`,
    `Data is sourced from Ministry of Statistics and Programme Implementation (MoSPI), ensuring reliability and accuracy.`,
    `IIP is a key indicator for manufacturing sector performance and overall industrial health in India.`
  ];

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">Index of Industrial Production (IIP)</h1>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-5 w-5 text-muted-foreground hover:text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p className="text-sm">
                      IIP measures the growth rate of various industry groups relative to a base year (2011-12=100). 
                      It covers mining, manufacturing, and electricity sectors.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-muted-foreground text-lg">
                Measures the growth rate of industrial production in India across mining, manufacturing, and electricity sectors
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Industrial Production
            </Badge>
          </div>

          {/* Current Value Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Index Value</div>
                  <div className="metric-value">
                    {latestIndex.toFixed(1)} (2011-12=100)
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">YoY Growth</div>
                  <div className={`text-2xl font-bold flex items-center gap-2 ${getTrendColor(latestGrowth)}`}>
                    {latestGrowth >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    {latestGrowth > 0 ? "+" : ""}{latestGrowth.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Latest Period</div>
                  <div className="text-2xl font-bold">
                    {latestSeries ? new Date(latestSeries.date).toLocaleDateString('en-IN', { 
                      year: 'numeric', 
                      month: 'short' 
                    }) : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chart Controls */}
            <ChartToolbar
              chartType={chartType}
              onChartTypeChange={setChartType}
              showGrowth={showGrowth}
              onShowGrowthChange={setShowGrowth}
              growthType={growthType}
              onGrowthTypeChange={setGrowthType}
              componentChartType={componentChartType}
              onComponentChartTypeChange={setComponentChartType}
              compareWith={compareWith}
              onCompareWithChange={setCompareWith}
              selectedComponents={selectedComponents}
              onComponentToggle={handleComponentToggle}
              availableComponents={getAvailableComponents()}
              timePeriod={timePeriod}
              onTimePeriodChange={setTimePeriod}
            />

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {chartType === 'combined' && 'IIP Index and Growth'}
                  {chartType === 'growth' && 'IIP Growth Rate'}
                  {chartType === 'components' && `IIP ${compareWith === 'sectoral' ? 'Sectoral' : 'Use-based'} Components`}
                </CardTitle>
                <CardDescription>
                  {chartType === 'combined' && 'Index values with optional growth overlay'}
                  {chartType === 'growth' && 'Year-over-year and month-over-month growth rates'}
                  {chartType === 'components' && `Latest ${componentChartType} values by ${compareWith} classification`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(seriesLoading || componentsLoading || eventsLoading) ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-muted-foreground">Loading chart data...</div>
                  </div>
                ) : (
                  renderChart()
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Component Breakdown */}
            {compareWith !== 'none' && breakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {compareWith === 'sectoral' ? 'Sectoral' : 'Use-based'} Breakdown
                  </CardTitle>
                  <CardDescription>
                    Latest values for selected classification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {breakdown.slice(0, 6).map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div className="text-sm font-medium">{component.component_name}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{component.latest_value?.toFixed(1)}</span>
                        <span className={`text-xs ${getTrendColor(component.growth_yoy || 0)}`}>
                          ({component.growth_yoy?.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Major Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Major Events
                </CardTitle>
                <CardDescription>
                  Significant events that impacted industrial production
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {eventsData.length > 0 ? (
                  eventsData.slice(0, 5).map((event, index) => (
                    <div key={index} className="p-3 rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-medium">{event.title}</div>
                        <Badge variant="outline" className={`text-xs ${getImpactColor(event.impact)}`}>
                          {event.impact} impact
                        </Badge>
                      </div>
                      {event.description && (
                        <div className="text-xs text-muted-foreground mb-1">{event.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No events data available</div>
                )}
              </CardContent>
            </Card>

            {/* Data Source */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Data Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Ministry of Statistics and Programme Implementation (MoSPI)
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Base Year: 2011-12 = 100
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default IIPIndicator;
