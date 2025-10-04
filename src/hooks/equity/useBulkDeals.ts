// Hook to fetch bulk deals

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BulkDeal } from '@/types/equity-markets.types';

interface UseBulkDealsResult {
  deals: BulkDeal[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBulkDeals(days: number = 7): UseBulkDealsResult {
  const [deals, setDeals] = useState<BulkDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error: dbError } = await (supabase as any)
        .from('bulk_deals')
        .select('*')
        .gte('date', fromDate.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('symbol', { ascending: true });

      if (dbError) throw dbError;

      setDeals(data || []);
    } catch (err) {
      console.error('Error fetching bulk deals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bulk deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [days]);

  return { deals, loading, error, refresh: fetchDeals };
}
