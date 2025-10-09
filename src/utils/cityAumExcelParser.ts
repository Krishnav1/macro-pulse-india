import * as XLSX from 'xlsx';
import { getCityCoordinates } from '@/data/cityCoordinates';

export interface ParsedCityData {
  cityName: string;
  aumPercentage: number;
  latitude: number | null;
  longitude: number | null;
}

export interface ParsedMetadata {
  otherCities: number;
  nrisOverseas: number;
  total: number;
}

export interface ParsedWorksheet {
  worksheetName: string;
  quarter: number;
  financialYear: string;
  quarterEndDate: string;
  cities: ParsedCityData[];
  metadata: ParsedMetadata;
  warnings: string[];
}

export interface ExcelParseResult {
  worksheets: ParsedWorksheet[];
  totalCities: number;
  totalQuarters: number;
  errors: string[];
}

/**
 * Parse quarter info from worksheet name
 * Supports formats: "Q1 2020-21", "Q1 FY2020-21", "Quarter 1 2020-21"
 */
function parseWorksheetName(sheetName: string): { quarter: number; financialYear: string } | null {
  const patterns = [
    /Q(\d)\s*(\d{4})-(\d{2})/i,
    /Q(\d)\s*FY\s*(\d{4})-(\d{2})/i,
    /Quarter\s*(\d)\s*(\d{4})-(\d{2})/i,
  ];

  for (const pattern of patterns) {
    const match = sheetName.match(pattern);
    if (match) {
      const quarter = parseInt(match[1]);
      const yearStart = match[2];
      const yearEnd = match[3];
      
      if (quarter >= 1 && quarter <= 4) {
        return {
          quarter,
          financialYear: `${yearStart}-${yearEnd}`,
        };
      }
    }
  }

  return null;
}

/**
 * Extract quarter end date from first row
 * Expected format: "Quarter End Date: 2020-06-30" or just "2020-06-30"
 */
function extractQuarterEndDate(firstRow: any[]): string | null {
  if (!firstRow || firstRow.length === 0) return null;

  const cellValue = String(firstRow[0] || '').trim();
  
  // Try to extract date from "Quarter End Date: YYYY-MM-DD" format
  const dateMatch = cellValue.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }

  // Check if first cell is already a date
  if (/^\d{4}-\d{2}-\d{2}$/.test(cellValue)) {
    return cellValue;
  }

  return null;
}

/**
 * Parse a single worksheet
 */
function parseWorksheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string
): ParsedWorksheet | null {
  const warnings: string[] = [];
  
  // Parse worksheet name
  const quarterInfo = parseWorksheetName(sheetName);
  if (!quarterInfo) {
    return null;
  }

  // Convert sheet to array of arrays
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (data.length < 4) {
    warnings.push(`Worksheet ${sheetName}: Not enough rows`);
    return null;
  }

  // Extract quarter end date from first row
  const quarterEndDate = extractQuarterEndDate(data[0]);
  if (!quarterEndDate) {
    warnings.push(`Worksheet ${sheetName}: Could not extract quarter end date`);
    return null;
  }

  // Validate headers in second row
  const headers = data[1];
  if (!headers || headers.length < 2) {
    warnings.push(`Worksheet ${sheetName}: Invalid headers`);
    return null;
  }

  // Parse city data (skip first 2 rows for headers, last 3 rows for metadata)
  const cities: ParsedCityData[] = [];
  const dataRows = data.slice(2, data.length - 3);

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length < 2) continue;

    const cityName = String(row[0] || '').trim();
    const aumPercentage = parseFloat(String(row[1] || '0'));

    if (!cityName || isNaN(aumPercentage)) continue;

    // Get coordinates
    const coords = getCityCoordinates(cityName);
    
    if (!coords) {
      warnings.push(`City "${cityName}" not found in coordinates database`);
    }

    cities.push({
      cityName,
      aumPercentage,
      latitude: coords?.latitude || null,
      longitude: coords?.longitude || null,
    });
  }

  // Parse metadata from last 3 rows
  const metadataRows = data.slice(data.length - 3);
  const metadata: ParsedMetadata = {
    otherCities: 0,
    nrisOverseas: 0,
    total: 0,
  };

  if (metadataRows.length >= 3) {
    // Row 1: Other Cities
    if (metadataRows[0] && metadataRows[0].length >= 2) {
      metadata.otherCities = parseFloat(String(metadataRows[0][1] || '0'));
    }
    // Row 2: NRIs & Overseas
    if (metadataRows[1] && metadataRows[1].length >= 2) {
      metadata.nrisOverseas = parseFloat(String(metadataRows[1][1] || '0'));
    }
    // Row 3: Total
    if (metadataRows[2] && metadataRows[2].length >= 2) {
      metadata.total = parseFloat(String(metadataRows[2][1] || '0'));
    }
  }

  // Validate total
  const cityTotal = cities.reduce((sum, city) => sum + city.aumPercentage, 0);
  const calculatedTotal = cityTotal + metadata.otherCities + metadata.nrisOverseas;
  
  if (Math.abs(calculatedTotal - metadata.total) > 0.1) {
    warnings.push(
      `Worksheet ${sheetName}: Total mismatch - Calculated: ${calculatedTotal.toFixed(2)}%, Stated: ${metadata.total.toFixed(2)}%`
    );
  }

  return {
    worksheetName: sheetName,
    quarter: quarterInfo.quarter,
    financialYear: quarterInfo.financialYear,
    quarterEndDate,
    cities,
    metadata,
    warnings,
  };
}

