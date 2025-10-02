// AMFI Data Fetcher Service
// Fetches and parses daily NAV data from AMFI India

export interface ParsedScheme {
  schemeCode: string;
  isinGrowth: string;
  isinDividend: string;
  schemeName: string;
  nav: number;
  date: string;
  amcName: string;
  category: string;
  subCategory: string;
  schemeType: string;
}

export interface AMCData {
  amcCode: string;
  amcName: string;
  schemes: ParsedScheme[];
}

export class AMFIDataFetcher {
  private static readonly NAV_URL = 'https://portal.amfiindia.com/spages/NAVAll.txt';
  
  /**
   * Fetch daily NAV data from AMFI
   */
  async fetchDailyNAV(): Promise<string> {
    try {
      const response = await fetch(AMFIDataFetcher.NAV_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch AMFI data: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error fetching AMFI NAV data:', error);
      throw error;
    }
  }

  /**
   * Parse NAV data from AMFI text file
   * Format: Scheme Code;ISIN Div Payout/ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date
   */
  parseNAVData(rawData: string): ParsedScheme[] {
    const lines = rawData.split('\n');
    const schemes: ParsedScheme[] = [];
    
    let currentAMC = '';
    let currentCategory = '';
    let currentSubCategory = '';
    let currentSchemeType = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;

      // Check if this is an AMC header (no semicolons)
      if (!trimmedLine.includes(';')) {
        // Check if it's a category header
        if (trimmedLine.startsWith('Open Ended Schemes') || trimmedLine.startsWith('Close Ended Schemes') || trimmedLine.startsWith('Interval Fund Schemes')) {
          const categoryMatch = trimmedLine.match(/\((.*?)\)/);
          if (categoryMatch) {
            const fullCategory = categoryMatch[1];
            const parts = fullCategory.split(' - ');
            currentCategory = parts[0]?.trim() || 'Other';
            currentSubCategory = parts[1]?.trim() || '';
          }
          currentSchemeType = trimmedLine.split('(')[0].trim();
        } else if (!trimmedLine.includes('Scheme Code')) {
          // This is an AMC name
          currentAMC = trimmedLine;
        }
        continue;
      }

      // Parse scheme data
      const parts = trimmedLine.split(';');
      if (parts.length < 6) continue;

      const schemeCode = parts[0]?.trim();
      const isinGrowth = parts[1]?.trim() || '';
      const isinDividend = parts[2]?.trim() || '';
      const schemeName = parts[3]?.trim();
      const navStr = parts[4]?.trim();
      const dateStr = parts[5]?.trim();

      // Skip if essential fields are missing
      if (!schemeCode || !schemeName || !navStr || !dateStr) continue;

      // Parse NAV
      const nav = parseFloat(navStr);
      if (isNaN(nav)) continue;

      schemes.push({
        schemeCode,
        isinGrowth,
        isinDividend,
        schemeName,
        nav,
        date: this.parseDate(dateStr),
        amcName: currentAMC,
        category: currentCategory,
        subCategory: currentSubCategory,
        schemeType: currentSchemeType,
      });
    }

    return schemes;
  }

  /**
   * Parse date from AMFI format (DD-MMM-YYYY)
   */
  private parseDate(dateStr: string): string {
    try {
      const months: { [key: string]: string } = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };

      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;

      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]] || '01';
      const year = parts[2];

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return dateStr;
    }
  }

  /**
   * Group schemes by AMC
   */
  groupByAMC(schemes: ParsedScheme[]): AMCData[] {
    const amcMap = new Map<string, ParsedScheme[]>();

    for (const scheme of schemes) {
      if (!amcMap.has(scheme.amcName)) {
        amcMap.set(scheme.amcName, []);
      }
      amcMap.get(scheme.amcName)!.push(scheme);
    }

    const amcData: AMCData[] = [];
    for (const [amcName, schemes] of amcMap.entries()) {
      amcData.push({
        amcCode: this.generateAMCCode(amcName),
        amcName,
        schemes,
      });
    }

    return amcData;
  }

  /**
   * Generate AMC code from name
   */
  private generateAMCCode(amcName: string): string {
    return amcName
      .replace(/Mutual Fund/gi, '')
      .replace(/Asset Management/gi, '')
      .replace(/Limited/gi, '')
      .replace(/Ltd/gi, '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_')
      .substring(0, 20);
  }

  /**
   * Calculate total AUM for AMC (placeholder - will be updated with actual data)
   */
  calculateAMCAUM(schemes: ParsedScheme[]): number {
    // This is a placeholder - actual AUM comes from monthly reports
    return schemes.length * 1000; // Dummy calculation
  }

  /**
   * Get statistics from parsed data
   */
  getStatistics(schemes: ParsedScheme[]) {
    const amcs = this.groupByAMC(schemes);
    
    return {
      totalSchemes: schemes.length,
      totalAMCs: amcs.length,
      categories: [...new Set(schemes.map(s => s.category))],
      latestDate: schemes[0]?.date || '',
    };
  }
}

export const amfiDataFetcher = new AMFIDataFetcher();
