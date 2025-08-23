export interface EconomicEvent {
  date: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
}

export interface IndicatorData {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  change: number;
  changePercent: number;
  lastUpdated: string;
  description: string;
  source: string;
  sparklineData: number[];
  historicalData: Array<{
    date: string;
    value: number;
  }>;
  events: EconomicEvent[];
}

export const economicIndicators: IndicatorData[] = [
  {
    id: 'gdp-growth',
    name: 'GDP Growth Rate',
    category: 'Growth',
    value: 7.2,
    unit: '%',
    change: 0.3,
    changePercent: 4.3,
    lastUpdated: '2024-03-15',
    description: 'Quarterly GDP growth rate showing economic expansion',
    source: 'Ministry of Statistics and Programme Implementation (MOSPI)',
    sparklineData: [6.1, 6.3, 6.8, 7.0, 6.9, 7.2],
    historicalData: [
      { date: '2020-Q1', value: 3.1 },
      { date: '2020-Q2', value: -24.4 },
      { date: '2020-Q3', value: -7.3 },
      { date: '2020-Q4', value: 0.4 },
      { date: '2021-Q1', value: 1.6 },
      { date: '2021-Q2', value: 20.1 },
      { date: '2021-Q3', value: 8.4 },
      { date: '2021-Q4', value: 5.4 },
      { date: '2022-Q1', value: 4.1 },
      { date: '2022-Q2', value: 13.5 },
      { date: '2022-Q3', value: 6.3 },
      { date: '2022-Q4', value: 4.5 },
      { date: '2023-Q1', value: 6.1 },
      { date: '2023-Q2', value: 7.8 },
      { date: '2023-Q3', value: 7.6 },
      { date: '2023-Q4', value: 8.4 },
      { date: '2024-Q1', value: 7.2 }
    ],
    events: [
      { date: '2020-03-25', event: 'COVID-19 Nationwide Lockdown', impact: 'high' },
      { date: '2021-05-01', event: 'Second COVID Wave Peak', impact: 'high' },
      { date: '2022-02-24', event: 'Russia-Ukraine Conflict Begins', impact: 'medium' }
    ]
  },
  {
    id: 'inflation-cpi',
    name: 'CPI Inflation',
    category: 'Inflation',
    value: 5.09,
    unit: '%',
    change: -0.21,
    changePercent: -3.96,
    lastUpdated: '2024-03-12',
    description: 'Consumer Price Index inflation rate',
    source: 'National Statistical Office (NSO)',
    sparklineData: [6.07, 5.88, 5.65, 5.09, 4.85, 5.09],
    historicalData: [
      { date: '2020-01', value: 7.59 },
      { date: '2020-04', value: 6.58 },
      { date: '2020-07', value: 6.93 },
      { date: '2020-10', value: 7.61 },
      { date: '2021-01', value: 4.06 },
      { date: '2021-04', value: 4.29 },
      { date: '2021-07', value: 5.59 },
      { date: '2021-10', value: 4.35 },
      { date: '2022-01', value: 6.01 },
      { date: '2022-04', value: 7.79 },
      { date: '2022-07', value: 6.71 },
      { date: '2022-10', value: 6.77 },
      { date: '2023-01', value: 6.52 },
      { date: '2023-04', value: 4.25 },
      { date: '2023-07', value: 7.44 },
      { date: '2023-10', value: 4.87 },
      { date: '2024-01', value: 5.09 }
    ],
    events: [
      { date: '2021-04-01', event: 'Fuel Price Surge', impact: 'high' },
      { date: '2022-02-24', event: 'Global Commodity Price Shock', impact: 'high' }
    ]
  },
  {
    id: 'repo-rate',
    name: 'RBI Repo Rate',
    category: 'Monetary',
    value: 6.50,
    unit: '%',
    change: 0.00,
    changePercent: 0.00,
    lastUpdated: '2024-02-08',
    description: 'Reserve Bank of India policy repo rate',
    source: 'Reserve Bank of India (RBI)',
    sparklineData: [4.00, 4.40, 4.90, 5.40, 5.90, 6.50],
    historicalData: [
      { date: '2020-01', value: 5.15 },
      { date: '2020-03', value: 4.40 },
      { date: '2020-05', value: 4.00 },
      { date: '2021-12', value: 4.00 },
      { date: '2022-05', value: 4.40 },
      { date: '2022-06', value: 4.90 },
      { date: '2022-08', value: 5.40 },
      { date: '2022-09', value: 5.90 },
      { date: '2022-12', value: 6.25 },
      { date: '2023-02', value: 6.50 },
      { date: '2024-02', value: 6.50 }
    ],
    events: [
      { date: '2020-03-27', event: 'Emergency Rate Cut (COVID Response)', impact: 'high' },
      { date: '2022-05-04', event: 'Rate Hike Cycle Begins', impact: 'high' }
    ]
  },
  {
    id: 'forex-reserves',
    name: 'Forex Reserves',
    category: 'External',
    value: 645.6,
    unit: 'USD Bn',
    change: 2.1,
    changePercent: 0.33,
    lastUpdated: '2024-03-08',
    description: 'Foreign exchange reserves including gold',
    source: 'Reserve Bank of India (RBI)',
    sparklineData: [590.1, 605.2, 620.8, 635.1, 643.5, 645.6],
    historicalData: [
      { date: '2020-01', value: 457.5 },
      { date: '2020-07', value: 534.6 },
      { date: '2021-01', value: 586.1 },
      { date: '2021-07', value: 620.1 },
      { date: '2022-01', value: 631.9 },
      { date: '2022-07', value: 572.7 },
      { date: '2023-01', value: 578.4 },
      { date: '2023-07', value: 609.0 },
      { date: '2024-01', value: 645.6 }
    ],
    events: [
      { date: '2022-03-01', event: 'Russia-Ukraine War Impact', impact: 'medium' },
      { date: '2022-09-01', event: 'Dollar Strength Impact', impact: 'medium' }
    ]
  },
  {
    id: 'fiscal-deficit',
    name: 'Fiscal Deficit',
    category: 'Fiscal',
    value: 5.8,
    unit: '% of GDP',
    change: -0.1,
    changePercent: -1.69,
    lastUpdated: '2024-02-29',
    description: 'Central government fiscal deficit as percentage of GDP',
    source: 'Controller General of Accounts (CGA)',
    sparklineData: [9.2, 6.4, 6.1, 5.9, 5.8, 5.8],
    historicalData: [
      { date: 'FY2020', value: 4.6 },
      { date: 'FY2021', value: 9.2 },
      { date: 'FY2022', value: 6.7 },
      { date: 'FY2023', value: 6.4 },
      { date: 'FY2024', value: 5.8 }
    ],
    events: [
      { date: '2020-03-01', event: 'COVID Fiscal Stimulus', impact: 'high' },
      { date: '2021-02-01', event: 'Budget 2021 - Recovery Focus', impact: 'medium' }
    ]
  },
  {
    id: 'iip',
    name: 'Industrial Production Growth',
    category: 'Growth',
    value: 3.8,
    unit: '%',
    change: 0.6,
    changePercent: 18.8,
    lastUpdated: '2024-03-12',
    description: 'Index of Industrial Production (IIP) growth rate measuring industrial sector performance',
    source: 'Ministry of Statistics and Programme Implementation (MoSPI)',
    sparklineData: [2.2, 2.8, 3.1, 3.4, 3.2, 3.8],
    historicalData: [
      { date: '2020-01', value: 2.1 },
      { date: '2020-04', value: -57.3 },
      { date: '2020-07', value: -10.4 },
      { date: '2020-10', value: 3.6 },
      { date: '2021-01', value: -0.9 },
      { date: '2021-04', value: 134.4 },
      { date: '2021-07', value: 11.5 },
      { date: '2021-10', value: 1.4 },
      { date: '2022-01', value: 1.3 },
      { date: '2022-04', value: 7.1 },
      { date: '2022-07', value: 2.4 },
      { date: '2022-10', value: 4.2 },
      { date: '2023-01', value: 5.2 },
      { date: '2023-04', value: 4.2 },
      { date: '2023-07', value: 5.7 },
      { date: '2023-10', value: 2.4 },
      { date: '2024-01', value: 3.8 }
    ],
    events: [
      { date: '2020-03-25', event: 'COVID-19 Industrial Shutdown', impact: 'high' },
      { date: '2021-04-01', event: 'Manufacturing Recovery Begins', impact: 'medium' },
      { date: '2022-02-24', event: 'Supply Chain Disruptions', impact: 'medium' }
    ]
  },
  {
    id: 'fii-flows',
    name: 'FII Net Flows',
    category: 'External',
    value: 12.8,
    unit: 'USD Bn (YTD)',
    change: 8.2,
    changePercent: 177.8,
    lastUpdated: '2024-03-15',
    description: 'Foreign Institutional Investor net equity flows',
    source: 'National Securities Depository Limited (NSDL)',
    sparklineData: [-12.1, -8.5, -2.3, 4.6, 8.1, 12.8],
    historicalData: [
      { date: '2020', value: 23.6 },
      { date: '2021', value: 11.6 },
      { date: '2022', value: -16.9 },
      { date: '2023', value: 21.4 },
      { date: '2024', value: 12.8 }
    ],
    events: [
      { date: '2022-01-01', event: 'Fed Rate Hike Fears', impact: 'high' },
      { date: '2023-06-01', event: 'India Weight Upgrade', impact: 'medium' }
    ]
  }
];

export const categories = [
  'All',
  'Growth',
  'Inflation', 
  'Monetary',
  'External',
  'Fiscal'
];