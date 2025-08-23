import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IipComponentData {
  id: string;
  date: string;
  classification_type: 'sectoral' | 'use_based';
  component_code: string;
  component_name: string;
  index_value: number;
  weight: number | null;
  growth_yoy: number | null;
  growth_mom: number | null;
}

export interface IipComponentBreakdown {
  component_name: string;
  latest_value: number | null;
  growth_yoy: number | null;
  growth_mom: number | null;
}

interface UseIipComponentsParams {
  classification?: 'sectoral' | 'use_based';
  startDate?: string;
  endDate?: string;
}

export const useIipComponents = (params: UseIipComponentsParams = {}) => {
  const [data, setData] = useState<IipComponentData[]>([]);
  const [breakdown, setBreakdown] = useState<IipComponentBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { classification, startDate, endDate } = params;

  useEffect(() => {
    const fetchIipComponents = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('iip_components' as any)
          .select('*')
          .order('date', { ascending: false });

        if (classification) {
          query = query.eq('classification_type', classification);
        }
        if (startDate) {
          query = query.gte('date', startDate);
        }
        if (endDate) {
          query = query.lte('date', endDate);
        }

        const { data: componentsData, error } = await query;

        if (error) {
          throw error;
        }

        setData(componentsData || []);

        // Create breakdown for latest data
        if (componentsData && componentsData.length > 0) {
          const componentMap = new Map<string, IipComponentData>();
          
          componentsData.forEach((item: any) => {
            const existing = componentMap.get(item.component_code);
            if (!existing || new Date(item.date) > new Date(existing.date)) {
              componentMap.set(item.component_code, item);
            }
          });

          const breakdownData: IipComponentBreakdown[] = Array.from(componentMap.values()).map(item => ({
            component_name: item.component_name,
            latest_value: item.index_value,
            growth_yoy: item.growth_yoy,
            growth_mom: item.growth_mom
          }));

          setBreakdown(breakdownData);
        }
      } catch (err) {
        console.error('Error fetching IIP components:', err);
        setError('Failed to fetch IIP components data');
      } finally {
        setLoading(false);
      }
    };

    fetchIipComponents();
  }, [classification, startDate, endDate]);

  return { data, breakdown, loading, error };
};
