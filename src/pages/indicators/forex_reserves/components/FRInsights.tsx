import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { useForexReserves } from '@/hooks/useForexReserves';

interface FRInsightsProps {
  unit: 'usd' | 'inr';
  selectedFY: string | null;
}

export const FRInsights = ({ unit, selectedFY }: FRInsightsProps) => {
  const { data: forexData, loading } = useForexReserves(unit, 'recent', selectedFY);

  const generateInsights = () => {
    if (!forexData || forexData.length < 2) return [];

    const latest = forexData[0];
    const previous = forexData[1];
    const insights = [];

    const unitSuffix = unit === 'usd' ? 'mn' : 'crore';
    const totalField = `total_reserves_${unit}_${unitSuffix}`;
    const fcaField = `foreign_currency_assets_${unit}_${unitSuffix}`;
    const goldField = `gold_${unit}_${unitSuffix}`;

    // Total reserves change
    const totalChange = ((latest[totalField] - previous[totalField]) / previous[totalField]) * 100;
    if (Math.abs(totalChange) > 0.5) {
      insights.push({
        type: totalChange > 0 ? 'positive' : 'negative',
        title: `Total Reserves ${totalChange > 0 ? 'Increased' : 'Decreased'}`,
        description: `Reserves ${totalChange > 0 ? 'rose' : 'fell'} by ${Math.abs(totalChange).toFixed(2)}% week-over-week, indicating ${totalChange > 0 ? 'strengthening' : 'pressure on'} India's external position.`,
        icon: totalChange > 0 ? TrendingUp : TrendingDown
      });
    }

    // FCA vs Gold composition
    const fcaShare = (latest[fcaField] / latest[totalField]) * 100;
    const goldShare = (latest[goldField] / latest[totalField]) * 100;
    
    if (goldShare > 8) {
      insights.push({
        type: 'info',
        title: 'Gold Holdings Above Average',
        description: `Gold comprises ${goldShare.toFixed(1)}% of total reserves, above the typical 6-8% range, reflecting RBI's diversification strategy.`,
        icon: Info
      });
    }

    // FCA dominance
    if (fcaShare > 85) {
      insights.push({
        type: 'warning',
        title: 'High FCA Concentration',
        description: `Foreign Currency Assets account for ${fcaShare.toFixed(1)}% of reserves, indicating high exposure to USD and major currency movements.`,
        icon: AlertTriangle
      });
    }

    // Import cover analysis (mock calculation)
    const importCover = latest[totalField] / (unit === 'usd' ? 50000 : 4200000); // Mock monthly imports
    if (importCover > 12) {
      insights.push({
        type: 'positive',
        title: 'Strong Import Cover',
        description: `Current reserves provide approximately ${importCover.toFixed(1)} months of import cover, well above the IMF recommended 3-month minimum.`,
        icon: TrendingUp
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const insights = generateInsights();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'negative':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'warning':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Key Insights
        </CardTitle>
        {selectedFY && (
          <div className="text-sm text-muted-foreground">
            Analysis for FY{selectedFY}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground py-4">
            Generating insights...
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            Insufficient data for insights
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <IconComponent className={`h-4 w-4 ${getIconColor(insight.type)}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Context */}
        <div className="mt-6 p-3 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Context</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Reserves managed by RBI for external stability</div>
            <div>• Adequate reserves: 3+ months of imports</div>
            <div>• Components: FCA (~85%), Gold (~8%), SDRs, IMF position</div>
            <div>• Used for currency intervention and confidence</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
