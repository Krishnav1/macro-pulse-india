import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IipEventData {
  id: string;
  date: string;
  title: string;
  description: string | null;
  impact: 'low' | 'medium' | 'high';
  tag: string | null;
}

interface UseIipEventsParams {
  startDate?: string;
  endDate?: string;
  impact?: 'low' | 'medium' | 'high';
}

export const useIipEvents = (params: UseIipEventsParams = {}) => {
  const [data, setData] = useState<IipEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startDate, endDate, impact } = params;

  useEffect(() => {
    const fetchIipEvents = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('iip_events' as any)
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

        const { data: eventsData, error } = await query;

        if (error) {
          throw error;
        }

        setData(eventsData || []);
      } catch (err) {
        console.error('Error fetching IIP events:', err);
        setError('Failed to fetch IIP events data');
      } finally {
        setLoading(false);
      }
    };

    fetchIipEvents();
  }, [startDate, endDate, impact]);

  return { data, loading, error };
};
