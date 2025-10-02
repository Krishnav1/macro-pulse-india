// Hook to fetch mutual fund industry-level metrics

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IndustryMetrics {
  totalAUM: number;
  totalAMCs: number;
  totalSchemes: number;
  avgReturns1Y: number;
  categories: {
    category: string;
    schemeCount: number;
    totalAUM: number;
  }[];
}

export function useIndustryMetrics() {
  return useQuery({
    queryKey: ['industry-metrics'],
    queryFn: async () => {
      // Fetch AMC count and total AUM
      const { data: amcData, error: amcError } = await (supabase as any)
        .from('mutual_fund_amcs')
        .select('total_aum');

      if (amcError) throw amcError;

      // Fetch scheme count and categories
      const { data: schemeData, error: schemeError } = await (supabase as any)
        .from('mutual_fund_schemes_new')
        .select('category, aum');

      if (schemeError) throw schemeError;

      // Fetch performance data
      const { data: perfData, error: perfError } = await (supabase as any)
        .from('scheme_performance')
        .select('return_1y')
        .not('return_1y', 'is', null);

      if (perfError) throw perfError;

      // Calculate metrics
      const totalAUM = amcData?.reduce((sum: number, amc: any) => sum + parseFloat(amc.total_aum || 0), 0) || 0;
      const totalAMCs = amcData?.length || 0;
      const totalSchemes = schemeData?.length || 0;
      const avgReturns1Y = perfData?.length > 0
        ? perfData.reduce((sum: number, p: any) => sum + parseFloat(p.return_1y || 0), 0) / perfData.length
        : 0;

      // Group by category
      const categoryMap = new Map<string, { count: number; aum: number }>();
      schemeData?.forEach((scheme: any) => {
        const cat = scheme.category || 'Other';
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { count: 0, aum: 0 });
        }
        const existing = categoryMap.get(cat)!;
        existing.count++;
        existing.aum += parseFloat(scheme.aum || 0);
      });

      const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        schemeCount: data.count,
        totalAUM: data.aum,
      }));

      return {
        totalAUM,
        totalAMCs,
        totalSchemes,
        avgReturns1Y,
        categories,
      } as IndustryMetrics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
