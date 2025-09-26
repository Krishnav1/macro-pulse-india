import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { useMemo } from 'react';

interface CPIEventsProps {
  timeframe: string;
}

export const CPIEvents = ({ timeframe }: CPIEventsProps) => {
  // Calculate date range based on timeframe
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate = new Date(2000, 0, 1); // Default to all data
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
    }
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  }, [timeframe]);

  // Fetch CPI events for the current timeframe
  const { data: eventsData, loading } = useIndicatorEvents({
    indicatorSlug: 'cpi_inflation',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const events = eventsData || [];

  const getImpactIcon = (impact: string) => {
    if (impact === 'high') return <AlertCircle className="h-4 w-4" />;
    if (impact === 'medium') return <TrendingUp className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Key Economic Events
        </CardTitle>
        <CardDescription>
          Major events that impacted CPI inflation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No events recorded for this timeframe</div>
        ) : (
          <div className="space-y-4">
            {events.slice(0, 4).map((event) => (
              <div key={event.id} className="p-3 bg-muted/30 rounded-lg">
                {/* Date first, then impact at the right end of same row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    event.impact === 'high' ? 'bg-destructive' : 
                    event.impact === 'medium' ? 'bg-warning' : 'bg-success'
                  }`} />
                </div>
                
                {/* Title and tag in same row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getImpactIcon(event.impact)}
                    <span className="font-medium text-sm">{event.title}</span>
                  </div>
                  {event.tag && (
                    <Badge variant="secondary" className="text-xs">
                      {event.tag}
                    </Badge>
                  )}
                </div>
                
                {/* Description below */}
                {event.description && (
                  <div className="text-sm text-muted-foreground">
                    {event.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
