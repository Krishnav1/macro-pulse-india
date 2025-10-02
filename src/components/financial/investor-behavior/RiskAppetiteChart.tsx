// =====================================================
// RISK APPETITE CHART
// Shows equity vs non-equity allocation by age group
// =====================================================

import { useAgeGroupAnalysis } from '@/hooks/investor-behavior/useAgeGroupAnalysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function RiskAppetiteChart() {
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

  const chartData = analysis.map(group => ({
    ageGroup: group.age_group,
    'Equity': Math.round(group.equity_aum),
    'Non-Equity': Math.round(group.non_equity_aum),
    equityPct: group.equity_percentage
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      const equityPct = payload[0]?.payload?.equityPct || 0;
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
            <div className="pt-2 mt-2 border-t border-border">
              <div className="font-semibold">Total: ₹{total.toLocaleString('en-IN')} Cr</div>
              <div className="text-xs text-muted-foreground mt-1">
                Risk Appetite: {equityPct >= 50 ? 'High' : equityPct >= 30 ? 'Medium' : 'Low'} ({equityPct.toFixed(1)}% equity)
              </div>
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
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="ageGroup" 
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--foreground))' }}
            label={{ value: 'AUM (₹ Crore)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="Equity" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Non-Equity" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Interpretation */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h4 className="font-semibold mb-2">💼 Interpretation:</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>• <span className="text-green-600 font-medium">Taller green bars</span> = higher equity allocation (aggressive risk appetite)</li>
          <li>• <span className="text-purple-600 font-medium">Taller purple bars</span> = higher debt/hybrid allocation (conservative approach)</li>
          <li>• Compare across age groups to identify risk-seeking vs risk-averse segments</li>
          <li>• HNI and Retail typically show higher equity allocation than Corporates/Banks</li>
        </ul>
      </div>
    </div>
  );
}
