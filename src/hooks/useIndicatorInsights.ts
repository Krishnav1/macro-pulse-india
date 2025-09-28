import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IndicatorInsightData {
  id: number;
  indicator_slug: string;
  content: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useIndicatorInsights = (indicatorSlug: string) => {
  const [data, setData] = useState<IndicatorInsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: insightsData, error } = await supabase
        .from('indicator_insights')
        .select('*')
        .eq('indicator_slug', indicatorSlug)
        .order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      setData(insightsData || []);
    } catch (err) {
      console.error('Error fetching indicator insights:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (indicatorSlug) {
      fetchInsights();
    }
  }, [indicatorSlug]);

  return {
    data,
    loading,
    error,
    refetch: fetchInsights
  };
};
