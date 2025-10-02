// AMFI Sync Service
// Orchestrates the complete sync process from AMFI to database

import { amfiDataFetcher } from './AMFIDataFetcher';
import { dataTransformer } from './DataTransformer';
import { supabase } from '@/integrations/supabase/client';

export interface SyncResult {
  success: boolean;
  amcsProcessed: number;
  schemesProcessed: number;
  navRecordsProcessed: number;
  errors: string[];
  duration: number;
}

export class AMFISyncService {
  /**
   * Execute complete AMFI sync process
   */
  async syncAMFIData(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      console.log('🚀 Starting AMFI data sync...');

      // Step 1: Fetch raw data from AMFI
      console.log('📥 Fetching data from AMFI...');
      const rawData = await amfiDataFetcher.fetchDailyNAV();
      
      // Step 2: Parse the data
      console.log('🔍 Parsing NAV data...');
      const parsedSchemes = amfiDataFetcher.parseNAVData(rawData);
      console.log(`✅ Parsed ${parsedSchemes.length} schemes`);

      if (parsedSchemes.length === 0) {
        throw new Error('No schemes parsed from AMFI data');
      }

      // Step 3: Group by AMC
      console.log('📊 Grouping schemes by AMC...');
      const amcData = amfiDataFetcher.groupByAMC(parsedSchemes);
      console.log(`✅ Found ${amcData.length} AMCs`);

      // Step 4: Transform AMC data
      console.log('🔄 Transforming AMC data...');
      const transformedAMCs = dataTransformer.transformAMCs(amcData);

      // Step 5: Upsert AMCs
      console.log('💾 Upserting AMCs to database...');
      const amcResult = await dataTransformer.upsertAMCs(transformedAMCs);
      
      if (!amcResult.success) {
        errors.push(`AMC upsert failed: ${amcResult.error}`);
      } else {
        console.log(`✅ Upserted ${amcResult.count} AMCs`);
      }

      // Step 6: Get AMC ID mapping
      console.log('🔗 Fetching AMC ID mapping...');
      const amcIdMap = await this.getAMCIdMap();

      // Step 7: Transform scheme data
      console.log('🔄 Transforming scheme data...');
      const transformedSchemes = dataTransformer.transformSchemes(parsedSchemes);

      // Step 8: Upsert schemes
      console.log('💾 Upserting schemes to database...');
      const schemeResult = await dataTransformer.upsertSchemes(transformedSchemes, amcIdMap);
      
      if (!schemeResult.success) {
        errors.push(`Scheme upsert failed: ${schemeResult.error}`);
      } else {
        console.log(`✅ Upserted ${schemeResult.count} schemes`);
      }

      // Step 9: Get scheme ID mapping
      console.log('🔗 Fetching scheme ID mapping...');
      const schemeIdMap = await this.getSchemeIdMap();

      // Step 10: Insert NAV history
      console.log('💾 Inserting NAV history...');
      const navResult = await dataTransformer.insertNAVHistory(parsedSchemes, schemeIdMap);
      
      if (!navResult.success) {
        errors.push(`NAV history insert failed: ${navResult.error}`);
      } else {
        console.log(`✅ Inserted ${navResult.count} NAV records`);
      }

      // Step 11: Update AMC statistics
      console.log('📊 Updating AMC statistics...');
      await this.updateAMCStatistics();

      // Step 12: Log the sync
      const duration = Date.now() - startTime;
      await dataTransformer.logScraping(
        'amfi_nav',
        errors.length === 0 ? 'success' : 'partial_success',
        parsedSchemes.length,
        errors.length > 0 ? errors.join('; ') : undefined
      );

      console.log(`✅ AMFI sync completed in ${(duration / 1000).toFixed(2)}s`);

      return {
        success: errors.length === 0,
        amcsProcessed: amcResult.count,
        schemesProcessed: schemeResult.count,
        navRecordsProcessed: navResult.count,
        errors,
        duration,
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('❌ AMFI sync failed:', error);
      
      await dataTransformer.logScraping(
        'amfi_nav',
        'failed',
        0,
        error.message
      );

      return {
        success: false,
        amcsProcessed: 0,
        schemesProcessed: 0,
        navRecordsProcessed: 0,
        errors: [error.message],
        duration,
      };
    }
  }

  /**
   * Get AMC ID mapping (amc_code -> id)
   */
  private async getAMCIdMap(): Promise<Map<string, number>> {
    const { data, error } = await (supabase as any)
      .from('mutual_fund_amcs')
      .select('id, amc_code');

    if (error) {
      console.error('Error fetching AMC IDs:', error);
      return new Map();
    }

    const map = new Map<string, number>();
    for (const amc of data || []) {
      map.set(amc.amc_code, amc.id);
    }

    return map;
  }

  /**
   * Get scheme ID mapping (scheme_code -> id)
   */
  private async getSchemeIdMap(): Promise<Map<string, number>> {
    const { data, error } = await (supabase as any)
      .from('mutual_fund_schemes_new')
      .select('id, scheme_code');

    if (error) {
      console.error('Error fetching scheme IDs:', error);
      return new Map();
    }

    const map = new Map<string, number>();
    for (const scheme of data || []) {
      map.set(scheme.scheme_code, scheme.id);
    }

    return map;
  }

  /**
   * Update AMC statistics (scheme count, total AUM)
   */
  private async updateAMCStatistics(): Promise<void> {
    try {
      // Update scheme counts
      const { error } = await (supabase as any).rpc('update_amc_scheme_counts');
      
      if (error) {
        console.error('Error updating AMC statistics:', error);
      }
    } catch (error) {
      console.error('Exception updating AMC statistics:', error);
    }
  }

  /**
   * Get latest sync status
   */
  async getLatestSyncStatus(): Promise<any> {
    const { data, error } = await (supabase as any)
      .from('mf_scraping_logs')
      .select('*')
      .eq('source', 'amfi_nav')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching sync status:', error);
      return null;
    }

    return data;
  }

  /**
   * Get sync history
   */
  async getSyncHistory(limit: number = 10): Promise<any[]> {
    const { data, error } = await (supabase as any)
      .from('mf_scraping_logs')
      .select('*')
      .eq('source', 'amfi_nav')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sync history:', error);
      return [];
    }

    return data || [];
  }
}

export const amfiSyncService = new AMFISyncService();
