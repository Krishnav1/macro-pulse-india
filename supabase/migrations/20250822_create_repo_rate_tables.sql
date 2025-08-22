-- Create tables for repo rate data management

-- Repo rate historical data
CREATE TABLE repo_rate_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  rate DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Economic events that impacted repo rate
CREATE TABLE repo_rate_events (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  impact VARCHAR(10) CHECK (impact IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Key insights about repo rate
CREATE TABLE repo_rate_insights (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comparison indicators available for repo rate
CREATE TABLE repo_rate_comparisons (
  id SERIAL PRIMARY KEY,
  indicator_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_repo_rate_data_date ON repo_rate_data(date DESC);
CREATE INDEX idx_repo_rate_events_date ON repo_rate_events(date DESC);
CREATE INDEX idx_repo_rate_insights_order ON repo_rate_insights(order_index);

-- Insert initial data
INSERT INTO repo_rate_data (date, rate) VALUES
  ('2025-08-06', 5.50),
  ('2025-06-06', 5.50),
  ('2025-04-09', 6.00),
  ('2025-02-07', 6.20),
  ('2024-12-06', 6.50),
  ('2024-10-09', 6.50),
  ('2024-08-08', 6.50),
  ('2024-06-07', 6.50),
  ('2024-04-05', 6.50),
  ('2024-02-08', 6.50),
  ('2023-12-08', 6.50),
  ('2023-10-06', 6.50),
  ('2023-08-10', 6.50);

INSERT INTO repo_rate_events (date, description, impact) VALUES
  ('2025-02-07', 'RBI cuts repo rate by 20 bps amid easing inflation', 'medium'),
  ('2024-02-08', 'RBI maintains status quo, signals data-dependent approach', 'low'),
  ('2023-02-08', 'Final rate hike of the tightening cycle', 'high'),
  ('2022-05-04', 'Emergency rate hike due to inflation surge post Ukraine war', 'high'),
  ('2020-03-27', 'Emergency rate cut during COVID-19 pandemic', 'high');

INSERT INTO repo_rate_insights (content, order_index) VALUES
  ('The repo rate at 5.50% reflects RBI''s accommodative stance amid controlled inflation expectations and growth concerns.', 1),
  ('Current rate is 100 bps below the peak of 6.50% reached in early 2023, indicating a shift towards supporting economic growth.', 2),
  ('The rate cut cycle began in February 2025 as inflation moderated below RBI''s 4% target, providing room for monetary easing.', 3),
  ('Real interest rates remain positive at approximately 3.95%, ensuring financial stability while supporting credit growth.', 4),
  ('Market expects further 25-50 bps cuts in 2025 based on inflation trajectory and global monetary policy trends.', 5);

INSERT INTO repo_rate_comparisons (indicator_id, name, category) VALUES
  ('cpi_inflation', 'CPI Inflation', 'Inflation'),
  ('gsec_yield_10y', '10-Year G-Sec Yield', 'Interest Rate'),
  ('bank_credit_growth', 'Bank Credit Growth', 'Financial'),
  ('real_gdp_growth', 'Real GDP Growth', 'Growth'),
  ('mclr', 'MCLR', 'Financial Sector Soundness'),
  ('term_deposit_rate', 'Term Deposit Rate', 'Financial Sector Soundness');
