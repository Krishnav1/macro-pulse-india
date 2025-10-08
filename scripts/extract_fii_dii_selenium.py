"""
FII/DII Data Extractor using Selenium
Automates browser to extract data from Trendlyne
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pandas as pd
import time
from datetime import datetime

def setup_driver():
    """Setup Chrome driver with options"""
    chrome_options = Options()
    # chrome_options.add_argument('--headless')  # Uncomment for headless mode
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def get_financial_year(date_str):
    """Convert date to financial year"""
    date = pd.to_datetime(date_str)
    if date.month >= 4:
        return f"FY {date.year}-{str(date.year + 1)[-2:]}"
    else:
        return f"FY {date.year - 1}-{str(date.year)[-2:]}"

def extract_cash_provisional_data(driver):
    """Extract Cash Provisional data"""
    url = 'https://trendlyne.com/macro-data/fii-dii/latest/cash-pastmonth/'
    driver.get(url)
    
    # Wait for page to load
    time.sleep(3)
    
    try:
        # Click on "Monthly" tab
        monthly_tab = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Monthly')]"))
        )
        monthly_tab.click()
        time.sleep(2)
        
        # Find the data table
        table = driver.find_element(By.TAG_NAME, 'table')
        
        # Extract table data
        rows = table.find_elements(By.TAG_NAME, 'tr')
        
        data = []
        headers = []
        
        for idx, row in enumerate(rows):
            cells = row.find_elements(By.TAG_NAME, 'td')
            if not cells:  # Header row
                cells = row.find_elements(By.TAG_NAME, 'th')
                headers = [cell.text.strip() for cell in cells]
            else:
                row_data = [cell.text.strip() for cell in cells]
                data.append(row_data)
        
        # Create DataFrame
        if headers and data:
            df = pd.DataFrame(data, columns=headers)
            print("Extracted Cash Provisional Data:")
            print(df.head())
            return df
        
    except Exception as e:
        print(f"Error extracting cash provisional data: {e}")
        return None

def extract_fii_cash_data(driver):
    """Extract FII Cash data"""
    url = 'https://trendlyne.com/macro-data/fii-dii/latest/fii-cash/'
    driver.get(url)
    time.sleep(3)
    
    try:
        # Similar extraction logic
        table = driver.find_element(By.TAG_NAME, 'table')
        # Extract and process...
        pass
    except Exception as e:
        print(f"Error extracting FII cash data: {e}")
        return None

def convert_to_monthly_format(df):
    """Convert extracted data to monthly CSV format"""
    # Transform data to match our template
    monthly_data = []
    
    for _, row in df.iterrows():
        monthly_row = {
            'Date': row.get('Date', ''),
            'FII_Equity': row.get('FII Equity', 0),
            'FII_Debt': row.get('FII Debt', 0),
            'FII_Derivatives': row.get('FII Derivatives', 0),
            'FII_Total': row.get('FII Total', 0),
            'DII_Equity': row.get('DII Equity', 0),
            'DII_Debt': row.get('DII Debt', 0),
            'DII_Derivatives': row.get('DII Derivatives', 0),
            'DII_Total': row.get('DII Total', 0)
        }
        monthly_data.append(monthly_row)
    
    return pd.DataFrame(monthly_data)

def main():
    """Main execution function"""
    print("="*60)
    print("FII/DII Data Extractor - Selenium Method")
    print("="*60)
    
    print("\nPrerequisites:")
    print("1. Install: pip install selenium pandas")
    print("2. Download ChromeDriver: https://chromedriver.chromium.org/")
    print("3. Add ChromeDriver to PATH\n")
    
    try:
        driver = setup_driver()
        print("Browser started successfully\n")
        
        # Extract different data types
        print("Extracting Cash Provisional data...")
        cash_df = extract_cash_provisional_data(driver)
        
        if cash_df is not None:
            # Convert to our format
            monthly_df = convert_to_monthly_format(cash_df)
            
            # Save to CSV
            output_file = '../public/templates/fii_dii_monthly_extracted.csv'
            monthly_df.to_csv(output_file, index=False)
            print(f"\nData saved to: {output_file}")
        
        # You can add more extraction functions here
        # extract_fii_cash_data(driver)
        # extract_derivatives_data(driver)
        
        driver.quit()
        print("\nExtraction complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        print("\nTroubleshooting:")
        print("- Ensure ChromeDriver is installed and in PATH")
        print("- Check if Trendlyne website structure has changed")
        print("- Try running without headless mode to see what's happening")

if __name__ == "__main__":
    main()
