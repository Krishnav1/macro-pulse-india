// =====================================================
// FUND FLOW HEATMAP
// Shows QoQ growth rates for all categories
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, TrendingUp, TrendingDown } from 'lucide-react';

export function FundFlowHeatmap() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'aum' | 'growth'>('aum');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get latest quarter
      const { data: latestData } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('quarter_end_date')
        .order('quarter_end_date', { ascending: false })
        .limit(1)
        .single();

      if (!latestData) throw new Error('No data available');

      // Get data for latest quarter
      const { data: categoryData, error: fetchError } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('category_display_name, parent_category, aum_crore, qoq_change_percent')
        .eq('quarter_end_date', latestData.quarter_end_date)
        .eq('is_subtotal', false)
        .eq('is_total', false)
        .not('qoq_change_percent', 'is', null)
        .order('aum_crore', { ascending: false })
        .limit(20);

      if (fetchError) throw fetchError;
      setData(categoryData || []);
    } catch (err: any) {
      console.error('Error fetching fund flow data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
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
        <AlertDescription>No data available. Upload at least 2 quarters to see growth rates.</AlertDescription>
      </Alert>
    );
  }

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'aum') {
      return b.aum_crore - a.aum_crore;
    } else {
      return (b.qoq_change_percent || 0) - (a.qoq_change_percent || 0);
    }
  });

  // Get color based on growth rate
  const getColor = (growth: number | null) => {
    if (growth === null) return 'bg-gray-100 text-gray-600';
    if (growth >= 5) return 'bg-green-600 text-white';
    if (growth >= 3) return 'bg-green-500 text-white';
    if (growth >= 1) return 'bg-green-400 text-white';
    if (growth >= -1) return 'bg-gray-200 text-gray-800';
    if (growth >= -3) return 'bg-red-400 text-white';
    if (growth >= -5) return 'bg-red-500 text-white';
    return 'bg-red-600 text-white';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Equity': 'border-l-4 border-green-500',
      'Debt': 'border-l-4 border-blue-500',
      'Hybrid': 'border-l-4 border-purple-500',
      'Other': 'border-l-4 border-orange-500'
    };
    return colors[category] || 'border-l-4 border-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Sort by:</span>
          <button
            onClick={() => setSortBy('aum')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'aum' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            AUM Size
          </button>
          <button
            onClick={() => setSortBy('growth')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'growth' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Growth Rate
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Growth:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span>+5%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>+1-5%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>±1%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span>-1-5%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>-5%+</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid gap-2">
        {sortedData.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-3 rounded-lg border ${getCategoryColor(item.parent_category)} hover:shadow-md transition-shadow`}
          >
            <div className="flex-1">
              <div className="font-medium">{item.category_display_name}</div>
              <div className="text-sm text-muted-foreground">
                {item.parent_category} • ₹{(item.aum_crore / 100000).toFixed(2)} Lakh Cr
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-md font-semibold ${getColor(item.qoq_change_percent)}`}>
                {item.qoq_change_percent !== null 
                  ? `${item.qoq_change_percent >= 0 ? '+' : ''}${item.qoq_change_percent.toFixed(2)}%`
                  : 'N/A'
                }
              </div>
              {item.qoq_change_percent !== null && (
                item.qoq_change_percent >= 0 
                  ? <TrendingUp className="h-5 w-5 text-green-600" />
                  : <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interpretation */}
      <div className="bg-muted/50 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <InfoIcon className="h-4 w-4" />
          Interpretation
        </h4>
        <p className="text-sm text-muted-foreground">
          {(() => {
            const topGainer = sortedData.reduce((max, item) => 
              (item.qoq_change_percent || 0) > (max.qoq_change_percent || 0) ? item : max
            , sortedData[0]);
            const topLoser = sortedData.reduce((min, item) => 
              (item.qoq_change_percent || 0) < (min.qoq_change_percent || 0) ? item : min
            , sortedData[0]);
            
            return (
              <>
                <strong>{topGainer.category_display_name}</strong> leads with {topGainer.qoq_change_percent?.toFixed(1)}% QoQ growth, 
                indicating strong investor interest. Meanwhile, <strong>{topLoser.category_display_name}</strong> saw 
                {topLoser.qoq_change_percent?.toFixed(1)}% change, suggesting shifting preferences or market conditions.
              </>
            );
          })()}
        </p>
      </div>
    </div>
  );
}
