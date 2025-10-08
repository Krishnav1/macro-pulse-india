# 📊 Trendlyne FII/DII Data Extraction Guide

## ✅ Confirmed: Trendlyne Data is Accessible

After investigation, Trendlyne displays FII/DII data in web tables but **does NOT provide direct CSV/Excel export**. However, we can extract the data using two methods:

---

## 🎯 Method 1: Browser Automation (Recommended)

### Prerequisites:
```bash
pip install selenium pandas lxml html5lib openpyxl
```

### Download ChromeDriver:
1. Check your Chrome version: `chrome://version/`
2. Download matching ChromeDriver: https://chromedriver.chromium.org/
3. Add to PATH or place in project folder

### Run Extraction Script:
```bash
cd scripts
python trendlyne_fii_dii_extractor.py
```

### What it does:
- Opens Trendlyne in Chrome browser
- Navigates to Monthly/Yearly tabs
- Extracts table data automatically
- Transforms to our CSV format
- Saves to `public/templates/fii_dii_monthly_extracted.csv`

---

## 🖱️ Method 2: Manual Copy-Paste (Fastest)

### Step-by-Step Instructions:

#### For Monthly Data:

1. **Open Trendlyne Monthly Page**:
   ```
   https://trendlyne.com/macro-data/fii-dii/month/snapshot-month/
   ```

2. **Navigate to Summary Tab**:
   - Click on "Summary" tab at the top
   - You'll see a table with columns: DATE, FII Equity, FII Debt, FII Derivatives, FII Total, DII Total, DII Derivatives, DII Debt, DII Equity

3. **Select Table Data**:
   - Click on the first cell of the table
   - Scroll to the last row
   - Hold Shift and click last cell
   - OR: Click on table and press `Ctrl + A` to select all

4. **Copy Data**:
   - Press `Ctrl + C` to copy

5. **Paste in Excel**:
   - Open Excel/Google Sheets
   - Press `Ctrl + V` to paste
   - Data should paste in proper columns

6. **Clean & Format**:
   - Ensure DATE column is in first position
   - Remove any header rows if duplicated
   - Check for any merged cells and unmerge

7. **Save as CSV**:
   - File → Save As → CSV (Comma delimited)
   - Name it: `trendlyne_monthly_data.csv`

8. **Transform to Our Format**:
   - Use the transformation script (see below)
   - OR manually rename columns to match our template

---

#### For Daily Data:

1. **Open Daily Page**:
   ```
   https://trendlyne.com/macro-data/fii-dii/latest/cash-pastmonth/
   ```

2. **Click "Cash Provisional" Tab**

3. **Copy Table Data** (same as above)

4. **For Each Date, Create 8 Rows**:
   - FII Cash Equity
   - FII Cash Debt
   - FII Derivatives Futures
   - FII Derivatives Options
   - DII Cash Equity
   - DII Cash Debt
   - DII Derivatives Futures
   - DII Derivatives Options

---

## 🔄 Data Transformation

### Using Python Script:

```python
import pandas as pd

# Read the copied data
df = pd.read_csv('trendlyne_monthly_data.csv')

# Column mapping
df.columns = ['Date', 'FII_Equity', 'FII_Debt', 'FII_Derivatives', 'FII_Total',
              'DII_Total', 'DII_Derivatives', 'DII_Debt', 'DII_Equity']

# Reorder columns to match our template
df = df[['Date', 'FII_Equity', 'FII_Debt', 'FII_Derivatives', 'FII_Total',
         'DII_Equity', 'DII_Debt', 'DII_Derivatives', 'DII_Total']]

# Clean numeric values (remove commas)
for col in df.columns:
    if col != 'Date':
        df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='coerce').fillna(0)

# Format date
df['Date'] = pd.to_datetime(df['Date']).dt.strftime('%Y-%m-%d')

# Save
df.to_csv('fii_dii_monthly_final.csv', index=False)
print("✅ Transformation complete!")
```

### Manual in Excel:

1. **Rename Columns** (if needed):
   - A: Date
   - B: FII_Equity
   - C: FII_Debt
   - D: FII_Derivatives
   - E: FII_Total
   - F: DII_Equity
   - G: DII_Debt
   - H: DII_Derivatives
   - I: DII_Total

2. **Format Date Column**:
   - Select Date column
   - Format → Date → YYYY-MM-DD

3. **Remove Commas from Numbers**:
   - Select all numeric columns
   - Find & Replace: Find "," Replace with "" (empty)

4. **Save as CSV**

---

## 📋 Trendlyne Data Structure

### Available Tabs:

1. **Summary**: Overall FII/DII totals
2. **Cash Provisional**: Daily cash market activity
3. **FII Cash**: FII equity and debt breakdown
4. **FII F&O**: FII futures and options
5. **MF Cash**: Mutual Fund (DII) cash activity
6. **MF F&O**: Mutual Fund derivatives

