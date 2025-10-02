// =====================================================
// USE INVESTOR BEHAVIOR DATA HOOK
// Fetches investor behavior data from database
// =====================================================

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InvestorMetrics, HoldingPeriodTrend } from '@/services/investor-behavior/types';

export function useInvestorBehaviorData() {
  const [data, setData] = useState<any[]>([]);
  const [latestQuarter, setLatestQuarter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: behaviorData, error: fetchError } = await (supabase as any)
        .from('investor_behavior_data')
        .select('*')
        .order('quarter_end_date', { ascending: false });

      if (fetchError) throw fetchError;

      setData(behaviorData || []);
      
      // Get latest quarter
      if (behaviorData && behaviorData.length > 0) {
        setLatestQuarter(behaviorData[0].quarter_end_date);
      }
    } catch (err: any) {
      console.error('Error fetching investor behavior data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, latestQuarter, isLoading, error, refetch: fetchData };
}

export function useLatestQuarterMetrics() {
  const [metrics, setMetrics] = useState<InvestorMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('investor_behavior_data')
        .select('*')
        .order('quarter_end_date', { ascending: false })
        .limit(20); // Get latest quarter data (10 age groups × 2 asset types)

      if (error) throw error;
      if (!data || data.length === 0) {
        setMetrics(null);
        return;
      }

      // Calculate aggregated metrics
      const latestQuarter = data[0].quarter_end_date;
      const quarterData = data.filter((d: any) => d.quarter_end_date === latestQuarter);

      const totalAUM = quarterData.reduce((sum: number, d: any) => sum + d.total_aum, 0);
      const longTermAUM = quarterData.reduce((sum: number, d: any) => sum + d.aum_above_24_months, 0);
      const shortTermAUM = quarterData.reduce((sum: number, d: any) => sum + d.aum_0_1_month + d.aum_1_3_months, 0);
      const equityAUM = quarterData.filter((d: any) => d.asset_type === 'EQUITY').reduce((sum: number, d: any) => sum + d.total_aum, 0);
      const nonEquityAUM = quarterData.filter((d: any) => d.asset_type === 'NON-EQUITY').reduce((sum: number, d: any) => sum + d.total_aum, 0);

      // Calculate weighted average holding period
      const weightedHoldingPeriod = quarterData.reduce((sum: number, d: any) => {
        return sum + (d.avg_holding_period_months * d.total_aum);
      }, 0) / totalAUM;

      const longTermPercentage = (longTermAUM / totalAUM) * 100;
      const shortTermPercentage = (shortTermAUM / totalAUM) * 100;
      const churnRiskLevel = shortTermPercentage < 15 ? 'Low' : shortTermPercentage < 25 ? 'Medium' : 'High';

      setMetrics({
        quarter_end_date: latestQuarter,
        total_aum: totalAUM,
        avg_holding_period: weightedHoldingPeriod,
        long_term_percentage: longTermPercentage,
        short_term_percentage: shortTermPercentage,
        churn_risk_level: churnRiskLevel as 'Low' | 'Medium' | 'High',
        equity_percentage: (equityAUM / totalAUM) * 100,
        non_equity_percentage: (nonEquityAUM / totalAUM) * 100
      });
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { metrics, isLoading, refetch: fetchMetrics };
}

export function useHoldingPeriodTrend() {
  const [trend, setTrend] = useState<HoldingPeriodTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrend();
  }, []);

  const fetchTrend = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('investor_behavior_data')
        .select('*')
        .order('quarter_end_date', { ascending: true });

      if (error) throw error;
      if (!data) {
        setTrend([]);
        return;
      }

      // Group by quarter and aggregate
      const quarterMap = new Map<string, any>();
      
      data.forEach((row: any) => {
        const key = row.quarter_end_date;
        if (!quarterMap.has(key)) {
          quarterMap.set(key, {
            quarter_end_date: row.quarter_end_date,
            quarter_label: row.quarter_label,
            '0-1_month': 0,
            '1-3_months': 0,
            '3-6_months': 0,
            '6-12_months': 0,
            '12-24_months': 0,
            'above_24_months': 0,
            total_aum: 0
          });
        }

        const quarter = quarterMap.get(key);
        quarter['0-1_month'] += row.aum_0_1_month;
        quarter['1-3_months'] += row.aum_1_3_months;
        quarter['3-6_months'] += row.aum_3_6_months;
        quarter['6-12_months'] += row.aum_6_12_months;
        quarter['12-24_months'] += row.aum_12_24_months;
        quarter['above_24_months'] += row.aum_above_24_months;
        quarter.total_aum += row.total_aum;
      });

      setTrend(Array.from(quarterMap.values()));
    } catch (err) {
      console.error('Error fetching holding period trend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { trend, isLoading, refetch: fetchTrend };
}
