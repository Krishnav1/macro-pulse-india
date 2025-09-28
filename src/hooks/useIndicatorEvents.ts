import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IndicatorEventData {
  id?: number;
  indicator_slug: string;
  date: string;
  title?: string;
  description: string;
  impact?: 'low' | 'medium' | 'high';
  tag?: string;
  created_at?: string;
  updated_at?: string;
}

interface UseIndicatorEventsParams {
  indicatorSlug: string;
  startDate?: string;
  endDate?: string;
}

export const useIndicatorEvents = (params: UseIndicatorEventsParams | string) => {
  const [data, setData] = useState<IndicatorEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle both object and string parameters for backward compatibility
  const indicatorSlug = typeof params === 'string' ? params : params.indicatorSlug;
  const startDate = typeof params === 'object' ? params.startDate : undefined;
  const endDate = typeof params === 'object' ? params.endDate : undefined;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('indicator_events')
        .select('*')
        .eq('indicator_slug', indicatorSlug)
        .order('date', { ascending: false });

      // Add date filtering if provided
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data: eventsData, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to ensure proper typing
      const transformedData: IndicatorEventData[] = (eventsData || []).map((event: any) => ({
        id: event.id,
        indicator_slug: event.indicator_slug,
        date: event.date,
        title: event.title || '',
        description: event.description,
        impact: event.impact as 'low' | 'medium' | 'high',
        tag: event.tag || '',
        created_at: event.created_at,
        updated_at: event.updated_at
      }));

      setData(transformedData);
    } catch (err) {
      console.error('Error fetching indicator events:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (indicatorSlug) {
      fetchEvents();
    }
  }, [indicatorSlug, startDate, endDate]);

  return {
    data,
    loading,
    error,
    refetch: fetchEvents
  };
};
