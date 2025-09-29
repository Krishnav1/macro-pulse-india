import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';
import { DataType, PriceType } from '@/hooks/useGdpData';

interface GDPInsightsProps {
  dataType?: DataType;
  priceType?: PriceType;
}

export const GDPInsights = ({ dataType, priceType }: GDPInsightsProps) => {
  const { insights, loading, error } = useIndicatorInsights('real_gdp_growth');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading insights...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">Error loading insights: {error}</div>
        </CardContent>
      </Card>
    );
  }

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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayInsights.map((insight, index) => (
            <div key={insight.id || index} className="border-l-4 border-blue-200 pl-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.content}
              </p>
            </div>
          ))}
          
          {insights.length > 3 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Showing 3 of {insights.length} insights
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
