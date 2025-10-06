import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExchangeRateData {
  id: string;
  indicator_slug: string;
  period_date: string;
  period_label: string;
  value: number;
  currency: string; // EUR, GBP, JPY, USD
  created_at: string;
  updated_at: string;
}

interface UseExchangeRateDataProps {
  currencies?: string[];
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}

export const useExchangeRateData = ({
  currencies = ['USD', 'EUR', 'GBP', 'JPY'],
  startDate,
  endDate,
  enabled = true
}: UseExchangeRateDataProps = {}) => {
  const [data, setData] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [currencies, startDate, endDate, enabled]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = (supabase as any)
        .from('indicator_series')
        .select('*')
        .eq('indicator_slug', 'inr_exchange_rate')
        .in('component', currencies)
        .order('period_date', { ascending: true });

      if (startDate) {
        query = query.gte('period_date', startDate);
      }

      if (endDate) {
        query = query.lte('period_date', endDate);
      }

      const { data: exchangeData, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching exchange rate data:', fetchError);
        throw fetchError;
      }

      // Transform data to include currency field from component
      const transformedData = (exchangeData || []).map((item: any) => ({
        ...item,
        currency: item.component || 'USD'
      }));

      setData(transformedData);
    } catch (err) {
      console.error('Error in useExchangeRateData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch exchange rate data');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
