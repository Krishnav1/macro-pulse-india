"""
Trendlyne FII/DII Data Extractor
Extracts historical data using browser automation
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import pandas as pd
import time
from datetime import datetime
import json

def setup_driver(headless=False):
    """Setup Chrome driver"""
    chrome_options = Options()
    if headless:
        chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def get_financial_year(date_str):
    """Convert date to financial year"""
    date = pd.to_datetime(date_str)
    if date.month >= 4:
        return f"FY {date.year}-{str(date.year + 1)[-2:]}"
    else:
        return f"FY {date.year - 1}-{str(date.year)[-2:]}"

def extract_monthly_summary(driver):
    """Extract monthly summary data from Trendlyne"""
    url = 'https://trendlyne.com/macro-data/fii-dii/latest/cash-pastmonth/'
    print(f"Opening: {url}")
    driver.get(url)
    
    # Wait for page to load
    time.sleep(5)
    
    try:
        # Click on "Monthly" tab
        print("Clicking Monthly tab...")
        monthly_tab = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Monthly') or contains(@href, 'monthly')]"))
        )
        monthly_tab.click()
        time.sleep(3)
        
        # Wait for table to load
        print("Waiting for table...")
        table = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, 'table'))
        )
        
        # Extract table HTML
        table_html = table.get_attribute('outerHTML')
        
        # Parse with pandas
        dfs = pd.read_html(table_html)
        
        if dfs:
            df = dfs[0]
            print(f"\n✅ Extracted {len(df)} rows")
            print(f"Columns: {df.columns.tolist()}")
            print("\nPreview:")
            print(df.head())
            return df
        else:
            print("❌ No tables found")
            return None
            
    except TimeoutException:
        print("❌ Timeout waiting for elements")
        # Try to get any tables on the page
        try:
            tables = driver.find_elements(By.TAG_NAME, 'table')
            print(f"Found {len(tables)} tables on page")
            if tables:
                for idx, table in enumerate(tables):
                    print(f"\nTable {idx + 1}:")
                    try:
                        df = pd.read_html(table.get_attribute('outerHTML'))[0]
                        print(df.head())
                        if len(df) > 5:  # Likely the data table
                            return df
                    except:
                        pass
        except:
            pass
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def extract_summary_tab(driver):
    """Extract from Summary tab"""
    url = 'https://trendlyne.com/macro-data/fii-dii/month/snapshot-month/'
    print(f"\nOpening Summary page: {url}")
    driver.get(url)
    time.sleep(5)
    
    try:
        # Find all tables
        tables = driver.find_elements(By.TAG_NAME, 'table')
        print(f"Found {len(tables)} tables")
        
        all_data = []
        
        for idx, table in enumerate(tables):
            try:
                df = pd.read_html(table.get_attribute('outerHTML'))[0]
                print(f"\nTable {idx + 1}: {df.shape}")
                print(df.head())
                
                if len(df) > 5:  # Significant data
                    all_data.append(df)
            except Exception as e:
                print(f"Error parsing table {idx + 1}: {e}")
        
        return all_data if all_data else None
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def transform_to_monthly_format(df):
    """Transform extracted data to our monthly CSV format"""
    
    # Try to identify columns
    print("\nTransforming data...")
    print(f"Original columns: {df.columns.tolist()}")
    
    monthly_data = []
    
    # Column mapping (adjust based on actual Trendlyne format)
    column_map = {
        'DATE': 'Date',
        'Date': 'Date',
        'FII Equity': 'FII_Equity',
        'FII Debt': 'FII_Debt',
        'FII Derivatives': 'FII_Derivatives',
        'FII Total': 'FII_Total',
        'DII Equity': 'DII_Equity',
        'DII Debt': 'DII_Debt',
        'DII Derivatives': 'DII_Derivatives',
        'DII Total': 'DII_Total',
    }
    
    # Rename columns
    df_renamed = df.copy()
    for old_col, new_col in column_map.items():
        if old_col in df.columns:
            df_renamed.rename(columns={old_col: new_col}, inplace=True)
    
    # Ensure we have required columns
    required_cols = ['Date', 'FII_Equity', 'FII_Debt', 'FII_Derivatives', 'FII_Total',
                     'DII_Equity', 'DII_Debt', 'DII_Derivatives', 'DII_Total']
    
    # Fill missing columns with 0
    for col in required_cols:
        if col not in df_renamed.columns:
            df_renamed[col] = 0
    
    # Select only required columns
    result_df = df_renamed[required_cols].copy()
    
    # Clean data
    for col in result_df.columns:
        if col != 'Date':
            # Remove commas and convert to numeric
            result_df[col] = pd.to_numeric(result_df[col].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
    
    # Format date
    result_df['Date'] = pd.to_datetime(result_df['Date']).dt.strftime('%Y-%m-%d')
    
    return result_df

def save_to_csv(df, output_file):
    """Save DataFrame to CSV"""
    df.to_csv(output_file, index=False)
    print(f"\n✅ Data saved to: {output_file}")
    print(f"   Total records: {len(df)}")
    print(f"\nFirst few rows:")
    print(df.head())
    print(f"\nLast few rows:")
    print(df.tail())

def main():
    """Main execution"""
    print("="*70)
    print("TRENDLYNE FII/DII DATA EXTRACTOR")
    print("="*70)
    
    print("\n📋 Prerequisites:")
    print("1. Install: pip install selenium pandas lxml html5lib")
    print("2. Install ChromeDriver: https://chromedriver.chromium.org/")
    print("3. Add ChromeDriver to PATH")
    
    input("\nPress Enter to start extraction...")
    
    driver = None
    
    try:
        # Setup driver
        print("\n🚀 Starting browser...")
        driver = setup_driver(headless=False)  # Set True for headless mode
        
        # Extract monthly summary
        print("\n📊 Extracting Monthly Summary Data...")
        df_monthly = extract_monthly_summary(driver)
        
        if df_monthly is None:
            # Try alternative method
            print("\n🔄 Trying alternative extraction method...")
            tables = extract_summary_tab(driver)
            
            if tables:
                df_monthly = tables[0]  # Use first significant table
        
        if df_monthly is not None:
            # Transform to our format
            print("\n🔄 Transforming data...")
            transformed_df = transform_to_monthly_format(df_monthly)
            
            # Save to CSV
            output_file = '../public/templates/fii_dii_monthly_extracted.csv'
            save_to_csv(transformed_df, output_file)
            
            print("\n" + "="*70)
            print("✅ EXTRACTION COMPLETE!")
            print("="*70)
            print(f"\nNext steps:")
            print(f"1. Review the extracted data: {output_file}")
            print(f"2. Upload via Admin Panel: /admin → Financial Markets → FII/DII")
            print(f"3. Select 'Monthly Data' tab and upload the CSV")
            
        else:
            print("\n❌ Failed to extract data")
            print("\n💡 Manual Alternative:")
            print("1. Visit: https://trendlyne.com/macro-data/fii-dii/month/snapshot-month/")
            print("2. Click 'Monthly' tab")
            print("3. Select table data (Ctrl+A on table)")
            print("4. Copy (Ctrl+C)")
            print("5. Paste in Excel")
            print("6. Save as CSV")
            print("7. Use our transformation script")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("- Ensure ChromeDriver matches your Chrome version")
        print("- Try running without headless mode to see what's happening")
        print("- Check if Trendlyne website structure has changed")
        
    finally:
        if driver:
            print("\n🔒 Closing browser...")
            driver.quit()
    
    print("\n" + "="*70)

if __name__ == "__main__":
    main()
