# FII/DII Historical Data Extraction Guide

## 📊 Data Sources (Recommended Order)

### 1. **NSE India (Most Reliable)** ⭐
- **URL**: https://www.nseindia.com/reports-indices-historical-fii-dii
- **Data Available**: Daily FII/DII activity, historical archives
- **Format**: Excel/CSV downloads
- **Frequency**: Daily updates
- **Advantages**: Official source, accurate, free

### 2. **BSE India**
- **URL**: https://www.bseindia.com/markets/FIIDIIData.aspx
- **Data Available**: FII/DII investment data
- **Format**: Excel downloads
- **Advantages**: Official exchange data

### 3. **SEBI (Regulatory Authority)**
- **URL**: https://www.sebi.gov.in/statistics/1392035/fii-statistics
- **Data Available**: Monthly FII statistics
- **Format**: PDF/Excel reports
- **Advantages**: Most authoritative, regulatory filings

### 4. **Trendlyne (Aggregated)**
- **URL**: https://trendlyne.com/macro-data/fii-dii/latest/cash-pastmonth/
- **Data Available**: Daily, Monthly, Yearly views
- **Format**: Web tables (requires scraping or manual copy)
- **Advantages**: Good visualization, easy to understand

---

## 🔧 Extraction Methods

### Method 1: Manual Download from NSE (Recommended)

1. **Visit NSE FII/DII Reports**:
   ```
   https://www.nseindia.com/reports-indices-historical-fii-dii
   ```

2. **Download Historical Data**:
   - Select date range
   - Download Excel/CSV file
   - Contains: Date, FII Buy, FII Sell, FII Net, DII Buy, DII Sell, DII Net

3. **Transform to Our Format**:
   ```python
   # Use the transformation script provided
   python scripts/transform_nse_data.py
   ```

### Method 2: Trendlyne Manual Copy

1. **Visit Trendlyne**:
   ```
   https://trendlyne.com/macro-data/fii-dii/latest/cash-pastmonth/
   ```

2. **Navigate Tabs**:
   - Click "Monthly" for monthly data
   - Click "Yearly" for yearly data
   - Use "Summary", "Cash Provisional", "FII Cash", etc. tabs

3. **Copy Data**:
   - Select table data
   - Copy to Excel
   - Save as CSV
   - Use transformation script

### Method 3: Selenium Automation

**Prerequisites**:
```bash
pip install selenium pandas openpyxl
```

**Run Script**:
```bash
python scripts/extract_fii_dii_selenium.py
```

**Note**: May require ChromeDriver installation

### Method 4: API Integration (If Available)

Some data providers offer APIs:
- Check Trendlyne for API access
- NSE may have unofficial APIs
- Third-party financial data APIs (paid)

---

## 📋 Data Mapping Guide

### From Trendlyne to Our Monthly Template

**Trendlyne Columns** → **Our Template Columns**:

| Trendlyne | Our Template |
|-----------|--------------|
| DATE | Date |
| FII Equity | FII_Equity |
| FII Debt | FII_Debt |
| FII Derivatives | FII_Derivatives |
| FII Total | FII_Total |
| DII Total | DII_Total |
| DII Derivatives | DII_Derivatives |
| DII Debt | DII_Debt |
| DII Equity | DII_Equity |

### From NSE to Our Daily Template

**NSE Format** → **Our Daily Template**:

For each date, create 8 rows (FII + DII × Cash + Derivatives × Equity + Debt):

```csv
Date,Investor_Type,Segment,Asset_Class,Gross_Purchase,Gross_Sales,Net_Purchase_Sales
2025-09-18,FII,Cash,Equity,308483.7,327411.6,-18927.9
2025-09-18,FII,Cash,Debt,2886.2,0,2886.2
2025-09-18,FII,Derivatives,Futures,82861.3,84450.7,-1589.4
2025-09-18,FII,Derivatives,Options,107216.3,0,107216.3
2025-09-18,DII,Cash,Equity,219673.4,175091.2,44582.2
2025-09-18,DII,Cash,Debt,0,52812.7,-52812.7
2025-09-18,DII,Derivatives,Futures,18878.4,16683.9,2194.5
2025-09-18,DII,Derivatives,Options,2903.1,0,2903.1
```

---

## 🔄 Data Transformation Script

Create a Python script to transform downloaded data:

