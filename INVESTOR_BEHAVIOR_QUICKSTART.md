# Investor Behavior Analysis - Quick Start Guide 🚀

## 📥 Step 1: Upload Your First Dataset

### Access Admin Panel
1. Navigate to: `http://localhost:5173/admin`
2. Scroll to **"Financial Markets"** section
3. Click on the **"Investor Behavior"** tab

### Download Template
1. Click the **"Download Template"** button
2. Open the CSV file in Excel or Google Sheets
3. Review the format:
   ```
   AMFI INDIA - INVESTOR BEHAVIOR DATA
   Quarter Ended: 30-Jun-2024
   
   Age Group,Asset Type,0-1 Month,1-3 Months,3-6 Months,6-12 Months,12-24 Months,> 24 Months
   ```

### Fill in Your Data
**Required Columns**:
- **Age Group**: Corporates, Banks/FIs, HNI, Retail, NRI
- **Asset Type**: EQUITY or NON-EQUITY
- **Holding Periods**: AUM values in Rs. Crore

**Example Row**:
```csv
Corporates,EQUITY,15670.78,36750.11,53324.52,74484.24,167869.47,262973.57
```

### Upload Process
1. Click **"Select File"** button
2. Choose your filled CSV/Excel file
3. Click **"Parse File"** to preview
4. Review the parsed data:
   - Check quarter date is correct
   - Verify total AUM matches expectations
   - Ensure all records are present
5. Click **"Upload to Database"**
6. Wait for success message ✅

---

## 📊 Step 2: View Analysis

### Navigate to Page
1. Go to: `http://localhost:5173/financial-markets`
2. Click on **"Investor Behavior"** card
3. Or directly visit: `http://localhost:5173/financial-markets/investor-behavior`

### Explore Visualizations

#### **Top Metrics** (6 Cards)
- **Avg Holding Period**: How long investors typically hold
- **Long-term Holdings**: % of AUM held >24 months (sticky)
- **Short-term Holdings**: % of AUM held 0-3 months (churn risk)
- **Churn Risk Level**: Low/Medium/High assessment
- **Equity Allocation**: % in equity vs non-equity
- **Total AUM**: Total assets under management

#### **Holding Period Distribution** (Stacked Bar)
- Shows each age group's AUM across holding periods
- **Green bars** = Long-term (sticky investors)
- **Red/Orange bars** = Short-term (potential churn)
- Hover for detailed breakdown

#### **Liquidity Preference Heatmap**
- Percentage allocation across holding periods
- **Dark green cells** = High concentration
- **Red cells** = Low allocation
- Identifies liquidity preferences by age group

#### **Risk Appetite Chart** (Grouped Bar)
- Equity vs Non-Equity by age group
- Shows risk tolerance across segments
- Compare investor risk profiles

#### **Holding Period Trend** (Stacked Area)
- Time series of holding patterns
- Track behavioral shifts over quarters
- Identify trends (increasing/decreasing stickiness)

#### **Age Group Composition** (Multi-line)
- Growth trajectory of each investor segment
- Identify fastest-growing segments
- Track retail participation trends

---

## 🎯 Step 3: Interpret the Data

### Understanding Churn Risk

**Low Risk (<15%)**:
- Majority of investors are long-term oriented
- Stable fund flows expected
- Low redemption pressure

**Medium Risk (15-25%)**:
- Moderate short-term holdings
- Monitor for changes
- Some redemption pressure possible

**High Risk (>25%)**:
- High short-term concentration
- Significant redemption risk
- Requires immediate attention

### Reading the Heatmap

**Right-heavy rows** (green on right):
- Long-term oriented investors
- High stickiness
- Stable segment

**Left-heavy rows** (green on left):
- Short-term oriented investors
- High churn risk
- Volatile segment

### Analyzing Risk Appetite

**High Equity Allocation (>50%)**:
- Aggressive investors
- Risk-seeking behavior
- Growth-focused

**Low Equity Allocation (<30%)**:
- Conservative investors
- Risk-averse behavior
- Stability-focused

---

## 💡 Step 4: Take Action

### For AMCs (Asset Management Companies)

**If High Churn Risk Detected**:
1. Launch retention campaigns for at-risk segments
2. Offer incentives for longer holding periods
3. Improve customer service for churning segments
4. Design products with lock-in features

**If Growing Retail Participation**:
1. Expand retail-focused products
2. Increase financial literacy initiatives
3. Simplify onboarding processes
4. Enhance digital platforms

### For Investors

**If Your Holding Period < Average**:
- Consider longer-term investment strategy
- Review frequent trading costs
- Align with financial goals

**If Your Risk Appetite Differs from Peers**:
- Ensure alignment with risk tolerance
- Consider diversification
- Consult financial advisor if needed

### For Analysts

