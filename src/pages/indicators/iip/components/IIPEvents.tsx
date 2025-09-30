import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { useMemo } from 'react';

interface IIPEventsProps {
  timeframe: string;
}

export const IIPEvents = ({ timeframe }: IIPEventsProps) => {
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

  // Fetch IIP events for the current timeframe
  const { data: eventsData, loading } = useIndicatorEvents({
    indicatorSlug: 'iip',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const events = eventsData || [];

  const getImpactIcon = (impact: string) => {
    if (impact === 'high') return <AlertCircle className="h-4 w-4" />;
    if (impact === 'medium') return <TrendingUp className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Economic Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Key Economic Events
        </CardTitle>
        <CardDescription>
          Major events that impacted industrial production
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No events recorded for this timeframe</div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
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
