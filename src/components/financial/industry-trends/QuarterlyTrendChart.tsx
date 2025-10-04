// =====================================================
// QUARTERLY TREND CHART
// Line chart showing last 8 quarters trend by category
// =====================================================

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface QuarterlyTrendChartProps {
  selectedQuarter: string;
}

interface TrendData {
  quarter: string;
  Equity: number;
  Debt: number;
  Hybrid: number;
  Other: number;
}

const COLORS = {
  Equity: '#3b82f6',
  Debt: '#10b981',
  Hybrid: '#f59e0b',
  Other: '#8b5cf6'
};

export function QuarterlyTrendChart({ selectedQuarter }: QuarterlyTrendChartProps) {
  const [data, setData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    Equity: true,
    Debt: true,
    Hybrid: true,
    Other: true
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get all quarters
        const { data: quarters, error: quartersError } = await (supabase as any)
          .from('quarterly_aum_data')
          .select('quarter_end_date, quarter_label')
          .order('quarter_end_date', { ascending: false })
          .limit(100);

        if (quartersError) throw quartersError;

        // Get unique quarters
        const uniqueQuarters = Array.from(
          new Map(quarters.map((item: any) => [item.quarter_end_date, item])).values()
        ).slice(0, 8).reverse();

        // Fetch subtotals for each quarter
        const trendData: TrendData[] = [];

        for (const quarter of uniqueQuarters) {
          const { data: subtotals, error } = await (supabase as any)
            .from('quarterly_aum_data')
            .select('*')
            .eq('quarter_end_date', quarter.quarter_end_date)
            .eq('is_subtotal', true);

          if (error) continue;

          const dataPoint: any = {
            quarter: quarter.quarter_label,
            Equity: 0,
            Debt: 0,
            Hybrid: 0,
            Other: 0
          };

          subtotals?.forEach((row: any) => {
            const category = row.parent_category;
            if (category in dataPoint) {
              dataPoint[category] = parseFloat(row.aum_crore) / 100000; // Convert to lakhs
            }
          });

          trendData.push(dataPoint);
        }

        setData(trendData);
      } catch (error) {
        console.error('Error fetching quarterly trend:', error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedQuarter]);

  const toggleLine = (category: string) => {
    setVisibleLines(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        <p>No data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-2">{label}</p>
          {payload
            .filter((entry: any) => visibleLines[entry.name])
            .map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-sm" style={{ color: entry.color }}>
                  {entry.name}:
                </span>
                <span className="text-sm font-medium">
                  ₹{entry.value.toFixed(2)}L Cr
                </span>
              </div>
            ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => (
    <div className="flex flex-wrap justify-center gap-4 pt-4">
      {Object.keys(COLORS).map((category) => (
        <button
          key={category}
          onClick={() => toggleLine(category)}
          className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all ${
            visibleLines[category]
              ? 'bg-muted hover:bg-muted/80'
              : 'bg-muted/30 opacity-50 hover:opacity-70'
          }`}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: visibleLines[category]
                ? COLORS[category as keyof typeof COLORS]
                : '#9ca3af'
            }}
          />
          <span className="text-sm font-medium">{category}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="quarter"
            className="text-xs"
            tick={{ fill: 'currentColor' }}
            angle={-15}
            textAnchor="end"
            height={60}
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
          {visibleLines.Equity && (
            <Line
              type="monotone"
              dataKey="Equity"
              stroke={COLORS.Equity}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
          )}
          {visibleLines.Debt && (
            <Line
              type="monotone"
              dataKey="Debt"
              stroke={COLORS.Debt}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
          )}
          {visibleLines.Hybrid && (
            <Line
              type="monotone"
              dataKey="Hybrid"
              stroke={COLORS.Hybrid}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
          )}
          {visibleLines.Other && (
            <Line
              type="monotone"
              dataKey="Other"
              stroke={COLORS.Other}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <CustomLegend />

      {/* Interpretation */}
      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Trend Analysis:</span> Click on category names above to show/hide lines. 
          The chart shows the last 8 quarters of AUM growth across different asset classes.
        </p>
      </div>
    </div>
  );
}
