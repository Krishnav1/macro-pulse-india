-- Create IIP (Index of Industrial Production) tables for comprehensive data management

-- IIP Series data (main time series - General Index)
CREATE TABLE iip_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  index_value NUMERIC(10,2) NOT NULL,
  growth_yoy NUMERIC(5,2),
  growth_mom NUMERIC(5,2),
  base_year TEXT DEFAULT '2011-12=100',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- IIP Components data (sectoral and use-based classification breakdown)
CREATE TABLE iip_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  classification_type TEXT NOT NULL CHECK (classification_type IN ('sectoral', 'use_based')),
  component_code TEXT NOT NULL,
  component_name TEXT NOT NULL,
  index_value NUMERIC(10,2) NOT NULL,
  weight NUMERIC(5,2),
  growth_yoy NUMERIC(5,2),
  growth_mom NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, classification_type, component_code)
);

-- IIP Events (economic events affecting IIP)
CREATE TABLE iip_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact TEXT CHECK (impact IN ('low', 'medium', 'high')) DEFAULT 'medium',
  tag TEXT, -- e.g., 'policy', 'manufacturing', 'mining', 'electricity'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IIP Insights (admin-managed interpretations)
CREATE TABLE iip_insights (
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
CREATE INDEX idx_iip_series_date ON iip_series(date);
CREATE INDEX idx_iip_components_date_class ON iip_components(date, classification_type);
CREATE INDEX idx_iip_events_date ON iip_events(date);
CREATE INDEX idx_iip_insights_section ON iip_insights(section, order_index);

-- Enable RLS
ALTER TABLE iip_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE iip_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE iip_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE iip_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to iip_series" ON iip_series FOR SELECT USING (true);
CREATE POLICY "Allow public read access to iip_components" ON iip_components FOR SELECT USING (true);
CREATE POLICY "Allow public read access to iip_events" ON iip_events FOR SELECT USING (true);
CREATE POLICY "Allow public read access to iip_insights" ON iip_insights FOR SELECT USING (is_active = true);

-- Admin write policies (authenticated users only)
CREATE POLICY "Allow authenticated users to manage iip_events" ON iip_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage iip_insights" ON iip_insights FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage iip_series" ON iip_series FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage iip_components" ON iip_components FOR ALL USING (auth.role() = 'authenticated');
