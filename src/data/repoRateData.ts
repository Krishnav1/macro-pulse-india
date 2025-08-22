export const repoRateData = [
  { date: '2025-08-06', rate: 5.50 },
  { date: '2025-06-06', rate: 5.50 },
  { date: '2025-04-09', rate: 6.00 },
  { date: '2025-02-07', rate: 6.20 },
  { date: '2024-12-06', rate: 6.50 },
  { date: '2024-10-09', rate: 6.50 },
  { date: '2024-08-08', rate: 6.50 },
  { date: '2024-06-07', rate: 6.50 },
  { date: '2024-04-05', rate: 6.50 },
  { date: '2024-02-08', rate: 6.50 },
  { date: '2023-12-08', rate: 6.50 },
  { date: '2023-10-06', rate: 6.50 },
  { date: '2023-08-10', rate: 6.50 },
];

export const repoRateEvents = [
  {
    date: '2025-02-07',
    description: 'RBI cuts repo rate by 20 bps amid easing inflation',
    impact: 'medium'
  },
  {
    date: '2024-02-08',
    description: 'RBI maintains status quo, signals data-dependent approach',
    impact: 'low'
  },
  {
    date: '2023-02-08',
    description: 'Final rate hike of the tightening cycle',
    impact: 'high'
  },
  {
    date: '2022-05-04',
    description: 'Emergency rate hike due to inflation surge post Ukraine war',
    impact: 'high'
  },
  {
    date: '2020-03-27',
    description: 'Emergency rate cut during COVID-19 pandemic',
    impact: 'high'
  }
];

export const repoRateInsights = [
  "The repo rate at 5.50% reflects RBI's accommodative stance amid controlled inflation expectations and growth concerns.",
  "Current rate is 100 bps below the peak of 6.50% reached in early 2023, indicating a shift towards supporting economic growth.",
  "The rate cut cycle began in February 2025 as inflation moderated below RBI's 4% target, providing room for monetary easing.",
  "Real interest rates remain positive at approximately 3.95%, ensuring financial stability while supporting credit growth.",
  "Market expects further 25-50 bps cuts in 2025 based on inflation trajectory and global monetary policy trends."
];

export const repoRateComparisons = [
  { id: 'cpi_inflation', name: 'CPI Inflation', category: 'Inflation' },
  { id: 'gsec_yield_10y', name: '10-Year G-Sec Yield', category: 'Interest Rate' },
  { id: 'bank_credit_growth', name: 'Bank Credit Growth', category: 'Financial' },
  { id: 'real_gdp_growth', name: 'Real GDP Growth', category: 'Growth' },
  { id: 'mclr', name: 'MCLR', category: 'Financial Sector Soundness' },
  { id: 'term_deposit_rate', name: 'Term Deposit Rate', category: 'Financial Sector Soundness' }
];
