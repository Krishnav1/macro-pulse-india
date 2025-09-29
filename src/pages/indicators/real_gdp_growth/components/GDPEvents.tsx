import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';

interface GDPEventsProps {
  timeframe: string;
}

export const GDPEvents = ({ timeframe }: GDPEventsProps) => {
  const { data: events, loading, error } = useIndicatorEvents('real_gdp_growth');

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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <AlertCircle className="h-3 w-3" />;
      case 'low': return <Info className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'quarterly-data': return 'bg-blue-100 text-blue-800';
      case 'policy': return 'bg-purple-100 text-purple-800';
      case 'seasonal': return 'bg-orange-100 text-orange-800';
      case 'sectoral': return 'bg-teal-100 text-teal-800';
      case 'recovery': return 'bg-green-100 text-green-800';
      case 'base-effect': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Key Economic Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading events...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Key Economic Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading events: {error}</div>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No events found for the selected timeframe
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="border-l-4 border-primary/20 pl-4 pb-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {event.impact && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs flex items-center gap-1 ${getImpactColor(event.impact)}`}
                        >
                          {getImpactIcon(event.impact)}
                          {event.impact.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    {event.title && (
                      <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                    {event.tag && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs mt-2 ${getTagColor(event.tag)}`}
                      >
                        {event.tag.replace('-', ' ').toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
