import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyImportsData {
  id: string;
  month_year: string;
  imports_usd_mn: number;
  imports_inr_crore: number;
  source: string;
}

export const useMonthlyImports = (months: number = 12) => {
  const [data, setData] = useState<MonthlyImportsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: importsData, error } = await (supabase as any)
          .from('monthly_imports')
          .select('*')
          .order('month_year', { ascending: false })
          .limit(months);

        if (error) {
          console.error('Error fetching monthly imports:', error);
          setError('Failed to fetch monthly imports data');
          return;
        }

        setData(importsData || []);
      } catch (err) {
        console.error('Error fetching monthly imports:', err);
        setError('Failed to fetch monthly imports data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [months]);

  const averageMonthlyImports = data.length > 0 
    ? data.reduce((sum, item) => sum + item.imports_usd_mn, 0) / data.length 
    : 0;

  return {
    data,
    loading,
    error,
    averageMonthlyImports
  };
};
