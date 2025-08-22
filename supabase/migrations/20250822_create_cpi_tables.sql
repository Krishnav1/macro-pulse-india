-- Create CPI-specific tables for comprehensive data management

-- CPI Series data (main time series)
CREATE TABLE cpi_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  geography TEXT NOT NULL CHECK (geography IN ('rural', 'urban', 'combined')),
  index_value NUMERIC(10,2) NOT NULL,
  inflation_yoy NUMERIC(5,2),
  inflation_mom NUMERIC(5,2),
  base_year TEXT DEFAULT '2012=100',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, geography)
);

-- CPI Components data (category-wise breakdown)
CREATE TABLE cpi_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  geography TEXT NOT NULL CHECK (geography IN ('rural', 'urban', 'combined')),
  component_code TEXT NOT NULL,
  component_name TEXT NOT NULL,
  index_value NUMERIC(10,2) NOT NULL,
  weight NUMERIC(5,2),
  inflation_yoy NUMERIC(5,2),
  contribution_to_inflation NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, geography, component_code)
);

-- CPI Events (economic events affecting CPI)
CREATE TABLE cpi_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')) DEFAULT 'medium',
  tag TEXT, -- e.g., 'policy', 'commodity', 'pandemic'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CPI Insights (admin-managed interpretations)
CREATE TABLE cpi_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT CHECK (section IN ('overview', 'trend', 'components', 'compare')) NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  chart_key TEXT, -- optional reference to specific chart
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_cpi_series_date_geo ON cpi_series(date, geography);
CREATE INDEX idx_cpi_components_date_geo ON cpi_components(date, geography);
CREATE INDEX idx_cpi_events_date ON cpi_events(date);
CREATE INDEX idx_cpi_insights_section ON cpi_insights(section, order_index);

-- Enable RLS
ALTER TABLE cpi_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpi_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpi_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpi_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to cpi_series" ON cpi_series FOR SELECT USING (true);
CREATE POLICY "Allow public read access to cpi_components" ON cpi_components FOR SELECT USING (true);
CREATE POLICY "Allow public read access to cpi_events" ON cpi_events FOR SELECT USING (true);
CREATE POLICY "Allow public read access to cpi_insights" ON cpi_insights FOR SELECT USING (is_active = true);

-- Admin write policies (authenticated users only)
CREATE POLICY "Allow authenticated users to manage cpi_events" ON cpi_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage cpi_insights" ON cpi_insights FOR ALL USING (auth.role() = 'authenticated');
