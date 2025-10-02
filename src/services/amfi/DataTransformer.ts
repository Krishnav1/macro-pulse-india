// Data Transformer Service
// Cleans and transforms AMFI data for database storage

import { ParsedScheme, AMCData } from './AMFIDataFetcher';
import { supabase } from '@/integrations/supabase/client';

export interface TransformedAMC {
  amc_code: string;
  amc_name: string;
  total_aum: number;
  num_schemes: number;
}

export interface TransformedScheme {
  scheme_code: string;
  amc_id?: number;
  scheme_name: string;
  isin_growth: string;
  isin_dividend: string;
  category: string;
  sub_category: string;
  scheme_type: string;
  current_nav: number;
  nav_date: string;
}

export class DataTransformer {
  /**
   * Transform AMC data for database insertion
   */
  transformAMCs(amcDataList: AMCData[]): TransformedAMC[] {
    return amcDataList.map(amc => ({
      amc_code: amc.amcCode,
      amc_name: this.cleanAMCName(amc.amcName),
      total_aum: 0, // Will be updated from monthly reports
      num_schemes: amc.schemes.length,
    }));
  }

  /**
   * Transform scheme data for database insertion
   */
  transformSchemes(schemes: ParsedScheme[]): TransformedScheme[] {
    return schemes.map(scheme => ({
      scheme_code: scheme.schemeCode,
      scheme_name: this.cleanSchemeName(scheme.schemeName),
      isin_growth: scheme.isinGrowth || '',
      isin_dividend: scheme.isinDividend || '',
      category: this.standardizeCategory(scheme.category),
      sub_category: scheme.subCategory || '',
      scheme_type: scheme.schemeType || 'Open Ended',
      current_nav: scheme.nav,
      nav_date: scheme.date,
    }));
  }

  /**
   * Clean AMC name
   */
  private cleanAMCName(name: string): string {
    return name
      .replace(/Mutual Fund$/i, 'Mutual Fund')
      .replace(/Asset Management Company$/i, 'AMC')
      .trim();
  }

  /**
   * Clean scheme name
   */
  private cleanSchemeName(name: string): string {
    return name
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Standardize category names
   */
  private standardizeCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'Debt Scheme': 'Debt',
      'Equity Scheme': 'Equity',
      'Hybrid Scheme': 'Hybrid',
      'Solution Oriented Scheme': 'Solution',
      'Other Scheme': 'Other',
      'Index Fund': 'Index',
      'FOF': 'Fund of Funds',
    };

    for (const [key, value] of Object.entries(categoryMap)) {
      if (category.includes(key)) {
        return value;
      }
    }

    return category || 'Other';
  }

  /**
   * Validate ISIN code format
   */
  validateISIN(isin: string): boolean {
    if (!isin) return true; // Empty is okay
    // ISIN format: 2 letter country code + 9 alphanumeric + 1 check digit
    const isinRegex = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;
    return isinRegex.test(isin);
  }

  /**
   * Batch insert/update AMCs
   */
  async upsertAMCs(amcs: TransformedAMC[]): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const { data, error } = await (supabase as any)
        .from('mutual_fund_amcs')
        .upsert(amcs, { 
          onConflict: 'amc_code',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('Error upserting AMCs:', error);
        return { success: false, count: 0, error: error.message };
      }

      return { success: true, count: data?.length || 0 };
    } catch (error: any) {
      console.error('Exception upserting AMCs:', error);
      return { success: false, count: 0, error: error.message };
    }
  }

  /**
   * Batch insert/update schemes
   */
  async upsertSchemes(
    schemes: TransformedScheme[], 
    amcMap: Map<string, number>
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      // Add AMC IDs to schemes
      const schemesWithAMC = schemes.map(scheme => {
        const amcId = amcMap.get(scheme.scheme_code.substring(0, 6)); // Approximate AMC lookup
        return {
          ...scheme,
          amc_id: amcId,
        };
      });

      // Batch insert in chunks of 1000
      const chunkSize = 1000;
      let totalInserted = 0;

      for (let i = 0; i < schemesWithAMC.length; i += chunkSize) {
        const chunk = schemesWithAMC.slice(i, i + chunkSize);
        
        const { data, error } = await (supabase as any)
          .from('mutual_fund_schemes_new')
          .upsert(chunk, { 
            onConflict: 'scheme_code',
            ignoreDuplicates: false 
          })
          .select();

        if (error) {
          console.error(`Error upserting schemes chunk ${i}:`, error);
          continue;
        }

        totalInserted += data?.length || 0;
      }

      return { success: true, count: totalInserted };
    } catch (error: any) {
      console.error('Exception upserting schemes:', error);
      return { success: false, count: 0, error: error.message };
    }
  }

  /**
   * Insert NAV history
   */
  async insertNAVHistory(
    schemes: ParsedScheme[],
    schemeIdMap: Map<string, number>
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const navRecords = schemes
        .map(scheme => {
          const schemeId = schemeIdMap.get(scheme.schemeCode);
          if (!schemeId) return null;

          return {
            scheme_id: schemeId,
            date: scheme.date,
            nav: scheme.nav,
          };
        })
        .filter(record => record !== null);

      // Batch insert in chunks
      const chunkSize = 1000;
      let totalInserted = 0;

      for (let i = 0; i < navRecords.length; i += chunkSize) {
        const chunk = navRecords.slice(i, i + chunkSize);
        
        const { data, error } = await (supabase as any)
          .from('scheme_nav_history')
          .upsert(chunk, { 
            onConflict: 'scheme_id,date',
            ignoreDuplicates: true 
          })
          .select();

        if (error) {
          console.error(`Error inserting NAV history chunk ${i}:`, error);
          continue;
        }

        totalInserted += data?.length || 0;
      }

      return { success: true, count: totalInserted };
    } catch (error: any) {
      console.error('Exception inserting NAV history:', error);
      return { success: false, count: 0, error: error.message };
    }
  }

  /**
   * Log scraping activity
   */
  async logScraping(
    source: string,
    status: string,
    recordsProcessed: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      await (supabase as any)
        .from('mf_scraping_logs')
        .insert({
          source,
          status,
          records_processed: recordsProcessed,
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error logging scraping activity:', error);
    }
  }
}

export const dataTransformer = new DataTransformer();
