// =====================================================
// CATEGORY BREAKDOWN CHART
// Donut chart for current quarter breakdown
// =====================================================

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useCategoryBreakdown } from '@/hooks/quarterly-aum/useCategoryAnalysis';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const COLORS = {
  Equity: '#10b981',
  Debt: '#3b82f6',
  Hybrid: '#8b5cf6',
  Other: '#f59e0b'
};

export function CategoryBreakdownChart() {
  const { breakdown, isLoading, error } = useCategoryBreakdown();

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    );
  }

  if (breakdown.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>No data available.</AlertDescription>
      </Alert>
    );
  }

  const chartData = breakdown.map(item => ({
    name: item.parent_category,
    value: item.aum_crore / 100000, // Convert to Lakh Crores
    percentage: item.percentage,
    qoq: item.qoq_change_percent
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null; // Don't show label for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: any, name: string, props: any) => [
              `₹${value.toFixed(2)} L Cr (${props.payload.percentage.toFixed(1)}%)`,
              name
            ]}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => {
              const item = entry.payload;
              const qoqText = item.qoq !== null && item.qoq !== undefined
                ? ` (${item.qoq >= 0 ? '+' : ''}${item.qoq.toFixed(1)}% QoQ)`
                : '';
              return `${value}${qoqText}`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="text-center -mt-48 mb-32 pointer-events-none">
        <div className="text-sm text-muted-foreground">Total AUM</div>
        <div className="text-2xl font-bold">₹{total.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">Lakh Crore</div>
      </div>

      {/* Breakdown Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-2">Category</th>
              <th className="text-right p-2">AUM</th>
              <th className="text-right p-2">Share</th>
              <th className="text-right p-2">QoQ</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[item.parent_category as keyof typeof COLORS] }}
                  />
                  {item.parent_category}
                </td>
                <td className="text-right p-2">₹{(item.aum_crore / 100000).toFixed(2)} L Cr</td>
                <td className="text-right p-2">{item.percentage.toFixed(1)}%</td>
                <td className={`text-right p-2 font-medium ${
                  item.qoq_change_percent && item.qoq_change_percent >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {item.qoq_change_percent !== null 
                    ? `${item.qoq_change_percent >= 0 ? '+' : ''}${item.qoq_change_percent.toFixed(2)}%`
                    : '-'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
