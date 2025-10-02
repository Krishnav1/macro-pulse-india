// Hook to fetch financial market categories

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FinancialCategory } from '@/types/financial-markets.types';

interface UseFinancialCategoriesResult {
  categories: FinancialCategory[];
  loading: boolean;
  error: string | null;
}

export function useFinancialCategories(): UseFinancialCategoriesResult {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error: dbError } = await (supabase as any)
          .from('financial_categories')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (dbError) throw dbError;

        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
