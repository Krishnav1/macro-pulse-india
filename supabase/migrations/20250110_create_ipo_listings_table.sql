-- Create IPO Listings Table for Mainboard and SME IPOs
-- This table stores comprehensive IPO performance data with year-wise tracking

CREATE TABLE IF NOT EXISTS ipo_listings (
  id SERIAL PRIMARY KEY,
  
  -- Classification
  ipo_type TEXT NOT NULL CHECK (ipo_type IN ('mainboard', 'sme')),
  year INTEGER NOT NULL,
  
  -- Company Details
  company_name TEXT NOT NULL,
  sector TEXT,
  
  -- Issue Details
  issue_size NUMERIC, -- in Crores
  issue_price NUMERIC, -- in Rs
  listing_date DATE NOT NULL,
  
  -- Listing Day Performance
  listing_open NUMERIC, -- Opening price on listing day (Rs)
  listing_close NUMERIC, -- Closing price on listing day (Rs)
  listing_gain_percent NUMERIC, -- (listing_close - issue_price) / issue_price * 100
  
  -- Current Performance
  ltp NUMERIC, -- Last Traded Price (current) in Rs
  market_cap NUMERIC, -- in Crores
  current_gain_percent NUMERIC, -- (ltp - issue_price) / issue_price * 100
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(company_name, listing_date, ipo_type)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_ipo_type_year ON ipo_listings(ipo_type, year);
CREATE INDEX IF NOT EXISTS idx_listing_date ON ipo_listings(listing_date);
CREATE INDEX IF NOT EXISTS idx_year ON ipo_listings(year);
CREATE INDEX IF NOT EXISTS idx_sector ON ipo_listings(sector);

-- Create upload tracking table
CREATE TABLE IF NOT EXISTS ipo_uploads (
  id SERIAL PRIMARY KEY,
  ipo_type TEXT NOT NULL,
  year INTEGER NOT NULL,
  records_count INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT
);

-- Enable Row Level Security
ALTER TABLE ipo_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ipo_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to ipo_listings"
  ON ipo_listings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to ipo_listings"
  ON ipo_listings FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to ipo_listings"
  ON ipo_listings FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete to ipo_listings"
  ON ipo_listings FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to ipo_uploads"
  ON ipo_uploads FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to ipo_uploads"
  ON ipo_uploads FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ipo_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_ipo_listings_updated_at
  BEFORE UPDATE ON ipo_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_ipo_listings_updated_at();

-- Insert sample data for testing (optional)
INSERT INTO ipo_listings (ipo_type, year, company_name, sector, issue_size, issue_price, listing_date, listing_open, listing_close, listing_gain_percent, ltp, market_cap, current_gain_percent)
VALUES 
  ('mainboard', 2024, 'Jaintech Aerospace', 'Technology', 200.0, 392, '2024-12-31', 1400, 1370.3, 80.00, 1092.5, 5060, 39.20),
  ('sme', 2024, 'Senores Pharmaceuticals Ltd.', 'Pharmaceuticals', 582.1, 391, '2024-12-30', 600, 557, 53.50, 673, 3099.6, 72.10)
ON CONFLICT (company_name, listing_date, ipo_type) DO NOTHING;
