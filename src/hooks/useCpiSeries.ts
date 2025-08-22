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

// Lightweight in-memory cache per session to avoid duplicate network calls
// Keyed by geography|seriesCodes(sorted)|startDate|endDate
const cpiCache = new Map<string, CpiSeriesData[]>();

export const useCpiSeries = (params: UseCpiSeriesParams = {}) => {
  const [data, setData] = useState<CpiSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { geography = 'combined', seriesCodes = ['headline'], startDate, endDate } = params;

  useEffect(() => {
    // Build a stable cache key
    const sortedCodes = [...seriesCodes].sort();
    const cacheKey = `${geography}|${sortedCodes.join(',')}|${startDate || ''}|${endDate || ''}`;

    // If no series codes were requested, short-circuit to avoid invalid/empty IN() queries
    if (!sortedCodes.length) {
      setData([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Serve from cache if present
    const cached = cpiCache.get(cacheKey);
    if (cached) {
      setData(cached);
      setError(null);
      setLoading(false);
      return;
    }

    // Track the current request to ignore stale responses
    let isStale = false;

    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    const fetchCpiSeries = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('cpi_series' as any)
          .select('id,date,geography,series_code,index_value,inflation_yoy,inflation_mom,base_year')
          .eq('geography', geography)
          .in('series_code', sortedCodes)
          .order('date', { ascending: true });

        if (startDate) {
          query = query.gte('date', startDate);
        }
        if (endDate) {
          query = query.lte('date', endDate);
        }

        // Minimal retry/backoff for transient failures
        let attempt = 0;
        const maxAttempts = 3;
        while (attempt < maxAttempts) {
          const { data: seriesData, error } = await query;
          if (!error) {
            if (isStale) return; // Ignore outdated result
            const clean = (seriesData as CpiSeriesData[]) || [];
            cpiCache.set(cacheKey, clean);
            setData(clean);
            setError(null);
            break;
          }
          attempt += 1;
          if (attempt >= maxAttempts) {
            console.error('Error fetching CPI series:', error);
            setError(error.message);
            break;
          }
          // Exponential backoff: 250ms, 500ms
          await sleep(250 * Math.pow(2, attempt - 1));
        }
      } catch (err) {
        console.error('Error fetching CPI series:', err);
        setError('Failed to fetch CPI series data');
      } finally {
        if (!isStale) setLoading(false);
      }
    };

    fetchCpiSeries();

    // Cleanup marks this effect's request as stale
    return () => {
      isStale = true;
    };
  }, [geography, seriesCodes, startDate, endDate]);

  return { data, loading, error };
};

