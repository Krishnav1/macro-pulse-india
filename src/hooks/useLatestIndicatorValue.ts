import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLatestIndicatorValue = (indicatorSlug: string) => {
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestValue = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('indicator_series')
          .select('value, period_date')
          .eq('indicator_slug', indicatorSlug)
          .order('period_date', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        
        if (data) {
          setValue(data.value);
        }
      } catch (err) {
        console.error(`Error fetching latest ${indicatorSlug}:`, err);
        setValue(null);
      } finally {
        setLoading(false);
      }
    };

    if (indicatorSlug) {
      fetchLatestValue();
    }
  }, [indicatorSlug]);

  return { value, loading };
};
