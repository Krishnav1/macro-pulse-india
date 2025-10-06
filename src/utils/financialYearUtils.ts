// Financial Year and Date Utilities for Indian Markets

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export type TimePeriodType = 'today' | 'month' | 'quarter' | 'year' | 'all';

// Get current financial year (April 1 - March 31)
export function getCurrentFinancialYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based
  
  // If current month is Jan-Mar, we're in previous FY
  if (currentMonth < 3) { // Jan=0, Feb=1, Mar=2
    return `FY${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
  } else {
    return `FY${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`;
  }
}

// Get financial year options for dropdown
export function getFinancialYearOptions(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  const options = [];
  
  // Generate last 5 financial years
  for (let i = 0; i < 5; i++) {
    const fyStartYear = currentYear - i;
    const fyEndYear = fyStartYear + 1;
    const value = `FY${fyStartYear.toString().slice(-2)}-${fyEndYear.toString().slice(-2)}`;
    const label = `FY ${fyStartYear}-${fyEndYear} (Apr ${fyStartYear} - Mar ${fyEndYear})`;
    options.push({ value, label });
  }
  
  return options;
}

// Get quarter options for dropdown
export function getQuarterOptions(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  const options = [];
  
  // Generate last 8 quarters
  for (let year = currentYear; year >= currentYear - 2; year--) {
    const quarters = [
      { q: 'Q4', months: 'Jan-Mar', startMonth: 0, endMonth: 2 },
      { q: 'Q3', months: 'Oct-Dec', startMonth: 9, endMonth: 11 },
      { q: 'Q2', months: 'Jul-Sep', startMonth: 6, endMonth: 8 },
      { q: 'Q1', months: 'Apr-Jun', startMonth: 3, endMonth: 5 }
    ];
    
    quarters.forEach(quarter => {
      const fyYear = quarter.q === 'Q4' ? year : year - 1;
      const value = `${quarter.q}-FY${fyYear.toString().slice(-2)}-${(fyYear + 1).toString().slice(-2)}`;
      const label = `${quarter.q} FY${fyYear}-${fyYear + 1} (${quarter.months} ${year})`;
      options.push({ value, label });
    });
  }
  
  return options.slice(0, 8); // Last 8 quarters
}

// Get month options for dropdown
export function getMonthOptions(): { value: string; label: string }[] {
  const currentDate = new Date();
  const options = [];
  
  // Generate last 12 months
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  
  return options;
}

// Convert period selection to date range
export function getDateRangeFromPeriod(
  type: TimePeriodType,
  value?: string
): DateRange {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  switch (type) {
    case 'today':
      return {
        startDate: todayStr,
        endDate: todayStr,
        label: 'Today'
      };
      
    case 'month':
      if (value && value.includes('-')) {
        const [year, month] = value.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          label: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
      }
      break;
      
    case 'quarter':
      if (value && value.includes('-FY')) {
        // Parse Q1-FY24-25 format
        const [quarter, fy] = value.split('-FY');
        if (!fy || !fy.includes('-')) break;
        const [startYear, endYear] = fy.split('-').map(y => 2000 + parseInt(y));
        
        let startMonth, endMonth, year;
        switch (quarter) {
          case 'Q1':
            startMonth = 3; // April (0-based)
            endMonth = 5;   // June
            year = startYear;
            break;
          case 'Q2':
            startMonth = 6; // July
            endMonth = 8;   // September
            year = startYear;
            break;
          case 'Q3':
            startMonth = 9;  // October
            endMonth = 11;   // December
            year = startYear;
            break;
          case 'Q4':
            startMonth = 0;  // January
            endMonth = 2;    // March
            year = endYear;
            break;
          default:
            startMonth = 0;
            endMonth = 2;
            year = endYear;
        }
        
        const startDate = new Date(year, startMonth, 1);
        const endDate = new Date(year, endMonth + 1, 0); // Last day of end month
        
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          label: `${quarter} FY${startYear}-${endYear}`
        };
      }
      break;
      
    case 'year':
      if (value && value.includes('-')) {
        // Parse FY24-25 format
        const cleaned = value.replace('FY', '');
        if (!cleaned.includes('-')) break;
        const [startYear, endYear] = cleaned.split('-').map(y => 2000 + parseInt(y));
        const startDate = new Date(startYear, 3, 1); // April 1
        const endDate = new Date(endYear, 2, 31);    // March 31
        
        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          label: `FY ${startYear}-${endYear}`
        };
      }
      break;
      
    case 'all':
      return {
        startDate: '2020-01-01', // Start from 2020
        endDate: todayStr,
        label: 'All Time'
      };
  }
  
  // Default: Current month
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    startDate: currentMonth.toISOString().split('T')[0],
    endDate: currentMonthEnd.toISOString().split('T')[0],
    label: 'Current Month'
  };
}

// Get default period (latest complete month)
export function getDefaultPeriod(): { type: TimePeriodType; value: string } {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const value = `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  
  return {
    type: 'month',
    value
  };
}

// Sector mapping for stocks
export const SECTOR_MAPPING: Record<string, string> = {
  // Banking
  'HDFCBANK': 'Banking',
  'ICICIBANK': 'Banking',
  'SBIN': 'Banking',
  'AXISBANK': 'Banking',
  'KOTAKBANK': 'Banking',
  'INDUSINDBK': 'Banking',
  'BANDHANBNK': 'Banking',
  'FEDERALBNK': 'Banking',
  'IDFCFIRSTB': 'Banking',
  'PNB': 'Banking',
  
  // IT
  'TCS': 'IT',
  'INFY': 'IT',
  'HCLTECH': 'IT',
  'WIPRO': 'IT',
  'TECHM': 'IT',
  'LTI': 'IT',
  'MINDTREE': 'IT',
  'MPHASIS': 'IT',
  
  // Oil & Gas
  'RELIANCE': 'Oil & Gas',
  'ONGC': 'Oil & Gas',
  'IOC': 'Oil & Gas',
  'BPCL': 'Oil & Gas',
  'GAIL': 'Oil & Gas',
  
  // Pharma
  'SUNPHARMA': 'Pharma',
  'DRREDDY': 'Pharma',
  'CIPLA': 'Pharma',
  'DIVISLAB': 'Pharma',
  'BIOCON': 'Pharma',
  'LUPIN': 'Pharma',
  
  // Auto
  'MARUTI': 'Auto',
  'TATAMOTORS': 'Auto',
  'M&M': 'Auto',
  'BAJAJ-AUTO': 'Auto',
  'HEROMOTOCO': 'Auto',
  'EICHERMOT': 'Auto',
  
  // FMCG
  'HINDUNILVR': 'FMCG',
  'ITC': 'FMCG',
  'NESTLEIND': 'FMCG',
  'BRITANNIA': 'FMCG',
  'DABUR': 'FMCG',
  'GODREJCP': 'FMCG',
  
  // Metals
  'TATASTEEL': 'Metals',
  'JSWSTEEL': 'Metals',
  'HINDALCO': 'Metals',
  'VEDL': 'Metals',
  'COALINDIA': 'Metals',
  'NMDC': 'Metals',
  
  // Telecom
  'BHARTIARTL': 'Telecom',
  'IDEA': 'Telecom',
  
  // Cement
  'ULTRACEMCO': 'Cement',
  'SHREECEM': 'Cement',
  'ACC': 'Cement',
  'AMBUJACEMENT': 'Cement',
  
  // Power
  'NTPC': 'Power',
  'POWERGRID': 'Power',
  'TATAPOWER': 'Power',
  
  // Realty
  'DLF': 'Realty',
  'GODREJPROP': 'Realty',
  'OBEROIRLTY': 'Realty'
};

// Get sector for a stock symbol
export function getSectorForStock(symbol: string): string {
  return SECTOR_MAPPING[symbol.toUpperCase()] || 'Others';
}

// Get all sectors
export function getAllSectors(): string[] {
  const sectors = new Set(Object.values(SECTOR_MAPPING));
  return Array.from(sectors).sort();
}
