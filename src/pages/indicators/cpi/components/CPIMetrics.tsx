import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

// Mock data for CPI metrics
const mockLatestData = {
  date: '2024-01',
  inflation: 5.1,
  index: 158.5,
  momInflation: 0.8
};

const mockPreviousData = {
  date: '2023-12',
  inflation: 5.7,
  index: 157.2,
  momInflation: 0.5
};

interface CPIMetricsProps {
  geography: 'rural' | 'urban' | 'combined';
}

export const CPIMetrics = ({ geography }: CPIMetricsProps) => {
  const latestData = mockLatestData;
  const previousData = mockPreviousData;
  const lastChange = latestData.inflation - previousData.inflation;

  const getTrendIcon = () => {
    if (lastChange > 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    } else if (lastChange < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    }
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <>
      {/* Main Indicator Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              CPI Inflation
              {getTrendIcon()}
            </CardTitle>
            <Badge variant="secondary" className="bg-orange-500/10 border-orange-500/20 border">
              Price Index
            </Badge>
          </div>
          <CardDescription>
            Source: MOSPI | Last Updated: {new Date(latestData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">
                {latestData.inflation.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                YoY Inflation
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-muted-foreground">
                {lastChange > 0 ? '+' : ''}{lastChange.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Last Change
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-foreground">
                {latestData.index.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                CPI Index
              </div>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-foreground">
                {latestData.momInflation.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                MoM Inflation
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inflation Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-4 w-4" />
            Inflation Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Food & Beverages:</span>
            <span className="font-semibold">2.1%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Housing:</span>
            <span className="font-semibold">3.2%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transport:</span>
            <span className="font-semibold">-0.8%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Core CPI:</span>
            <span className="font-semibold">3.1%</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
