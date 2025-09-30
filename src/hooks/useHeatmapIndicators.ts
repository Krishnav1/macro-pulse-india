import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeatmapIndicator {
  id: string;
  slug: string;
  name: string;
  unit: string;
  description?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export const useHeatmapIndicators = () => {
  const [indicators, setIndicators] = useState<HeatmapIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('heatmap_indicators')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setIndicators(data || []);
    } catch (err) {
      console.error('Error fetching heatmap indicators:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch indicators');
    } finally {
      setLoading(false);
    }
  };

  return {
    indicators,
    loading,
    error,
    refetch: fetchIndicators,
  };
};
