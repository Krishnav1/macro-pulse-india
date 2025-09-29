import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lightbulb, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIndicatorInsights } from '@/hooks/useIndicatorInsights';

const RealGDPGrowthInsights = () => {
  const navigate = useNavigate();
  const { insights, loading, error } = useIndicatorInsights('real_gdp_growth');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center">Loading insights...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="text-center text-red-500">Error loading insights: {error}</div>
        </div>
      </div>
    );
  }

  // Use database insights or fallback content
  const displayInsights = insights.length > 0 
    ? insights
    : [
        {
          id: 1,
          content: "India's GDP growth has shown remarkable resilience, consistently outperforming global averages despite various economic challenges. The economy has successfully navigated post-pandemic disruptions while maintaining strong fundamentals across consumption, investment, and export sectors.",
          order_index: 1
        },
        {
          id: 2,
          content: "Private Final Consumption Expenditure (PFCE) remains the largest contributor to GDP, typically accounting for 55-60% of total economic output. Strong consumer confidence and rising disposable incomes continue to drive domestic demand, supported by favorable demographics and urbanization trends.",
          order_index: 2
        },
        {
          id: 3,
          content: "Government Final Consumption Expenditure (GFCE) and Gross Fixed Capital Formation (GFCF) have been key policy levers for sustaining growth momentum. The government's focus on infrastructure development through programs like National Infrastructure Pipeline has provided crucial support to economic expansion.",
          order_index: 3
        },
        {
          id: 4,
          content: "The services sector, including IT, financial services, and telecommunications, continues to be a major growth driver, contributing significantly to India's position as a global services hub. Digital transformation initiatives have further strengthened this sector's contribution to GDP.",
          order_index: 4
        },
        {
          id: 5,
          content: "Manufacturing sector growth has been supported by government initiatives like Make in India and Production Linked Incentive (PLI) schemes. However, the sector remains sensitive to global supply chain disruptions and commodity price fluctuations, requiring continued policy support.",
          order_index: 5
        },
        {
          id: 6,
          content: "Export performance has been mixed, with services exports showing strong growth while merchandise exports face headwinds from global economic slowdown and geopolitical tensions. The government's focus on export diversification and market expansion remains crucial for sustained growth.",
          order_index: 6
        },
        {
          id: 7,
          content: "Investment climate has improved significantly with reforms in ease of doing business, corporate tax reductions, and infrastructure development. Foreign Direct Investment (FDI) flows have remained robust, particularly in technology and manufacturing sectors.",
          order_index: 7
        },
        {
          id: 8,
          content: "Rural economy continues to play a vital role in overall GDP growth, with agriculture and allied activities providing employment to nearly half the workforce. Monsoon patterns, agricultural reforms, and rural infrastructure development significantly impact overall economic performance.",
          order_index: 8
        }
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/indicators/real-gdp-growth')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to GDP Growth
          </Button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Real GDP Growth Insights</h1>
              <p className="text-muted-foreground">
                Comprehensive analysis of India's economic growth patterns and trends
              </p>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid gap-6">
          {displayInsights.map((insight, index) => (
            <Card key={insight.id || index} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Key Insight #{index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {insight.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Economic Context */}
        <Card className="mt-8 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <TrendingUp className="h-5 w-5" />
              Economic Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-blue-700 dark:text-blue-300">
              <div>
                <strong>GDP Formula:</strong> GDP = C (PFCE) + G (GFCE) + I (GFCF) + ΔS (Changes in Stocks) + (X - M) (Net Exports)
              </div>
              <div>
                <strong>Price Types:</strong>
                <ul className="mt-2 ml-4 space-y-1">
                  <li>• <strong>Constant Prices:</strong> GDP adjusted for inflation, shows real economic growth</li>
                  <li>• <strong>Current Prices:</strong> GDP at market prices, includes inflation effects</li>
                </ul>
              </div>
              <div>
                <strong>Quarterly Periods:</strong> Q1 (Apr-Jun), Q2 (Jul-Sep), Q3 (Oct-Dec), Q4 (Jan-Mar)
              </div>
              <div>
                <strong>Data Source:</strong> National Statistical Office (NSO), Ministry of Statistics and Programme Implementation
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealGDPGrowthInsights;
