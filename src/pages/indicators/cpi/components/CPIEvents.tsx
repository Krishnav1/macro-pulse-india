import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

// Mock data for CPI events
const mockEvents = [
  { 
    id: '1',
    date: '2023-12-15', 
    description: 'Food price surge due to supply disruptions', 
    impact: 'high' as const
  },
  { 
    id: '2',
    date: '2023-08-20', 
    description: 'Monsoon impact on vegetable prices', 
    impact: 'medium' as const
  },
  { 
    id: '3',
    date: '2023-06-10', 
    description: 'Base effect normalization', 
    impact: 'low' as const
  },
  { 
    id: '4',
    date: '2023-04-05', 
    description: 'Fuel price adjustments', 
    impact: 'medium' as const
  },
];

interface CPIEventsProps {
  timeframe: string;
}

export const CPIEvents = ({ timeframe }: CPIEventsProps) => {
  const getFilteredEvents = () => {
    const now = new Date();
    let startDate = new Date(0);
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
      default:
        break;
    }
    return mockEvents.filter(event => new Date(event.date) >= startDate);
  };

  const events = getFilteredEvents();

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
        <div className="space-y-4">
          {events.slice(0, 4).map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                event.impact === 'high' ? 'bg-destructive' : 
                event.impact === 'medium' ? 'bg-warning' : 'bg-success'
              }`} />
              <div>
                <div className="font-semibold text-sm">
                  {new Date(event.date).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-muted-foreground">{event.description}</div>
                <Badge 
                  variant={event.impact === 'high' ? 'destructive' : event.impact === 'medium' ? 'secondary' : 'default'}
                  className="mt-1 text-xs"
                >
                  {event.impact} impact
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
