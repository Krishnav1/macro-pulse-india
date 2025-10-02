// =====================================================
// INVESTOR BEHAVIOR TYPES
// TypeScript interfaces for investor behavior data
// =====================================================

export type AgeGroup = 'Corporates' | 'Banks/FIs' | 'HNI' | 'Retail' | 'NRI' | 'High Networth Individuals';
export type AssetType = 'EQUITY' | 'NON-EQUITY';
export type HoldingPeriod = '0-1 Month' | '1-3 Months' | '3-6 Months' | '6-12 Months' | '12-24 Months' | '> 24 Months';

// Raw data row from Excel/CSV
export interface InvestorBehaviorRow {
  age_group: string;
  asset_type: AssetType;
  aum_0_1_month: number;
  aum_1_3_months: number;
  aum_3_6_months: number;
  aum_6_12_months: number;
  aum_12_24_months: number;
  aum_above_24_months: number;
}

// Parsed file structure
export interface ParsedInvestorBehaviorFile {
  quarter_end_date: string; // YYYY-MM-DD
  quarter_label: string; // e.g., "Q1 FY2024-25"
  rows: InvestorBehaviorRow[];
  total_aum_crore: number;
  metadata: {
    total_records: number;
    equity_total: number;
    non_equity_total: number;
    age_groups: string[];
  };
}

// Database record structure
export interface InvestorBehaviorRecord {
  quarter_end_date: string;
  quarter_label: string;
  age_group: string;
  asset_type: AssetType;
  aum_0_1_month: number;
  aum_1_3_months: number;
  aum_3_6_months: number;
  aum_6_12_months: number;
  aum_12_24_months: number;
  aum_above_24_months: number;
  total_aum: number;
  pct_0_1_month: number;
  pct_1_3_months: number;
  pct_3_6_months: number;
  pct_6_12_months: number;
  pct_12_24_months: number;
  pct_above_24_months: number;
  avg_holding_period_months: number;
  churn_risk_score: number;
  stickiness_score: number;
}

// Aggregated metrics
export interface InvestorMetrics {
  quarter_end_date: string;
  total_aum: number;
  avg_holding_period: number;
  long_term_percentage: number; // >24 months
  short_term_percentage: number; // 0-3 months
  churn_risk_level: 'Low' | 'Medium' | 'High';
  equity_percentage: number;
  non_equity_percentage: number;
}

// Age group analysis
export interface AgeGroupAnalysis {
  age_group: string;
  total_aum: number;
  equity_aum: number;
  non_equity_aum: number;
  equity_percentage: number;
  avg_holding_period: number;
  churn_risk_score: number;
  stickiness_score: number;
  holding_distribution: {
    '0-1': number;
    '1-3': number;
    '3-6': number;
    '6-12': number;
    '12-24': number;
    '>24': number;
  };
}

// Holding period trend
export interface HoldingPeriodTrend {
  quarter_end_date: string;
  quarter_label: string;
  '0-1_month': number;
  '1-3_months': number;
  '3-6_months': number;
  '6-12_months': number;
  '12-24_months': number;
  'above_24_months': number;
  total_aum: number;
}

// Churn risk data
export interface ChurnRiskData {
  age_group: string;
  asset_type: AssetType;
  churn_risk_score: number;
  short_term_aum: number; // 0-3 months
  total_aum: number;
  risk_level: 'Low' | 'Medium' | 'High';
}

// Upload status
export interface UploadStatus {
  id: string;
  quarter_end_date: string;
  quarter_label: string;
  file_name: string;
  total_records: number;
  total_aum_crore: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploaded_at: string;
  processed_at?: string;
}
