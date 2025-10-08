// FII/DII Utility Functions

/**
 * Calculate Financial Year from date
 * FY starts April 1st
 */
export function getFinancialYear(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  
  if (month >= 4) {
    return `FY ${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `FY ${year - 1}-${String(year).slice(-2)}`;
  }
}

/**
 * Get month name from date
 */
export function getMonthName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Get quarter from date
 * Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
 */
export function getQuarter(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth() + 1; // 1-12
  const year = d.getFullYear();
  
  let quarter: number;
  let fy: string;
  
  if (month >= 4 && month <= 6) {
    quarter = 1;
    fy = `${year}-${String(year + 1).slice(-2)}`;
  } else if (month >= 7 && month <= 9) {
    quarter = 2;
    fy = `${year}-${String(year + 1).slice(-2)}`;
  } else if (month >= 10 && month <= 12) {
    quarter = 3;
    fy = `${year}-${String(year + 1).slice(-2)}`;
  } else {
    quarter = 4;
    fy = `${year - 1}-${String(year).slice(-2)}`;
  }
  
  return `Q${quarter} FY${fy}`;
}

/**
 * Format number with Indian number system
 */
export function formatIndianNumber(num: number): string {
  if (num === 0) return '0';
  
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  
  let formatted: string;
  
  if (absNum >= 10000000) {
    // Crores
    formatted = `₹${(absNum / 10000000).toFixed(2)} Cr`;
  } else if (absNum >= 100000) {
    // Lakhs
    formatted = `₹${(absNum / 100000).toFixed(2)} L`;
  } else if (absNum >= 1000) {
    // Thousands
    formatted = `₹${(absNum / 1000).toFixed(2)} K`;
  } else {
    formatted = `₹${absNum.toFixed(2)}`;
  }
  
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Get color class based on value (positive/negative)
 */
export function getValueColorClass(value: number): string {
  if (value > 0) {
    return 'text-green-600 dark:text-green-400';
  } else if (value < 0) {
    return 'text-red-600 dark:text-red-400';
  } else {
    return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * Get background color class based on value
 */
export function getValueBgClass(value: number): string {
  if (value > 0) {
    return 'bg-green-50 dark:bg-green-900/20';
  } else if (value < 0) {
    return 'bg-red-50 dark:bg-red-900/20';
  } else {
    return 'bg-gray-50 dark:bg-gray-900/20';
  }
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Parse CSV value (remove commas, convert to number)
 */
export function parseCSVValue(value: string): number {
  if (!value || value.trim() === '') return 0;
  const cleaned = value.replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get date range for period
 */
export function getDateRangeForPeriod(period: 'day' | 'month' | 'quarter' | 'year', date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  
  switch (period) {
    case 'day':
      return {
        start: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
      };
    
    case 'month':
      return {
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      };
    
    case 'quarter':
      const month = d.getMonth();
      let qStartMonth: number;
      
      if (month >= 3 && month <= 5) qStartMonth = 3; // Apr-Jun
      else if (month >= 6 && month <= 8) qStartMonth = 6; // Jul-Sep
      else if (month >= 9 && month <= 11) qStartMonth = 9; // Oct-Dec
      else qStartMonth = 0; // Jan-Mar
      
      return {
        start: new Date(d.getFullYear(), qStartMonth, 1),
        end: new Date(d.getFullYear(), qStartMonth + 3, 0, 23, 59, 59)
      };
    
    case 'year':
      const fyMonth = d.getMonth();
      const fyYear = fyMonth >= 3 ? d.getFullYear() : d.getFullYear() - 1;
      
      return {
        start: new Date(fyYear, 3, 1), // April 1st
        end: new Date(fyYear + 1, 2, 31, 23, 59, 59) // March 31st
      };
  }
}

/**
 * Color palette for charts
 */
export const CHART_COLORS = {
  fii: '#3B82F6', // Blue
  dii: '#F97316', // Orange
  equity: '#6366F1', // Indigo
  debt: '#14B8A6', // Teal
  futures: '#8B5CF6', // Purple
  options: '#EC4899', // Pink
  indices: '#06B6D4', // Cyan
  stocks: '#F59E0B', // Amber
  positive: '#10B981', // Green
  negative: '#EF4444', // Red
  neutral: '#6B7280', // Gray
};

/**
 * Get chart color by category
 */
export function getChartColor(category: string): string {
  const key = category.toLowerCase() as keyof typeof CHART_COLORS;
  return CHART_COLORS[key] || CHART_COLORS.neutral;
}
