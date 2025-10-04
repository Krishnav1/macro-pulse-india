// Index Comparison Component - Bar chart comparing multiple indices

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { MarketIndex } from '@/types/equity-markets.types';

interface IndexComparisonProps {
  indices: MarketIndex[];
  loading: boolean;
}

export function IndexComparison({ indices, loading }: IndexComparisonProps) {
  if (loading) {
    return (
      <div className="dashboard-card">
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    );
  }

  const chartData = indices.map(index => ({
    name: index.name.replace('NIFTY ', ''),
    change: index.change_percent || 0,
  }));

  const getBarColor = (value: number) => {
    if (value >= 2) return 'hsl(142, 76%, 36%)'; // Dark green
    if (value >= 0.5) return 'hsl(142, 76%, 50%)'; // Light green
    if (value >= -0.5) return 'hsl(0, 0%, 50%)'; // Gray
    if (value >= -2) return 'hsl(0, 84%, 70%)'; // Light red
    return 'hsl(0, 84%, 60%)'; // Dark red
  };

  return (
    <div className="dashboard-card">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            label={{ value: 'Change (%)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value.toFixed(2)}%`, 'Change']}
          />
          <Bar dataKey="change" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.change)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }}></div>
          <span className="text-xs text-muted-foreground">Strong Gain (+2%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(142, 76%, 50%)' }}></div>
          <span className="text-xs text-muted-foreground">Moderate Gain (+0.5 to +2%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 0%, 50%)' }}></div>
          <span className="text-xs text-muted-foreground">Neutral (-0.5 to +0.5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 84%, 70%)' }}></div>
          <span className="text-xs text-muted-foreground">Moderate Loss (-0.5 to -2%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }}></div>
          <span className="text-xs text-muted-foreground">Strong Loss (-2%+)</span>
        </div>
      </div>
    </div>
  );
}
