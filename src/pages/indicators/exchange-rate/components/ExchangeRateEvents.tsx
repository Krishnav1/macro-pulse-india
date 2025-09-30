import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { format } from 'date-fns';

interface ExchangeRateEventsProps {
  timeframe: string;
}

export const ExchangeRateEvents = ({ timeframe }: ExchangeRateEventsProps) => {
  // Calculate date range based on timeframe
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate = new Date(1998, 11, 1); // Dec 1998
    switch (timeframe) {
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '3y':
        startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
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

  const { data: events, loading, error } = useIndicatorEvents({
    indicatorSlug: 'inr_exchange_rate',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'medium':
        return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4" />;
      case 'low':
        return <Zap className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Key Economic Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading events...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            {error}
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="border-l-2 border-primary pl-4 py-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getImpactColor(event.impact)}>
                      <span className="flex items-center gap-1">
                        {getImpactIcon(event.impact)}
                        {event.impact}
                      </span>
                    </Badge>
                    {event.tag && (
                      <Badge variant="secondary" className="text-xs">
                        {event.tag}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event.date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No events recorded for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
};
