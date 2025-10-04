// =====================================================
// QUARTERLY AUM DATA TYPES
// =====================================================

export interface QuarterlyAUMData {
  id: string;
  quarter_end_date: string;
  quarter_label: string;
  fiscal_year: string | null;
  
  // Category hierarchy
  category_level_1: string | null;
  category_level_2: string | null;
  category_level_3: string | null;
  category_level_4: string | null;
  category_level_5: string | null;
  
  // Unified fields
  category_code: string;
  category_display_name: string;
  parent_category: 'Equity' | 'Debt' | 'Hybrid' | 'Other';
  scheme_type: string | null;
  
  data_format_version: 'aggregated' | 'detailed';
  
  // AUM values
  aum_crore: number;
  aaum_crore: number;
  
  // Calculated fields
  qoq_change_crore: number | null;
  qoq_change_percent: number | null;
  yoy_change_crore: number | null;
  yoy_change_percent: number | null;
  
  // Metadata
  is_subtotal: boolean;
  is_total: boolean;
  notes: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface CategoryMapping {
  id: string;
  old_category_code: string | null;
  old_category_name: string | null;
  new_category_code: string | null;
  new_category_name: string | null;
  new_category_hierarchy: string | null;
  unified_category_code: string;
  unified_category_name: string;
  parent_category: 'Equity' | 'Debt' | 'Hybrid' | 'Other';
  mapping_type: 'one_to_one' | 'one_to_many' | 'many_to_one';
  is_active: boolean;
}

export interface UploadHistory {
  id: string;
  quarter_end_date: string;
  quarter_label: string;
  data_format_version: 'aggregated' | 'detailed';
  file_name: string | null;
  file_size_kb: number | null;
  total_categories: number | null;
  total_aum_crore: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
  processed_at: string | null;
}

// Parsed data from Excel/CSV
export interface ParsedAUMRow {
  category_name: string;
  aum_crore: number;
  aaum_crore: number;
  category_level_1?: string;
  category_level_2?: string;
  category_level_3?: string;
  category_level_4?: string;
  is_subtotal?: boolean;
  is_grand_total?: boolean;
  parent_category?: 'Equity' | 'Debt' | 'Hybrid' | 'Other';
}

export interface ParsedAUMFile {
  quarter_end_date: string;
  quarter_label: string;
  fiscal_year: string;
  data_format_version: 'aggregated' | 'detailed';
  total_aum_crore: number;
  rows: ParsedAUMRow[];
}

// Analysis types
export interface AUMTrend {
  quarter_end_date: string;
  quarter_label: string;
  total_aum_crore: number;
  total_aaum_crore: number;
  qoq_change_percent: number | null;
  yoy_change_percent: number | null;
}

export interface CategoryBreakdown {
  parent_category: 'Equity' | 'Debt' | 'Hybrid' | 'Other';
  aum_crore: number;
  percentage: number;
  qoq_change_percent: number | null;
}

export interface CategoryTrend {
  category_code: string;
  category_name: string;
  parent_category: string;
  data: {
    quarter_end_date: string;
    quarter_label: string;
    aum_crore: number;
    market_share_percent: number;
  }[];
}

export interface InvestorBehaviorMetrics {
  quarter_end_date: string;
  equity_debt_ratio: number;
  liquidity_preference_percent: number;
  passive_penetration_percent: number;
  risk_appetite_score: number; // 0-100
}
