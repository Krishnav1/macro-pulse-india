// =====================================================
// INVESTOR BEHAVIOR DATA TRANSFORMER
// Transforms parsed data and calculates metrics
// =====================================================

import { ParsedInvestorBehaviorFile, InvestorBehaviorRecord } from './types';

export class InvestorBehaviorTransformer {
  /**
   * Transform parsed data to database records with calculated metrics
   */
  transform(parsedData: ParsedInvestorBehaviorFile): InvestorBehaviorRecord[] {
    return parsedData.rows.map(row => {
      // Calculate total AUM
      const totalAUM = row.aum_0_1_month + row.aum_1_3_months + 
                      row.aum_3_6_months + row.aum_6_12_months + 
                      row.aum_12_24_months + row.aum_above_24_months;

      // Calculate percentages
      const pct_0_1 = totalAUM > 0 ? (row.aum_0_1_month / totalAUM) * 100 : 0;
      const pct_1_3 = totalAUM > 0 ? (row.aum_1_3_months / totalAUM) * 100 : 0;
      const pct_3_6 = totalAUM > 0 ? (row.aum_3_6_months / totalAUM) * 100 : 0;
      const pct_6_12 = totalAUM > 0 ? (row.aum_6_12_months / totalAUM) * 100 : 0;
      const pct_12_24 = totalAUM > 0 ? (row.aum_12_24_months / totalAUM) * 100 : 0;
      const pct_above_24 = totalAUM > 0 ? (row.aum_above_24_months / totalAUM) * 100 : 0;

      // Calculate weighted average holding period (in months)
      const avgHoldingPeriod = this.calculateAvgHoldingPeriod(
        pct_0_1, pct_1_3, pct_3_6, pct_6_12, pct_12_24, pct_above_24
      );

      // Calculate churn risk score (% in 0-1 month bucket)
      const churnRiskScore = pct_0_1;

      // Calculate stickiness score (% in >24 months bucket)
      const stickinessScore = pct_above_24;

      return {
        quarter_end_date: parsedData.quarter_end_date,
        quarter_label: parsedData.quarter_label,
        age_group: row.age_group,
        asset_type: row.asset_type,
        aum_0_1_month: row.aum_0_1_month,
        aum_1_3_months: row.aum_1_3_months,
        aum_3_6_months: row.aum_3_6_months,
        aum_6_12_months: row.aum_6_12_months,
        aum_12_24_months: row.aum_12_24_months,
        aum_above_24_months: row.aum_above_24_months,
        total_aum: totalAUM,
        pct_0_1_month: this.round(pct_0_1, 2),
        pct_1_3_months: this.round(pct_1_3, 2),
        pct_3_6_months: this.round(pct_3_6, 2),
        pct_6_12_months: this.round(pct_6_12, 2),
        pct_12_24_months: this.round(pct_12_24, 2),
        pct_above_24_months: this.round(pct_above_24, 2),
        avg_holding_period_months: this.round(avgHoldingPeriod, 2),
        churn_risk_score: this.round(churnRiskScore, 2),
        stickiness_score: this.round(stickinessScore, 2)
      };
    });
  }

  /**
   * Calculate weighted average holding period in months
   * Uses midpoint of each bucket as weight
   */
  private calculateAvgHoldingPeriod(
    pct_0_1: number,
    pct_1_3: number,
    pct_3_6: number,
    pct_6_12: number,
    pct_12_24: number,
    pct_above_24: number
  ): number {
    // Bucket midpoints in months
    const midpoint_0_1 = 0.5;      // 0-1 month → 0.5 months
    const midpoint_1_3 = 2;        // 1-3 months → 2 months
    const midpoint_3_6 = 4.5;      // 3-6 months → 4.5 months
    const midpoint_6_12 = 9;       // 6-12 months → 9 months
    const midpoint_12_24 = 18;     // 12-24 months → 18 months
    const midpoint_above_24 = 36;  // >24 months → assume 36 months (3 years)

    const weightedSum = 
      (pct_0_1 * midpoint_0_1) +
      (pct_1_3 * midpoint_1_3) +
      (pct_3_6 * midpoint_3_6) +
      (pct_6_12 * midpoint_6_12) +
      (pct_12_24 * midpoint_12_24) +
      (pct_above_24 * midpoint_above_24);

    const totalPct = pct_0_1 + pct_1_3 + pct_3_6 + pct_6_12 + pct_12_24 + pct_above_24;

    return totalPct > 0 ? weightedSum / totalPct : 0;
  }

  /**
   * Round number to specified decimal places
   */
  private round(value: number, decimals: number): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Get churn risk level based on score
   */
  static getChurnRiskLevel(score: number): 'Low' | 'Medium' | 'High' {
    if (score < 15) return 'Low';
    if (score < 25) return 'Medium';
    return 'High';
  }

  /**
   * Get stickiness level based on score
   */
  static getStickinessLevel(score: number): 'Low' | 'Medium' | 'High' {
    if (score < 30) return 'Low';
    if (score < 50) return 'Medium';
    return 'High';
  }
}
