import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { CashProvisionalData } from '@/types/fii-dii';

interface ContextualHelpProps {
  data: CashProvisionalData[];
  view: 'yearly' | 'monthly' | 'weekly' | 'daily';
}

export function ContextualHelp({ data, view }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!data || data.length === 0) return null;

  // Generate insights based on data
  const generateInsights = () => {
    const totalFII = data.reduce((sum, item) => sum + item.fii_net, 0);
    const totalDII = data.reduce((sum, item) => sum + item.dii_net, 0);
    const totalFlow = totalFII + totalDII;
    
    const insights = [];

    // Flow direction insight
    if (totalFlow > 0) {
      insights.push({
        type: 'positive',
        icon: <TrendingUp className="h-4 w-4" />,
        text: `Net inflow of ₹${Math.abs(totalFlow).toFixed(0)} Cr indicates positive market sentiment`
      });
    } else if (totalFlow < 0) {
      insights.push({
        type: 'negative',
        icon: <TrendingDown className="h-4 w-4" />,
        text: `Net outflow of ₹${Math.abs(totalFlow).toFixed(0)} Cr suggests profit booking or risk aversion`
      });
    }

    // Dominance insight
    if (Math.abs(totalFII) > Math.abs(totalDII)) {
      insights.push({
        type: 'info',
        icon: <Info className="h-4 w-4" />,
        text: `FII activity dominates with ${((Math.abs(totalFII) / (Math.abs(totalFII) + Math.abs(totalDII))) * 100).toFixed(1)}% of total flows`
      });
    } else {
      insights.push({
        type: 'info',
        icon: <Info className="h-4 w-4" />,
        text: `DII activity dominates with ${((Math.abs(totalDII) / (Math.abs(totalFII) + Math.abs(totalDII))) * 100).toFixed(1)}% of total flows`
      });
    }

    // Volatility insight
    const dailyChanges = data.slice(1).map((item, idx) => {
      const prevItem = data[idx];
      return Math.abs((item.fii_net + item.dii_net) - (prevItem.fii_net + prevItem.dii_net));
    });
    const avgVolatility = dailyChanges.reduce((sum, change) => sum + change, 0) / dailyChanges.length;
    
    if (avgVolatility > 2000) {
      insights.push({
        type: 'warning',
        icon: <AlertCircle className="h-4 w-4" />,
        text: `High volatility detected with average daily swing of ₹${avgVolatility.toFixed(0)} Cr`
      });
    }

    return insights;
  };

  const insights = generateInsights();

  const getViewDescription = () => {
    switch (view) {
      case 'daily':
        return 'Single day analysis showing segment-wise breakdown';
      case 'weekly':
        return 'Weekly aggregation showing 5-day trading patterns';
      case 'monthly':
        return 'Daily data for the selected month showing intramonth trends';
      case 'yearly':
        return 'Monthly aggregation for the financial year showing seasonal patterns';
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Info className="h-4 w-4" />
        Help & Insights
      </Button>

      {isOpen && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Understanding FII/DII Data</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current View Explanation */}
            <div>
              <h4 className="font-semibold mb-2">Current View: {view.charAt(0).toUpperCase() + view.slice(1)}</h4>
              <p className="text-sm text-muted-foreground">{getViewDescription()}</p>
            </div>

            {/* Data Definitions */}
            <div>
              <h4 className="font-semibold mb-3">Data Segments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="font-medium">Cash Market</p>
                      <p className="text-muted-foreground">Delivery-based equity & debt trades</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="font-medium">F&O Indices</p>
                      <p className="text-muted-foreground">NIFTY, SENSEX derivatives</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="font-medium">F&O Stocks</p>
                      <p className="text-muted-foreground">Individual stock futures & options</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                    <div>
                      <p className="font-medium">Net Flow</p>
                      <p className="text-muted-foreground">Gross Purchase - Gross Sales</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div>
              <h4 className="font-semibold mb-3">Key Insights</h4>
              <div className="space-y-2">
                {insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <div className={`mt-0.5 ${
                      insight.type === 'positive' ? 'text-green-600' :
                      insight.type === 'negative' ? 'text-red-600' :
                      insight.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {insight.icon}
                    </div>
                    <p className="text-muted-foreground">{insight.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Interpretation Guide */}
            <div>
              <h4 className="font-semibold mb-3">Interpretation Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-green-600 mb-1">Positive Flow (Inflow)</p>
                  <p className="text-muted-foreground">Net buying indicates bullish sentiment and confidence in Indian markets</p>
                </div>
                <div>
                  <p className="font-medium text-red-600 mb-1">Negative Flow (Outflow)</p>
                  <p className="text-muted-foreground">Net selling suggests profit booking, risk aversion, or better opportunities elsewhere</p>
                </div>
                <div>
                  <p className="font-medium text-blue-600 mb-1">FII Dominance</p>
                  <p className="text-muted-foreground">Foreign investors driving market direction, sensitive to global factors</p>
                </div>
                <div>
                  <p className="font-medium text-orange-600 mb-1">DII Dominance</p>
                  <p className="text-muted-foreground">Domestic institutions leading, indicating local confidence and liquidity</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
