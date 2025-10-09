// IPO Data Parser Utilities

import { IPOUploadData, IPOListing } from '@/types/ipo';

/**
 * Clean numeric value by removing currency symbols, commas, and percentage signs
 */
export function cleanNumericValue(value: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Remove ₹, Rs, Cr, %, commas, and spaces
  const cleaned = value.toString()
    .replace(/[₹Rs,\s%Cr]/g, '')
    .trim();
  
  return parseFloat(cleaned) || 0;
}

/**
 * Parse date from various formats (YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY, Excel serial number)
 * Note: Excel dates like 8/12/2025 are interpreted as MM/DD/YYYY (August 12, 2025)
 */
export function parseDate(dateStr: string | number): string {
  if (!dateStr) return '';
  
  // Convert to string if it's a number (Excel serial date)
  const dateString = dateStr.toString().trim();
  
  // If it's an Excel serial number (pure digits in valid range 1–60000)
  const isExcelSerial = /^\d+$/.test(dateString);
  const numericValue = parseInt(dateString, 10);
  if (isExcelSerial && numericValue >= 1 && numericValue <= 60000) {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + numericValue * 86400000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Try parsing as YYYY-MM-DD first
  const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  
  // Try MM/DD/YYYY (Excel default format: 8/12/2025 = August 12, 2025)
  const mmddyyyyMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mmddyyyyMatch) {
    const month = mmddyyyyMatch[1].padStart(2, '0');
    const day = mmddyyyyMatch[2].padStart(2, '0');
    const year = mmddyyyyMatch[3];
    return `${year}-${month}-${day}`;
  }
  
  // Try DD-MM-YYYY
  const ddmmMatch = dateString.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (ddmmMatch) {
    return `${ddmmMatch[3]}-${ddmmMatch[2]}-${ddmmMatch[1]}`;
  }
  
  return dateString;
}

/**
 * Extract year from date string
 */
export function extractYear(dateStr: string): number {
  const parsed = parseDate(dateStr);
  const year = new Date(parsed).getFullYear();
  return isNaN(year) ? new Date().getFullYear() : year;
}

/**
 * Transform uploaded CSV data to database format
 */
export function transformIPOData(
  data: IPOUploadData[],
  ipoType: 'mainboard' | 'sme'
): Omit<IPOListing, 'id' | 'created_at' | 'updated_at'>[] {
  return data.map(row => {
    const listingDate = parseDate(row['Listing Date']);
    const year = extractYear(listingDate);
    
    return {
      ipo_type: ipoType,
      year,
      company_name: row['Company Name']?.toString().trim() || '',
      main_industry: row['Main Industry']?.toString().trim() || null,
      sector: row['Sector']?.toString().trim() || null,
      issue_size: cleanNumericValue(row['Issue Size']),
      issue_price: cleanNumericValue(row['Issue Price']),
      listing_date: listingDate,
      listing_open: cleanNumericValue(row['Listing Open (Rs)']),
      listing_close: cleanNumericValue(row['Listing Close (Rs)']),
      listing_gain_percent: cleanNumericValue(row['Listing Gain %']),
      ltp: cleanNumericValue(row['LTP (Rs)']),
      market_cap: cleanNumericValue(row['Market Cap (Cr)']),
      current_gain_percent: cleanNumericValue(row['Current Gain %']),
    };
  });
}

/**
 * Detect years present in the uploaded data
 */
export function detectYears(data: IPOUploadData[]): number[] {
  const years = new Set<number>();
  
  data.forEach(row => {
    const year = extractYear(row['Listing Date']);
    if (year) years.add(year);
  });
  
  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Validate IPO data row
 */
export function validateIPORow(row: IPOUploadData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!row['Company Name']) {
    errors.push('Company Name is required');
  }
  
  if (!row['Listing Date']) {
    errors.push('Listing Date is required');
  }
  
  if (!row['Issue Price']) {
    errors.push('Issue Price is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate listing open gain percentage
 */
export function calculateListingOpenGain(issuePrice: number, listingOpen: number): number {
  if (!issuePrice || !listingOpen) return 0;
  return ((listingOpen - issuePrice) / issuePrice) * 100;
}

/**
 * Group IPOs by year
 */
export function groupByYear(ipos: IPOListing[]): Record<number, IPOListing[]> {
  return ipos.reduce((acc, ipo) => {
    if (!acc[ipo.year]) {
      acc[ipo.year] = [];
    }
    acc[ipo.year].push(ipo);
    return acc;
  }, {} as Record<number, IPOListing[]>);
}

/**
 * Group IPOs by sector
 */
export function groupBySector(ipos: IPOListing[]): Record<string, IPOListing[]> {
  return ipos.reduce((acc, ipo) => {
    const sector = ipo.sector || 'Others';
    if (!acc[sector]) {
      acc[sector] = [];
    }
    acc[sector].push(ipo);
    return acc;
  }, {} as Record<string, IPOListing[]>);
}
