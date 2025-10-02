// Performance Calculation Service
// Orchestrates calculation of returns and risk metrics for all schemes

import { supabase } from '@/integrations/supabase/client';
import { returnsCalculator } from './ReturnsCalculator';
import { riskCalculator } from './RiskCalculator';

export class PerformanceCalculationService {
  /**
   * Calculate and update performance for all schemes
   */
  async calculateAllPerformance(): Promise<{ success: boolean; schemesProcessed: number; errors: string[] }> {
    const errors: string[] = [];
    let schemesProcessed = 0;

    try {
      console.log('🚀 Starting performance calculation...');

      // Fetch all schemes
      const { data: schemes, error: schemesError } = await (supabase as any)
        .from('mutual_fund_schemes_new')
        .select('id, scheme_code, launch_date');

      if (schemesError) throw schemesError;

      console.log(`📊 Found ${schemes?.length || 0} schemes to process`);

      // Process in batches of 50
      const batchSize = 50;
      for (let i = 0; i < (schemes?.length || 0); i += batchSize) {
        const batch = schemes.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (scheme) => {
            try {
              await this.calculateSchemePerformance(scheme.id, scheme.launch_date);
              schemesProcessed++;
            } catch (error: any) {
              errors.push(`Scheme ${scheme.scheme_code}: ${error.message}`);
            }
          })
        );

        console.log(`✅ Processed ${Math.min(i + batchSize, schemes.length)} / ${schemes.length} schemes`);
      }

      console.log(`✅ Performance calculation completed. Processed: ${schemesProcessed}, Errors: ${errors.length}`);

      return {
        success: errors.length === 0,
        schemesProcessed,
        errors,
      };

    } catch (error: any) {
      console.error('❌ Performance calculation failed:', error);
      return {
        success: false,
        schemesProcessed,
        errors: [error.message],
      };
    }
  }

  /**
   * Calculate performance for a single scheme
   */
  async calculateSchemePerformance(schemeId: number, launchDate?: string): Promise<void> {
    // Fetch NAV history
    const { data: navHistory, error: navError } = await (supabase as any)
      .from('scheme_nav_history')
      .select('date, nav')
      .eq('scheme_id', schemeId)
      .order('date', { ascending: true });

    if (navError) throw navError;

    if (!navHistory || navHistory.length < 2) {
      // Not enough data to calculate
      return;
    }

    // Calculate returns
    const returns = returnsCalculator.calculateReturns(navHistory, launchDate);

    // Calculate risk metrics
    const riskMetrics = riskCalculator.calculateAllMetrics(navHistory);

    // Prepare performance record
    const performanceData = {
      scheme_id: schemeId,
      as_of_date: new Date().toISOString().split('T')[0],
      ...returns,
      volatility: riskMetrics.volatility,
      sharpe_ratio: riskMetrics.sharpe_ratio,
      max_drawdown: riskMetrics.max_drawdown,
    };

    // Upsert to database
    const { error: upsertError } = await (supabase as any)
      .from('scheme_performance')
      .upsert(performanceData, {
        onConflict: 'scheme_id,as_of_date',
        ignoreDuplicates: false,
      });

    if (upsertError) throw upsertError;
  }

  /**
   * Get performance data for a scheme
   */
  async getSchemePerformance(schemeId: number): Promise<any> {
    const { data, error } = await (supabase as any)
      .from('scheme_performance')
      .select('*')
      .eq('scheme_id', schemeId)
      .order('as_of_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching performance:', error);
      return null;
    }

    return data;
  }

  /**
   * Calculate performance for schemes with recent NAV updates
   */
  async calculateRecentlyUpdated(): Promise<{ success: boolean; schemesProcessed: number }> {
    try {
      // Find schemes with NAV updates in last 2 days
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const { data: recentSchemes, error } = await (supabase as any)
        .from('scheme_nav_history')
        .select('scheme_id')
        .gte('date', twoDaysAgo.toISOString().split('T')[0])
        .order('scheme_id');

      if (error) throw error;

      const uniqueSchemeIds = [...new Set(recentSchemes?.map((s: any) => s.scheme_id) || [])];

      console.log(`📊 Calculating performance for ${uniqueSchemeIds.length} recently updated schemes`);

      let processed = 0;
      for (const schemeId of uniqueSchemeIds) {
        try {
          await this.calculateSchemePerformance(schemeId as number);
          processed++;
        } catch (error) {
          console.error(`Error processing scheme ${schemeId}:`, error);
        }
      }

      return {
        success: true,
        schemesProcessed: processed,
      };

    } catch (error: any) {
      console.error('Error calculating recently updated:', error);
      return {
        success: false,
        schemesProcessed: 0,
      };
    }
  }
}

export const performanceCalculationService = new PerformanceCalculationService();
