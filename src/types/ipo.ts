// IPO Types and Interfaces

export interface IPOListing {
  id: number;
  ipo_type: 'mainboard' | 'sme';
  year: number;
  company_name: string;
  sector: string | null;
  issue_size: number | null;
  issue_price: number | null;
  listing_date: string;
  listing_open: number | null;
  listing_close: number | null;
  listing_gain_percent: number | null;
  ltp: number | null;
  market_cap: number | null;
  current_gain_percent: number | null;
  created_at: string;
  updated_at: string;
}

export interface IPOStats {
  totalIPOs: number;
  totalIssueSize: number;
  avgListingGain: number;
  avgCurrentReturn: number;
  successRate: number;
  
  // Listing Day Open Analysis
  openProfitCount: number;
  openLossCount: number;
  avgOpenGain: number;
  
  // Listing Day Close Analysis
  closeProfitCount: number;
  closeLossCount: number;
  avgCloseGain: number;
  
  // Till Date Analysis
  currentProfitCount: number;
  currentLossCount: number;
  avgCurrentGain: number;
}

export interface SectorPerformance {
  sector: string;
  ipoCount: number;
  totalIssueSize: number;
  avgListingGain: number;
  avgCurrentGain: number;
  successRate: number;
  bestPerformer: string;
  worstPerformer: string;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  ipoCount: number;
  totalIssueSize: number;
  avgListingGain: number;
  avgCurrentGain: number;
}

export interface IPOFilters {
  ipoType: 'all' | 'mainboard' | 'sme';
  year: number | 'all';
  sector?: string;
}

export interface IPOUploadData {
  'Company Name': string;
  'LTP (Rs)': number | string;
  'Market Cap (Cr)': number | string;
  'Listing Date': string;
  'Issue Size': number | string;
  'Issue Price': number | string;
  'Listing Open (Rs)': number | string;
  'Listing Close (Rs)': number | string;
  'Listing Gain %': number | string;
  'Current Gain %': number | string;
  'Sector'?: string;
}
