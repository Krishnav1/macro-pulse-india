import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UsdInrRateData {
  id: string;
  date: string;
  rate: number;
  source: string;
}

export const useUsdInrRates = (timeframe: string = '1Y') => {
  const [data, setData] = useState<UsdInrRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        let startDate: Date;

        switch (timeframe) {
          case '1Y':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
          case '5Y':
            startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            break;
          case '10Y':
            startDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
            break;
          default:
            startDate = new Date(2020, 0, 1); // All data from 2020
        }

        let query = (supabase as any)
          .from('usd_inr_rates')
          .select('*')
          .order('date', { ascending: true });

        if (timeframe !== 'all') {
          query = query.gte('date', startDate.toISOString().split('T')[0]);
        }

        const { data: ratesData, error } = await query;

        if (error) {
          console.error('Error fetching USD/INR rates:', error);
          setError('Failed to fetch USD/INR rates data');
          return;
        }

        setData(ratesData || []);
      } catch (err) {
        console.error('Error fetching USD/INR rates:', err);
        setError('Failed to fetch USD/INR rates data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  return {
    data,
    loading,
    error
  };
};
