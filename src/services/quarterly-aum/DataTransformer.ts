// =====================================================
// DATA TRANSFORMER
// Maps parsed data to database format using category mapping
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { ParsedAUMFile, QuarterlyAUMData, CategoryMapping } from './types';

export class QuarterlyAUMTransformer {
  private categoryMappings: CategoryMapping[] = [];

  /**
   * Load category mappings from database
   */
  async loadMappings(): Promise<void> {
    const { data, error } = await (supabase as any)
      .from('category_mapping')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    this.categoryMappings = (data || []) as CategoryMapping[];
  }

  /**
   * Transform parsed file data to database records
   */
  async transform(parsedFile: ParsedAUMFile): Promise<Omit<QuarterlyAUMData, 'id' | 'created_at' | 'updated_at'>[]> {
    if (this.categoryMappings.length === 0) {
      await this.loadMappings();
    }

    const records: Omit<QuarterlyAUMData, 'id' | 'created_at' | 'updated_at'>[] = [];

    for (const row of parsedFile.rows) {
      // Find matching category mapping (creates automatic mapping if not found)
      const mapping = this.findCategoryMapping(row.category_name, parsedFile.data_format_version);

      if (!mapping) {
        // This should never happen now since we create automatic mappings
        console.warn(`Could not create mapping for category: ${row.category_name}`);
        continue;
      }

      // Log if using automatic mapping
      if (mapping.id.startsWith('auto_')) {
        console.log(`Using automatic mapping for: ${row.category_name} → ${mapping.parent_category}`);
      }

      // Determine scheme type from hierarchy
      let schemeType: string | null = null;
      if (row.category_level_1) {
        if (row.category_level_1.includes('Open Ended')) schemeType = 'Open Ended';
        else if (row.category_level_1.includes('Close Ended')) schemeType = 'Close Ended';
        else if (row.category_level_1.includes('Interval')) schemeType = 'Interval';
      }

      records.push({
        quarter_end_date: parsedFile.quarter_end_date,
        quarter_label: parsedFile.quarter_label,
        fiscal_year: parsedFile.fiscal_year,
        
        category_level_1: row.category_level_1 || null,
        category_level_2: row.category_level_2 || null,
        category_level_3: row.category_level_3 || null,
        category_level_4: row.category_level_4 || null,
        category_level_5: null,
        
        category_code: mapping.unified_category_code,
        category_display_name: mapping.unified_category_name,
        parent_category: mapping.parent_category,
        scheme_type: schemeType,
        
        data_format_version: parsedFile.data_format_version,
        
        aum_crore: row.aum_crore,
        aaum_crore: row.aaum_crore,
        
        qoq_change_crore: null,
        qoq_change_percent: null,
        yoy_change_crore: null,
        yoy_change_percent: null,
        
        is_subtotal: false,
        is_total: false,
        notes: null
      });
    }

    return records;
  }

  /**
   * Find category mapping based on category name and format version
   * If no mapping found, creates a default mapping automatically
   */
  private findCategoryMapping(categoryName: string, formatVersion: 'aggregated' | 'detailed'): CategoryMapping | null {
    const cleanName = categoryName.trim().toLowerCase();

    // Try to find existing mapping
    let mapping: CategoryMapping | undefined;
    
    if (formatVersion === 'aggregated') {
      // Match against old_category_name
      mapping = this.categoryMappings.find(m => 
        m.old_category_name?.toLowerCase().includes(cleanName) ||
        cleanName.includes(m.old_category_name?.toLowerCase() || '')
      );
    } else {
      // Match against new_category_name
      mapping = this.categoryMappings.find(m => 
        m.new_category_name?.toLowerCase() === cleanName ||
        cleanName.includes(m.new_category_name?.toLowerCase() || '')
      );
    }

    // If mapping found, return it
    if (mapping) return mapping;

    // If no mapping found, create automatic mapping based on category name
    return this.createAutomaticMapping(categoryName);
  }

