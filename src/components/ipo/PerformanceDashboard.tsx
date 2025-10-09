// Performance Dashboard - 2-Stage IPO Analysis (Listing Day + Current Performance)

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { IPOStats } from '@/types/ipo';
interface PerformanceDashboardProps {
  stats: IPOStats;
}

export function PerformanceDashboard({ stats }: PerformanceDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Listing Day Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Listing Day Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stocks Closed in Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">
                  {stats.closeProfitCount}
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                IPOs closed above issue price
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stocks Closed in Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-red-600">
                  {stats.closeLossCount}
                </div>
                <TrendingDown className="h-8 w-8 text-red-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                IPOs closed below issue price
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                End of Listing Day Avg Gain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold ${stats.avgCloseGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.avgCloseGain >= 0 ? '+' : ''}{stats.avgCloseGain.toFixed(2)}%
                </div>
                <Activity className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Average gain at market close
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current Performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-500" />
          Current Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stocks in Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">
                  {stats.currentProfitCount}
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Currently trading above issue price
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stocks in Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-red-600">
                  {stats.currentLossCount}
                </div>
                <TrendingDown className="h-8 w-8 text-red-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Currently trading below issue price
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Returns Till Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold ${stats.avgCurrentGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.avgCurrentGain >= 0 ? '+' : ''}{stats.avgCurrentGain.toFixed(2)}%
                </div>
                <Activity className="h-8 w-8 text-indigo-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Average current return from issue price
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Insights */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Performance Summary</CardTitle>
          <CardDescription>Key insights from the analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
            <p className="text-sm text-foreground">
              <strong className="text-foreground">{stats.closeProfitCount}</strong> out of <strong className="text-foreground">{stats.closeProfitCount + stats.closeLossCount}</strong> IPOs closed in profit on listing day 
              (<strong className="text-foreground">{stats.closeProfitCount > 0 ? ((stats.closeProfitCount / (stats.closeProfitCount + stats.closeLossCount)) * 100).toFixed(1) : 0}%</strong> success rate)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <p className="text-sm text-foreground">
              Currently, <strong className="text-foreground">{stats.currentProfitCount}</strong> IPOs are trading above their issue price, showing 
              <strong className={stats.successRate >= 50 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}> {stats.successRate.toFixed(1)}%</strong> long-term success rate
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
            <p className="text-sm text-foreground">
              Average returns improved from <strong className="text-foreground">{stats.avgOpenGain.toFixed(2)}%</strong> at open to 
              <strong className="text-foreground"> {stats.avgCloseGain.toFixed(2)}%</strong> at close, currently at 
              <strong className={stats.avgCurrentGain >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}> {stats.avgCurrentGain.toFixed(2)}%</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
