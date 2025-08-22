import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, TrendingUp } from 'lucide-react';

// Mock data for CPI insights
const mockInsights = [
  {
    id: '1',
    content: 'CPI inflation remains above RBI target of 4%, driven by food and fuel prices.'
  },
  {
    id: '2',
    content: 'Rural inflation continues to outpace urban inflation due to food price volatility.'
  },
  {
    id: '3',
    content: 'Core CPI shows signs of moderation, indicating underlying price pressures are easing.'
  },
];

export const CPIInsights = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Key Insights
        </CardTitle>
        <CardDescription>
          Analysis and economic implications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockInsights.slice(0, 3).map((insight) => (
            <div key={insight.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.content}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Outlook
          </h4>
          <p className="text-sm text-muted-foreground">
            Current inflation trends suggest continued price stability with seasonal variations. 
            Monitor food and fuel price movements for potential policy implications.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
