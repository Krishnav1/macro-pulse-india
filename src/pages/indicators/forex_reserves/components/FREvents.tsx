import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface FREventsProps {
  timeframe: string;
}

export const FREvents = ({ timeframe }: FREventsProps) => {
  // Mock data for forex reserves events
  const upcomingEvents = [
    {
      date: '2025-08-30',
      title: 'Weekly Forex Reserves Data',
      description: 'RBI releases weekly forex reserves data for week ended Aug 23, 2025',
      type: 'data_release',
      importance: 'high'
    },
    {
      date: '2025-09-06',
      title: 'Weekly Forex Reserves Data',
      description: 'RBI releases weekly forex reserves data for week ended Aug 30, 2025',
      type: 'data_release',
      importance: 'high'
    },
    {
      date: '2025-09-15',
      title: 'RBI Monetary Policy',
      description: 'RBI MPC meeting - potential impact on forex reserves through intervention',
      type: 'policy',
      importance: 'medium'
    }
  ];

  const recentEvents = [
    {
      date: '2025-08-23',
      title: 'Forex Reserves Rise',
      description: 'India\'s forex reserves increased by $2.5 billion to $693.6 billion',
      type: 'data_release',
      impact: 'positive'
    },
    {
      date: '2025-08-16',
      title: 'Dollar Intervention',
      description: 'RBI likely intervened to prevent sharp rupee depreciation',
      type: 'intervention',
      impact: 'neutral'
    },
    {
      date: '2025-08-09',
      title: 'Gold Reserves Update',
      description: 'RBI continued gold purchases, reserves up $1.2 billion',
      type: 'composition',
      impact: 'positive'
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'data_release':
        return <Calendar className="h-4 w-4" />;
      case 'policy':
        return <AlertCircle className="h-4 w-4" />;
      case 'intervention':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'data_release':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'policy':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'intervention':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'composition':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Forex Events & Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upcoming Events */}
        <div>
          <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg border bg-card/50">
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getEventColor(event.type)}`}
                    >
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
            Recent Developments
          </h3>
          <div className="space-y-3">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg border bg-card/30">
                <div className="flex-shrink-0 mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getEventColor(event.type)}`}
                      >
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Release Schedule */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Regular Schedule</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Weekly data: Every Friday (for previous week)</div>
            <div>• Release time: Usually 6:00 PM IST</div>
            <div>• Source: RBI Weekly Statistical Supplement</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
