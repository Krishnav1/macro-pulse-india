// Sample data for Indian Macroeconomics Dashboard
export interface IndicatorData {
  id: string;
  name: string;
  value: string;
  change: number;
  category: string;
  sparklineData: number[];
  unit?: string;
  source?: string;
  lastUpdated?: string;
}

export interface EconomicEvent {
  date: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

// Sample sparkline data (30 data points for mini charts)
const generateSparklineData = (base: number, volatility: number = 0.1): number[] => {
  const data = [];
  let current = base;
  for (let i = 0; i < 30; i++) {
    current += (Math.random() - 0.5) * volatility * base;
    data.push(Math.round(current * 100) / 100);
  }
  return data;
};

export const dashboardIndicators: IndicatorData[] = [
  {
    id: 'real_gdp_growth',
    name: '📈 Real GDP Growth',
    value: '7.38%',
    change: 0.5,
    category: 'Growth',
    sparklineData: generateSparklineData(7.38, 0.1),
    unit: 'YoY',
    source: 'MOSPI'
  },
  {
    id: 'debt_to_gdp',
    name: '📊 Debt-to-GDP Ratio',
    value: '54.90%',
    change: -0.3,
    category: 'Fiscal',
    sparklineData: generateSparklineData(54.9, 0.05),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'repo_rate',
    name: '🏦 Repo Rate',
    value: '5.50%',
    change: 0.0,
    category: 'Monetary',
    sparklineData: generateSparklineData(5.5, 0.03),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'gsec_yield_10y',
    name: '📈 10-Year G-Sec Yield',
    value: '6.43%',
    change: 0.2,
    category: 'Interest Rate',
    sparklineData: generateSparklineData(6.43, 0.08),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'fiscal_deficit',
    name: '🏛️ Central Govt Fiscal Deficit',
    value: '4.74%',
    change: -0.1,
    category: 'Fiscal',
    sparklineData: generateSparklineData(4.74, 0.06),
    unit: '% of GDP',
    source: 'CGA'
  },
  {
    id: 'forex_reserves',
    name: '💵 Foreign Exchange Reserves',
    value: '$698.19B',
    change: 1.2,
    category: 'External',
    sparklineData: generateSparklineData(698.19, 0.12),
    unit: 'Billion USD',
    source: 'RBI'
  },
  {
    id: 'cpi_inflation',
    name: '📊 CPI Inflation',
    value: '1.55%',
    change: -2.1,
    category: 'Inflation',
    sparklineData: generateSparklineData(1.55, 0.15),
    unit: 'YoY',
    source: 'MOSPI'
  },
  {
    id: 'cpi_food_inflation',
    name: '🍎 CPI Food Inflation',
    value: '-1.76%',
    change: -3.2,
    category: 'Inflation',
    sparklineData: generateSparklineData(-1.76, 0.2),
    unit: 'YoY',
    source: 'MOSPI'
  },
  {
    id: 'core_inflation',
    name: '🎯 Core Inflation',
    value: '2.30%',
    change: -0.5,
    category: 'Inflation',
    sparklineData: generateSparklineData(2.3, 0.1),
    unit: 'YoY',
    source: 'MOSPI'
  },
  {
    id: 'current_account_balance',
    name: '⚖️ Current Account Balance',
    value: '-0.6%',
    change: 0.2,
    category: 'External',
    sparklineData: generateSparklineData(-0.6, 0.08),
    unit: '% of GDP',
    source: 'RBI'
  },
  {
    id: 'unemployment_rate',
    name: '👥 Unemployment Rate',
    value: '6.1%',
    change: -0.3,
    category: 'Employment',
    sparklineData: generateSparklineData(6.1, 0.12),
    unit: 'Percentage',
    source: 'CMIE'
  },
  {
    id: 'iip_growth',
    name: '🏭 Industrial Production Growth',
    value: '3.9%',
    change: 0.8,
    category: 'Industrial',
    sparklineData: generateSparklineData(3.9, 0.15),
    unit: 'YoY',
    source: 'MOSPI'
  },
  {
    id: 'bank_credit_growth',
    name: '🏦 Non-Food Bank Credit Growth',
    value: '12.4%',
    change: 1.1,
    category: 'Financial',
    sparklineData: generateSparklineData(12.4, 0.1),
    unit: 'YoY',
    source: 'RBI'
  },
  {
    id: 'merchandise_exports',
    name: '📦 Merchandise Exports',
    value: '$41.6B',
    change: 2.3,
    category: 'Trade',
    sparklineData: generateSparklineData(41.6, 0.18),
    unit: 'Monthly',
    source: 'DGFT'
  },
  {
    id: 'merchandise_imports',
    name: '📥 Merchandise Imports',
    value: '$45.2B',
    change: 1.8,
    category: 'Trade',
    sparklineData: generateSparklineData(45.2, 0.16),
    unit: 'Monthly',
    source: 'DGFT'
  }
];

export const sampleIndicators: IndicatorData[] = [
  // Services Sector Activity
  {
    id: 'bdi',
    name: '🚢 Baltic Dry Index (BDI)',
    value: '1,245',
    change: 2.4,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(1245, 0.15),
    unit: 'Index',
    source: 'Baltic Exchange'
  },
  {
    id: 'air_passenger_intl',
    name: '✈️ International Air Passenger Traffic',
    value: '5.2M',
    change: 8.7,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(5.2, 0.2),
    unit: 'Million Passengers',
    source: 'DGCA'
  },
  {
    id: 'services_pmi',
    name: '📊 Services PMI',
    value: '58.4',
    change: 1.2,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(58.4, 0.05),
    unit: 'Index',
    source: 'S&P Global'
  },
  {
    id: 'air_passenger_domestic',
    name: '🛫 Domestic Air Passenger Traffic',
    value: '12.8M',
    change: 6.3,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(12.8, 0.15),
    unit: 'Million Passengers',
    source: 'DGCA'
  },
  {
    id: 'gst_collections',
    name: '💰 GST Collections',
    value: '₹1.87L Cr',
    change: 4.8,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(187000, 0.1),
    unit: 'Crore INR',
    source: 'GST Council'
  },
  {
    id: 'cpi_misc',
    name: '🛒 CPI Inflation - Miscellaneous',
    value: '5.8%',
    change: -0.3,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(5.8, 0.08),
    unit: 'Percentage',
    source: 'MOSPI'
  },
  {
    id: 'capex_central',
    name: '🏛️ Capital Expenditure - Central Govt',
    value: '₹89,000 Cr',
    change: 12.5,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(89000, 0.12),
    unit: 'Crore INR',
    source: 'CGA'
  },
  {
    id: 'bank_credit_growth_services',
    name: '🏦 India\'s Bank Credit Growth',
    value: '15.2%',
    change: 2.1,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(15.2, 0.06),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'two_wheeler_sales',
    name: '🏍️ Two Wheeler Sales Data',
    value: '1.65M',
    change: 7.9,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(1.65, 0.18),
    unit: 'Million Units',
    source: 'SIAM'
  },
  {
    id: 'port_cargo',
    name: '⚓ Port Cargo Traffic',
    value: '63.2M MT',
    change: 3.7,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(63.2, 0.12),
    unit: 'Million Tonnes',
    source: 'Ministry of Ports'
  },
  {
    id: 'epfo_additions',
    name: '👥 EPFO Additions',
    value: '1.89M',
    change: 5.6,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(1.89, 0.14),
    unit: 'Million Subscribers',
    source: 'EPFO'
  },
  {
    id: 'business_expectation_services',
    name: '📈 Business Situation Assessment (Services)',
    value: '68.5',
    change: 2.8,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(68.5, 0.08),
    unit: 'Index',
    source: 'RBI'
  },
  {
    id: 'services_trade_inflows',
    name: '💼 Net Inflows - Services Trade',
    value: '$28.5B',
    change: 9.2,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(28.5, 0.15),
    unit: 'Billion USD',
    source: 'RBI'
  },
  {
    id: 'passenger_car_sales',
    name: '🚗 Domestic Passenger Car Sales',
    value: '342K',
    change: 4.1,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(342, 0.12),
    unit: 'Thousand Units',
    source: 'SIAM'
  },
  {
    id: 'mgnrega_demand',
    name: '🔨 MGNREGA - Work Demanded',
    value: '2.87 Cr',
    change: -2.1,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(2.87, 0.18),
    unit: 'Crore Person-days',
    source: 'Ministry of Rural Development'
  },
  {
    id: 'central_tax_collections',
    name: '🏛️ Central Government Tax Collections',
    value: '₹14.8L Cr',
    change: 11.7,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(148000, 0.1),
    unit: 'Crore INR',
    source: 'CBDT/CBIC'
  },
  {
    id: 'railway_freight_revenue',
    name: '🚂 Railway Freight Revenue',
    value: '₹1.42L Cr',
    change: 6.8,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(142000, 0.08),
    unit: 'Crore INR',
    source: 'Railway Board'
  },

  // Industrial Sector Performance
  {
    id: 'bank_credit_industries',
    name: '🏭 Bank Credit to Industries',
    value: '₹45.2L Cr',
    change: 8.5,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(452000, 0.12),
    unit: 'Crore INR',
    source: 'RBI'
  },
  {
    id: 'energy_requirements',
    name: '⚡ Energy Requirements',
    value: '1,245 BU',
    change: 4.2,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(1245, 0.1),
    unit: 'Billion Units',
    source: 'CEA'
  },
  {
    id: 'consumer_durables_output',
    name: '📱 Consumer Durables Output',
    value: '125.4',
    change: 6.8,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(125.4, 0.15),
    unit: 'Index',
    source: 'MOSPI'
  },
  {
    id: 'steel_production',
    name: '🏗️ Steel Production',
    value: '12.5M MT',
    change: 3.7,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(12.5, 0.18),
    unit: 'Million Tonnes',
    source: 'Ministry of Steel'
  },
  {
    id: 'petroleum_sales',
    name: '🛢️ Petroleum Product Sales',
    value: '18.2M MT',
    change: 5.1,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(18.2, 0.14),
    unit: 'Million Tonnes',
    source: 'PPAC'
  },
  {
    id: 'cement_production',
    name: '🏢 Cement Production',
    value: '35.8M MT',
    change: 7.3,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(35.8, 0.16),
    unit: 'Million Tonnes',
    source: 'CMA'
  },
  {
    id: 'natural_gas_production',
    name: '🔥 Natural Gas Production',
    value: '2.8 BCM',
    change: 2.1,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(2.8, 0.12),
    unit: 'Billion Cubic Meters',
    source: 'MoPNG'
  },
  {
    id: 'iip_manufacturing',
    name: '🏭 IIP - Manufacturing',
    value: '142.5',
    change: 4.6,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(142.5, 0.13),
    unit: 'Index',
    source: 'MOSPI'
  },
  {
    id: 'manufacturing_pmi',
    name: '📊 Manufacturing PMI',
    value: '56.7',
    change: 1.8,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(56.7, 0.08),
    unit: 'Index',
    source: 'S&P Global'
  },
  {
    id: 'manufactured_exports',
    name: '📦 Exports of Manufactured Goods',
    value: '$28.4B',
    change: 6.2,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(28.4, 0.17),
    unit: 'Billion USD',
    source: 'DGFT'
  },
  {
    id: 'wpi_manufacturing',
    name: '📈 WPI Inflation - Manufacturing',
    value: '2.8%',
    change: -0.5,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(2.8, 0.11),
    unit: 'Percentage',
    source: 'MOSPI'
  },
  {
    id: 'capacity_utilization',
    name: '⚙️ Capacity Utilisation in Manufacturing',
    value: '74.2%',
    change: 2.3,
    category: 'Industrial Sector Performance',
    sparklineData: generateSparklineData(74.2, 0.09),
    unit: 'Percentage',
    source: 'RBI'
  },

  // Consumer Inflation
  {
    id: 'pfce',
    name: '🛒 Private Final Consumption Expenditure',
    value: '₹89.5L Cr',
    change: 6.8,
    category: 'Consumer Inflation',
    sparklineData: generateSparklineData(895000, 0.12),
    unit: 'Crore INR',
    source: 'MOSPI'
  },
  {
    id: 'steel_consumption',
    name: '🏗️ Steel Consumption',
    value: '11.8M MT',
    change: 4.5,
    category: 'Consumer Inflation',
    sparklineData: generateSparklineData(11.8, 0.16),
    unit: 'Million Tonnes',
    source: 'Ministry of Steel'
  },
  {
    id: 'broad_money_m3',
    name: '💰 Broad Money (M3)',
    value: '₹198.5L Cr',
    change: 9.2,
    category: 'Consumer Inflation',
    sparklineData: generateSparklineData(1985000, 0.08),
    unit: 'Crore INR',
    source: 'RBI'
  },
  {
    id: 'electronic_toll_collection',
    name: '🛣️ Average Daily Electronic Toll Collection',
    value: '₹145 Cr',
    change: 12.3,
    category: 'Consumer Inflation',
    sparklineData: generateSparklineData(145, 0.15),
    unit: 'Crore INR',
    source: 'NHAI'
  },
  {
    id: 'tractor_sales',
    name: '🚜 Domestic Tractor Sales',
    value: '85.2K',
    change: 3.7,
    category: 'Consumer Inflation',
    sparklineData: generateSparklineData(85.2, 0.18),
    unit: 'Thousand Units',
    source: 'TMAI'
  },

  // Equity Market Optimism
  {
    id: 'gross_fdi',
    name: '📊 Gross Foreign Direct Investment',
    value: '$8.4B',
    change: 15.2,
    category: 'Equity Market Optimism',
    sparklineData: generateSparklineData(8.4, 0.22),
    unit: 'Billion USD',
    source: 'DPIIT'
  },
  {
    id: 'primary_equity_issuances',
    name: '📊 Primary Issuances in Equity Market',
    value: '₹45.8K Cr',
    change: 28.5,
    category: 'Equity Market Optimism',
    sparklineData: generateSparklineData(45800, 0.25),
    unit: 'Crore INR',
    source: 'SEBI'
  },
  {
    id: 'rupee_dollar_rate',
    name: '💱 Rupee-Dollar Exchange Rate',
    value: '83.15',
    change: 0.8,
    category: 'Equity Market Optimism',
    sparklineData: generateSparklineData(83.15, 0.02),
    unit: 'INR/USD',
    source: 'RBI'
  },
  {
    id: 'fpi_equity',
    name: '🌍 Foreign Portfolio Investments - Equity',
    value: '₹18.5K Cr',
    change: 22.1,
    category: 'Equity Market Optimism',
    sparklineData: generateSparklineData(18500, 0.28),
    unit: 'Crore INR',
    source: 'NSDL'
  },
  {
    id: 'dii_equity_investment',
    name: '📊 Domestic Institutional Investors - Equity',
    value: '₹25.2K Cr',
    change: 18.7,
    category: 'Equity Market Optimism',
    sparklineData: generateSparklineData(25200, 0.2),
    unit: 'Crore INR',
    source: 'SEBI'
  },
  {
    id: 'mutual_fund_aum_equity',
    name: '📊 Mutual Funds AUM - Equity',
    value: '₹28.9L Cr',
    change: 24.3,
    category: 'Equity Market Optimism',
    sparklineData: generateSparklineData(289000, 0.18),
    unit: 'Crore INR',
    source: 'AMFI'
  },

  // Financial Sector Soundness
  {
    id: 'mclr',
    name: '🏦 Marginal Cost of Funds Lending Rate',
    value: '8.85%',
    change: 0.15,
    category: 'Financial Sector Soundness',
    sparklineData: generateSparklineData(8.85, 0.03),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'term_deposit_rate',
    name: '💰 Term Deposit Rate',
    value: '6.75%',
    change: 0.25,
    category: 'Financial Sector Soundness',
    sparklineData: generateSparklineData(6.75, 0.05),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'fpi_debt',
    name: '🌍 Foreign Portfolio Investments - Debt',
    value: '₹8.2K Cr',
    change: -5.3,
    category: 'Financial Sector Soundness',
    sparklineData: generateSparklineData(8200, 0.15),
    unit: 'Crore INR',
    source: 'NSDL'
  },
  {
    id: 'crr',
    name: '🏛️ Cash Reserve Ratio',
    value: '4.50%',
    change: 0.0,
    category: 'Financial Sector Soundness',
    sparklineData: generateSparklineData(4.5, 0.01),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'slr',
    name: '📊 Statutory Liquidity Ratio',
    value: '18.00%',
    change: 0.0,
    category: 'Financial Sector Soundness',
    sparklineData: generateSparklineData(18.0, 0.01),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'bank_deposits',
    name: '🏦 Aggregate Bank Deposits',
    value: '₹185.4L Cr',
    change: 10.8,
    category: 'Financial Sector Soundness',
    sparklineData: generateSparklineData(1854000, 0.08),
    unit: 'Crore INR',
    source: 'RBI'
  },

  // Global Economic Impact
  {
    id: 'crude_oil_prices_global',
    name: '🛢️ Crude Oil Prices',
    value: '$82.45',
    change: -2.1,
    category: 'Global Economic Impact',
    sparklineData: generateSparklineData(82.45, 0.12),
    unit: 'USD/Barrel',
    source: 'Bloomberg'
  },
  {
    id: 'non_pol_exports',
    name: '📦 Non-POL Exports',
    value: '$35.8B',
    change: 4.2,
    category: 'Global Economic Impact',
    sparklineData: generateSparklineData(35.8, 0.15),
    unit: 'Billion USD',
    source: 'DGFT'
  },
  {
    id: 'ecb',
    name: '💰 External Commercial Borrowings',
    value: '$2.8B',
    change: -8.5,
    category: 'Global Economic Impact',
    sparklineData: generateSparklineData(2.8, 0.25),
    unit: 'Billion USD',
    source: 'RBI'
  },
  {
    id: 'import_cover_months',
    name: '📊 Import Cover in Months',
    value: '11.2',
    change: 0.3,
    category: 'Global Economic Impact',
    sparklineData: generateSparklineData(11.2, 0.08),
    unit: 'Months',
    source: 'RBI'
  },
  {
    id: 'foreign_tourist_arrivals',
    name: '🏝️ Foreign Tourist Arrivals',
    value: '1.25M',
    change: 18.5,
    category: 'Global Economic Impact',
    sparklineData: generateSparklineData(1.25, 0.22),
    unit: 'Million',
    source: 'Ministry of Tourism'
  },

  // Interest Rate Outlook
  {
    id: 'gsec_spread_1y_3y',
    name: '🏦 G-Sec Yield Spread (1Y-3Y)',
    value: '0.25%',
    change: 0.05,
    category: 'Interest Rate Outlook',
    sparklineData: generateSparklineData(0.25, 0.1),
    unit: 'Percentage Points',
    source: 'RBI'
  },
  {
    id: 'gsec_spread_1y_10y',
    name: '🏦 G-Sec Yield Spread (1Y-10Y)',
    value: '0.85%',
    change: 0.12,
    category: 'Interest Rate Outlook',
    sparklineData: generateSparklineData(0.85, 0.15),
    unit: 'Percentage Points',
    source: 'RBI'
  },
  {
    id: 'aaa_bonds_spread_1y_3y',
    name: '📊 AAA Bonds Yield Spread (1Y-3Y)',
    value: '0.35%',
    change: 0.08,
    category: 'Interest Rate Outlook',
    sparklineData: generateSparklineData(0.35, 0.12),
    unit: 'Percentage Points',
    source: 'CRISIL'
  },
  {
    id: 'real_interest_rate',
    name: '📈 Real Interest Rate',
    value: '3.95%',
    change: 0.45,
    category: 'Interest Rate Outlook',
    sparklineData: generateSparklineData(3.95, 0.18),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'cpi_core_inflation',
    name: '🛒 CPI Inflation - Core',
    value: '3.2%',
    change: -0.3,
    category: 'Interest Rate Outlook',
    sparklineData: generateSparklineData(3.2, 0.1),
    unit: 'Percentage',
    source: 'MOSPI'
  }
];

// Economic events for historical context
export const economicEvents: EconomicEvent[] = [
  {
    date: '2008-09',
    description: 'Global Financial Crisis',
    impact: 'high'
  },
  {
    date: '2016-11',
    description: 'Demonetization',
    impact: 'high'
  },
  {
    date: '2017-07',
    description: 'GST Implementation',
    impact: 'high'
  },
  {
    date: '2020-03',
    description: 'COVID-19 Pandemic',
    impact: 'high'
  },
  {
    date: '2021-04',
    description: 'Second COVID Wave',
    impact: 'medium'
  },
  {
    date: '2022-02',
    description: 'Russia-Ukraine Conflict',
    impact: 'medium'
  }
];

// Category configurations with colors
export const categoryConfig = {
  'Services Sector Activity': {
    color: 'chart-1',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  'Industrial Sector Performance': {
    color: 'chart-2',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  'Agriculture Output': {
    color: 'chart-3',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  'Consumer Inflation': {
    color: 'chart-4',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  'Equity Market Optimism': {
    color: 'chart-5',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20'
  },
  'Financial Sector Soundness': {
    color: 'chart-6',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  'Global Economic Impact': {
    color: 'chart-1',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20'
  },
  'Interest Rate Outlook': {
    color: 'chart-2',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  }
};

export const categories = Object.keys(categoryConfig);