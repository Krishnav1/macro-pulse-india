-- =====================================================
-- FII/DII Data Tables Migration
-- Created: 2025-01-08
-- Description: Creates 7 tables for FII/DII activity data
-- =====================================================

-- Drop old tables if they exist
DROP TABLE IF EXISTS fii_dii_monthly_data CASCADE;
DROP TABLE IF EXISTS fii_dii_daily_data CASCADE;
DROP TABLE IF EXISTS fii_dii_derivatives_data CASCADE;

-- =====================================================
-- Table 1: Cash Provisional (Summary)
-- =====================================================
CREATE TABLE IF NOT EXISTS fii_dii_cash_provisional (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  financial_year TEXT NOT NULL,
  month_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  fii_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  fii_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  fii_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  dii_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  dii_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  dii_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

CREATE INDEX idx_cash_prov_date ON fii_dii_cash_provisional(date DESC);
CREATE INDEX idx_cash_prov_fy ON fii_dii_cash_provisional(financial_year);
CREATE INDEX idx_cash_prov_month ON fii_dii_cash_provisional(month_name);
CREATE INDEX idx_cash_prov_quarter ON fii_dii_cash_provisional(quarter);

ALTER TABLE fii_dii_cash_provisional ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON fii_dii_cash_provisional FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON fii_dii_cash_provisional FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON fii_dii_cash_provisional FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON fii_dii_cash_provisional FOR DELETE USING (true);

-- =====================================================
-- Table 2: FII Cash Data (Equity + Debt)
-- =====================================================
CREATE TABLE IF NOT EXISTS fii_cash_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  financial_year TEXT NOT NULL,
  month_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  equity_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  equity_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  equity_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  debt_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  debt_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  debt_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

CREATE INDEX idx_fii_cash_date ON fii_cash_data(date DESC);
CREATE INDEX idx_fii_cash_fy ON fii_cash_data(financial_year);
CREATE INDEX idx_fii_cash_month ON fii_cash_data(month_name);
CREATE INDEX idx_fii_cash_quarter ON fii_cash_data(quarter);

ALTER TABLE fii_cash_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON fii_cash_data FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON fii_cash_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON fii_cash_data FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON fii_cash_data FOR DELETE USING (true);

-- =====================================================
-- Table 3: FII F&O Indices (Futures + Options)
-- =====================================================
CREATE TABLE IF NOT EXISTS fii_fo_indices_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  financial_year TEXT NOT NULL,
  month_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  futures_gross_purchase_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  futures_gross_sales_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  futures_net_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_gross_purchase_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_gross_sales_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_net_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

CREATE INDEX idx_fii_fo_idx_date ON fii_fo_indices_data(date DESC);
CREATE INDEX idx_fii_fo_idx_fy ON fii_fo_indices_data(financial_year);
CREATE INDEX idx_fii_fo_idx_month ON fii_fo_indices_data(month_name);
CREATE INDEX idx_fii_fo_idx_quarter ON fii_fo_indices_data(quarter);

ALTER TABLE fii_fo_indices_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON fii_fo_indices_data FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON fii_fo_indices_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON fii_fo_indices_data FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON fii_fo_indices_data FOR DELETE USING (true);

-- =====================================================
-- Table 4: FII F&O Stocks (Futures + Options)
-- =====================================================
CREATE TABLE IF NOT EXISTS fii_fo_stocks_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  financial_year TEXT NOT NULL,
  month_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  futures_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  futures_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  futures_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

CREATE INDEX idx_fii_fo_stk_date ON fii_fo_stocks_data(date DESC);
CREATE INDEX idx_fii_fo_stk_fy ON fii_fo_stocks_data(financial_year);
CREATE INDEX idx_fii_fo_stk_month ON fii_fo_stocks_data(month_name);
CREATE INDEX idx_fii_fo_stk_quarter ON fii_fo_stocks_data(quarter);

ALTER TABLE fii_fo_stocks_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON fii_fo_stocks_data FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON fii_fo_stocks_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON fii_fo_stocks_data FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON fii_fo_stocks_data FOR DELETE USING (true);

-- =====================================================
-- Table 5: DII Cash Data (Equity + Debt)
-- =====================================================
CREATE TABLE IF NOT EXISTS dii_cash_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  financial_year TEXT NOT NULL,
  month_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  equity_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  equity_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  equity_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  debt_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  debt_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  debt_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

CREATE INDEX idx_dii_cash_date ON dii_cash_data(date DESC);
CREATE INDEX idx_dii_cash_fy ON dii_cash_data(financial_year);
CREATE INDEX idx_dii_cash_month ON dii_cash_data(month_name);
CREATE INDEX idx_dii_cash_quarter ON dii_cash_data(quarter);

ALTER TABLE dii_cash_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON dii_cash_data FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON dii_cash_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON dii_cash_data FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON dii_cash_data FOR DELETE USING (true);

-- =====================================================
-- Table 6: DII F&O Indices (Futures + Options)
-- =====================================================
CREATE TABLE IF NOT EXISTS dii_fo_indices_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  financial_year TEXT NOT NULL,
  month_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  futures_gross_purchase_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  futures_gross_sales_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  futures_net_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_gross_purchase_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_gross_sales_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_net_indices NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

CREATE INDEX idx_dii_fo_idx_date ON dii_fo_indices_data(date DESC);
CREATE INDEX idx_dii_fo_idx_fy ON dii_fo_indices_data(financial_year);
CREATE INDEX idx_dii_fo_idx_month ON dii_fo_indices_data(month_name);
CREATE INDEX idx_dii_fo_idx_quarter ON dii_fo_indices_data(quarter);

ALTER TABLE dii_fo_indices_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON dii_fo_indices_data FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON dii_fo_indices_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON dii_fo_indices_data FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON dii_fo_indices_data FOR DELETE USING (true);

-- =====================================================
-- Table 7: DII F&O Stocks (Futures + Options)
-- =====================================================
CREATE TABLE IF NOT EXISTS dii_fo_stocks_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  financial_year TEXT NOT NULL,
  month_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  futures_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  futures_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  futures_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_gross_purchase NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0,
  options_net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

CREATE INDEX idx_dii_fo_stk_date ON dii_fo_stocks_data(date DESC);
CREATE INDEX idx_dii_fo_stk_fy ON dii_fo_stocks_data(financial_year);
CREATE INDEX idx_dii_fo_stk_month ON dii_fo_stocks_data(month_name);
CREATE INDEX idx_dii_fo_stk_quarter ON dii_fo_stocks_data(quarter);

ALTER TABLE dii_fo_stocks_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON dii_fo_stocks_data FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON dii_fo_stocks_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON dii_fo_stocks_data FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON dii_fo_stocks_data FOR DELETE USING (true);

-- =====================================================
-- Table 8: Upload Tracking
-- =====================================================
CREATE TABLE IF NOT EXISTS fii_dii_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_type TEXT NOT NULL,
  file_name TEXT,
  records_count INTEGER NOT NULL DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_uploads_type ON fii_dii_uploads(upload_type);
CREATE INDEX idx_uploads_date ON fii_dii_uploads(uploaded_at DESC);

ALTER TABLE fii_dii_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON fii_dii_uploads FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON fii_dii_uploads FOR INSERT WITH CHECK (true);

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE fii_dii_cash_provisional IS 'Daily FII/DII cash provisional data - Summary of gross buy/sell/net';
COMMENT ON TABLE fii_cash_data IS 'Daily FII cash market data - Equity and Debt breakdown';
COMMENT ON TABLE fii_fo_indices_data IS 'Daily FII F&O indices data - Futures and Options on indices';
COMMENT ON TABLE fii_fo_stocks_data IS 'Daily FII F&O stocks data - Futures and Options on stocks';
COMMENT ON TABLE dii_cash_data IS 'Daily DII cash market data - Equity and Debt breakdown';
COMMENT ON TABLE dii_fo_indices_data IS 'Daily DII F&O indices data - Futures and Options on indices';
COMMENT ON TABLE dii_fo_stocks_data IS 'Daily DII F&O stocks data - Futures and Options on stocks';
COMMENT ON TABLE fii_dii_uploads IS 'Upload tracking for FII/DII data imports';
