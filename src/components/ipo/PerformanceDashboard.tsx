// Performance Dashboard - 3-Stage IPO Analysis

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { IPOStats } from '@/types/ipo';

interface PerformanceDashboardProps {
  stats: IPOStats;
}

export function PerformanceDashboard({ stats }: PerformanceDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Listing Day Open Analysis */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Listing Day Open Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stocks Listed in Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">
                  {stats.openProfitCount}
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                IPOs opened above issue price
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stocks Listed in Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-red-600">
                  {stats.openLossCount}
                </div>
                <TrendingDown className="h-8 w-8 text-red-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                IPOs opened below issue price
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Listing Gains (Open)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold ${stats.avgOpenGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.avgOpenGain >= 0 ? '+' : ''}{stats.avgOpenGain.toFixed(2)}%
                </div>
                <Activity className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Average gain at market open
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Listing Day Close Analysis */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Listing Day Closing Analysis
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

      {/* Till Date Analysis */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-500" />
          Till Date Analysis
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
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg">Performance Summary</CardTitle>
          <CardDescription>Key insights from the analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
            <p className="text-sm">
              <strong>{stats.closeProfitCount}</strong> out of <strong>{stats.closeProfitCount + stats.closeLossCount}</strong> IPOs closed in profit on listing day 
              ({stats.closeProfitCount > 0 ? ((stats.closeProfitCount / (stats.closeProfitCount + stats.closeLossCount)) * 100).toFixed(1) : 0}% success rate)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            <p className="text-sm">
              Currently, <strong>{stats.currentProfitCount}</strong> IPOs are trading above their issue price, showing 
              <strong className={stats.successRate >= 50 ? 'text-green-600' : 'text-red-600'}> {stats.successRate.toFixed(1)}%</strong> long-term success rate
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
            <p className="text-sm">
              Average returns improved from <strong>{stats.avgOpenGain.toFixed(2)}%</strong> at open to 
              <strong> {stats.avgCloseGain.toFixed(2)}%</strong> at close, currently at 
              <strong className={stats.avgCurrentGain >= 0 ? 'text-green-600' : 'text-red-600'}> {stats.avgCurrentGain.toFixed(2)}%</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
