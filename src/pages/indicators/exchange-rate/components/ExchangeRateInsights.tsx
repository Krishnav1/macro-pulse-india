import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';

export const ExchangeRateInsights = () => {
  const { insights, loading, error } = useIndicatorInsights('inr_exchange_rate');

  // Fallback insights if none are available
  const fallbackInsights = [
    {
      title: 'Currency Volatility',
      content: 'INR exchange rates are influenced by various factors including trade balance, foreign investment flows, and global economic conditions.',
      category: 'Analysis'
    },
    {
      title: 'RBI Intervention',
      content: 'The Reserve Bank of India actively manages currency volatility through forex market interventions to maintain stability.',
      category: 'Policy'
    },
    {
      title: 'Trade Impact',
      content: 'Exchange rate movements significantly affect import costs, export competitiveness, and overall trade balance.',
      category: 'Economic Impact'
    }
  ];

  const displayInsights = insights && insights.length > 0 ? insights : fallbackInsights;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading insights...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {displayInsights.map((insight: any, index: number) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  {insight.category && (
                    <Badge variant="secondary" className="text-xs">
                      {insight.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{insight.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
