 # 🏦 Mutual Fund Module - Complete Implementation Plan

## 📊 Project Overview

**Goal**: Build a comprehensive mutual fund analysis platform using AMFI India data with multi-level drill-down capabilities.

**Data Source**: AMFI India (Association of Mutual Funds in India) - Official & Free
- Primary: `https://portal.amfiindia.com/spages/NAVAll.txt` (Daily NAV)
- Secondary: AMFI Monthly Reports (AUM, Holdings, Performance)

---

## 🎯 Implementation Phases

### **Phase 1: Foundation & Data Infrastructure** (Week 1)

#### 1.1 Database Schema
```sql
-- AMC Master Table
CREATE TABLE mutual_fund_amcs (
  id SERIAL PRIMARY KEY,
  amc_code TEXT UNIQUE NOT NULL,
  amc_name TEXT NOT NULL,
  established_year INT,
  headquarters TEXT,
  parent_company TEXT,
  website TEXT,
  sebi_registration TEXT,
  total_aum DECIMAL DEFAULT 0,
  num_schemes INT DEFAULT 0,
  market_share DECIMAL,
  rank INT,
  ceo_name TEXT,
  cio_equity TEXT,
  cio_debt TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheme Master Table
CREATE TABLE mutual_fund_schemes (
  id SERIAL PRIMARY KEY,
  scheme_code TEXT UNIQUE NOT NULL,
  amc_id INT REFERENCES mutual_fund_amcs(id) ON DELETE CASCADE,
  scheme_name TEXT NOT NULL,
  isin_growth TEXT,
  isin_dividend TEXT,
  isin_reinvestment TEXT,
  category TEXT,
  sub_category TEXT,
  scheme_type TEXT, -- Open/Close ended
  launch_date DATE,
  benchmark TEXT,
  risk_grade TEXT,
  expense_ratio DECIMAL,
  exit_load TEXT,
  min_investment DECIMAL,
  min_sip DECIMAL,
  fund_manager_name TEXT,
  aum DECIMAL DEFAULT 0,
  current_nav DECIMAL,
  nav_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily NAV History
CREATE TABLE scheme_nav_history (
  id SERIAL PRIMARY KEY,
  scheme_id INT REFERENCES mutual_fund_schemes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  nav DECIMAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(scheme_id, date)
);

-- Performance Metrics (Calculated)
CREATE TABLE scheme_performance (
  id SERIAL PRIMARY KEY,
  scheme_id INT REFERENCES mutual_fund_schemes(id) ON DELETE CASCADE,
  as_of_date DATE NOT NULL,
  return_1m DECIMAL,
  return_3m DECIMAL,
  return_6m DECIMAL,
  return_1y DECIMAL,
  return_3y DECIMAL,
  return_5y DECIMAL,
  return_since_inception DECIMAL,
  volatility DECIMAL,
  sharpe_ratio DECIMAL,
  max_drawdown DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(scheme_id, as_of_date)
);

-- Portfolio Holdings (Monthly)
CREATE TABLE scheme_portfolio (
  id SERIAL PRIMARY KEY,
  scheme_id INT REFERENCES mutual_fund_schemes(id) ON DELETE CASCADE,
  as_of_date DATE NOT NULL,
  stock_name TEXT,
  isin TEXT,
  sector TEXT,
  holding_percent DECIMAL,
  quantity BIGINT,
  market_value DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(scheme_id, as_of_date, stock_name)
);

-- Scraping Logs
CREATE TABLE mf_scraping_logs (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL, -- 'amfi_nav', 'amfi_monthly', 'manual'
  status TEXT NOT NULL, -- 'success', 'failed', 'in_progress'
  records_processed INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_scheme_code ON mutual_fund_schemes(scheme_code);
CREATE INDEX idx_amc_id ON mutual_fund_schemes(amc_id);
CREATE INDEX idx_nav_scheme_date ON scheme_nav_history(scheme_id, date DESC);
CREATE INDEX idx_performance_scheme ON scheme_performance(scheme_id, as_of_date DESC);
```

#### 1.2 AMFI Data Fetcher Service
**File**: `src/services/amfi/AMFIDataFetcher.ts`

**Responsibilities**:
- Fetch NAVAll.txt from AMFI
- Parse semicolon-separated data
- Extract AMC names, scheme codes, ISINs, NAV
- Categorize schemes (Equity, Debt, Hybrid, etc.)
- Batch upsert to Supabase

