import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface IIPEventsProps {
  timeframe: string;
}

export const IIPEvents = ({ timeframe }: IIPEventsProps) => {
  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      '1y': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0],
      '2y': new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()).toISOString().split('T')[0],
      '5y': new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()).toISOString().split('T')[0],
      'all': undefined
    };
    return ranges[timeframe as keyof typeof ranges];
  };

  const { data: events, loading } = useIndicatorEvents({
    indicatorSlug: 'iip',
    startDate: getDateRange()
  });

  const getImpactIcon = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
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
        <CardTitle>Economic Events</CardTitle>
        <CardDescription>
          Key events affecting industrial production
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event, index) => (
              <div
                key={index}
                className={`p-3 border-l-4 rounded-r-lg ${getImpactColor(event.impact)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getImpactIcon(event.impact)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        event.impact?.toLowerCase() === 'low'
                          ? 'bg-green-100 text-green-800'
                          : event.impact?.toLowerCase() === 'high'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.impact}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {event.tag && (
                        <span className="px-2 py-0.5 bg-muted rounded">
                          {event.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No events found for the selected time period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
