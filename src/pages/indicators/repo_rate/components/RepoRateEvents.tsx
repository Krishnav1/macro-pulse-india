import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useIndicatorEvents } from '@/hooks/useIndicatorEvents';

const RepoRateEvents: React.FC = () => {
  const { events, loading, error } = useIndicatorEvents('repo_rate');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Key Policy Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-muted mt-1" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2" />
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-5 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            Key Policy Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error loading events</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Key Policy Events
        </CardTitle>
        <CardDescription>
          Major RBI policy decisions and economic events affecting repo rate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                event.impact === 'high' ? 'bg-destructive' : 
                event.impact === 'medium' ? 'bg-warning' : 'bg-success'
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-sm">
                    {new Date(event.date).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                  <Badge 
                    variant={
                      event.impact === 'high' ? 'destructive' : 
                      event.impact === 'medium' ? 'secondary' : 'default'
                    }
                    className="text-xs"
                  >
                    {event.impact} impact
                  </Badge>
                </div>
                {event.title && (
                  <div className="font-medium text-sm mb-1">{event.title}</div>
                )}
                <div className="text-sm text-muted-foreground">{event.description}</div>
                {event.tag && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {event.tag}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          
          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No events available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RepoRateEvents;