  /**
   * Create automatic mapping for unmapped categories
   */
  private createAutomaticMapping(categoryName: string): CategoryMapping {
    const cleanName = categoryName.trim();
    const lowerName = cleanName.toLowerCase();

    // Determine parent category based on keywords
    let parentCategory: 'Equity' | 'Debt' | 'Hybrid' | 'Other' = 'Other';
    
    if (lowerName.includes('equity') || lowerName.includes('elss')) {
      parentCategory = 'Equity';
    } else if (lowerName.includes('debt') || lowerName.includes('liquid') || 
               lowerName.includes('gilt') || lowerName.includes('duration')) {
      parentCategory = 'Debt';
    } else if (lowerName.includes('hybrid') || lowerName.includes('balanced')) {
      parentCategory = 'Hybrid';
    }

    // Create slug from category name
    const categoryCode = cleanName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .toUpperCase();

    return {
      id: `auto_${Date.now()}`,
      old_category_name: cleanName,
      old_category_code: null,
      new_category_name: cleanName,
      new_category_code: null,
      new_category_hierarchy: null,
      unified_category_code: categoryCode,
      unified_category_name: cleanName,
      parent_category: parentCategory,
      mapping_type: 'one_to_one',
      is_active: true
    };
  }

  /**
   * Calculate QoQ and YoY changes for a quarter
   */
  async calculateChanges(quarterEndDate: string): Promise<void> {
    // Get current quarter data
    const { data: currentData, error: currentError } = await (supabase as any)
      .from('quarterly_aum_data')
      .select('*')
      .eq('quarter_end_date', quarterEndDate);

    if (currentError) throw currentError;
    if (!currentData || currentData.length === 0) return;

    // Calculate previous quarter date (3 months back)
    const currentDate = new Date(quarterEndDate);
    const prevQuarterDate = new Date(currentDate);
    prevQuarterDate.setMonth(prevQuarterDate.getMonth() - 3);
    const prevQuarterStr = prevQuarterDate.toISOString().split('T')[0];

    // Calculate year-ago quarter date (12 months back)
    const yearAgoDate = new Date(currentDate);
    yearAgoDate.setFullYear(yearAgoDate.getFullYear() - 1);
    const yearAgoStr = yearAgoDate.toISOString().split('T')[0];

    // Get previous quarter data
    const { data: prevQuarterData } = await (supabase as any)
      .from('quarterly_aum_data')
      .select('*')
      .eq('quarter_end_date', prevQuarterStr);

    // Get year-ago data
    const { data: yearAgoData } = await (supabase as any)
      .from('quarterly_aum_data')
      .select('*')
      .eq('quarter_end_date', yearAgoStr);

    // Update each record with calculated changes
    for (const record of currentData) {
      const updates: any = {};

      // Calculate QoQ change
      if (prevQuarterData) {
        const prevRecord = prevQuarterData.find(r => 
          r.category_code === record.category_code
        );
        if (prevRecord) {
          updates.qoq_change_crore = record.aum_crore - prevRecord.aum_crore;
          updates.qoq_change_percent = prevRecord.aum_crore !== 0
            ? ((record.aum_crore - prevRecord.aum_crore) / prevRecord.aum_crore) * 100
            : null;
        }
      }

      // Calculate YoY change
      if (yearAgoData) {
        const yearAgoRecord = yearAgoData.find(r => 
          r.category_code === record.category_code
        );
        if (yearAgoRecord) {
          updates.yoy_change_crore = record.aum_crore - yearAgoRecord.aum_crore;
          updates.yoy_change_percent = yearAgoRecord.aum_crore !== 0
            ? ((record.aum_crore - yearAgoRecord.aum_crore) / yearAgoRecord.aum_crore) * 100
            : null;
        }
      }

      // Update record if there are changes to apply
      if (Object.keys(updates).length > 0) {
        await (supabase as any)
          .from('quarterly_aum_data')
          .update(updates)
          .eq('id', record.id);
      }
    }
  }

  /**
   * Aggregate detailed data to parent categories for consistent trend analysis
   */
  async aggregateToParentCategories(quarterEndDate: string): Promise<{
    parent_category: string;
    aum_crore: number;
    aaum_crore: number;
  }[]> {
    const { data, error } = await (supabase as any)
      .from('quarterly_aum_data')
      .select('parent_category, aum_crore, aaum_crore')
      .eq('quarter_end_date', quarterEndDate);

    if (error) throw error;
    if (!data) return [];

    // Group by parent category
    const aggregated = data.reduce((acc, row) => {
      if (!acc[row.parent_category]) {
        acc[row.parent_category] = {
          parent_category: row.parent_category,
          aum_crore: 0,
          aaum_crore: 0
        };
      }
      acc[row.parent_category].aum_crore += row.aum_crore;
      acc[row.parent_category].aaum_crore += row.aaum_crore;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(aggregated);
  }
}
