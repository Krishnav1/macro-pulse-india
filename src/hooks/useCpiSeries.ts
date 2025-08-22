import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CpiSeriesData {
  id: string;
  date: string;
  geography: 'rural' | 'urban' | 'combined';
  series_code: string;
  index_value: number;
  inflation_yoy: number | null;
  inflation_mom: number | null;
  base_year: string;
}

interface UseCpiSeriesParams {
  geography?: 'rural' | 'urban' | 'combined';
  seriesCodes?: string[];
  startDate?: string;
  endDate?: string;
}

export const useCpiSeries = (params: UseCpiSeriesParams = {}) => {
  const [data, setData] = useState<CpiSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { geography = 'combined', seriesCodes = ['headline'], startDate, endDate } = params;

  useEffect(() => {
    const fetchCpiSeries = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('cpi_series' as any)
          .select('*')
          .eq('geography', geography)
          .in('series_code', seriesCodes)
          .order('date', { ascending: true });

        if (startDate) {
          query = query.gte('date', startDate);
        }
        if (endDate) {
          query = query.lte('date', endDate);
        }

        const { data: seriesData, error } = await query;

        if (error) {
          console.error('Error fetching CPI series:', error);
          setError(error.message);
        } else {
          setData(seriesData as CpiSeriesData[] || []);
        }
      } catch (err) {
        console.error('Error fetching CPI series:', err);
        setError('Failed to fetch CPI series data');
      } finally {
        setLoading(false);
      }
    };

    fetchCpiSeries();
  }, [geography, seriesCodes, startDate, endDate]);

  return { data, loading, error };
};
