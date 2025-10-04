import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StateAumComposition {
  id: string;
  month_year: string;
  state_name: string;
  industry_share_percentage: number;
  liquid_money_market_percentage: number | null;
  debt_oriented_percentage: number | null;
  equity_oriented_percentage: number | null;
  etfs_fofs_percentage: number | null;
}

export interface StateAumCategory {
  id: string;
  month_year: string;
  state_name: string;
  category: string;
  aum_crores: number;
  rank: number | null;
}

export function useStateAumMonths() {
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const { data, error } = await supabase
          .from('state_aum_allocation' as any)
          .select('month_year')
          .order('month_year', { ascending: false });

        if (error) throw error;

        // Get unique months
        const uniqueMonths = [...new Set((data as any)?.map((d: any) => d.month_year) || [])] as string[];
        setMonths(uniqueMonths);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch months');
      } finally {
        setLoading(false);
      }
    };

    fetchMonths();
  }, []);

  return { months, loading, error };
}

export function useStateAumComposition(monthYear: string | null) {
  const [data, setData] = useState<StateAumComposition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!monthYear) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: stateData, error } = await supabase
          .from('state_aum_allocation' as any)
          .select('*')
          .eq('month_year', monthYear)
          .order('industry_share_percentage', { ascending: false });

        if (error) throw error;

        setData((stateData as any) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch state AUM data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthYear]);

  return { data, loading, error };
}

export function useStateAumCategories(monthYear: string | null, category: string | null) {
  const [data, setData] = useState<StateAumCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!monthYear || !category) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: categoryData, error } = await supabase
          .from('state_aum_category_values' as any)
          .select('*')
          .eq('month_year', monthYear)
          .eq('category', category)
          .order('rank', { ascending: true });

        if (error) throw error;

        setData((categoryData as any) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch category data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [monthYear, category]);

  return { data, loading, error };
}
