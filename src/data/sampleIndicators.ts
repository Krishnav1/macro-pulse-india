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

export const sampleIndicators: IndicatorData[] = [
  // Services Sector Activity
  {
    id: 'bdi',
    name: 'Baltic Dry Index (BDI)',
    value: '1,245',
    change: 2.4,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(1245, 0.15),
    unit: 'Index',
    source: 'Baltic Exchange'
  },
  {
    id: 'air_passenger_intl',
    name: 'International Air Passenger Traffic',
    value: '5.2M',
    change: 8.7,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(5.2, 0.2),
    unit: 'Million Passengers',
    source: 'DGCA'
  },
  {
    id: 'services_pmi',
    name: 'Services PMI',
    value: '58.4',
    change: 1.2,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(58.4, 0.05),
    unit: 'Index',
    source: 'S&P Global'
  },
  {
    id: 'air_passenger_domestic',
    name: 'Domestic Air Passenger Traffic',
    value: '12.8M',
    change: 6.3,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(12.8, 0.15),
    unit: 'Million Passengers',
    source: 'DGCA'
  },
  {
    id: 'gst_collections',
    name: 'GST Collections',
    value: '₹1.87L Cr',
    change: 4.8,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(187000, 0.1),
    unit: 'Crore INR',
    source: 'GST Council'
  },
  {
    id: 'cpi_misc',
    name: 'CPI Inflation - Miscellaneous',
    value: '5.8%',
    change: -0.3,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(5.8, 0.08),
    unit: 'Percentage',
    source: 'MOSPI'
  },
  {
    id: 'capex_central',
    name: 'Capital Expenditure - Central Govt',
    value: '₹89,000 Cr',
    change: 12.5,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(89000, 0.12),
    unit: 'Crore INR',
    source: 'CGA'
  },
  {
    id: 'bank_credit_growth',
    name: "India's Bank Credit Growth",
    value: '15.2%',
    change: 2.1,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(15.2, 0.06),
    unit: 'Percentage',
    source: 'RBI'
  },
  {
    id: 'two_wheeler_sales',
    name: 'Two Wheeler Sales Data',
    value: '1.65M',
    change: 7.9,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(1.65, 0.18),
    unit: 'Million Units',
    source: 'SIAM'
  },
  {
    id: 'port_cargo',
    name: 'Port Cargo Traffic',
    value: '63.2M MT',
    change: 3.7,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(63.2, 0.12),
    unit: 'Million Tonnes',
    source: 'Ministry of Ports'
  },
  {
    id: 'epfo_additions',
    name: 'EPFO Additions',
    value: '1.89M',
    change: 5.6,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(1.89, 0.14),
    unit: 'Million Subscribers',
    source: 'EPFO'
  },
  {
    id: 'business_expectation_services',
    name: 'Business Situation Assessment (Services)',
    value: '68.5',
    change: 2.8,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(68.5, 0.08),
    unit: 'Index',
    source: 'RBI'
  },
  {
    id: 'services_trade_inflows',
    name: 'Net Inflows - Services Trade',
    value: '$28.5B',
    change: 9.2,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(28.5, 0.15),
    unit: 'Billion USD',
    source: 'RBI'
  },
  {
    id: 'passenger_car_sales',
    name: 'Domestic Passenger Car Sales',
    value: '342K',
    change: 4.1,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(342, 0.12),
    unit: 'Thousand Units',
    source: 'SIAM'
  },
  {
    id: 'mgnrega_demand',
    name: 'MGNREGA - Work Demanded',
    value: '2.87 Cr',
    change: -2.1,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(2.87, 0.18),
    unit: 'Crore Person-days',
    source: 'Ministry of Rural Development'
  },
  {
    id: 'central_tax_collections',
    name: 'Central Government Tax Collections',
    value: '₹14.8L Cr',
    change: 11.7,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(148000, 0.1),
    unit: 'Crore INR',
    source: 'CBDT/CBIC'
  },
  {
    id: 'railway_freight_revenue',
    name: 'Railway Freight Revenue',
    value: '₹1.42L Cr',
    change: 6.8,
    category: 'Services Sector Activity',
    sparklineData: generateSparklineData(142000, 0.08),
    unit: 'Crore INR',
    source: 'Railway Board'
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