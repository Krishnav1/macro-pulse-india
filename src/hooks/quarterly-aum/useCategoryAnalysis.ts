// =====================================================
// HOOK: USE CATEGORY ANALYSIS
// Analyze category-wise AUM data
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CategoryBreakdown, CategoryTrend, InvestorBehaviorMetrics } from '@/services/quarterly-aum/types';

export function useCategoryBreakdown(quarterEndDate?: string) {
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quarterEndDate) {
      fetchBreakdown(quarterEndDate);
    } else {
      fetchLatestBreakdown();
    }
  }, [quarterEndDate]);

  const fetchLatestBreakdown = async () => {
    // Get latest quarter first
    const { data: latestData } = await (supabase as any)
      .from('quarterly_aum_data')
      .select('quarter_end_date')
      .order('quarter_end_date', { ascending: false })
      .limit(1)
      .single();

    if (latestData) {
      await fetchBreakdown(latestData.quarter_end_date);
    }
  };

  const fetchBreakdown = async (date: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('parent_category, aum_crore, qoq_change_percent')
        .eq('quarter_end_date', date)
        .eq('is_subtotal', false)
        .eq('is_total', false);

      if (fetchError) throw fetchError;

      // Aggregate by parent category
      const aggregated = data?.reduce((acc, row) => {
        if (!acc[row.parent_category]) {
          acc[row.parent_category] = {
            parent_category: row.parent_category,
            aum_crore: 0,
            qoq_changes: []
          };
        }
        acc[row.parent_category].aum_crore += row.aum_crore;
        if (row.qoq_change_percent !== null) {
          acc[row.parent_category].qoq_changes.push(row.qoq_change_percent);
        }
        return acc;
      }, {} as Record<string, any>);

      // Calculate totals and percentages
      const total = Object.values(aggregated || {}).reduce((sum: number, cat: any) => sum + cat.aum_crore, 0);

      const breakdownData: CategoryBreakdown[] = Object.values(aggregated || {}).map((cat: any) => ({
        parent_category: cat.parent_category,
        aum_crore: cat.aum_crore,
        percentage: (cat.aum_crore / total) * 100,
        qoq_change_percent: cat.qoq_changes.length > 0
          ? cat.qoq_changes.reduce((sum: number, val: number) => sum + val, 0) / cat.qoq_changes.length
          : null
      }));

      // Sort by AUM descending
      breakdownData.sort((a, b) => b.aum_crore - a.aum_crore);

      setBreakdown(breakdownData);
    } catch (err: any) {
      console.error('Error fetching category breakdown:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { breakdown, isLoading, error };
}

export function useCategoryTrends(categoryCodes: string[], viewMode: 'quarterly' | 'annual' = 'quarterly') {
  const [trends, setTrends] = useState<CategoryTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryCodes.length > 0) {
      fetchTrends();
    }
  }, [categoryCodes, viewMode]);

  const fetchTrends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('category_code, category_display_name, parent_category, quarter_end_date, quarter_label, fiscal_year, aum_crore')
        .in('category_code', categoryCodes)
        .order('quarter_end_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Group by category
      const grouped = data?.reduce((acc, row) => {
        if (!acc[row.category_code]) {
          acc[row.category_code] = {
            category_code: row.category_code,
            category_name: row.category_display_name,
            parent_category: row.parent_category,
            data: []
          };
        }
        acc[row.category_code].data.push({
          quarter_end_date: row.quarter_end_date,
          quarter_label: viewMode === 'annual' ? row.fiscal_year : row.quarter_label,
          aum_crore: row.aum_crore,
          market_share_percent: 0 // Will calculate below
        });
        return acc;
      }, {} as Record<string, CategoryTrend>);

      // Calculate market share for each data point
      Object.values(grouped || {}).forEach(trend => {
        trend.data.forEach(point => {
          // Get total AUM for this quarter
          const totalForQuarter = data?.filter(d => d.quarter_end_date === point.quarter_end_date)
            .reduce((sum, d) => sum + d.aum_crore, 0) || 1;
          point.market_share_percent = (point.aum_crore / totalForQuarter) * 100;
        });
      });

      setTrends(Object.values(grouped || {}));
    } catch (err: any) {
      console.error('Error fetching category trends:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { trends, isLoading, error };
}

export function useInvestorBehavior(quarterEndDate?: string) {
  const [metrics, setMetrics] = useState<InvestorBehaviorMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quarterEndDate) {
      fetchMetrics(quarterEndDate);
    } else {
      fetchLatestMetrics();
    }
  }, [quarterEndDate]);

  const fetchLatestMetrics = async () => {
    const { data: latestData } = await (supabase as any)
      .from('quarterly_aum_data')
      .select('quarter_end_date')
      .order('quarter_end_date', { ascending: false })
      .limit(1)
      .single();

    if (latestData) {
      await fetchMetrics(latestData.quarter_end_date);
    }
  };

  const fetchMetrics = async (date: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('parent_category, category_code, aum_crore')
        .eq('quarter_end_date', date)
        .eq('is_subtotal', false)
        .eq('is_total', false);

      if (fetchError) throw fetchError;

      // Calculate metrics
      const equityAUM = data?.filter(d => d.parent_category === 'Equity')
        .reduce((sum, d) => sum + d.aum_crore, 0) || 0;
      
      const debtAUM = data?.filter(d => d.parent_category === 'Debt')
        .reduce((sum, d) => sum + d.aum_crore, 0) || 0;

      const liquidAUM = data?.filter(d => 
        ['OVERNIGHT', 'LIQUID', 'MONEY_MARKET'].includes(d.category_code)
      ).reduce((sum, d) => sum + d.aum_crore, 0) || 0;

      const passiveAUM = data?.filter(d => 
        d.category_code.includes('INDEX') || d.category_code.includes('ETF')
      ).reduce((sum, d) => sum + d.aum_crore, 0) || 0;

      const totalAUM = data?.reduce((sum, d) => sum + d.aum_crore, 0) || 1;

      const equityDebtRatio = debtAUM > 0 ? equityAUM / debtAUM : 0;
      const liquidityPreference = (liquidAUM / totalAUM) * 100;
      const passivePenetration = (passiveAUM / totalAUM) * 100;
      
      // Risk appetite score (0-100): Higher equity/debt ratio = higher risk appetite
      const riskAppetiteScore = Math.min(100, (equityDebtRatio / 2) * 100);

      setMetrics({
        quarter_end_date: date,
        equity_debt_ratio: equityDebtRatio,
        liquidity_preference_percent: liquidityPreference,
        passive_penetration_percent: passivePenetration,
        risk_appetite_score: riskAppetiteScore
      });
    } catch (err: any) {
      console.error('Error fetching investor behavior metrics:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { metrics, isLoading, error };
}
