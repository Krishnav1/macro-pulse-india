// =====================================================
// AUM GROWTH CHART
// Line chart showing total AUM growth over time
// =====================================================

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAUMTrends } from '@/hooks/quarterly-aum/useQuarterlyAUMData';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface AUMGrowthChartProps {
  viewMode: 'quarterly' | 'annual';
}

export function AUMGrowthChart({ viewMode }: AUMGrowthChartProps) {
  const { trends, isLoading, error } = useAUMTrends(viewMode);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading AUM trends: {error}</AlertDescription>
      </Alert>
    );
  }

  if (trends.length === 0) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>No data available. Please upload quarterly AUM data.</AlertDescription>
      </Alert>
    );
  }

  // Format data for chart
  const chartData = trends.map(trend => ({
    label: trend.quarter_label,
    aum: trend.total_aum_crore / 100000, // Convert to Lakh Crores
    aaum: trend.total_aaum_crore / 100000,
    growth: viewMode === 'quarterly' ? trend.qoq_change_percent : trend.yoy_change_percent
  }));

  // Calculate CAGR
  const firstValue = chartData[0]?.aum || 0;
  const lastValue = chartData[chartData.length - 1]?.aum || 0;
  const years = chartData.length / (viewMode === 'quarterly' ? 4 : 1);
  const cagr = years > 0 ? (Math.pow(lastValue / firstValue, 1 / years) - 1) * 100 : 0;

  // Key milestones
  const milestones = [
    { date: '2016-11-30', label: 'Demonetization', color: '#ef4444' },
    { date: '2018-09-30', label: 'SEBI Categorization', color: '#3b82f6' },
    { date: '2020-03-31', label: 'COVID-19', color: '#f59e0b' },
  ];

  return (
    <div className="space-y-4">
      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            formatter={(value: any, name: string) => {
              if (name === 'aum') return [`₹${value.toFixed(2)} L Cr`, 'AUM'];
              if (name === 'aaum') return [`₹${value.toFixed(2)} L Cr`, 'AAUM'];
              if (name === 'growth') return [`${value?.toFixed(2)}%`, viewMode === 'quarterly' ? 'QoQ Growth' : 'YoY Growth'];
              return [value, name];
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {/* Main AUM Line */}
          <Line 
            type="monotone" 
            dataKey="aum" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="AUM"
          />
          
          {/* AAUM Line */}
          <Line 
            type="monotone" 
            dataKey="aaum" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="AAUM"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-900">CAGR ({viewMode === 'quarterly' ? 'Quarterly' : 'Annual'})</div>
          <div className="text-2xl font-bold text-blue-600">{cagr.toFixed(2)}%</div>
          <div className="text-xs text-blue-700 mt-1">Compound Annual Growth Rate</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-900">Growth Since 2011</div>
          <div className="text-2xl font-bold text-green-600">
            {((lastValue / firstValue - 1) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-green-700 mt-1">Total percentage increase</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-purple-900">Latest AUM</div>
          <div className="text-2xl font-bold text-purple-600">₹{lastValue.toFixed(2)} L Cr</div>
          <div className="text-xs text-purple-700 mt-1">{chartData[chartData.length - 1]?.label}</div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <InfoIcon className="h-4 w-4" />
          Interpretation
        </h4>
        <p className="text-sm text-muted-foreground">
          The mutual fund industry has shown <strong>consistent growth</strong> with a CAGR of {cagr.toFixed(1)}%.
          {lastValue > firstValue * 2 && ' The industry has more than doubled in size since 2011.'}
          {' '}Key events like demonetization (2016), SEBI categorization (2018), and COVID-19 (2020) 
          created temporary volatility but the long-term trend remains <strong>strongly positive</strong>.
        </p>
      </div>
    </div>
  );
}
