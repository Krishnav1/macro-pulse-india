import { Calendar, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { economicIndicators } from "@/data/indicators";

const Events = () => {
  // Flatten all events from all indicators and sort by date
  const allEvents = economicIndicators
    .flatMap(indicator => 
      indicator.events.map(event => ({
        ...event,
        indicatorName: indicator.name,
        indicatorId: indicator.id
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "bg-destructive/20 text-destructive border-destructive/30",
      medium: "bg-warning/20 text-warning border-warning/30", 
      low: "bg-success/20 text-success border-success/30"
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const getImpactIcon = (impact: string) => {
    if (impact === 'high') return <AlertCircle className="h-4 w-4" />;
    if (impact === 'medium') return <TrendingUp className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Economic Events Timeline</h1>
        <p className="text-muted-foreground">
          Major events that have shaped India's economic landscape and their impact on key indicators.
        </p>
      </div>

      <div className="space-y-4">
        {allEvents.map((event, index) => (
          <Card key={`${event.indicatorId}-${index}`} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {new Date(event.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <Badge variant="outline" className={`text-xs ${getImpactColor(event.impact)}`}>
                  {event.impact} impact
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getImpactIcon(event.impact)}
                  {event.event}
                </CardTitle>
                {(event as any).tag && (
                  <Badge variant="secondary" className="text-xs">
                    {(event as any).tag}
                  </Badge>
                )}
              </div>
              
              {(event as any).description && (
                <CardDescription className="mt-2">
                  {(event as any).description}
                </CardDescription>
              )}
              
              <div className="text-xs text-muted-foreground mt-2">
                Related to: {event.indicatorName}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {allEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No events found.</p>
        </div>
      )}
    </div>
  );
};

export default Events;