**Key Functions**:
```typescript
- fetchDailyNAV(): Promise<string>
- parseNAVData(rawData: string): ParsedScheme[]
- categorizeScheme(schemeName: string): Category
- extractAMCName(schemeName: string): string
- updateDatabase(schemes: ParsedScheme[]): Promise<void>
```

#### 1.3 Data Transformer
**File**: `src/services/amfi/DataTransformer.ts`

**Responsibilities**:
- Clean scheme names
- Validate ISIN codes
- Map categories to standard taxonomy
- Calculate derived fields

---

### **Phase 2: Admin Interface** (Week 1-2)

#### 2.1 Admin Component Structure
**File**: `src/components/admin/financial/MutualFundAdmin.tsx`

**Features**:
1. **Data Source Tabs**:
   - AMFI Daily NAV Sync
   - Monthly Data Upload (Manual)
   - Portfolio Holdings Upload
   - Scheme Master Data

2. **AMFI Daily NAV Sync**:
   ```
   ┌─────────────────────────────────────────────────┐
   │  📊 AMFI Daily NAV Synchronization              │
   ├─────────────────────────────────────────────────┤
   │                                                  │
   │  Data Source: AMFI India (Official)             │
   │  URL: portal.amfiindia.com/spages/NAVAll.txt    │
   │                                                  │
   │  Last Sync: 01-Oct-2025 6:45 PM                 │
   │  Status: ✓ Success                              │
   │  Schemes Updated: 10,247                        │
   │  AMCs Identified: 42                            │
   │                                                  │
   │  [🔄 Sync Now] [📅 Schedule Daily at 6:30 PM]  │
   │                                                  │
   │  Auto-sync: [ON ●] Daily at 6:30 PM IST        │
   │                                                  │
   │  📋 Recent Sync History:                        │
   │  - 01-Oct-2025 6:30 PM: Success (10,247)       │
   │  - 30-Sep-2025 6:30 PM: Success (10,245)       │
   │  - 29-Sep-2025 6:30 PM: Success (10,243)       │
   │                                                  │
   └─────────────────────────────────────────────────┘
   ```

3. **Manual Data Upload**:
   ```
   ┌─────────────────────────────────────────────────┐
   │  📁 Manual Data Upload                          │
   ├─────────────────────────────────────────────────┤
   │                                                  │
   │  Upload Type: [Scheme Master Data ▼]           │
   │                                                  │
   │  Options:                                       │
   │  - Scheme Master Data (AMC, Manager, etc.)     │
   │  - Monthly AUM Data                             │
   │  - Portfolio Holdings                           │
   │  - Expense Ratios                               │
   │                                                  │
   │  [📥 Download Template] [📤 Upload File]       │
   │                                                  │
   │  Supported Formats: Excel (.xlsx), CSV          │
   │                                                  │
   │  📋 Template Structure:                         │
   │  - Scheme Code (Required)                       │
   │  - AMC Name (Required)                          │
   │  - Fund Manager                                 │
   │  - Launch Date                                  │
   │  - Expense Ratio                                │
   │  - Min Investment                               │
   │  - Benchmark                                    │
   │                                                  │
   └─────────────────────────────────────────────────┘
   ```

4. **Data Preview & Validation**:
   - Show first 10 rows before upload
   - Validate required fields
   - Check for duplicates
   - Show warnings for missing data

#### 2.2 CSV Templates

**Template 1: Scheme Master Data**
```csv
Scheme Code,AMC Name,Fund Manager,Launch Date,Expense Ratio,Min Investment,Min SIP,Benchmark,Risk Grade,Exit Load
103176,SBI Mutual Fund,R. Srinivasan,2006-02-15,1.45,5000,500,Nifty 50 TRI,Moderately High,1% if redeemed within 1 year
```

**Template 2: Monthly AUM Data**
```csv
Scheme Code,Date,AUM (Cr),Total Folios,SIP Accounts
103176,2025-09-30,32450,1250000,820000
```

**Template 3: Portfolio Holdings**
```csv
Scheme Code,Date,Stock Name,ISIN,Sector,Holding %,Quantity,Market Value (Cr)
103176,2025-09-30,Reliance Industries,INE002A01018,Energy,8.5,12500000,2756.25
```

