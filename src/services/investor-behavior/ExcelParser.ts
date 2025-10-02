// =====================================================
// INVESTOR BEHAVIOR EXCEL PARSER
// Parses Excel/CSV files with age group + holding period data
// =====================================================

import * as XLSX from 'xlsx';
import { ParsedInvestorBehaviorFile, InvestorBehaviorRow, AssetType } from './types';

export class InvestorBehaviorParser {
  /**
   * Parse Excel or CSV file
   */
  static async parseFile(file: File): Promise<ParsedInvestorBehaviorFile> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    return this.parseData(data);
  }

  /**
   * Parse 2D array data
   */
  private static parseData(data: any[][]): ParsedInvestorBehaviorFile {
    // Extract quarter end date from header
    const quarterEndDate = this.extractQuarterEndDate(data);
    const quarterLabel = this.generateQuarterLabel(quarterEndDate);

    // Find data start row (after headers)
    const dataStartRow = this.findDataStartRow(data);
    
    if (dataStartRow === -1) {
      throw new Error('Could not find data rows. Please ensure the file has headers: Age Group, Asset Type, 0-1 Month, etc.');
    }

    // Parse data rows
    const rows: InvestorBehaviorRow[] = [];
    let totalAUM = 0;
    const ageGroupsSet = new Set<string>();
    let equityTotal = 0;
    let nonEquityTotal = 0;

    for (let i = dataStartRow; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) continue;
      
      // Skip total/grand total rows
      if (this.isTotalRow(row[0])) continue;

      try {
        const parsedRow = this.parseRow(row);
        rows.push(parsedRow);
        
        const rowTotal = parsedRow.aum_0_1_month + parsedRow.aum_1_3_months + 
                        parsedRow.aum_3_6_months + parsedRow.aum_6_12_months + 
                        parsedRow.aum_12_24_months + parsedRow.aum_above_24_months;
        
        totalAUM += rowTotal;
        ageGroupsSet.add(parsedRow.age_group);
        
        if (parsedRow.asset_type === 'EQUITY') {
          equityTotal += rowTotal;
        } else {
          nonEquityTotal += rowTotal;
        }
      } catch (error) {
        console.warn(`Skipping row ${i + 1}:`, error);
      }
    }

    if (rows.length === 0) {
      throw new Error('No valid data rows found. Please check the file format.');
    }

    return {
      quarter_end_date: quarterEndDate,
      quarter_label: quarterLabel,
      rows,
      total_aum_crore: totalAUM,
      metadata: {
        total_records: rows.length,
        equity_total: equityTotal,
        non_equity_total: nonEquityTotal,
        age_groups: Array.from(ageGroupsSet)
      }
    };
  }

  /**
   * Extract quarter end date from header rows
   */
  private static extractQuarterEndDate(data: any[][]): string {
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      if (!row) continue;

      for (const cell of row) {
        if (!cell) continue;
        const cellStr = String(cell);
        
        // Look for "Quarter Ended: DD-MMM-YYYY" or similar
        const match = cellStr.match(/Quarter\s+Ended[:\s]+(\d{1,2}[-\/]\w{3}[-\/]\d{4})/i);
        if (match) {
          return this.parseDate(match[1]);
        }
      }
    }

    throw new Error('Could not find "Quarter Ended" date in file. Please ensure the header contains "Quarter Ended: DD-MMM-YYYY"');
  }

  /**
   * Parse date string to YYYY-MM-DD format
   */
  private static parseDate(dateStr: string): string {
    // Handle formats: 30-Jun-2024, 30/Jun/2024, etc.
    const parts = dateStr.split(/[-\/]/);
    if (parts.length !== 3) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }

    const day = parts[0].padStart(2, '0');
    const monthStr = parts[1];
    const year = parts[2];

    const monthMap: { [key: string]: string } = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };

    const month = monthMap[monthStr.toLowerCase()];
    if (!month) {
      throw new Error(`Invalid month: ${monthStr}`);
    }

    return `${year}-${month}-${day}`;
  }

  /**
   * Generate quarter label (e.g., "Q1 FY2024-25")
   */
  private static generateQuarterLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1; // 1-12
    const year = date.getFullYear();

    let quarter: number;
    let fiscalYearStart: number;

    // Indian fiscal year: Apr-Jun = Q1, Jul-Sep = Q2, Oct-Dec = Q3, Jan-Mar = Q4
    if (month >= 4 && month <= 6) {
      quarter = 1;
      fiscalYearStart = year;
    } else if (month >= 7 && month <= 9) {
      quarter = 2;
      fiscalYearStart = year;
    } else if (month >= 10 && month <= 12) {
      quarter = 3;
      fiscalYearStart = year;
    } else {
      quarter = 4;
      fiscalYearStart = year - 1;
    }

    const fiscalYearEnd = fiscalYearStart + 1;
    return `Q${quarter} FY${fiscalYearStart}-${String(fiscalYearEnd).slice(-2)}`;
  }

  /**
   * Find the row where data starts (after headers)
   */
  private static findDataStartRow(data: any[][]): number {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      // Look for header row with "Age Group" and holding period columns
      const firstCell = String(row[0] || '').toLowerCase();
      if (firstCell.includes('age') && firstCell.includes('group')) {
        return i + 1; // Data starts on next row
      }
    }
    return -1;
  }

  /**
   * Parse a single data row
   */
  private static parseRow(row: any[]): InvestorBehaviorRow {
    if (row.length < 8) {
      throw new Error('Row has insufficient columns');
    }

    // Normalize age group name
    let ageGroup = String(row[0] || '').trim();
    ageGroup = this.normalizeAgeGroup(ageGroup);

    // Parse asset type
    const assetType = String(row[1] || '').trim().toUpperCase();
    if (assetType !== 'EQUITY' && assetType !== 'NON-EQUITY') {
      throw new Error(`Invalid asset type: ${assetType}`);
    }

    return {
      age_group: ageGroup,
      asset_type: assetType as AssetType,
      aum_0_1_month: this.parseNumeric(row[2]),
      aum_1_3_months: this.parseNumeric(row[3]),
      aum_3_6_months: this.parseNumeric(row[4]),
      aum_6_12_months: this.parseNumeric(row[5]),
      aum_12_24_months: this.parseNumeric(row[6]),
      aum_above_24_months: this.parseNumeric(row[7])
    };
  }

  /**
   * Normalize age group names
   */
  private static normalizeAgeGroup(ageGroup: string): string {
    const normalized = ageGroup.toLowerCase().trim();
    
    if (normalized.includes('corporate')) return 'Corporates';
    if (normalized.includes('bank') || normalized.includes('fi')) return 'Banks/FIs';
    if (normalized.includes('high') && normalized.includes('net')) return 'HNI';
    if (normalized.includes('retail')) return 'Retail';
    if (normalized.includes('nri')) return 'NRI';
    
    // Return as-is if no match (will be validated later)
    return ageGroup;
  }

  /**
   * Parse numeric value (handles commas, decimals, etc.)
   */
  private static parseNumeric(value: any): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    const str = String(value).replace(/,/g, '').trim();
    const num = parseFloat(str);
    
    if (isNaN(num)) {
      throw new Error(`Invalid numeric value: ${value}`);
    }
    
    return num;
  }

  /**
   * Check if row is a total/subtotal row
   */
  private static isTotalRow(firstCell: any): boolean {
    const str = String(firstCell || '').toLowerCase();
    return str.includes('total') || str.includes('grand');
  }
}