```python
import pandas as pd
from datetime import datetime

def transform_nse_to_monthly(input_file):
    """Transform NSE data to monthly format"""
    df = pd.read_excel(input_file)
    
    # Group by month
    df['Date'] = pd.to_datetime(df['Date'])
    df['Month'] = df['Date'].dt.to_period('M')
    
    monthly = df.groupby('Month').agg({
        'FII_Equity_Net': 'sum',
        'FII_Debt_Net': 'sum',
        'FII_Derivatives_Net': 'sum',
        'DII_Equity_Net': 'sum',
        'DII_Debt_Net': 'sum',
        'DII_Derivatives_Net': 'sum'
    }).reset_index()
    
    # Calculate totals
    monthly['FII_Total'] = monthly[['FII_Equity_Net', 'FII_Debt_Net', 'FII_Derivatives_Net']].sum(axis=1)
    monthly['DII_Total'] = monthly[['DII_Equity_Net', 'DII_Debt_Net', 'DII_Derivatives_Net']].sum(axis=1)
    
    # Format date
    monthly['Date'] = monthly['Month'].dt.to_timestamp()
    
    # Rename columns
    monthly.columns = ['Month', 'FII_Equity', 'FII_Debt', 'FII_Derivatives', 
                       'DII_Equity', 'DII_Debt', 'DII_Derivatives', 
                       'FII_Total', 'DII_Total', 'Date']
    
    # Save
    monthly[['Date', 'FII_Equity', 'FII_Debt', 'FII_Derivatives', 'FII_Total',
             'DII_Equity', 'DII_Debt', 'DII_Derivatives', 'DII_Total']].to_csv(
        'fii_dii_monthly_data.csv', index=False
    )
    
    print("Monthly data saved!")

# Usage
transform_nse_to_monthly('nse_fii_dii_download.xlsx')
```

---

## 📝 Step-by-Step Process

### For Monthly Data:

1. **Download from NSE**:
   - Go to NSE FII/DII page
   - Select last 12 months
   - Download Excel

2. **Transform Data**:
   ```bash
   python scripts/transform_nse_data.py --input nse_download.xlsx --output monthly
   ```

3. **Upload to Admin Panel**:
   - Go to `/admin` → Financial Markets → FII/DII
   - Click "Monthly Data" tab
   - Upload transformed CSV

### For Daily Data:

1. **Download Daily Reports**:
   - NSE provides daily reports
   - Download for required date range

2. **Transform to Daily Format**:
   ```bash
   python scripts/transform_nse_data.py --input nse_daily.xlsx --output daily
   ```

3. **Upload**:
   - Admin panel → FII/DII → Daily Data tab
   - Upload CSV

### For Derivatives Data:

1. **Extract from F&O Reports**:
   - NSE F&O section
   - Download participant-wise data

2. **Transform**:
   ```bash
   python scripts/transform_nse_data.py --input nse_fo.xlsx --output derivatives
   ```

3. **Upload**:
   - Admin panel → FII/DII → Derivatives Data tab

---

## ⚠️ Important Notes

1. **Data Consistency**:
   - Ensure dates are in YYYY-MM-DD format
   - Values in INR Crores
   - Negative values indicate outflows

2. **Financial Year**:
   - FY starts April 1st
   - Auto-calculated in upload components

3. **Data Validation**:
   - Check totals match (FII_Total = FII_Equity + FII_Debt + FII_Derivatives)
   - Verify Net = Gross_Purchase - Gross_Sales

4. **Update Frequency**:
   - NSE updates daily (T+1)
   - Monthly aggregation at month-end
   - Historical data available for years

---

## 🛠️ Troubleshooting

### Issue: Trendlyne blocks scraping
**Solution**: Use manual download or NSE official source

### Issue: Date format mismatch
**Solution**: Use pandas to standardize: `pd.to_datetime(date).strftime('%Y-%m-%d')`

### Issue: Missing derivatives data
**Solution**: Check NSE F&O section separately

### Issue: Data doesn't match
**Solution**: Verify source (NSE vs BSE may have slight differences)

---

## 📚 Additional Resources

- **NSE Circulars**: https://www.nseindia.com/regulations/circulars
- **SEBI Guidelines**: https://www.sebi.gov.in/legal/circulars.html
- **FII/DII Definitions**: https://www.nseindia.com/education/content/fii-dii

---

## 🎯 Quick Start (Recommended)

**Easiest Method**:

1. Visit: https://www.nseindia.com/reports-indices-historical-fii-dii
2. Download Excel for last 6 months
3. Open in Excel, copy data
4. Paste into our monthly template
5. Upload via admin panel

**Time Required**: 5-10 minutes
**Data Quality**: Official, accurate
**Cost**: Free
