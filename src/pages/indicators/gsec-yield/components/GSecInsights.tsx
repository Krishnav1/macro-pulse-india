import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';

export const GSecInsights = () => {
  const { insights, loading } = useIndicatorInsights('gsec_yield_10y');

  // Fallback insights if none exist
  const fallbackInsights = [
    {
      title: 'Benchmark Rate',
      content: 'The 10-year G-Sec yield serves as the benchmark for long-term interest rates in India, influencing corporate borrowing costs and investment decisions.'
    },
    {
      title: 'Monetary Policy',
      content: 'G-Sec yields are closely tied to RBI\'s monetary policy stance. Rate cuts typically lead to lower yields, while rate hikes push yields higher.'
    },
    {
      title: 'Inflation Expectations',
      content: 'Rising yields often reflect higher inflation expectations, while falling yields suggest expectations of lower inflation or economic slowdown.'
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
        ) : (
          <div className="space-y-4">
            {displayInsights.map((insight, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
              >
                <h3 className="font-semibold text-sm mb-2 text-blue-900">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-700">
                  {insight.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
