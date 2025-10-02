// =====================================================
// HOLDING PERIOD TREND CHART
// Shows how holding periods evolve over time
// =====================================================

import { useHoldingPeriodTrend } from '@/hooks/investor-behavior/useInvestorBehaviorData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function HoldingPeriodTrendChart() {
  const { trend, isLoading } = useHoldingPeriodTrend();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!trend || trend.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  const chartData = trend.map(item => ({
    quarter: item.quarter_label,
    '0-1 Month': Math.round(item['0-1_month']),
    '1-3 Months': Math.round(item['1-3_months']),
    '3-6 Months': Math.round(item['3-6_months']),
    '6-12 Months': Math.round(item['6-12_months']),
    '12-24 Months': Math.round(item['12-24_months']),
    '>24 Months': Math.round(item['above_24_months'])
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            {payload.reverse().map((entry: any, index: number) => {
              const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';
              return (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}:</span>
                  </div>
                  <div className="font-medium">
                    ₹{entry.value.toLocaleString('en-IN')} Cr ({percentage}%)
                  </div>
                </div>
              );
            })}
            <div className="pt-2 mt-2 border-t border-border font-semibold">
              Total: ₹{total.toLocaleString('en-IN')} Cr
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="color0-1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="color1-3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="color3-6" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="color6-12" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#eab308" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="color12-24" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#84cc16" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="color24plus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="quarter" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--foreground))' }}
            label={{ value: 'AUM (₹ Crore)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <Area type="monotone" dataKey="0-1 Month" stackId="1" stroke="#ef4444" fill="url(#color0-1)" />
          <Area type="monotone" dataKey="1-3 Months" stackId="1" stroke="#f97316" fill="url(#color1-3)" />
          <Area type="monotone" dataKey="3-6 Months" stackId="1" stroke="#f59e0b" fill="url(#color3-6)" />
          <Area type="monotone" dataKey="6-12 Months" stackId="1" stroke="#eab308" fill="url(#color6-12)" />
          <Area type="monotone" dataKey="12-24 Months" stackId="1" stroke="#84cc16" fill="url(#color12-24)" />
          <Area type="monotone" dataKey=">24 Months" stackId="1" stroke="#22c55e" fill="url(#color24plus)" />
        </AreaChart>
      </ResponsiveContainer>

      {/* Interpretation */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h4 className="font-semibold mb-2">📈 Interpretation:</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>• <span className="text-green-600 font-medium">Growing green area</span> = investors becoming more long-term oriented (positive)</li>
          <li>• <span className="text-red-600 font-medium">Growing red/orange area</span> = increasing short-term holdings (potential churn risk)</li>
          <li>• Overall height growth = total AUM expansion</li>
          <li>• Shifts in composition reveal changing investor behavior and market sentiment</li>
        </ul>
      </div>
    </div>
  );
}
