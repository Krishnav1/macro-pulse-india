-- Fix numeric field constraints for IIP tables
-- Increase precision for weight and growth fields to handle larger values

-- Update iip_series table
ALTER TABLE iip_series 
  ALTER COLUMN growth_yoy TYPE NUMERIC(8,2),
  ALTER COLUMN growth_mom TYPE NUMERIC(8,2);

-- Update iip_components table  
ALTER TABLE iip_components
  ALTER COLUMN weight TYPE NUMERIC(8,2),
  ALTER COLUMN growth_yoy TYPE NUMERIC(8,2),
  ALTER COLUMN growth_mom TYPE NUMERIC(8,2);
