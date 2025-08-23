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
  enabled?: boolean;
}

// Lightweight in-memory cache per session to avoid duplicate network calls
// Keyed by geography|seriesCodes(sorted)|startDate|endDate
const cpiCache = new Map<string, CpiSeriesData[]>();

export const useCpiSeries = (params: UseCpiSeriesParams = {}) => {
  const [data, setData] = useState<CpiSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { geography = 'combined', seriesCodes = ['headline'], startDate, endDate, enabled = true } = params;

  useEffect(() => {
    // Short-circuit entirely if disabled
    if (!enabled) {
      if (loading) setLoading(false);
      return;
    }

    // Build a stable cache key
    const sortedCodes = [...seriesCodes].sort();
    const cacheKey = `${geography}|${sortedCodes.join(',')}|${startDate || ''}|${endDate || ''}`;

    // If no series codes were requested, short-circuit to avoid invalid/empty IN() queries
    if (!sortedCodes.length) {
      setError(null);
      if (loading) setLoading(false);
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
        
        let allData: CpiSeriesData[] = [];
        
        // Fetch from cpi_series table for headline and cfpi
        const seriesTableCodes = sortedCodes.filter(code => ['headline', 'cfpi'].includes(code));
        if (seriesTableCodes.length > 0) {
          let seriesQuery = supabase
            .from('cpi_series' as any)
            .select('id,date,geography,series_code,index_value,inflation_yoy,inflation_mom,base_year')
            .eq('geography', geography)
            .in('series_code', seriesTableCodes)
            .order('date', { ascending: true });
          
          if (startDate) {
            seriesQuery = seriesQuery.gte('date', startDate);
          }
          if (endDate) {
            seriesQuery = seriesQuery.lte('date', endDate);
          }

          const { data: seriesData, error: seriesError } = await seriesQuery;
          if (!seriesError && seriesData) {
            allData = [...allData, ...(seriesData as unknown as CpiSeriesData[])];
          }
        }

        // Fetch from cpi_components table for A.1, A.2, etc.
        const componentCodes = sortedCodes.filter(code => code.startsWith('A.'));
        if (componentCodes.length > 0) {
          let componentQuery = supabase
            .from('cpi_components' as any)
            .select('id,date,geography,component_code,index_value,inflation_yoy')
            .eq('geography', geography)
            .in('component_code', componentCodes)
            .order('date', { ascending: true });
          
          if (startDate) {
            componentQuery = componentQuery.gte('date', startDate);
          }
          if (endDate) {
            componentQuery = componentQuery.lte('date', endDate);
          }

          const { data: componentData, error: componentError } = await componentQuery;
          if (!componentError && componentData) {
            // Transform component data to match CpiSeriesData format
            const transformedComponents = (componentData as any[]).map(item => ({
              id: item.id,
              date: item.date,
              geography: item.geography,
              series_code: item.component_code,
              index_value: item.index_value,
              inflation_yoy: item.inflation_yoy,
              inflation_mom: null,
              base_year: '2012=100'
            }));
            allData = [...allData, ...transformedComponents];
          }
        }

        if (!isStale) {
          cpiCache.set(cacheKey, allData);
          setData(allData);
          setError(null);
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
  }, [geography, seriesCodes, startDate, endDate, enabled]);

  return { data, loading, error };
};