**Monitor These Signals**:
1. **Sudden increase in short-term holdings** → Market uncertainty
2. **Declining retail participation** → Confidence issues
3. **Shift from equity to non-equity** → Risk-off sentiment
4. **Increasing average holding period** → Market maturity

---

## 📈 Step 5: Upload More Data

### Quarterly Updates
1. Obtain latest AMFI data (quarter-end)
2. Format according to template
3. Upload via admin panel
4. System automatically:
   - Replaces old data for same quarter
   - Calculates all metrics
   - Updates visualizations

### Historical Data
- Upload past quarters one by one
- Maintain consistent format
- Build time series for trend analysis

---

## 🔍 Troubleshooting

### Upload Errors

**"No data rows found"**:
- Check header row format
- Ensure "Quarter Ended" is present
- Verify column headers match template

**"Invalid asset type"**:
- Must be exactly "EQUITY" or "NON-EQUITY"
- Check for typos or extra spaces

**"Invalid numeric value"**:
- Remove currency symbols (₹, $)
- Use only numbers and decimals
- Commas are automatically removed

### Display Issues

**"No data available"**:
- Ensure data is uploaded successfully
- Check upload history in admin panel
- Verify database connection

**Charts not loading**:
- Refresh the page
- Clear browser cache
- Check browser console for errors

---

## 📊 Sample Data for Testing

Use this sample data to test the system:

```csv
AMFI INDIA - INVESTOR BEHAVIOR DATA (AGE GROUP + HOLDING PERIOD)
Quarter Ended: 30-Jun-2024
NOTE: All AUM values in Rs. Crore (as of quarter end date)

Age Group,Asset Type,0-1 Month,1-3 Months,3-6 Months,6-12 Months,12-24 Months,> 24 Months
Corporates,EQUITY,15670.78,36750.11,53324.52,74484.24,167869.47,262973.57
Corporates,NON-EQUITY,405990.71,264123.51,174730.85,233885.70,232770.38,758544.37
Banks/FIs,EQUITY,121.94,238.79,367.05,1976.48,892.91,55.95
Banks/FIs,NON-EQUITY,42359.01,40767.93,32523.07,2715.88,1195.28,2525.95
HNI,EQUITY,33496.67,64685.38,93537.74,197115.45,314857.55,789045.77
HNI,NON-EQUITY,50444.83,77480.43,72661.77,131237.36,178264.02,564030.07
Retail,EQUITY,34221.35,67968.78,106486.40,197247.62,299691.87,1101016.28
Retail,NON-EQUITY,7836.74,13329.19,16722.09,31096.00,39485.62,148862.83
NRI,EQUITY,83544.88,169697.49,253821.08,471111.82,783546.29,2153893.84
NRI,NON-EQUITY,506631.66,395970.98,296648.69,399286.79,451752.32,1474764.98
```

**Expected Results**:
- Total AUM: ₹74,40,670.82 Crores
- 10 records (5 age groups × 2 asset types)
- Average holding period: ~18-20 months
- Churn risk: Low to Medium

---

## 🎓 Best Practices

### Data Quality
1. **Verify totals** before upload
2. **Cross-check** with quarterly AUM data
3. **Maintain consistency** in naming (age groups, asset types)
4. **Document sources** for audit trail

### Analysis Workflow
1. **Upload data** → Review metrics
2. **Identify trends** → Compare with previous quarters
3. **Generate insights** → Document findings
4. **Take action** → Implement strategies
5. **Monitor results** → Track effectiveness

### Reporting
1. **Screenshot key charts** for presentations
2. **Export data** for detailed analysis
3. **Share insights** with stakeholders
4. **Track changes** quarter-over-quarter

---

## 📞 Need Help?

### Common Questions

**Q: How often should I upload data?**  
A: Quarterly, aligned with AMFI reporting schedule (end of Mar, Jun, Sep, Dec)

**Q: Can I edit uploaded data?**  
A: Yes, re-upload the same quarter to replace existing data

**Q: What if my data format is different?**  
A: Reformat to match the template exactly. The parser expects specific column headers.

**Q: How do I compare across quarters?**  
A: Upload multiple quarters. The trend charts automatically show comparisons.

**Q: Can I download the analysis?**  
A: Currently view-only. Export feature coming in future update.

---

## ✅ Quick Checklist

Before going live:
- [ ] Downloaded template
- [ ] Filled in quarter data
- [ ] Uploaded successfully
- [ ] Verified metrics are correct
- [ ] Explored all visualizations
- [ ] Read interpretations
- [ ] Understood key insights
- [ ] Identified action items

---

**Ready to start?** Head to `/admin` and upload your first dataset! 🚀

**Questions?** Check the full implementation guide: `INVESTOR_BEHAVIOR_IMPLEMENTATION.md`
