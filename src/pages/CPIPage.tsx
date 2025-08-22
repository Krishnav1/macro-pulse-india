import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, AlertCircle, Calendar } from "lucide-react";
import { CPICombinedChart } from "@/components/cpi/CPICombinedChart";
import { CPIInflationChart } from "@/components/cpi/CPIInflationChart";
import { CPIComponentsChart } from "@/components/cpi/CPIComponentsChart";
import { ChartToolbar } from "@/components/cpi/ChartToolbar";
import { useCpiSeries } from "@/hooks/useCpiSeries";
import { useCpiComponents } from "@/hooks/useCpiComponents";
import { useCpiEvents } from "@/hooks/useCpiEvents";
import { useCpiInsights } from "@/hooks/useCpiInsights";

const CPIPage = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState("3y");
  const [selectedGeography, setSelectedGeography] = useState<'rural' | 'urban' | 'combined'>('combined');
  const [chartView, setChartView] = useState<'combined' | 'inflation' | 'components'>('combined');
  const [showInflation, setShowInflation] = useState(true);
  const [inflationType, setInflationType] = useState<'yoy' | 'mom'>('yoy');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  // Calculate date range based on timeframe
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

  // Fetch data using hooks
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

  const { data: insightsData } = useCpiInsights({
    section: 'overview'
  });

  const isLoading = seriesLoading || componentsLoading;

  // Get latest CPI values for display
  const latestData = seriesData[seriesData.length - 1];

  const handleExport = () => {
    // TODO: Implement chart export functionality
    console.log('Export functionality to be implemented');
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-96 flex items-center justify-center">
          <div className="text-muted-foreground">Loading chart data...</div>
        </div>
      );
    }

    switch (chartView) {
      case 'combined':
        return (
          <CPICombinedChart
            data={seriesData}
            events={eventsData}
            showInflation={showInflation}
            inflationType={inflationType}
          />
        );
      case 'inflation':
        return (
          <CPIInflationChart
            data={seriesData}
            events={eventsData}
            showYoY={true}
            showMoM={true}
          />
        );
      case 'components':
        return (
          <CPIComponentsChart
            data={componentsData}
            chartType="contribution"
            selectedComponents={selectedComponents}
          />
        );
      default:
        return null;
    }
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "bg-destructive/20 text-destructive border-destructive/30",
      medium: "bg-warning/20 text-warning border-warning/30", 
      low: "bg-success/20 text-success border-success/30"
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Consumer Price Index (CPI)</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Comprehensive analysis of inflation trends and price movements across India
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            Inflation Indicator
          </Badge>
        </div>

        {/* Current Values Display */}
        {latestData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Current CPI Index</div>
                <div className="text-2xl font-bold">
                  {latestData.index_value.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Base: {latestData.base_year}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Inflation (YoY)</div>
                <div className={`text-2xl font-bold ${
                  (latestData.inflation_yoy || 0) > 0 ? 'text-destructive' : 'text-success'
                }`}>
                  {latestData.inflation_yoy?.toFixed(2) || 'N/A'}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Inflation (MoM)</div>
                <div className={`text-2xl font-bold ${
                  (latestData.inflation_mom || 0) > 0 ? 'text-destructive' : 'text-success'
                }`}>
                  {latestData.inflation_mom?.toFixed(2) || 'N/A'}%
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                <div className="text-lg font-medium">
                  {new Date(latestData.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <ChartToolbar
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            selectedGeography={selectedGeography}
            onGeographyChange={setSelectedGeography}
            chartView={chartView}
            onChartViewChange={setChartView}
            showInflation={showInflation}
            onShowInflationChange={setShowInflation}
            inflationType={inflationType}
            onInflationTypeChange={setInflationType}
            onExport={handleExport}
          />

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>CPI Analysis</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/indicators/cpi/insights')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Insights
                </Button>
              </div>
              <CardDescription>
                Interactive analysis of Consumer Price Index trends and inflation patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart()}
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
              {insightsData.map((insight) => (
                <div key={insight.id} className="p-3 rounded-lg border border-border">
                  <div className="font-medium text-sm mb-1">{insight.title}</div>
                  <div className="text-sm text-muted-foreground">{insight.text}</div>
                </div>
              ))}
              {insightsData.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No insights available. Check back later for analysis updates.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Events
              </CardTitle>
              <CardDescription>
                Economic events impacting CPI trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventsData.slice(0, 5).map((event) => (
                <div key={event.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium">{event.title}</div>
                    <Badge variant="outline" className={`text-xs ${getImpactColor(event.impact)}`}>
                      {event.impact} impact
                    </Badge>
                  </div>
                  {event.description && (
                    <div className="text-xs text-muted-foreground mb-2">
                      {event.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))}
              {eventsData.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No recent events recorded.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CPIPage;
