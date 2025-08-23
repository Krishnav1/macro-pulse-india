import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IipSeriesData {
  id: string;
  date: string;
  index_value: number;
  growth_yoy: number | null;
  growth_mom: number | null;
  base_year: string;
}

interface UseIipSeriesParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const useIipSeries = (params: UseIipSeriesParams = {}) => {
  const [data, setData] = useState<IipSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startDate, endDate, limit = 100 } = params;

  useEffect(() => {
    const fetchIipSeries = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('iip_series' as any)
          .select('*')
          .order('date', { ascending: false })
          .limit(limit);

        if (startDate) {
          query = query.gte('date', startDate);
        }
        if (endDate) {
          query = query.lte('date', endDate);
        }

        const { data: seriesData, error } = await query;

        if (error) {
          throw error;
        }

        setData(seriesData || []);
      } catch (err) {
        console.error('Error fetching IIP series:', err);
        setError('Failed to fetch IIP series data');
      } finally {
        setLoading(false);
      }
    };

    fetchIipSeries();
  }, [startDate, endDate, limit]);

  return { data, loading, error };
};
