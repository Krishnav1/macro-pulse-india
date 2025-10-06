import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';
import { DataType, PriceType } from '@/hooks/useGdpData';

interface GDPInsightsProps {
  dataType?: DataType;
  priceType?: PriceType;
}

export const GDPInsights = ({ dataType, priceType }: GDPInsightsProps) => {
  const { insights, loading } = useIndicatorInsights('real_gdp_growth');

  // Show first 3 insights, or fallback content if none available
  const displayInsights = insights.length > 0 
    ? insights.slice(0, 3)
    : [
        {
          id: 1,
          content: "India's GDP growth has shown remarkable resilience, consistently outperforming global averages despite various economic challenges.",
          order_index: 1
        },
        {
          id: 2,
          content: "Private consumption remains the largest driver of economic growth, typically contributing 55-60% of total GDP.",
          order_index: 2
        },
        {
          id: 3,
          content: "Government capital expenditure and infrastructure development continue to provide crucial support to economic expansion.",
          order_index: 3
        }
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Key Insights
        </CardTitle>
        <CardDescription>
          Analysis and trends in GDP growth
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading insights...</div>
        ) : (
          <div className="space-y-4">
            {displayInsights.map((insight, index) => (
              <div key={insight.id || index} className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground leading-relaxed">
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
