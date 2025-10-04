import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CityAumData {
  id: string;
  quarter_end_date: string;
  city_name: string;
  aum_percentage: number;
  latitude: number | null;
  longitude: number | null;
}

export function useCityAumQuarters() {
  const [quarters, setQuarters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuarters = async () => {
      try {
        const { data, error } = await supabase
          .from('city_aum_allocation' as any)
          .select('quarter_end_date')
          .order('quarter_end_date', { ascending: false });

        if (error) throw error;

        // Get unique quarters
        const uniqueQuarters = [...new Set((data as any)?.map((d: any) => d.quarter_end_date) || [])] as string[];
        setQuarters(uniqueQuarters);
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
