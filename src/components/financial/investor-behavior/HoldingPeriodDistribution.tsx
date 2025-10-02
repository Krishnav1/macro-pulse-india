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
    <div className="h-full flex flex-col space-y-4">
      <ResponsiveContainer width="100%" height="75%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="ageGroup" 
            angle={-35}
            textAnchor="end"
            height={80}
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            label={{ value: 'Investor Type', position: 'insideBottom', offset: -10, fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            label={{ value: 'AUM (₹ Crore)', angle: -90, position: 'insideLeft', offset: 10, fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="square"
            iconSize={12}
          />
          <Bar dataKey="0-1 Month" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
          <Bar dataKey="1-3 Months" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
          <Bar dataKey="3-6 Months" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="6-12 Months" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
          <Bar dataKey="12-24 Months" stackId="a" fill="#84cc16" radius={[0, 0, 0, 0]} />
          <Bar dataKey=">24 Months" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Interpretation */}
      <div className="bg-muted/50 rounded-lg p-3 text-sm flex-shrink-0">
        <p className="font-semibold mb-1.5 text-xs">📊 How to Read:</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-green-600 font-medium">Green bars</span> show long-term committed investors. 
          <span className="text-red-600 font-medium"> Red/Orange bars</span> indicate short-term holdings with potential redemption risk. 
          Taller bars = larger investor base.
        </p>
      </div>
    </div>
  );
}
