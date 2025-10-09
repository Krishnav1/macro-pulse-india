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
 * Parse date from various formats (YYYY-MM-DD, DD-MM-YYYY, etc.)
 */
export function parseDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // Try parsing as YYYY-MM-DD first
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return dateStr;
  }
  
  // Try DD-MM-YYYY or DD/MM/YYYY
  const ddmmMatch = dateStr.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
  if (ddmmMatch) {
    return `${ddmmMatch[3]}-${ddmmMatch[2]}-${ddmmMatch[1]}`;
  }
  
  return dateStr;
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
