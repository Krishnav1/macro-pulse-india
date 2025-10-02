// =====================================================
// USE AGE GROUP ANALYSIS HOOK
// Analyzes investor behavior by age group
// =====================================================

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgeGroupAnalysis, ChurnRiskData } from '@/services/investor-behavior/types';

export function useAgeGroupAnalysis(quarterEndDate?: string) {
  const [analysis, setAnalysis] = useState<AgeGroupAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, [quarterEndDate]);

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      
      // If no quarter specified, get latest
      let targetQuarter = quarterEndDate;
      if (!targetQuarter) {
        const { data: latestData } = await (supabase as any)
          .from('investor_behavior_data')
          .select('quarter_end_date')
          .order('quarter_end_date', { ascending: false })
          .limit(1);
        
        if (latestData && latestData.length > 0) {
          targetQuarter = latestData[0].quarter_end_date;
        }
      }

      if (!targetQuarter) {
        setAnalysis([]);
        return;
      }

      const { data, error } = await (supabase as any)
        .from('investor_behavior_data')
        .select('*')
        .eq('quarter_end_date', targetQuarter);

      if (error) throw error;
      if (!data) {
        setAnalysis([]);
        return;
      }

      // Group by age group
      const ageGroupMap = new Map<string, any>();

      data.forEach((row: any) => {
        const ageGroup = row.age_group;
        if (!ageGroupMap.has(ageGroup)) {
          ageGroupMap.set(ageGroup, {
            age_group: ageGroup,
            total_aum: 0,
            equity_aum: 0,
            non_equity_aum: 0,
            equity_percentage: 0,
            avg_holding_period: 0,
            churn_risk_score: 0,
            stickiness_score: 0,
            holding_distribution: {
              '0-1': 0,
              '1-3': 0,
              '3-6': 0,
              '6-12': 0,
              '12-24': 0,
              '>24': 0
            },
            _weightedHoldingSum: 0
          });
        }

        const group = ageGroupMap.get(ageGroup);
        group.total_aum += row.total_aum;
        
        if (row.asset_type === 'EQUITY') {
          group.equity_aum += row.total_aum;
        } else {
          group.non_equity_aum += row.total_aum;
        }

        // Accumulate holding distribution
        group.holding_distribution['0-1'] += row.aum_0_1_month;
        group.holding_distribution['1-3'] += row.aum_1_3_months;
        group.holding_distribution['3-6'] += row.aum_3_6_months;
        group.holding_distribution['6-12'] += row.aum_6_12_months;
        group.holding_distribution['12-24'] += row.aum_12_24_months;
        group.holding_distribution['>24'] += row.aum_above_24_months;

        // Weighted average holding period
        group._weightedHoldingSum += row.avg_holding_period_months * row.total_aum;
      });

      // Calculate final metrics
      const analysisData: AgeGroupAnalysis[] = Array.from(ageGroupMap.values()).map(group => {
        const equityPercentage = group.total_aum > 0 ? (group.equity_aum / group.total_aum) * 100 : 0;
        const avgHoldingPeriod = group.total_aum > 0 ? group._weightedHoldingSum / group.total_aum : 0;
        const churnRiskScore = group.total_aum > 0 ? (group.holding_distribution['0-1'] / group.total_aum) * 100 : 0;
        const stickinessScore = group.total_aum > 0 ? (group.holding_distribution['>24'] / group.total_aum) * 100 : 0;

        delete group._weightedHoldingSum;

        return {
          ...group,
          equity_percentage: equityPercentage,
          avg_holding_period: avgHoldingPeriod,
          churn_risk_score: churnRiskScore,
          stickiness_score: stickinessScore
        };
      });

      // Sort by total AUM descending
      analysisData.sort((a, b) => b.total_aum - a.total_aum);

      setAnalysis(analysisData);
    } catch (err) {
      console.error('Error fetching age group analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { analysis, isLoading, refetch: fetchAnalysis };
}

export function useChurnRiskAnalysis(quarterEndDate?: string) {
  const [churnRisk, setChurnRisk] = useState<ChurnRiskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChurnRisk();
  }, [quarterEndDate]);

  const fetchChurnRisk = async () => {
    try {
      setIsLoading(true);

      // If no quarter specified, get latest
      let targetQuarter = quarterEndDate;
      if (!targetQuarter) {
        const { data: latestData } = await (supabase as any)
          .from('investor_behavior_data')
          .select('quarter_end_date')
          .order('quarter_end_date', { ascending: false })
          .limit(1);
        
        if (latestData && latestData.length > 0) {
          targetQuarter = latestData[0].quarter_end_date;
        }
      }

      if (!targetQuarter) {
        setChurnRisk([]);
        return;
      }

      const { data, error } = await (supabase as any)
        .from('investor_behavior_data')
        .select('*')
        .eq('quarter_end_date', targetQuarter);

      if (error) throw error;
      if (!data) {
        setChurnRisk([]);
        return;
      }

      const riskData: ChurnRiskData[] = data.map((row: any) => {
        const shortTermAUM = row.aum_0_1_month + row.aum_1_3_months;
        const riskLevel = row.churn_risk_score < 15 ? 'Low' : row.churn_risk_score < 25 ? 'Medium' : 'High';

        return {
          age_group: row.age_group,
          asset_type: row.asset_type,
          churn_risk_score: row.churn_risk_score,
          short_term_aum: shortTermAUM,
          total_aum: row.total_aum,
          risk_level: riskLevel as 'Low' | 'Medium' | 'High'
        };
      });

      // Sort by churn risk score descending
      riskData.sort((a, b) => b.churn_risk_score - a.churn_risk_score);

      setChurnRisk(riskData);
    } catch (err) {
      console.error('Error fetching churn risk analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { churnRisk, isLoading, refetch: fetchChurnRisk };
}