---

### **Phase 3: Frontend Pages** (Week 2-3)

#### 3.1 Industry Overview Page
**Route**: `/financial-markets/mutual-funds`
**File**: `src/pages/financial/MutualFundsPage.tsx`

**Sections**:
1. **Hero Metrics** (4 cards)
   - Total Industry AUM
   - Total AMCs
   - Total Active Schemes
   - Average Returns (1Y)

2. **AUM Distribution** (Pie Chart)
   - By Category (Equity, Debt, Hybrid, etc.)

3. **Top 10 AMCs** (Horizontal Bar Chart)
   - Ranked by AUM
   - Market share %

4. **Category Performance** (Table + Charts)
   - Equity, Debt, Hybrid, Solution
   - Scheme count, AUM, Avg returns

5. **Monthly Trends** (Line Chart)
   - Industry AUM growth
   - Category-wise trends

#### 3.2 AMC Detail Page
**Route**: `/financial-markets/mutual-funds/amc/:amcCode`
**File**: `src/pages/financial/AMCDetailPage.tsx`

**Sections**:
1. **AMC Overview**
   - Name, Logo, Established Year
   - Parent Company, Website
   - SEBI Registration

2. **AUM Metrics** (4 cards)
   - Total AUM
   - Number of Schemes
   - Market Share
   - Industry Rank

3. **AUM Breakdown** (Stacked Bar)
   - By Category

4. **Key Personnel**
   - CEO, CIO (Equity), CIO (Debt)
   - Fund Managers

5. **Performance Summary**
   - Average returns across schemes
   - Best performing scheme

6. **All Schemes Table**
   - Filterable by category
   - Searchable
   - Sortable columns
   - Click to view scheme details

#### 3.3 Scheme Detail Page
**Route**: `/financial-markets/mutual-funds/scheme/:schemeCode`
**File**: `src/pages/financial/SchemeDetailPage.tsx`

**Sections**:
1. **Scheme Basics**
   - Name, Code, ISIN
   - Category, Launch Date
   - Benchmark, Risk Grade

2. **NAV & AUM** (4 cards)
   - Current NAV
   - Total AUM
   - Expense Ratio
   - Exit Load

3. **Performance Analysis**
   - Returns table (1M, 3M, 6M, 1Y, 3Y, 5Y)
   - vs Benchmark comparison
   - NAV growth chart (Line)

4. **Fund Manager**
   - Name, Experience
   - Managing since
   - Other schemes managed

5. **Portfolio Composition** (if available)
   - Asset allocation (Pie)
   - Top 10 holdings (Table)
   - Sector allocation (Bar)

6. **Risk Metrics**
   - Volatility, Beta, Sharpe Ratio
   - Max Drawdown

7. **Investment Suitability**
   - Ideal for (goals, risk profile)
   - Not suitable for

---

### **Phase 4: Data Processing & Calculations** (Week 3)

#### 4.1 Returns Calculator
**File**: `src/services/amfi/ReturnsCalculator.ts`

**Functions**:
```typescript
- calculateReturns(navHistory: NAV[], period: string): number
- calculateRollingReturns(navHistory: NAV[], window: number): number[]
- calculateCAGR(startNAV: number, endNAV: number, years: number): number
- calculateSIPReturns(navHistory: NAV[], monthlyInvestment: number): SIPResult
```

#### 4.2 Risk Metrics Calculator
**File**: `src/services/amfi/RiskCalculator.ts`

**Functions**:
```typescript
- calculateVolatility(returns: number[]): number
- calculateBeta(schemeReturns: number[], benchmarkReturns: number[]): number
- calculateSharpeRatio(returns: number[], riskFreeRate: number): number
- calculateMaxDrawdown(navHistory: NAV[]): number
```

#### 4.3 Scheduled Jobs (Supabase Edge Functions)

**Function 1: Daily NAV Sync**
**File**: `supabase/functions/sync-amfi-nav/index.ts`
**Schedule**: Daily at 6:30 PM IST
**Logic**:
1. Fetch NAVAll.txt from AMFI
2. Parse data
3. Upsert schemes and NAV history
4. Log sync status
5. Send notification if failed

