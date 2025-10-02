// =====================================================
// HOLDING PERIOD DISTRIBUTION CHART
// Stacked bar chart showing holding periods by age group
// =====================================================

import { useAgeGroupAnalysis } from '@/hooks/investor-behavior/useAgeGroupAnalysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function HoldingPeriodDistribution() {
  const { analysis, isLoading } = useAgeGroupAnalysis();

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!analysis || analysis.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  // Transform data for stacked bar chart
  const chartData = analysis.map(group => ({
    ageGroup: group.age_group,
    '0-1 Month': Math.round(group.holding_distribution['0-1']),
    '1-3 Months': Math.round(group.holding_distribution['1-3']),
    '3-6 Months': Math.round(group.holding_distribution['3-6']),
    '6-12 Months': Math.round(group.holding_distribution['6-12']),
    '12-24 Months': Math.round(group.holding_distribution['12-24']),
    '>24 Months': Math.round(group.holding_distribution['>24'])
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
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
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 100, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
            <XAxis 
              dataKey="ageGroup" 
              angle={-30}
              textAnchor="end"
              height={70}
              interval={0}
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
              label={{ 
                value: 'AUM (₹ Crore)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }
              }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }}
              iconType="square"
              iconSize={10}
            />
            <Bar dataKey="0-1 Month" stackId="a" fill="#ef4444" />
            <Bar dataKey="1-3 Months" stackId="a" fill="#f97316" />
            <Bar dataKey="3-6 Months" stackId="a" fill="#f59e0b" />
            <Bar dataKey="6-12 Months" stackId="a" fill="#eab308" />
            <Bar dataKey="12-24 Months" stackId="a" fill="#84cc16" />
            <Bar dataKey=">24 Months" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interpretation - Right below chart */}
      <div className="bg-muted/50 rounded-lg p-2.5 mt-2 text-xs">
        <p className="font-semibold mb-1">📊 How to Read:</p>
        <p className="text-muted-foreground leading-snug">
          <span className="text-green-600 font-medium">Green</span> = long-term investors. 
          <span className="text-red-600 font-medium"> Red/Orange</span> = short-term (redemption risk). 
          Taller bars = larger base.
        </p>
      </div>
    </div>
  );
}
