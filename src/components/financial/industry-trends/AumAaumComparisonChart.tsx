// =====================================================
// AUM VS AAUM COMPARISON CHART
// Bar chart comparing quarter-end vs average AUM
// =====================================================

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface AumAaumComparisonChartProps {
  selectedQuarter: string;
}

interface ComparisonData {
  category: string;
  AUM: number;
  AAUM: number;
}

export function AumAaumComparisonChart({ selectedQuarter }: AumAaumComparisonChartProps) {
  const [data, setData] = useState<ComparisonData[]>([]);
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
          .ilike('category_display_name', '%- TOTAL')
          .not('category_display_name', 'ilike', '%Grand TOTAL%');

        if (error) throw error;

        if (!subtotals || subtotals.length === 0) {
          setData([]);
          return;
        }

        // Map to chart data
        const chartData: ComparisonData[] = subtotals.map((row: any) => ({
          category: row.parent_category,
          AUM: parseFloat(row.aum_crore) / 100000, // Convert to lakhs
          AAUM: parseFloat(row.aaum_crore) / 100000
        })).sort((a: ComparisonData, b: ComparisonData) => b.AUM - a.AUM);

        setData(chartData);
      } catch (error) {
        console.error('Error fetching AUM/AAUM comparison:', error);
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
        <Skeleton className="h-full w-full" />
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-sm font-medium">
                ₹{entry.value.toFixed(2)}L Cr
              </span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
            Difference: ₹{Math.abs(payload[0].value - payload[1].value).toFixed(2)}L Cr
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="category"
            className="text-xs"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            label={{
              value: 'AUM (₹ Lakh Crore)',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'currentColor' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar
            dataKey="AUM"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
          <Bar
            dataKey="AAUM"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Interpretation */}
      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">AUM</span> = Assets Under Management as of quarter-end date (snapshot value)
          <br />
          <span className="font-semibold text-foreground">AAUM</span> = Average AUM during the quarter (daily average)
        </p>
      </div>
    </div>
  );
}
