// =====================================================
// EXCEL/CSV PARSER FOR QUARTERLY AUM DATA
// Handles both aggregated (2011-2023) and detailed (2024+) formats
// =====================================================

import * as XLSX from 'xlsx';
import { ParsedAUMFile, ParsedAUMRow } from './types';

export class QuarterlyAUMParser {
  /**
   * Parse Excel/CSV file and detect format automatically
   */
  static async parseFile(file: File): Promise<ParsedAUMFile> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
    
    // Extract metadata from header
    const metadata = this.extractMetadata(rawData);
    
    // Detect format based on number of categories
    const dataRows = this.extractDataRows(rawData);
    const formatVersion = this.detectFormat(dataRows);
    
    // Parse rows based on format
    const parsedRows = formatVersion === 'aggregated' 
      ? this.parseAggregatedFormat(dataRows)
      : this.parseDetailedFormat(dataRows);
    
    // Calculate total AUM
    const totalRow = parsedRows.find(row => 
      row.category_name.toLowerCase().includes('total')
    );
    const totalAUM = totalRow ? totalRow.aum_crore : 
      parsedRows.reduce((sum, row) => sum + row.aum_crore, 0);
    
    return {
      quarter_end_date: metadata.quarter_end_date,
      quarter_label: metadata.quarter_label,
      fiscal_year: metadata.fiscal_year,
      data_format_version: formatVersion,
      total_aum_crore: totalAUM,
      rows: parsedRows.filter(row => 
        !row.category_name.toLowerCase().includes('total')
      )
    };
  }

  /**
   * Extract quarter metadata from header rows
   */
  private static extractMetadata(rawData: any[][]): {
    quarter_end_date: string;
    quarter_label: string;
    fiscal_year: string;
  } {
    // Look for header row with quarter info
    const headerRow = rawData.find(row => 
      row.some(cell => 
        typeof cell === 'string' && 
        cell.toLowerCase().includes('quarter ended')
      )
    );
    
    if (!headerRow) {
      throw new Error('Could not find quarter information in file');
    }
    
    // Extract date from header (e.g., "31-Dec-2022" or "30-Jun-2025")
    const dateMatch = headerRow.join(' ').match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
    if (!dateMatch) {
      throw new Error('Could not parse quarter end date');
    }
    
    const [, day, monthStr, year] = dateMatch;
    const monthMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    const month = monthMap[monthStr];
    
    const quarterEndDate = `${year}-${month}-${day.padStart(2, '0')}`;
    
    // Determine quarter (Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar)
    const monthNum = parseInt(month);
    let quarter: number;
    let fiscalYearStart: number;
    
    if (monthNum >= 4 && monthNum <= 6) {
      quarter = 1;
      fiscalYearStart = parseInt(year);
    } else if (monthNum >= 7 && monthNum <= 9) {
      quarter = 2;
      fiscalYearStart = parseInt(year);
    } else if (monthNum >= 10 && monthNum <= 12) {
      quarter = 3;
      fiscalYearStart = parseInt(year);
    } else {
      quarter = 4;
      fiscalYearStart = parseInt(year) - 1;
    }
    
    const fiscalYearEnd = fiscalYearStart + 1;
    const fiscalYear = `${fiscalYearStart}-${fiscalYearEnd.toString().slice(2)}`;
    const quarterLabel = `Q${quarter} ${fiscalYear}`;
    
    return {
      quarter_end_date: quarterEndDate,
      quarter_label: quarterLabel,
      fiscal_year: fiscalYear
    };
  }

  /**
   * Extract data rows (skip headers and empty rows)
   */
  private static extractDataRows(rawData: any[][]): any[][] {
    // Find the row with "Category of the Scheme" header
    const headerIndex = rawData.findIndex(row =>
      row.some(cell => 
        typeof cell === 'string' && 
        cell.toLowerCase().includes('category of the scheme')
      )
    );
    
    if (headerIndex === -1) {
      throw new Error('Could not find data header row');
    }
    
    // Get all rows after header
    const dataRows = rawData.slice(headerIndex + 1);
    
    // Filter out empty rows
    return dataRows.filter(row => 
      row.some(cell => cell !== null && cell !== undefined && cell !== '')
    );
  }

  /**
   * Detect format based on number of categories
   */
  private static detectFormat(dataRows: any[][]): 'aggregated' | 'detailed' {
    // Count non-empty category rows
    const categoryCount = dataRows.filter(row => {
      const firstCell = row[0];
      return firstCell && 
             typeof firstCell === 'string' && 
             firstCell.trim().length > 0 &&
             !firstCell.toLowerCase().includes('total');
    }).length;
    
    // Aggregated format has ~11-15 categories
    // Detailed format has 50+ categories
    return categoryCount < 20 ? 'aggregated' : 'detailed';
  }

  /**
   * Parse aggregated format (2011-2023)
   */
  private static parseAggregatedFormat(dataRows: any[][]): ParsedAUMRow[] {
    const parsed: ParsedAUMRow[] = [];
    
    for (const row of dataRows) {
      const categoryName = row[0];
      const aumValue = row[1];
      const aaumValue = row[2];
      
      // Skip if not a valid category row
      if (!categoryName || typeof categoryName !== 'string') continue;
      if (!aumValue || typeof aumValue !== 'number') continue;
      
      const cleanCategoryName = categoryName.trim();
      
      parsed.push({
        category_name: cleanCategoryName,
        aum_crore: aumValue,
        aaum_crore: aaumValue || aumValue
      });
    }
    
    return parsed;
  }

  /**
   * Parse detailed format (2024+)
   */
  private static parseDetailedFormat(dataRows: any[][]): ParsedAUMRow[] {
    const parsed: ParsedAUMRow[] = [];
    let currentLevel1 = '';
    let currentLevel2 = '';
    let currentLevel3 = '';
    
    for (const row of dataRows) {
      const categoryName = row[0];
      const aumValue = row[1];
      const aaumValue = row[2];
      
      // Skip if not a valid row
      if (!categoryName || typeof categoryName !== 'string') continue;
      
      const cleanCategoryName = categoryName.trim();
      
      // Detect hierarchy level based on prefix
      if (cleanCategoryName.match(/^[A-C]\./)) {
        // Level 1: A., B., C.
        currentLevel1 = cleanCategoryName;
        currentLevel2 = '';
        currentLevel3 = '';
        continue;
      } else if (cleanCategoryName.match(/^[IVX]+\./)) {
        // Level 2: I., II., III., IV., V.
        currentLevel2 = cleanCategoryName;
        currentLevel3 = '';
        continue;
      } else if (cleanCategoryName.match(/^[a-z]\)/)) {
        // Level 3: a), b), c)
        currentLevel3 = cleanCategoryName;
        continue;
      }
      
      // Level 4: i), ii), iii), etc. - actual data rows
      if (aumValue && typeof aumValue === 'number') {
        parsed.push({
          category_name: cleanCategoryName,
          aum_crore: aumValue,
          aaum_crore: aaumValue || aumValue,
          category_level_1: currentLevel1,
          category_level_2: currentLevel2,
          category_level_3: currentLevel3,
          category_level_4: cleanCategoryName
        });
      }
    }
    
    return parsed;
  }

  /**
   * Clean numeric value (remove commas, handle empty)
   */
  private static cleanNumericValue(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/,/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
}
