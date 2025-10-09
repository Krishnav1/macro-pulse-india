import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CityAumData {
  id: string;
  quarter_end_date: string;
  financial_year: string;
  quarter_number: number;
  city_name: string;
  aum_percentage: number;
  latitude: number | null;
  longitude: number | null;
}

export interface QuarterInfo {
  quarterEndDate: string;
  financialYear: string;
  quarter: number;
  displayName: string;
}

export interface CityAumMetadata {
  quarter_end_date: string;
  other_cities_percentage: number;
  nris_overseas_percentage: number;
  total_percentage: number;
}

export function useCityAumQuarters() {
  const [quarters, setQuarters] = useState<QuarterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuarters = async () => {
      try {
        const { data, error } = await supabase
          .from('city_aum_allocation' as any)
          .select('quarter_end_date, financial_year, quarter_number')
          .order('quarter_end_date', { ascending: false });

        if (error) throw error;

        // Get unique quarters with metadata
        const uniqueQuartersMap = new Map<string, QuarterInfo>();
        
        (data as any)?.forEach((d: any) => {
          if (!uniqueQuartersMap.has(d.quarter_end_date)) {
            const date = new Date(d.quarter_end_date);
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            uniqueQuartersMap.set(d.quarter_end_date, {
              quarterEndDate: d.quarter_end_date,
              financialYear: d.financial_year || 'Unknown',
              quarter: d.quarter_number || 0,
              displayName: `Q${d.quarter_number} ${d.financial_year} (${monthName})`,
            });
          }
        });

        const quartersList = Array.from(uniqueQuartersMap.values());
        setQuarters(quartersList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch quarters');
      } finally {
        setLoading(false);
      }
    };

    fetchQuarters();
  }, []);

  return { quarters, loading, error };
}

export function useCityAumData(quarterEndDate: string | null) {
  const [data, setData] = useState<CityAumData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quarterEndDate) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: cityData, error } = await supabase
          .from('city_aum_allocation' as any)
          .select('*')
          .eq('quarter_end_date', quarterEndDate)
          .order('aum_percentage', { ascending: false });

        if (error) throw error;

        setData((cityData as any) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch city AUM data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quarterEndDate]);

  return { data, loading, error };
}

export function useCityAumMetadata(quarterEndDate: string | null) {
  const [metadata, setMetadata] = useState<CityAumMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quarterEndDate) {
      setMetadata(null);
      return;
    }

    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: metaData, error } = await supabase
          .from('city_aum_metadata' as any)
          .select('*')
          .eq('quarter_end_date', quarterEndDate)
          .single();

        if (error) {
          // If no metadata found, return null (not an error)
          if (error.code === 'PGRST116') {
            setMetadata(null);
          } else {
            throw error;
          }
        } else {
          setMetadata(metaData as any);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metadata');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [quarterEndDate]);

  return { metadata, loading, error };
}
