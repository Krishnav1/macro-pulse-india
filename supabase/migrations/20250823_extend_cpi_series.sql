-- Extend CPI series to support multiple series types and comparison data

-- Add series_code column to existing cpi_series table
ALTER TABLE cpi_series 
ADD COLUMN series_code TEXT NOT NULL DEFAULT 'headline' 
CHECK (series_code IN ('headline', 'cfpi', 'core', 'wpi', 'food', 'fuel', 'housing', 'transport'));

-- Drop existing unique constraint and add new one with series_code
ALTER TABLE cpi_series DROP CONSTRAINT IF EXISTS cpi_series_date_geography_key;
ALTER TABLE cpi_series ADD CONSTRAINT cpi_series_date_geography_series_key 
UNIQUE(date, geography, series_code);

-- Create series metadata table for managing comparison series labels and visibility
CREATE TABLE cpi_series_meta (
  series_code TEXT PRIMARY KEY CHECK (series_code IN ('headline', 'cfpi', 'core', 'wpi', 'food', 'fuel', 'housing', 'transport')),
  label TEXT NOT NULL,
  short_label TEXT NOT NULL,
  unit TEXT DEFAULT 'index',
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  color TEXT DEFAULT '#0088FE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default series metadata
INSERT INTO cpi_series_meta (series_code, label, short_label, unit, is_visible, display_order, color) VALUES
('headline', 'Consumer Price Index (General)', 'CPI General', 'index', true, 1, '#0088FE'),
('cfpi', 'Consumer Food Price Index', 'Food CPI', 'index', true, 2, '#00C49F'),
('core', 'Core CPI (Excluding Food & Fuel)', 'Core CPI', 'index', true, 3, '#FFBB28'),
('wpi', 'Wholesale Price Index', 'WPI', 'index', true, 4, '#FF8042'),
('food', 'Food & Beverages CPI', 'Food CPI', 'index', true, 5, '#8884D8'),
('fuel', 'Fuel & Light CPI', 'Fuel CPI', 'index', true, 6, '#82CA9D'),
('housing', 'Housing CPI', 'Housing', 'index', true, 7, '#FFC658'),
('transport', 'Transport & Communication CPI', 'Transport', 'index', true, 8, '#FF7C7C');

-- Create new composite index for better query performance
CREATE INDEX idx_cpi_series_geo_series_date ON cpi_series(geography, series_code, date DESC);

-- Enable RLS for new table
ALTER TABLE cpi_series_meta ENABLE ROW LEVEL SECURITY;

-- Create policies for series metadata
CREATE POLICY "Allow public read access to cpi_series_meta" ON cpi_series_meta FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage cpi_series_meta" ON cpi_series_meta FOR ALL USING (auth.role() = 'authenticated');