/**
 * Parse entire Excel file with multiple worksheets
 */
export async function parseCityAumExcel(file: File): Promise<ExcelParseResult> {
  const errors: string[] = [];
  const worksheets: ParsedWorksheet[] = [];

  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse workbook
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    if (workbook.SheetNames.length === 0) {
      errors.push('No worksheets found in Excel file');
      return { worksheets: [], totalCities: 0, totalQuarters: 0, errors };
    }

    // Parse each worksheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const parsed = parseWorksheet(worksheet, sheetName);
      
      if (parsed) {
        worksheets.push(parsed);
      } else {
        errors.push(`Failed to parse worksheet: ${sheetName}`);
      }
    }

    // Sort worksheets by financial year and quarter
    worksheets.sort((a, b) => {
      if (a.financialYear !== b.financialYear) {
        return a.financialYear.localeCompare(b.financialYear);
      }
      return a.quarter - b.quarter;
    });

    // Calculate totals
    const totalCities = worksheets.reduce((sum, ws) => sum + ws.cities.length, 0);
    const totalQuarters = worksheets.length;

    return {
      worksheets,
      totalCities,
      totalQuarters,
      errors,
    };
  } catch (error) {
    errors.push(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { worksheets: [], totalCities: 0, totalQuarters: 0, errors };
  }
}

/**
 * Validate parsed data
 */
export function validateParsedData(result: ExcelParseResult): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [...result.errors];
  const warnings: string[] = [];

  // Collect all warnings from worksheets
  result.worksheets.forEach(ws => {
    warnings.push(...ws.warnings);
  });

  // Check if any worksheets were parsed
  if (result.worksheets.length === 0) {
    errors.push('No valid worksheets found');
  }

  // Check for duplicate quarters
  const quarterKeys = result.worksheets.map(ws => `${ws.financialYear}-Q${ws.quarter}`);
  const duplicates = quarterKeys.filter((key, index) => quarterKeys.indexOf(key) !== index);
  
  if (duplicates.length > 0) {
    errors.push(`Duplicate quarters found: ${[...new Set(duplicates)].join(', ')}`);
  }

  // Check for cities without coordinates
  const unmappedCount = result.worksheets.reduce((sum, ws) => {
    return sum + ws.cities.filter(c => !c.latitude || !c.longitude).length;
  }, 0);

  if (unmappedCount > 0) {
    warnings.push(`${unmappedCount} cities across all quarters do not have coordinates and will not appear on the map`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
