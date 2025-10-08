// FII/DII Data Types

export interface CashProvisionalData {
  id: string;
  date: string;
  financial_year: string;
  month_name: string;
  quarter: string;
  fii_gross_purchase: number;
  fii_gross_sales: number;
  fii_net: number;
  dii_gross_purchase: number;
  dii_gross_sales: number;
  dii_net: number;
  created_at: string;
  updated_at: string;
}

export interface FIICashData {
  id: string;
  date: string;
  financial_year: string;
  month_name: string;
  quarter: string;
  equity_gross_purchase: number;
  equity_gross_sales: number;
  equity_net: number;
  debt_gross_purchase: number;
  debt_gross_sales: number;
  debt_net: number;
  created_at: string;
  updated_at: string;
}

export interface FIIFOIndicesData {
  id: string;
  date: string;
  financial_year: string;
  month_name: string;
  quarter: string;
  futures_gross_purchase_indices: number;
  futures_gross_sales_indices: number;
  futures_net_indices: number;
  options_gross_purchase_indices: number;
  options_gross_sales_indices: number;
  options_net_indices: number;
  created_at: string;
  updated_at: string;
}

export interface FIIFOStocksData {
  id: string;
  date: string;
  financial_year: string;
  month_name: string;
  quarter: string;
  futures_gross_purchase: number;
  futures_gross_sales: number;
  futures_net: number;
  options_gross_purchase: number;
  options_gross_sales: number;
  options_net: number;
  created_at: string;
  updated_at: string;
}

export interface DIICashData {
  id: string;
  date: string;
  financial_year: string;
  month_name: string;
  quarter: string;
  equity_gross_purchase: number;
  equity_gross_sales: number;
  equity_net: number;
  debt_gross_purchase: number;
  debt_gross_sales: number;
  debt_net: number;
  created_at: string;
  updated_at: string;
}

export interface DIIFOIndicesData {
  id: string;
  date: string;
  financial_year: string;
  month_name: string;
  quarter: string;
  futures_gross_purchase_indices: number;
  futures_gross_sales_indices: number;
  futures_net_indices: number;
  options_gross_purchase_indices: number;
  options_gross_sales_indices: number;
  options_net_indices: number;
  created_at: string;
  updated_at: string;
}

export interface DIIFOStocksData {
  id: string;
  date: string;
  financial_year: string;
  month_name: string;
  quarter: string;
  futures_gross_purchase: number;
  futures_gross_sales: number;
  futures_net: number;
  options_gross_purchase: number;
  options_gross_sales: number;
  options_net: number;
  created_at: string;
  updated_at: string;
}

export interface FIIDIIUpload {
  id: string;
  upload_type: string;
  file_name: string;
  records_count: number;
  date_range_start: string;
  date_range_end: string;
  uploaded_by: string;
  uploaded_at: string;
}

// Aggregated data types for analysis
export interface AggregatedData {
  period: string; // Date, Month, or Quarter
  fii_net: number;
  dii_net: number;
  combined_net: number;
  fii_gross_activity: number;
  dii_gross_activity: number;
}

export interface SegmentData {
  segment: string;
  fii_net: number;
  dii_net: number;
  gross_activity: number;
}

// Filter options
export type ViewType = 'daily' | 'monthly' | 'quarterly' | 'yearly';
export type DataCategory = 
  | 'cash_provisional'
  | 'fii_cash'
  | 'fii_fo_indices'
  | 'fii_fo_stocks'
  | 'dii_cash'
  | 'dii_fo_indices'
  | 'dii_fo_stocks';
