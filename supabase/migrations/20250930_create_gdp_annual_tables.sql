-- Create GDP Annual Value table for annual GDP values
CREATE TABLE IF NOT EXISTS gdp_annual (
    id BIGSERIAL PRIMARY KEY,
    year TEXT NOT NULL,
    -- Private Final Consumption Expenditure (PFCE)
    pfce_constant_price DECIMAL(15,2),
    pfce_current_price DECIMAL(15,2),
    -- Government Final Consumption Expenditure (GFCE)
    gfce_constant_price DECIMAL(15,2),
    gfce_current_price DECIMAL(15,2),
    -- Gross Fixed Capital Formation (GFCF)
    gfcf_constant_price DECIMAL(15,2),
    gfcf_current_price DECIMAL(15,2),
    -- Changes in Stocks (inventories)
    changes_in_stocks_constant_price DECIMAL(15,2),
    changes_in_stocks_current_price DECIMAL(15,2),
    -- Valuables
    valuables_constant_price DECIMAL(15,2),
    valuables_current_price DECIMAL(15,2),
    -- Exports of Goods & Services
    exports_constant_price DECIMAL(15,2),
    exports_current_price DECIMAL(15,2),
    -- Imports of Goods & Services
    imports_constant_price DECIMAL(15,2),
    imports_current_price DECIMAL(15,2),
    -- Discrepancies
    discrepancies_constant_price DECIMAL(15,2),
    discrepancies_current_price DECIMAL(15,2),
    -- Total GDP
    gdp_constant_price DECIMAL(15,2),
    gdp_current_price DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year)
);

-- Create GDP Annual Growth table for annual growth percentages
CREATE TABLE IF NOT EXISTS gdp_annual_growth (
    id BIGSERIAL PRIMARY KEY,
    year TEXT NOT NULL,
    -- Private Final Consumption Expenditure (PFCE) Growth
    pfce_constant_price_growth DECIMAL(8,2),
    pfce_current_price_growth DECIMAL(8,2),
    -- Government Final Consumption Expenditure (GFCE) Growth
    gfce_constant_price_growth DECIMAL(8,2),
    gfce_current_price_growth DECIMAL(8,2),
    -- Gross Fixed Capital Formation (GFCF) Growth
    gfcf_constant_price_growth DECIMAL(8,2),
    gfcf_current_price_growth DECIMAL(8,2),
    -- Changes in Stocks Growth
    changes_in_stocks_constant_price_growth DECIMAL(8,2),
    changes_in_stocks_current_price_growth DECIMAL(8,2),
    -- Valuables Growth
    valuables_constant_price_growth DECIMAL(8,2),
    valuables_current_price_growth DECIMAL(8,2),
    -- Exports Growth
    exports_constant_price_growth DECIMAL(8,2),
    exports_current_price_growth DECIMAL(8,2),
    -- Imports Growth
    imports_constant_price_growth DECIMAL(8,2),
    imports_current_price_growth DECIMAL(8,2),
    -- Discrepancies Growth
    discrepancies_constant_price_growth DECIMAL(8,2),
    discrepancies_current_price_growth DECIMAL(8,2),
    -- Total GDP Growth
    gdp_constant_price_growth DECIMAL(8,2),
    gdp_current_price_growth DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gdp_annual_year ON gdp_annual(year);
CREATE INDEX IF NOT EXISTS idx_gdp_annual_growth_year ON gdp_annual_growth(year);

-- Add RLS policies
ALTER TABLE gdp_annual ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdp_annual_growth ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to gdp_annual" ON gdp_annual
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to gdp_annual_growth" ON gdp_annual_growth
    FOR SELECT USING (true);

-- Allow insert/update/delete for authenticated users (for admin functionality)
CREATE POLICY "Allow full access to gdp_annual for authenticated users" ON gdp_annual
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access to gdp_annual_growth for authenticated users" ON gdp_annual_growth
    FOR ALL USING (auth.role() = 'authenticated');
