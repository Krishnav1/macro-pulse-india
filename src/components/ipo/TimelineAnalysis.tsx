// Timeline Analysis Component - Month-wise IPO trends

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IPOListing, MonthlyTrend } from '@/types/ipo';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

interface TimelineAnalysisProps {
  ipos: IPOListing[];
}

export function TimelineAnalysis({ ipos }: TimelineAnalysisProps) {
  const monthlyData = useMemo(() => {
    const months: Record<string, MonthlyTrend> = {};

    ipos.forEach(ipo => {
      const date = new Date(ipo.listing_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthName,
          year: date.getFullYear(),
          ipoCount: 0,
          totalIssueSize: 0,
          avgListingGain: 0,
          avgCurrentGain: 0,
        };
      }

      months[monthKey].ipoCount++;
      months[monthKey].totalIssueSize += ipo.issue_size || 0;
    });

    // Calculate averages
    Object.keys(months).forEach(monthKey => {
      const monthIPOs = ipos.filter(ipo => {
        const date = new Date(ipo.listing_date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return key === monthKey;
      });

      const listingGains = monthIPOs
        .filter(ipo => ipo.listing_gain_percent !== null)
        .map(ipo => ipo.listing_gain_percent!);

      const currentGains = monthIPOs
        .filter(ipo => ipo.current_gain_percent !== null)
        .map(ipo => ipo.current_gain_percent!);

      months[monthKey].avgListingGain = listingGains.length > 0
        ? listingGains.reduce((sum, gain) => sum + gain, 0) / listingGains.length
        : 0;

      months[monthKey].avgCurrentGain = currentGains.length > 0
        ? currentGains.reduce((sum, gain) => sum + gain, 0) / currentGains.length
        : 0;
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => data);
  }, [ipos]);

  // Calculate cumulative data
  const cumulativeData = useMemo(() => {
    let cumulativeCount = 0;
    let cumulativeIssueSize = 0;

    return monthlyData.map(month => {
      cumulativeCount += month.ipoCount;
      cumulativeIssueSize += month.totalIssueSize;

      return {
        ...month,
        cumulativeCount,
        cumulativeIssueSize,
      };
    });
  }, [monthlyData]);

  // Top performing months
  const topMonths = useMemo(() => {
    return [...monthlyData]
      .sort((a, b) => b.avgCurrentGain - a.avgCurrentGain)
      .slice(0, 5);
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      {/* Monthly IPO Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly IPO Count</CardTitle>
            <CardDescription>Number of IPOs listed each month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="ipoCount" name="IPO Count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Issue Size</CardTitle>
            <CardDescription>Total capital raised per month (₹ Crores)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalIssueSize" 
                  name="Issue Size (Cr)" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Trends</CardTitle>
          <CardDescription>Average listing and current gains by month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11} 
                angle={-45} 
                textAnchor="end" 
                height={80} 
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgListingGain" 
                name="Avg Listing Gain %" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="avgCurrentGain" 
                name="Avg Current Gain %" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cumulative Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative IPO Activity</CardTitle>
          <CardDescription>Running total of IPOs and capital raised</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11} 
                angle={-45} 
                textAnchor="end" 
                height={80} 
              />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="cumulativeCount" 
                name="Cumulative IPO Count" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cumulativeIssueSize" 
                name="Cumulative Issue Size (Cr)" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Months */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top Performing Months
          </CardTitle>
          <CardDescription>Months with highest average current gains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topMonths.map((month, index) => (
              <div 
                key={month.month} 
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      {month.month}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {month.ipoCount} IPOs | ₹{month.totalIssueSize.toFixed(0)} Cr
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    +{month.avgCurrentGain.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Current Gain
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
