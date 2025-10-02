// Hook to fetch top AMCs by AUM

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AMC {
  id: number;
  amc_code: string;
  amc_name: string;
  total_aum: number;
  num_schemes: number;
  market_share: number;
  rank: number;
}

export function useTopAMCs(limit: number = 10) {
  return useQuery({
    queryKey: ['top-amcs', limit],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('mutual_fund_amcs')
        .select('*')
        .order('total_aum', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data as AMC[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
