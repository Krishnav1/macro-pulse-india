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
        const componentCodes = ['A.1', 'A.2', 'A.3', 'A.4', 'A.5', 'A.6'];
        const componentNames = {
          'A.1': 'Food and beverages',
          'A.2': 'Pan, tobacco and intoxicants',
          'A.3': 'Clothing and footwear', 
          'A.4': 'Housing',
          'A.5': 'Fuel and light',
          'A.6': 'Miscellaneous'
        };

        const componentData: CpiComponentBreakdown[] = [];

        // First, get CFPI data from cpi_series table
        const { data: cfpiData, error: cfpiError } = await supabase
          .from('cpi_series' as any)
          .select('*')
          .eq('geography', geography)
          .eq('series_code', 'cfpi')
          .order('date', { ascending: false })
          .limit(2);

        if (!cfpiError && cfpiData && cfpiData.length > 0) {
          const latest = cfpiData[0] as any;
          const previous = cfpiData[1] as any;
          const yoyInflation = latest.inflation_yoy || (previous ? 
            ((latest.index_value - previous.index_value) / previous.index_value) * 100 : null);

          componentData.push({
            component_name: 'Consumer Food Price Index',
            latest_value: latest.index_value,
            yoy_inflation: yoyInflation
          });
        }

        // Then get component data from cpi_components table
        for (const code of componentCodes) {
          const { data: latestData, error } = await supabase
            .from('cpi_components' as any)
            .select('*')
            .eq('geography', geography)
            .eq('component_code', code)
            .order('date', { ascending: false })
            .limit(2);

          if (error) {
            console.error(`Error fetching component ${code}:`, error);
            continue;
          }

          if (latestData && latestData.length > 0) {
            const latest = latestData[0] as any;
            const previous = latestData[1] as any;
            
            const yoyInflation = latest.inflation_yoy || (previous ? 
              ((latest.index_value - previous.index_value) / previous.index_value) * 100 : null);

            componentData.push({
              component_name: componentNames[code as keyof typeof componentNames],
              latest_value: latest.index_value,
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
