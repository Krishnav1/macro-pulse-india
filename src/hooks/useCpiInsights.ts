import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CpiInsightData {
  id: string;
  section: 'overview' | 'trend' | 'components' | 'compare';
  title: string;
  text: string;
  chart_key: string | null;
  order_index: number;
  is_active: boolean;
}

interface UseCpiInsightsParams {
  section?: 'overview' | 'trend' | 'components' | 'compare';
}

export const useCpiInsights = (params: UseCpiInsightsParams = {}) => {
  const [data, setData] = useState<CpiInsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { section } = params;

  useEffect(() => {
    const fetchCpiInsights = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('cpi_insights')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (section) {
          query = query.eq('section', section);
        }

        const { data: insightsData, error } = await query;

        if (error) {
          console.error('Error fetching CPI insights:', error);
          setError(error.message);
        } else {
          setData(insightsData || []);
        }
      } catch (err) {
        console.error('Error fetching CPI insights:', err);
        setError('Failed to fetch CPI insights data');
      } finally {
        setLoading(false);
      }
    };

    fetchCpiInsights();
  }, [section]);

  return { data, loading, error };
};
