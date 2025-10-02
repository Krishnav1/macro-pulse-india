// =====================================================
// ASSET CLASS DISTRIBUTION
// Stacked area chart showing composition over time
// =====================================================

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface AssetClassDistributionProps {
  viewMode: 'quarterly' | 'annual';
}

export function AssetClassDistribution({ viewMode }: AssetClassDistributionProps) {
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
      const { data: rawData, error: fetchError } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('quarter_end_date, quarter_label, fiscal_year, parent_category, aum_crore')
        .eq('is_subtotal', false)
        .eq('is_total', false)
        .order('quarter_end_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Group by quarter and parent category
      const grouped = rawData?.reduce((acc, row) => {
        const key = viewMode === 'annual' && row.fiscal_year 
          ? row.fiscal_year 
          : row.quarter_label;
        
        if (!acc[key]) {
          acc[key] = {
            label: key,
            date: row.quarter_end_date,
            Equity: 0,
            Debt: 0,
            Hybrid: 0,
            Other: 0
          };
        }
        
        acc[key][row.parent_category] += row.aum_crore / 100000; // Convert to Lakh Crores
        return acc;
      }, {} as Record<string, any>);

      const chartData = Object.values(grouped || {});
      
      // Filter for annual view (take Q4 data only)
      const finalData = viewMode === 'annual'
        ? chartData.filter((d: any) => d.label.includes('-'))
        : chartData;

      setData(finalData);
    } catch (err: any) {
      console.error('Error fetching asset class distribution:', err);
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
        <AlertDescription>Error loading distribution: {error}</AlertDescription>
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

  // Calculate latest composition
  const latest = data[data.length - 1];
  const total = latest ? latest.Equity + latest.Debt + latest.Hybrid + latest.Other : 1;
  const composition = {
    Equity: ((latest?.Equity || 0) / total * 100).toFixed(1),
    Debt: ((latest?.Debt || 0) / total * 100).toFixed(1),
    Hybrid: ((latest?.Hybrid || 0) / total * 100).toFixed(1),
    Other: ((latest?.Other || 0) / total * 100).toFixed(1)
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="colorHybrid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="label" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{ value: 'AUM (₹ Lakh Crore)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: any, name: string) => [`₹${value.toFixed(2)} L Cr`, name]}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Area 
            type="monotone" 
            dataKey="Equity" 
            stackId="1"
            stroke="#10b981" 
            fill="url(#colorEquity)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="Debt" 
            stackId="1"
            stroke="#3b82f6" 
            fill="url(#colorDebt)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="Hybrid" 
            stackId="1"
            stroke="#8b5cf6" 
            fill="url(#colorHybrid)"
            strokeWidth={2}
          />
          <Area 
            type="monotone" 
            dataKey="Other" 
            stackId="1"
            stroke="#f59e0b" 
            fill="url(#colorOther)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Current Composition */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <div className="text-xs font-medium text-green-900">Equity</div>
          <div className="text-xl font-bold text-green-600">{composition.Equity}%</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-xs font-medium text-blue-900">Debt</div>
          <div className="text-xl font-bold text-blue-600">{composition.Debt}%</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="text-xs font-medium text-purple-900">Hybrid</div>
          <div className="text-xl font-bold text-purple-600">{composition.Hybrid}%</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
          <div className="text-xs font-medium text-orange-900">Other</div>
          <div className="text-xl font-bold text-orange-600">{composition.Other}%</div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <InfoIcon className="h-4 w-4" />
          Interpretation
        </h4>
        <p className="text-sm text-muted-foreground">
          {parseFloat(composition.Equity) > parseFloat(composition.Debt) 
            ? `Equity funds dominate with ${composition.Equity}% market share, indicating strong investor risk appetite and confidence in equity markets.`
            : `Debt funds lead with ${composition.Debt}% share, suggesting investors prefer stable, lower-risk investments.`
          }
          {' '}The {parseFloat(composition.Other) > 10 ? 'growing' : 'stable'} share of passive funds (Index & ETFs) 
          reflects the global trend toward low-cost investing.
        </p>
      </div>
    </div>
  );
}
