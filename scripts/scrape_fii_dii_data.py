"""
FII/DII Data Scraper from Trendlyne
Extracts historical FII/DII data and converts to our CSV format
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import json
import time

# Base URLs for different data types
URLS = {
    'cash_provisional': 'https://trendlyne.com/macro-data/fii-dii/latest/cash-pastmonth/',
    'fii_cash': 'https://trendlyne.com/macro-data/fii-dii/latest/fii-cash/',
    'fii_fo': 'https://trendlyne.com/macro-data/fii-dii/latest/fii-fo/',
    'mf_cash': 'https://trendlyne.com/macro-data/fii-dii/latest/mf-cash/',
    'mf_fo': 'https://trendlyne.com/macro-data/fii-dii/latest/mf-fo/',
}

def get_financial_year(date_str):
    """Convert date to financial year (Apr-Mar)"""
    date = pd.to_datetime(date_str)
    if date.month >= 4:
        return f"FY {date.year}-{str(date.year + 1)[-2:]}"
    else:
        return f"FY {date.year - 1}-{str(date.year)[-2:]}"

def scrape_trendlyne_data(url, data_type):
    """Scrape data from Trendlyne"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try to find data tables or JSON data embedded in the page
        # Trendlyne often embeds data in script tags
        scripts = soup.find_all('script')
        
        for script in scripts:
            if script.string and 'data' in script.string:
                # Try to extract JSON data
                try:
                    # Look for patterns like var data = {...}
                    if 'var data' in script.string or 'const data' in script.string:
                        print(f"Found potential data in script tag for {data_type}")
                        # You would parse the JavaScript data here
                        pass
                except:
                    pass
        
        # Also try to find HTML tables
        tables = soup.find_all('table')
        if tables:
            print(f"Found {len(tables)} tables for {data_type}")
            for idx, table in enumerate(tables):
                print(f"\nTable {idx + 1}:")
                # Try to parse table
                try:
                    df = pd.read_html(str(table))[0]
                    print(df.head())
                except:
                    pass
        
        return soup
        
    except Exception as e:
        print(f"Error scraping {data_type}: {e}")
        return None

def create_monthly_csv():
    """Create monthly summary CSV"""
    # Sample data structure based on the images you shared
    monthly_data = []
    
    # You would populate this from scraped data
    # For now, showing the structure
    sample_row = {
        'Date': '2025-09-01',  # First day of month
        'FII_Equity': -18928,
        'FII_Debt': 2886,
        'FII_Derivatives': 102864,
        'FII_Total': 86822,
        'DII_Equity': 44582,
        'DII_Debt': -52813,
        'DII_Derivatives': -12782,
        'DII_Total': -21013
    }
    
    monthly_data.append(sample_row)
    
    df = pd.DataFrame(monthly_data)
    df.to_csv('../public/templates/fii_dii_monthly_data.csv', index=False)
    print("Created monthly CSV")

def create_daily_csv():
    """Create daily detailed CSV"""
    daily_data = []
    
    # Sample structure for one day
    date = '2025-09-18'
    
    # FII Cash Equity
    daily_data.append({
        'Date': date,
        'Investor_Type': 'FII',
        'Segment': 'Cash',
        'Asset_Class': 'Equity',
        'Gross_Purchase': 308483.7,
        'Gross_Sales': 327411.6,
        'Net_Purchase_Sales': -18927.9
    })
    
    # FII Cash Debt
    daily_data.append({
        'Date': date,
        'Investor_Type': 'FII',
        'Segment': 'Cash',
        'Asset_Class': 'Debt',
        'Gross_Purchase': 2886.2,
        'Gross_Sales': 0,
        'Net_Purchase_Sales': 2886.2
    })
    
    # Add more rows for Derivatives, DII, etc.
    
    df = pd.DataFrame(daily_data)
    df.to_csv('../public/templates/fii_dii_daily_data.csv', index=False)
    print("Created daily CSV")

def create_derivatives_csv():
    """Create derivatives detailed CSV"""
    derivatives_data = []
    
    date = '2025-09-18'
    
    # FII Futures Indices
    derivatives_data.append({
        'Date': date,
        'Investor_Type': 'FII',
        'Instrument': 'Futures',
        'Market_Type': 'Indices',
        'Gross_Purchase': 82861.3,
        'Gross_Sales': 84450.7,
        'Net_Purchase_Sales': -1589.4
    })
    
    # Add more rows
    
    df = pd.DataFrame(derivatives_data)
    df.to_csv('../public/templates/fii_dii_derivatives_data.csv', index=False)
    print("Created derivatives CSV")

def main():
    """Main function to scrape and process data"""
    print("Starting FII/DII data scraper...")
    print("\nNote: Trendlyne may require authentication or have anti-scraping measures.")
    print("You may need to:")
    print("1. Use Selenium for JavaScript-rendered content")
    print("2. Handle authentication if required")
    print("3. Add delays between requests")
    print("4. Use browser automation tools\n")
    
    # Try scraping each URL
    for data_type, url in URLS.items():
        print(f"\nScraping {data_type}...")
        soup = scrape_trendlyne_data(url, data_type)
        time.sleep(2)  # Be respectful with delays
    
    # Create sample CSVs with the structure
    print("\n\nCreating sample CSV files with correct structure...")
    # create_monthly_csv()
    # create_daily_csv()
    # create_derivatives_csv()
    
    print("\n" + "="*60)
    print("ALTERNATIVE APPROACH - Manual Data Entry:")
    print("="*60)
    print("""
Since Trendlyne may have anti-scraping measures, here's what you can do:

1. MANUAL DOWNLOAD (Recommended):
   - Visit: https://trendlyne.com/macro-data/fii-dii/latest/cash-pastmonth/
   - Click on "Monthly" or "Yearly" tabs
   - Look for export/download options
   - Copy data from tables manually if needed

2. USE THEIR API (If available):
   - Check if Trendlyne offers a data API
   - Some platforms provide API access for subscribers

3. BROWSER AUTOMATION:
   - Use Selenium to automate browser interactions
   - Can handle JavaScript-rendered content
   - Can export data programmatically

4. NSE OFFICIAL DATA:
   - Visit: https://www.nseindia.com/reports-indices-historical-fii-dii
   - Download official FII/DII reports
   - More reliable source

5. SEBI WEBSITE:
   - Visit: https://www.sebi.gov.in/statistics/1392035/fii-statistics
   - Official regulatory data
   - Most authoritative source

RECOMMENDED DATA SOURCES (in order):
1. NSE India - Official FII/DII reports
2. BSE India - Official data
3. SEBI - Regulatory filings
4. Trendlyne - Aggregated data (manual download)
    """)

if __name__ == "__main__":
    main()
