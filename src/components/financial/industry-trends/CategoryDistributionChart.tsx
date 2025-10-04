// =====================================================
// CATEGORY DISTRIBUTION CHART
// Donut chart showing AUM breakdown by category
// =====================================================

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryDistributionChartProps {
  selectedQuarter: string;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const COLORS = {
  Equity: '#3b82f6',   // blue
  Debt: '#10b981',     // green
  Hybrid: '#f59e0b',   // amber
  Other: '#8b5cf6'     // purple
};

export function CategoryDistributionChart({ selectedQuarter }: CategoryDistributionChartProps) {
  const [data, setData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedQuarter) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get subtotal rows for the selected quarter
        const { data: subtotals, error } = await (supabase as any)
          .from('quarterly_aum_data')
          .select('*')
          .eq('quarter_end_date', selectedQuarter)
          .eq('is_subtotal', true);

        if (error) throw error;

        if (!subtotals || subtotals.length === 0) {
          setData([]);
          return;
        }

        // Calculate total
        const total = subtotals.reduce((sum: number, row: any) => sum + parseFloat(row.aum_crore), 0);

        // Map to chart data
        const chartData: CategoryData[] = subtotals.map((row: any) => {
          const value = parseFloat(row.aum_crore);
          return {
            name: row.parent_category,
            value: value,
            percentage: (value / total) * 100,
            color: COLORS[row.parent_category as keyof typeof COLORS] || '#6b7280'
          };
        }).sort((a: CategoryData, b: CategoryData) => b.value - a.value);

        setData(chartData);
      } catch (error) {
        console.error('Error fetching category distribution:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedQuarter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Skeleton className="h-[250px] w-[250px] rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <p>No data available for selected quarter</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ₹{(data.value / 100000).toFixed(2)}L Cr
          </p>
          <p className="text-sm font-medium" style={{ color: data.color }}>
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-sm">
                {value}: ₹{(entry.payload.value / 100000).toFixed(2)}L Cr
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        {data.map((category) => (
          <div key={category.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {category.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