**Function 2: Weekly Performance Calculation**
**File**: `supabase/functions/calculate-performance/index.ts`
**Schedule**: Weekly on Sunday at 8:00 AM
**Logic**:
1. Fetch all schemes with NAV history
2. Calculate returns (1M, 3M, 6M, 1Y, 3Y, 5Y)
3. Calculate risk metrics
4. Update scheme_performance table

---

## 📋 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DATA SOURCES                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. AMFI Daily NAV (Automated)                          │
│     ↓                                                    │
│     AMFIDataFetcher.fetchDailyNAV()                     │
│     ↓                                                    │
│     Parse & Categorize                                  │
│     ↓                                                    │
│     Supabase: mutual_fund_schemes, scheme_nav_history   │
│                                                          │
│  2. Manual Uploads (Admin)                              │
│     ↓                                                    │
│     Excel/CSV Upload                                    │
│     ↓                                                    │
│     Validate & Transform                                │
│     ↓                                                    │
│     Supabase: mutual_fund_amcs, scheme_portfolio        │
│                                                          │
│  3. Calculated Metrics (Scheduled)                      │
│     ↓                                                    │
│     ReturnsCalculator, RiskCalculator                   │
│     ↓                                                    │
│     Supabase: scheme_performance                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND PAGES                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Industry Overview → AMC Details → Scheme Details       │
│                                                          │
│  Hooks:                                                 │
│  - useIndustryMetrics()                                 │
│  - useAMCDetails(amcCode)                               │
│  - useSchemeDetails(schemeCode)                         │
│  - useSchemePerformance(schemeCode)                     │
│  - usePortfolioHoldings(schemeCode)                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Update Frequencies

| **Data Type** | **Source** | **Frequency** | **Method** |
|---------------|------------|---------------|------------|
| NAV | AMFI Daily | Daily 6:30 PM | Automated (Edge Function) |
| Schemes List | AMFI Daily | Daily 6:30 PM | Automated (Edge Function) |
| Performance | Calculated | Weekly Sunday | Automated (Edge Function) |
| AUM | Manual Upload | Monthly | Admin Upload |
| Holdings | Manual Upload | Monthly | Admin Upload |
| Fund Manager | Manual Upload | As needed | Admin Upload |

---

## 🎯 Success Metrics

1. **Data Coverage**:
   - ✅ 100% of schemes from AMFI (10,000+)
   - ✅ Daily NAV updates
   - ✅ Historical NAV (1+ year)

2. **Performance**:
   - ✅ Page load < 2 seconds
   - ✅ API response < 500ms
   - ✅ Batch processing < 5 minutes

3. **User Experience**:
   - ✅ 3-level drill-down (Industry → AMC → Scheme)
   - ✅ Interactive charts
   - ✅ Search & filter capabilities
   - ✅ Mobile responsive

---

## 📝 Implementation Checklist

### Phase 1: Foundation
- [ ] Create database tables via Supabase MCP
- [ ] Build AMFIDataFetcher service
- [ ] Build DataTransformer service
- [ ] Test NAV parsing with sample data
- [ ] Create initial seed data

### Phase 2: Admin Interface
- [ ] Create MutualFundAdmin component
- [ ] Build AMFI sync UI
- [ ] Build manual upload UI
- [ ] Create CSV templates
- [ ] Add data validation
- [ ] Add preview functionality
- [ ] Test with real AMFI data

### Phase 3: Frontend Pages
- [ ] Build Industry Overview page
- [ ] Build AMC Detail page
- [ ] Build Scheme Detail page
- [ ] Create custom hooks
- [ ] Add charts (Recharts)
- [ ] Add search & filters
- [ ] Mobile responsive design

### Phase 4: Automation
- [ ] Create sync-amfi-nav Edge Function
- [ ] Create calculate-performance Edge Function
- [ ] Set up cron schedules
- [ ] Add error notifications
- [ ] Create monitoring dashboard

---

## 🚀 Deployment Plan

**Week 1**: Foundation + Admin (Phase 1 & 2)
**Week 2**: Frontend Pages (Phase 3)
**Week 3**: Calculations + Automation (Phase 4)
**Week 4**: Testing, Polish, Documentation

---

## 📚 Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **Data Source**: AMFI India
- **Scheduling**: Supabase Cron
- **File Parsing**: XLSX, PapaParse
- **State Management**: React Query
- **Routing**: React Router

---

**Last Updated**: 02-Oct-2025
**Status**: Ready for Implementation
