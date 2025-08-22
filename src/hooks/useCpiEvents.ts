import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CpiEventData {
  id: string;
  date: string;
  title: string;
  description: string | null;
  impact: 'low' | 'medium' | 'high';
  tag: string | null;
}

interface UseCpiEventsParams {
  startDate?: string;
  endDate?: string;
  impact?: 'low' | 'medium' | 'high';
  tag?: string;
}

export const useCpiEvents = (params: UseCpiEventsParams = {}) => {
  const [data, setData] = useState<CpiEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startDate, endDate, impact, tag } = params;

  useEffect(() => {
    const fetchCpiEvents = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('cpi_events')
          .select('*')
          .order('date', { ascending: false });

        if (startDate) {
          query = query.gte('date', startDate);
        }
        if (endDate) {
          query = query.lte('date', endDate);
        }
        if (impact) {
          query = query.eq('impact', impact);
        }
        if (tag) {
          query = query.eq('tag', tag);
        }

        const { data: eventsData, error } = await query;

        if (error) {
          console.error('Error fetching CPI events:', error);
          setError(error.message);
        } else {
          setData(eventsData || []);
        }
      } catch (err) {
        console.error('Error fetching CPI events:', err);
        setError('Failed to fetch CPI events data');
      } finally {
        setLoading(false);
      }
    };

    fetchCpiEvents();
  }, [startDate, endDate, impact, tag]);

  return { data, loading, error };
};
