import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';

interface GDPEventsProps {
  timeframe: string;
}

export const GDPEvents = ({ timeframe }: GDPEventsProps) => {
  const { data: events, loading } = useIndicatorEvents('real_gdp_growth');

  // Filter events based on timeframe
  const filteredEvents = events.filter(event => {
    if (timeframe === 'all') return true;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    const yearsBack = timeframe === '1Y' ? 1 : timeframe === '5Y' ? 5 : timeframe === '10Y' ? 10 : 0;
    
    if (yearsBack > 0) {
      const cutoffDate = new Date(now.getFullYear() - yearsBack, now.getMonth(), now.getDate());
      return eventDate >= cutoffDate;
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Key Economic Events
        </CardTitle>
        <CardDescription>
          Major events that impacted GDP growth
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No events recorded for this timeframe</div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
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
                
                {/* Title */}
                {event.title && (
                  <h4 className="font-semibold mb-1">{event.title}</h4>
                )}
                
                {/* Description */}
                <p className="text-sm text-muted-foreground mb-2">
                  {event.description}
                </p>
                
                {/* Tag */}
                {event.tag && (
                  <Badge variant="outline" className="text-xs">
                    {event.tag}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
