// Hook to fetch FII/DII activity

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FIIDIIActivity } from '@/types/equity-markets.types';

interface UseFIIDIIActivityResult {
  activity: FIIDIIActivity[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useFIIDIIActivity(days: number = 30): UseFIIDIIActivityResult {
  const [activity, setActivity] = useState<FIIDIIActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const { data, error: dbError } = await (supabase as any)
        .from('fii_dii_activity')
        .select('*')
        .gte('date', fromDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (dbError) throw dbError;

      setActivity(data || []);
    } catch (err) {
      console.error('Error fetching FII/DII activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FII/DII activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [days]);

  return { activity, loading, error, refresh: fetchActivity };
}
