import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CpiComponentBreakdown {
  component_name: string;
  latest_value: number | null;
  yoy_inflation: number | null;
}

interface UseCpiComponentsParams {
  geography?: 'rural' | 'urban' | 'combined';
}

export const useCpiComponents = (params: UseCpiComponentsParams = {}) => {
  const [data, setData] = useState<CpiComponentBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { geography = 'combined' } = params;

  useEffect(() => {
    const fetchCpiComponents = async () => {
      try {
        setLoading(true);
        
        // Get latest data for main CPI components
        const componentCodes = ['A.1', 'A.2', 'A.3', 'A.4', 'A.5', 'A.6', 'cfpi'];
        const componentNames = {
          'A.1': 'Food and beverages',
          'A.2': 'Pan, tobacco and intoxicants',
          'A.3': 'Clothing and footwear', 
          'A.4': 'Housing',
          'A.5': 'Fuel and light',
          'A.6': 'Miscellaneous',
          'cfpi': 'Consumer Food Price Index'
        };

        const componentData: CpiComponentBreakdown[] = [];

        for (const code of componentCodes) {
          // Get latest data for this component
          const { data: latestData, error } = await supabase
            .from('indicator_series')
            .select('*')
            .eq('indicator_slug', 'cpi-inflation')
            .eq('period_label', code)
            .order('period_date', { ascending: false })
            .limit(2);

          if (error) {
            console.error(`Error fetching component ${code}:`, error);
            continue;
          }

          if (latestData && latestData.length > 0) {
            const latest = latestData[0];
            const previous = latestData[1];
            
            // Calculate YoY inflation if we have previous data
            const yoyInflation = previous ? 
              ((latest.value - previous.value) / previous.value) * 100 : null;

            componentData.push({
              component_name: componentNames[code as keyof typeof componentNames],
              latest_value: latest.value,
              yoy_inflation: yoyInflation
            });
          }
        }

        setData(componentData);
      } catch (err) {
        console.error('Error fetching CPI components:', err);
        setError('Failed to fetch CPI components data');
      } finally {
        setLoading(false);
      }
    };

    fetchCpiComponents();
  }, [geography]);

  return { data, loading, error };
};
