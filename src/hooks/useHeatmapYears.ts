import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useHeatmapYears = (indicatorId?: string) => {
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (indicatorId) {
      fetchYears(indicatorId);
    } else {
      setYears([]);
      setLoading(false);
    }
  }, [indicatorId]);

  const fetchYears = async (indicatorId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('heatmap_values')
        .select('year_label')
        .eq('indicator_id', indicatorId)
        .order('year_label', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        if (fetchError.code === '42P01') {
          throw new Error('Heatmap tables not found. Please set up the database first.');
        } else if (fetchError.code === '42501') {
          throw new Error('Permission denied. Please check database access policies.');
        }
        throw fetchError;
      }

      // Get unique years and sort them properly (fiscal year format)
      const uniqueYears = Array.from(new Set((data as any)?.map((item: any) => item.year_label) || []));
      
      // Sort fiscal years properly (e.g., 2023-24, 2022-23, etc.)
      const sortedYears = uniqueYears.sort((a: any, b: any) => {
        // Extract starting year from fiscal year format (e.g., "2023-24" -> 2023)
        const yearA = parseInt(a.split('-')[0]);
        const yearB = parseInt(b.split('-')[0]);
        return yearB - yearA; // Descending order (latest first)
      });

      setYears(sortedYears as string[]);
    } catch (err) {
      console.error('Error fetching heatmap years:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch years');
    } finally {
      setLoading(false);
    }
  };

  return {
    years,
    loading,
    error,
    refetch: () => indicatorId && fetchYears(indicatorId),
  };
};
