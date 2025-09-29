import { ValidationResult } from './GdpAdminTypes';

// Helper function to find column name variations
export const findColumnValue = (row: any, possibleNames: string[]): any => {
  for (const name of possibleNames) {
    if (row[name] !== undefined && row[name] !== null) {
      // Allow empty strings for optional fields, but return the value
      return row[name];
    }
  }
  return null;
};

// Helper function to parse numbers from various formats
export const parseNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim();
    if (cleaned === '' || cleaned.toLowerCase() === 'na' || cleaned === '-') return 0;
    const num = Number(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

export const validateValueRow = (row: any): ValidationResult => {
  const errors: string[] = [];
  
  // Check for Year column variations
  const yearValue = findColumnValue(row, ['Year', 'year', 'YEAR', 'Financial Year', 'FY']);
  if (!yearValue) errors.push('Missing Year');
  
  // For quarterly data, check Quarter column variations
  const quarterValue = findColumnValue(row, ['Quarter', 'quarter', 'QUARTER', 'Q', 'Qtr']);
  if (!quarterValue) errors.push('Missing Quarter');
  
  // Define field mappings for quarterly data (simplified column names)
  const fieldMappings = [
    {
      name: 'PFCE',
      variations: ['PFCE', 'pfce', 'Private Final Consumption Expenditure']
    },
    {
      name: 'GFCE',
      variations: ['GFCE', 'gfce', 'Government Final Consumption Expenditure']
    },
    {
      name: 'GFCF',
      variations: ['GFCF', 'gfcf', 'Gross Fixed Capital Formation']
    },
    {
      name: 'Changes in Stocks',
      variations: ['Changes in Stocks', 'changes_in_stocks', 'Changes_in_Stocks']
    },
    {
      name: 'Valuables',
      variations: ['Valuables', 'valuables']
    },
    {
      name: 'Exports',
      variations: ['Exports', 'exports']
    },
    {
      name: 'Imports',
      variations: ['Imports', 'imports']
    },
    {
      name: 'Discrepancies',
      variations: ['Discrepancies', 'discrepancies']
    },
    {
      name: 'GDP',
      variations: ['GDP', 'gdp', 'Gross Domestic Product']
    }
  ];
  
  fieldMappings.forEach(field => {
    const value = findColumnValue(row, field.variations);
    if (value === null) {
      errors.push(`Missing column for ${field.name}`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

export const validateGrowthRow = (row: any): ValidationResult => {
  const errors: string[] = [];
  
  // Check for Year column variations
  const yearValue = findColumnValue(row, ['Year', 'year', 'YEAR', 'Financial Year', 'FY']);
  if (!yearValue) errors.push('Missing Year');
  
  // For quarterly data, check Quarter column variations
  const quarterValue = findColumnValue(row, ['Quarter', 'quarter', 'QUARTER', 'Q', 'Qtr']);
  if (!quarterValue) errors.push('Missing Quarter');
  
  // Define field mappings for quarterly growth data (% growth format)
  const fieldMappings = [
    {
      name: 'PFCE (% growth)',
      variations: ['PFCE (% growth)', 'PFCE (%growth)', 'PFCE_growth', 'pfce_growth']
    },
    {
      name: 'GFCE (% growth)',
      variations: ['GFCE (% growth)', 'GFCE (%growth)', 'GFCE_growth', 'gfce_growth']
    },
    {
      name: 'GFCF (% growth)',
      variations: ['GFCF (% growth)', 'GFCF (%growth)', 'GFCF_growth', 'gfcf_growth']
    },
    {
      name: 'Changes in Stocks (% growth)',
      variations: ['Changes in Stocks (% growth)', 'Changes in Stocks (%growth)', 'changes_in_stocks_growth']
    },
    {
      name: 'Valuables (% growth)',
      variations: ['Valuables (% growth)', 'Valuables (%growth)', 'valuables_growth']
    },
    {
      name: 'Exports (% growth)',
      variations: ['Exports (% growth)', 'Exports (%growth)', 'exports_growth']
    },
    {
      name: 'Imports (% growth)',
      variations: ['Imports (% growth)', 'Imports (%growth)', 'imports_growth']
    },
    {
      name: 'Discrepancies (% growth)',
      variations: ['Discrepancies (% growth)', 'Discrepancies (%growth)', 'discrepancies_growth']
    },
    {
      name: 'GDP (% growth)',
      variations: ['GDP (% growth)', 'GDP (%growth)', 'GDP_growth', 'gdp_growth']
    }
  ];
  
  fieldMappings.forEach(field => {
    const value = findColumnValue(row, field.variations);
    if (value === null) {
      errors.push(`Missing column for ${field.name}`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

export const validateAnnualValueRow = (row: any): ValidationResult => {
  const errors: string[] = [];
  
  // Check for Year column variations (no Quarter needed for annual data)
  const yearValue = findColumnValue(row, ['Year', 'year', 'YEAR', 'Financial Year', 'FY']);
  if (!yearValue) errors.push('Missing Year');
  
  // Define field mappings for annual value data (both constant and current prices)
  const fieldMappings = [
    {
      name: 'PFCE Constant Price',
      variations: ['PFCE Constant Price', 'PFCE_Constant_Price', 'pfce_constant_price']
    },
    {
      name: 'PFCE Current Price', 
      variations: ['PFCE Current Price', 'PFCE_Current_Price', 'pfce_current_price']
    },
    {
      name: 'GFCE Constant Price',
      variations: ['GFCE Constant Price', 'GFCE_Constant_Price', 'gfce_constant_price']
    },
    {
      name: 'GFCE Current Price',
      variations: ['GFCE Current Price', 'GFCE_Current_Price', 'gfce_current_price']
    },
    {
      name: 'GFCF Constant Price',
      variations: ['GFCF Constant Price', 'GFCF_Constant_Price', 'gfcf_constant_price']
    },
    {
      name: 'GFCF Current Price',
      variations: ['GFCF Current Price', 'GFCF_Current_Price', 'gfcf_current_price']
    },
    {
      name: 'Changes in Stocks Constant Price',
      variations: ['Changes in Stocks Constant Price', 'Changes_in_Stocks_Constant_Price', 'changes_in_stocks_constant_price']
    },
    {
      name: 'Changes in Stocks Current Price',
      variations: ['Changes in Stocks Current Price', 'Changes_in_Stocks_Current_Price', 'changes_in_stocks_current_price']
    },
    {
      name: 'Valuables Constant Price',
      variations: ['Valuables Constant Price', 'Valuables_Constant_Price', 'valuables_constant_price']
    },
    {
      name: 'Valuables Current Price',
      variations: ['Valuables Current Price', 'Valuables_Current_Price', 'valuables_current_price']
    },
    {
      name: 'Exports Constant Price',
      variations: ['Exports Constant Price', 'Exports_Constant_Price', 'exports_constant_price']
    },
    {
      name: 'Exports Current Price',
      variations: ['Exports Current Price', 'Exports_Current_Price', 'exports_current_price']
    },
    {
      name: 'Imports Constant Price',
      variations: ['Imports Constant Price', 'Imports_Constant_Price', 'imports_constant_price']
    },
    {
      name: 'Imports Current Price',
      variations: ['Imports Current Price', 'Imports_Current_Price', 'imports_current_price']
    },
    {
      name: 'Discrepancies Constant Price',
      variations: ['Discrepancies Constant Price', 'Discrepancies_Constant_Price', 'discrepancies_constant_price']
    },
    {
      name: 'Discrepancies Current Price',
      variations: ['Discrepancies Current Price', 'Discrepancies_Current_Price', 'discrepancies_current_price']
    },
    {
      name: 'GDP Constant Price',
      variations: ['GDP Constant Price', 'GDP_Constant_Price', 'gdp_constant_price']
    },
    {
      name: 'GDP Current Price',
      variations: ['GDP Current Price', 'GDP_Current_Price', 'gdp_current_price']
    }
  ];
  
  fieldMappings.forEach(field => {
    const value = findColumnValue(row, field.variations);
    if (value === null) {
      errors.push(`Missing column for ${field.name}`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

export const validateAnnualGrowthRow = (row: any): ValidationResult => {
  const errors: string[] = [];
  
  // Check for Year column variations (no Quarter needed for annual data)
  const yearValue = findColumnValue(row, ['Year', 'year', 'YEAR', 'Financial Year', 'FY']);
  if (!yearValue) errors.push('Missing Year');
  
  // Define field mappings for annual growth data (both constant and current price growth)
  const fieldMappings = [
    {
      name: 'PFCE Constant Price Growth',
      variations: ['PFCE Constant Price Growth', 'PFCE_Constant_Price_Growth', 'pfce_constant_price_growth']
    },
    {
      name: 'PFCE Current Price Growth',
      variations: ['PFCE Current Price Growth', 'PFCE_Current_Price_Growth', 'pfce_current_price_growth']
    },
    {
      name: 'GFCE Constant Price Growth',
      variations: ['GFCE Constant Price Growth', 'GFCE_Constant_Price_Growth', 'gfce_constant_price_growth']
    },
    {
      name: 'GFCE Current Price Growth',
      variations: ['GFCE Current Price Growth', 'GFCE_Current_Price_Growth', 'gfce_current_price_growth']
    },
    {
      name: 'GFCF Constant Price Growth',
      variations: ['GFCF Constant Price Growth', 'GFCF_Constant_Price_Growth', 'gfcf_constant_price_growth']
    },
    {
      name: 'GFCF Current Price Growth',
      variations: ['GFCF Current Price Growth', 'GFCF_Current_Price_Growth', 'gfcf_current_price_growth']
    },
    {
      name: 'Changes in Stocks Constant Price Growth',
      variations: ['Changes in Stocks Constant Price Growth', 'Changes_in_Stocks_Constant_Price_Growth', 'changes_in_stocks_constant_price_growth']
    },
    {
      name: 'Changes in Stocks Current Price Growth',
      variations: ['Changes in Stocks Current Price Growth', 'Changes_in_Stocks_Current_Price_Growth', 'changes_in_stocks_current_price_growth']
    },
    {
      name: 'Valuables Constant Price Growth',
      variations: ['Valuables Constant Price Growth', 'Valuables_Constant_Price_Growth', 'valuables_constant_price_growth']
    },
    {
      name: 'Valuables Current Price Growth',
      variations: ['Valuables Current Price Growth', 'Valuables_Current_Price_Growth', 'valuables_current_price_growth']
    },
    {
      name: 'Exports Constant Price Growth',
      variations: ['Exports Constant Price Growth', 'Exports_Constant_Price_Growth', 'exports_constant_price_growth']
    },
    {
      name: 'Exports Current Price Growth',
      variations: ['Exports Current Price Growth', 'Exports_Current_Price_Growth', 'exports_current_price_growth']
    },
    {
      name: 'Imports Constant Price Growth',
      variations: ['Imports Constant Price Growth', 'Imports_Constant_Price_Growth', 'imports_constant_price_growth']
    },
    {
      name: 'Imports Current Price Growth',
      variations: ['Imports Current Price Growth', 'Imports_Current_Price_Growth', 'imports_current_price_growth']
    },
    {
      name: 'Discrepancies Constant Price Growth',
      variations: ['Discrepancies Constant Price Growth', 'Discrepancies_Constant_Price_Growth', 'discrepancies_constant_price_growth']
    },
    {
      name: 'Discrepancies Current Price Growth',
      variations: ['Discrepancies Current Price Growth', 'Discrepancies_Current_Price_Growth', 'discrepancies_current_price_growth']
    },
    {
      name: 'GDP Constant Price Growth',
      variations: ['GDP Constant Price Growth', 'GDP_Constant_Price_Growth', 'gdp_constant_price_growth']
    },
    {
      name: 'GDP Current Price Growth',
      variations: ['GDP Current Price Growth', 'GDP_Current_Price_Growth', 'gdp_current_price_growth']
    }
  ];
  
  fieldMappings.forEach(field => {
    const value = findColumnValue(row, field.variations);
    if (value === null) {
      errors.push(`Missing column for ${field.name}`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};