### Time Periods:

- **Past Month**: Last 30 days of data
- **Monthly**: Month-wise aggregated data
- **Yearly**: Year-wise aggregated data

---

## 🎯 Quick Extraction Workflow

### For Monthly Data (5 minutes):

```
1. Open: https://trendlyne.com/macro-data/fii-dii/month/snapshot-month/
2. Click "Summary" tab
3. Select table → Ctrl+C
4. Paste in Excel → Ctrl+V
5. Save as CSV
6. Upload to admin panel
```

### For Daily Data (10 minutes):

```
1. Open: https://trendlyne.com/macro-data/fii-dii/latest/cash-pastmonth/
2. Click "Cash Provisional" tab
3. Copy table data
4. Transform to daily format (8 rows per date)
5. Upload to admin panel
```

---

## 🔍 Data Validation

### Check These Before Upload:

✅ **Date Format**: YYYY-MM-DD (e.g., 2025-09-01)
✅ **Numeric Values**: No commas, decimal points OK
✅ **Column Order**: Matches our template exactly
✅ **No Empty Rows**: Remove any blank rows
✅ **Headers**: First row should be column names

### Sample Valid Row:
```
2025-09-01,-18928,2886,102864,86822,44582,-52813,-12782,-21013
```

---

## 📊 Expected Data Volume

### Monthly Data:
- **12 months**: ~12 rows
- **1 year**: ~12 rows
- **5 years**: ~60 rows

### Daily Data:
- **1 month**: ~20-22 trading days × 8 rows = ~160-176 rows
- **1 year**: ~250 trading days × 8 rows = ~2000 rows

---

## ⚠️ Important Notes

1. **Data Accuracy**: Trendlyne aggregates from NSE/BSE, generally accurate

2. **Update Frequency**: 
   - Daily data: Updated next day (T+1)
   - Monthly: Updated at month-end

3. **Historical Data**:
   - Trendlyne shows limited history on free tier
   - For extensive history, may need subscription

4. **Negative Values**: 
   - Negative = Outflow/Selling
   - Positive = Inflow/Buying

5. **Units**: All values in INR Crores

---

## 🚀 Upload to Dashboard

After extraction and transformation:

1. **Go to Admin Panel**:
   ```
   http://localhost:5173/admin
   ```

2. **Navigate**:
   - Financial Markets → FII/DII

3. **Select Tab**:
   - Monthly Data (for monthly CSV)
   - Daily Data (for daily CSV)
   - Derivatives Data (for F&O CSV)

4. **Upload**:
   - Click "Choose File"
   - Select your CSV
   - Click "Upload"
   - Wait for success message

5. **Verify**:
   - Go to FII/DII Activity page
   - Check if data displays correctly
   - Verify charts render properly

---

## 🛠️ Troubleshooting

### Issue: Table not copying properly
**Solution**: Try right-click → "Copy table" or use browser DevTools to inspect table structure

### Issue: Dates not formatting
**Solution**: In Excel, use formula: `=TEXT(A2,"YYYY-MM-DD")`

### Issue: Numbers have commas
**Solution**: Find & Replace all commas with nothing (empty string)

### Issue: Extra columns
**Solution**: Delete extra columns, keep only the 9 required columns

### Issue: Browser automation fails
**Solution**: Use manual copy-paste method instead

---

## 📚 Additional Resources

- **Trendlyne Help**: https://help.trendlyne.com/
- **FII/DII Explained**: https://trendlyne.com/blog/fii-dii-explained/
- **Our Templates**: `/public/templates/fii_dii_*.csv`

---

## ✅ Success Checklist

Before uploading, verify:

- [ ] CSV file has correct column names
- [ ] Dates are in YYYY-MM-DD format
- [ ] No commas in numeric values
- [ ] No empty rows
- [ ] File size is reasonable (< 5MB)
- [ ] Data looks correct in preview
- [ ] Totals match (FII_Total = FII_Equity + FII_Debt + FII_Derivatives)

---

## 🎯 Recommended Approach

**For Best Results**:

1. **Use Manual Copy-Paste** for monthly data (fastest, most reliable)
2. **Use Browser Automation** for bulk historical data
3. **Validate** data before upload
4. **Start with** last 12 months
5. **Expand** to historical data as needed

**Time Investment**:
- First time: 15-20 minutes (learning)
- Subsequent: 5-10 minutes (routine)

---

## 💡 Pro Tips

1. **Bookmark Trendlyne Pages**: Save frequently used URLs
2. **Create Excel Template**: Pre-formatted with our column names
3. **Batch Process**: Extract multiple months at once
4. **Verify Totals**: Always check FII_Total and DII_Total calculations
5. **Keep Backups**: Save raw Trendlyne data before transformation

---

**Ready to extract? Start with the manual method for quick results!** 🚀
