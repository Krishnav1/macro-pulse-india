import { useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import { economicIndicators } from "@/data/indicators";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, ExternalLink, AlertCircle } from "lucide-react";

const IndicatorDetail = () => {
  const { id } = useParams();
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  
  const indicator = economicIndicators.find(ind => ind.id === id);
  
  if (!indicator) {
    return <Navigate to="/404" replace />;
  }

  const timeframes = [
    { label: "1Y", value: "1y" },
    { label: "3Y", value: "3y" },
    { label: "5Y", value: "5y" },
    { label: "All", value: "all" }
  ];

  const getFilteredData = () => {
    const now = new Date();
    const cutoffDates: Record<string, Date> = {
      "1y": new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      "3y": new Date(now.getFullYear() - 3, now.getMonth(), now.getDate()),
      "5y": new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()),
      "all": new Date(0)
    };

    return indicator.historicalData.filter(point => {
      const pointDate = new Date(point.date);
      return pointDate >= cutoffDates[selectedTimeframe];
    });
  };

  const getEventMarkers = () => {
    const filteredData = getFilteredData();
    return indicator.events.filter(event => {
      const eventDate = new Date(event.date);
      const dataRange = filteredData.map(d => new Date(d.date));
      const minDate = Math.min(...dataRange.map(d => d.getTime()));
      const maxDate = Math.max(...dataRange.map(d => d.getTime()));
      return eventDate.getTime() >= minDate && eventDate.getTime() <= maxDate;
    });
  };

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

  const chartData = getFilteredData();
  const eventMarkers = getEventMarkers();

  const keyInsights = [
    `Current value of ${indicator.value}${indicator.unit} represents a ${Math.abs(indicator.changePercent).toFixed(1)}% ${indicator.change >= 0 ? 'increase' : 'decrease'} from previous period.`,
    `Historical analysis shows ${indicator.name} has been ${indicator.change >= 0 ? 'trending upward' : 'trending downward'} in recent periods.`,
    `Data is sourced from ${indicator.source}, ensuring reliability and accuracy of measurements.`,
    `This indicator falls under ${indicator.category} category and is crucial for economic policy decisions.`
  ];

  return (
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{indicator.name}</h1>
            <p className="text-muted-foreground text-lg">{indicator.description}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {indicator.category}
          </Badge>
        </div>

        {/* Current Value Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                <div className="metric-value">
                  {indicator.value.toLocaleString()} {indicator.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Change</div>
                <div className={`text-2xl font-bold flex items-center gap-2 ${getTrendColor(indicator.change)}`}>
                  {indicator.change >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {indicator.change > 0 ? "+" : ""}{indicator.change} {indicator.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Percentage Change</div>
                <div className={`text-2xl font-bold ${getTrendColor(indicator.changePercent)}`}>
                  {indicator.changePercent > 0 ? "+" : ""}{indicator.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historical Trend</CardTitle>
                <div className="flex gap-2">
                  {timeframes.map(tf => (
                    <Button
                      key={tf.value}
                      variant={selectedTimeframe === tf.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeframe(tf.value)}
                    >
                      {tf.label}
                    </Button>
                  ))}
                </div>
              </div>
              <CardDescription>
                {indicator.name} over time with major economic events highlighted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--foreground))"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                    {eventMarkers.map((event, index) => (
                      <ReferenceLine 
                        key={index}
                        x={event.date}
                        stroke="hsl(var(--destructive))"
                        strokeDasharray="2 2"
                        label={{ value: event.event.substring(0, 20) + "...", position: "top" }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
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

          {/* Major Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Major Events
              </CardTitle>
              <CardDescription>
                Significant events that impacted this indicator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {indicator.events.map((event, index) => (
                <div key={index} className="p-3 rounded-lg border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium">{event.event}</div>
                    <Badge variant="outline" className={`text-xs ${getImpactColor(event.impact)}`}>
                      {event.impact} impact
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))}
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
                <span className="text-sm text-muted-foreground">{indicator.source}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(indicator.lastUpdated).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetail;