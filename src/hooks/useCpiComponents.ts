import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CpiComponentData {
  id: string;
  date: string;
  geography: 'rural' | 'urban' | 'combined';
  component_code: string;
  component_name: string;
  index_value: number;
  weight: number | null;
  inflation_yoy: number | null;
  contribution_to_inflation: number | null;
}

interface UseCpiComponentsParams {
  geography?: 'rural' | 'urban' | 'combined';
  startDate?: string;
  endDate?: string;
  componentCodes?: string[];
}

export const useCpiComponents = (params: UseCpiComponentsParams = {}) => {
  const [data, setData] = useState<CpiComponentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { geography = 'combined', startDate, endDate, componentCodes } = params;

  useEffect(() => {
    const fetchCpiComponents = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('cpi_components')
          .select('*')
          .eq('geography', geography)
          .order('date', { ascending: true });

        if (startDate) {
          query = query.gte('date', startDate);
        }
        if (endDate) {
          query = query.lte('date', endDate);
        }
        if (componentCodes && componentCodes.length > 0) {
          query = query.in('component_code', componentCodes);
        }

        const { data: componentsData, error } = await query;

        if (error) {
          console.error('Error fetching CPI components:', error);
          setError(error.message);
        } else {
          setData(componentsData || []);
        }
      } catch (err) {
        console.error('Error fetching CPI components:', err);
        setError('Failed to fetch CPI components data');
      } finally {
        setLoading(false);
      }
    };

    fetchCpiComponents();
  }, [geography, startDate, endDate, componentCodes?.join(',')]);

  return { data, loading, error };
};
