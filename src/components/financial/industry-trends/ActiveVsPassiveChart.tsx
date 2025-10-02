// =====================================================
// ACTIVE VS PASSIVE CHART
// Dual-axis chart comparing active and passive funds
// =====================================================

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface ActiveVsPassiveChartProps {
  viewMode: 'quarterly' | 'annual';
}

export function ActiveVsPassiveChart({ viewMode }: ActiveVsPassiveChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [viewMode]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: rawData, error: fetchError } = await supabase
        .from('quarterly_aum_data')
        .select('quarter_end_date, quarter_label, fiscal_year, category_code, aum_crore')
        .eq('is_subtotal', false)
        .eq('is_total', false)
        .order('quarter_end_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Categorize as active or passive
      const passiveCodes = ['INDEX_EQUITY_DOMESTIC', 'INDEX_EQUITY_INTL', 'INDEX_DEBT', 
                           'ETF_EQUITY_DOMESTIC', 'ETF_EQUITY_INTL', 'ETF_DEBT', 
                           'ETF_OTHER_DOMESTIC', 'GOLD_ETF', 'SILVER_ETF'];

      // Group by quarter
      const grouped = rawData?.reduce((acc, row) => {
        const key = viewMode === 'annual' && row.fiscal_year 
          ? row.fiscal_year 
          : row.quarter_label;
        
        if (!acc[key]) {
          acc[key] = {
            label: key,
            date: row.quarter_end_date,
            active: 0,
            passive: 0
          };
        }
        
        const isPassive = passiveCodes.includes(row.category_code);
        if (isPassive) {
          acc[key].passive += row.aum_crore / 100000; // Convert to Lakh Crores
        } else {
          acc[key].active += row.aum_crore / 100000;
        }
        
        return acc;
      }, {} as Record<string, any>);

      const chartData = Object.values(grouped || {}).map((item: any) => ({
        ...item,
        passivePenetration: ((item.passive / (item.active + item.passive)) * 100).toFixed(2)
      }));

      // Filter for annual view
      const finalData = viewMode === 'annual'
        ? chartData.filter((d: any) => d.label.includes('-'))
        : chartData;

      setData(finalData);
    } catch (err: any) {
      console.error('Error fetching active vs passive data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>No data available.</AlertDescription>
      </Alert>
    );
  }

  const latest = data[data.length - 1];
  const first = data[0];
  const penetrationGrowth = parseFloat(latest?.passivePenetration || '0') - parseFloat(first?.passivePenetration || '0');

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="label" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'AUM (₹ Lakh Crore)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'Passive Penetration (%)', angle: 90, position: 'insideRight', style: { fill: '#6b7280' } }}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'active') return [`₹${value.toFixed(2)} L Cr`, 'Active Funds'];
              if (name === 'passive') return [`₹${value.toFixed(2)} L Cr`, 'Passive Funds'];
              if (name === 'passivePenetration') return [`${value}%`, 'Passive Share'];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Bar 
            yAxisId="left"
            dataKey="active" 
            fill="#3b82f6" 
            name="Active Funds"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            yAxisId="left"
            dataKey="passive" 
            fill="#10b981" 
            name="Passive Funds"
            radius={[4, 4, 0, 0]}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="passivePenetration" 
            stroke="#f59e0b" 
            strokeWidth={3}
            dot={{ fill: '#f59e0b', r: 4 }}
            name="Passive Share"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-900">Active Funds</div>
          <div className="text-2xl font-bold text-blue-600">₹{latest?.active.toFixed(2)} L Cr</div>
          <div className="text-xs text-blue-700 mt-1">Latest quarter</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm font-medium text-green-900">Passive Funds</div>
          <div className="text-2xl font-bold text-green-600">₹{latest?.passive.toFixed(2)} L Cr</div>
          <div className="text-xs text-green-700 mt-1">Index Funds + ETFs</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm font-medium text-orange-900">Passive Penetration</div>
          <div className="text-2xl font-bold text-orange-600">{latest?.passivePenetration}%</div>
          <div className="text-xs text-orange-700 mt-1">
            {penetrationGrowth >= 0 ? '+' : ''}{penetrationGrowth.toFixed(1)}% since 2011
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <InfoIcon className="h-4 w-4" />
          Interpretation
        </h4>
        <p className="text-sm text-muted-foreground">
          Passive funds (Index Funds & ETFs) have grown from {first?.passivePenetration}% to {latest?.passivePenetration}% 
          market share, reflecting the <strong>global shift toward low-cost investing</strong>.
          {parseFloat(latest?.passivePenetration || '0') > 10 && ' This trend is accelerating as investors become more cost-conscious and favor diversified, market-tracking strategies.'}
          {' '}However, active funds still dominate with {(100 - parseFloat(latest?.passivePenetration || '0')).toFixed(1)}% share, 
          indicating continued investor belief in professional fund management.
        </p>
      </div>
    </div>
  );
}
