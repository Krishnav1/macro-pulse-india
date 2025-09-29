import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DataType,
  UploadStatus,
  GdpValueRow,
  GdpGrowthRow,
  GdpAnnualValueRow,
  GdpAnnualGrowthRow
} from './GdpAdminTypes';
import {
  validateValueRow,
  validateGrowthRow,
  validateAnnualValueRow,
  validateAnnualGrowthRow,
  findColumnValue,
  parseNumber
} from './GdpValidation';

export const processExcelFile = async (
  file: File,
  type: DataType,
  setUploading: (uploading: boolean) => void,
  setUploadStatus: (status: UploadStatus | null | ((prev: UploadStatus | null) => UploadStatus | null)) => void,
  fetchGdpData: () => void
) => {
  setUploading(true);
  setUploadStatus({ total: 0, processed: 0, errors: [] });
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // Debug: Log available columns
    if (jsonData.length > 0) {
      const availableColumns = Object.keys(jsonData[0] as any);
      console.log('Available columns in Excel file:', availableColumns);
    }
    
    setUploadStatus(prev => ({ ...prev!, total: jsonData.length }));
    
    const validRows: any[] = [];
    const errors: string[] = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      let validation;
      
      switch (type) {
        case 'value':
          validation = validateValueRow(row);
          break;
        case 'growth':
          validation = validateGrowthRow(row);
          break;
        case 'annual-value':
          validation = validateAnnualValueRow(row);
          break;
        case 'annual-growth':
          validation = validateAnnualGrowthRow(row);
          break;
        default:
          validation = { isValid: false, errors: ['Invalid type'] };
      }
      
      const { isValid, errors: rowErrors } = validation;
      
      if (!isValid) {
        errors.push(`Row ${i + 2}: ${rowErrors.join(', ')}`);
        // Add available columns info for first error
        if (errors.length === 1) {
          const availableColumns = Object.keys(row);
          errors.push(`Available columns: ${availableColumns.join(', ')}`);
        }
        continue;
      }
      
      switch (type) {
        case 'value':
          const valueRow: GdpValueRow = {
            year: findColumnValue(row, ['Year', 'year', 'YEAR', 'Financial Year', 'FY']),
            quarter: findColumnValue(row, ['Quarter', 'quarter', 'QUARTER', 'Q', 'Qtr']),
            pfce_constant_price: parseNumber(findColumnValue(row, ['PFCE', 'pfce', 'Private Final Consumption Expenditure'])),
            pfce_current_price: 0, // Quarterly data doesn't have current price
            gfce_constant_price: parseNumber(findColumnValue(row, ['GFCE', 'gfce', 'Government Final Consumption Expenditure'])),
            gfce_current_price: 0,
            gfcf_constant_price: parseNumber(findColumnValue(row, ['GFCF', 'gfcf', 'Gross Fixed Capital Formation'])),
            gfcf_current_price: 0,
            changes_in_stocks_constant_price: parseNumber(findColumnValue(row, ['Changes in Stocks', 'changes_in_stocks', 'Changes_in_Stocks'])),
            changes_in_stocks_current_price: 0,
            valuables_constant_price: parseNumber(findColumnValue(row, ['Valuables', 'valuables'])),
            valuables_current_price: 0,
            exports_constant_price: parseNumber(findColumnValue(row, ['Exports', 'exports'])),
            exports_current_price: 0,
            imports_constant_price: parseNumber(findColumnValue(row, ['Imports', 'imports'])),
            imports_current_price: 0,
            discrepancies_constant_price: parseNumber(findColumnValue(row, ['Discrepancies', 'discrepancies'])),
            discrepancies_current_price: 0,
            gdp_constant_price: parseNumber(findColumnValue(row, ['GDP', 'gdp', 'Gross Domestic Product'])),
            gdp_current_price: 0
          };
          validRows.push(valueRow);
          break;
          
        case 'growth':
          const growthRow: GdpGrowthRow = {
            year: findColumnValue(row, ['Year', 'year', 'YEAR', 'Financial Year', 'FY']),
            quarter: findColumnValue(row, ['Quarter', 'quarter', 'QUARTER', 'Q', 'Qtr']),
            pfce_constant_price_growth: parseNumber(findColumnValue(row, ['PFCE (% growth)', 'PFCE (%growth)', 'PFCE_growth', 'pfce_growth'])),
            pfce_current_price_growth: 0,
            gfce_constant_price_growth: parseNumber(findColumnValue(row, ['GFCE (% growth)', 'GFCE (%growth)', 'GFCE_growth', 'gfce_growth'])),
            gfce_current_price_growth: 0,
            gfcf_constant_price_growth: parseNumber(findColumnValue(row, ['GFCF (% growth)', 'GFCF (%growth)', 'GFCF_growth', 'gfcf_growth'])),
            gfcf_current_price_growth: 0,
            changes_in_stocks_constant_price_growth: parseNumber(findColumnValue(row, ['Changes in Stocks (% growth)', 'Changes in Stocks (%growth)', 'changes_in_stocks_growth'])),
            changes_in_stocks_current_price_growth: 0,
            valuables_constant_price_growth: parseNumber(findColumnValue(row, ['Valuables (% growth)', 'Valuables (%growth)', 'valuables_growth'])),
            valuables_current_price_growth: 0,
            exports_constant_price_growth: parseNumber(findColumnValue(row, ['Exports (% growth)', 'Exports (%growth)', 'exports_growth'])),
            exports_current_price_growth: 0,
            imports_constant_price_growth: parseNumber(findColumnValue(row, ['Imports (% growth)', 'Imports (%growth)', 'imports_growth'])),
            imports_current_price_growth: 0,
            discrepancies_constant_price_growth: parseNumber(findColumnValue(row, ['Discrepancies (% growth)', 'Discrepancies (%growth)', 'discrepancies_growth'])),
            discrepancies_current_price_growth: 0,
            gdp_constant_price_growth: parseNumber(findColumnValue(row, ['GDP (% growth)', 'GDP (%growth)', 'GDP_growth', 'gdp_growth'])),
            gdp_current_price_growth: 0
          };
          validRows.push(growthRow);
          break;
          
        case 'annual-value':
          const annualValueRow: GdpAnnualValueRow = {
            year: findColumnValue(row, ['Year', 'year', 'YEAR', 'Financial Year', 'FY']),
            pfce_constant_price: parseNumber(findColumnValue(row, ['PFCE Constant Price', 'PFCE_Constant_Price', 'pfce_constant_price'])),
            pfce_current_price: parseNumber(findColumnValue(row, ['PFCE Current Price', 'PFCE_Current_Price', 'pfce_current_price'])),
            gfce_constant_price: parseNumber(findColumnValue(row, ['GFCE Constant Price', 'GFCE_Constant_Price', 'gfce_constant_price'])),
            gfce_current_price: parseNumber(findColumnValue(row, ['GFCE Current Price', 'GFCE_Current_Price', 'gfce_current_price'])),
            gfcf_constant_price: parseNumber(findColumnValue(row, ['GFCF Constant Price', 'GFCF_Constant_Price', 'gfcf_constant_price'])),
            gfcf_current_price: parseNumber(findColumnValue(row, ['GFCF Current Price', 'GFCF_Current_Price', 'gfcf_current_price'])),
            changes_in_stocks_constant_price: parseNumber(findColumnValue(row, ['Changes in Stocks Constant Price', 'Changes_in_Stocks_Constant_Price', 'changes_in_stocks_constant_price'])),
            changes_in_stocks_current_price: parseNumber(findColumnValue(row, ['Changes in Stocks Current Price', 'Changes_in_Stocks_Current_Price', 'changes_in_stocks_current_price'])),
            valuables_constant_price: parseNumber(findColumnValue(row, ['Valuables Constant Price', 'Valuables_Constant_Price', 'valuables_constant_price'])),
            valuables_current_price: parseNumber(findColumnValue(row, ['Valuables Current Price', 'Valuables_Current_Price', 'valuables_current_price'])),
            exports_constant_price: parseNumber(findColumnValue(row, ['Exports Constant Price', 'Exports_Constant_Price', 'exports_constant_price'])),
            exports_current_price: parseNumber(findColumnValue(row, ['Exports Current Price', 'Exports_Current_Price', 'exports_current_price'])),
            imports_constant_price: parseNumber(findColumnValue(row, ['Imports Constant Price', 'Imports_Constant_Price', 'imports_constant_price'])),
            imports_current_price: parseNumber(findColumnValue(row, ['Imports Current Price', 'Imports_Current_Price', 'imports_current_price'])),
            discrepancies_constant_price: parseNumber(findColumnValue(row, ['Discrepancies Constant Price', 'Discrepancies_Constant_Price', 'discrepancies_constant_price'])),
            discrepancies_current_price: parseNumber(findColumnValue(row, ['Discrepancies Current Price', 'Discrepancies_Current_Price', 'discrepancies_current_price'])),
            gdp_constant_price: parseNumber(findColumnValue(row, ['GDP Constant Price', 'GDP_Constant_Price', 'gdp_constant_price'])),
            gdp_current_price: parseNumber(findColumnValue(row, ['GDP Current Price', 'GDP_Current_Price', 'gdp_current_price']))
          };
          validRows.push(annualValueRow);
          break;
          
        case 'annual-growth':
          const annualGrowthRow: GdpAnnualGrowthRow = {
            year: findColumnValue(row, ['Year', 'year', 'YEAR', 'Financial Year', 'FY']),
            pfce_constant_price_growth: parseNumber(findColumnValue(row, ['PFCE Constant Price Growth', 'PFCE_Constant_Price_Growth', 'pfce_constant_price_growth'])),
            pfce_current_price_growth: parseNumber(findColumnValue(row, ['PFCE Current Price Growth', 'PFCE_Current_Price_Growth', 'pfce_current_price_growth'])),
            gfce_constant_price_growth: parseNumber(findColumnValue(row, ['GFCE Constant Price Growth', 'GFCE_Constant_Price_Growth', 'gfce_constant_price_growth'])),
            gfce_current_price_growth: parseNumber(findColumnValue(row, ['GFCE Current Price Growth', 'GFCE_Current_Price_Growth', 'gfce_current_price_growth'])),
            gfcf_constant_price_growth: parseNumber(findColumnValue(row, ['GFCF Constant Price Growth', 'GFCF_Constant_Price_Growth', 'gfcf_constant_price_growth'])),
            gfcf_current_price_growth: parseNumber(findColumnValue(row, ['GFCF Current Price Growth', 'GFCF_Current_Price_Growth', 'gfcf_current_price_growth'])),
            changes_in_stocks_constant_price_growth: parseNumber(findColumnValue(row, ['Changes in Stocks Constant Price Growth', 'Changes_in_Stocks_Constant_Price_Growth', 'changes_in_stocks_constant_price_growth'])),
            changes_in_stocks_current_price_growth: parseNumber(findColumnValue(row, ['Changes in Stocks Current Price Growth', 'Changes_in_Stocks_Current_Price_Growth', 'changes_in_stocks_current_price_growth'])),
            valuables_constant_price_growth: parseNumber(findColumnValue(row, ['Valuables Constant Price Growth', 'Valuables_Constant_Price_Growth', 'valuables_constant_price_growth'])),
            valuables_current_price_growth: parseNumber(findColumnValue(row, ['Valuables Current Price Growth', 'Valuables_Current_Price_Growth', 'valuables_current_price_growth'])),
            exports_constant_price_growth: parseNumber(findColumnValue(row, ['Exports Constant Price Growth', 'Exports_Constant_Price_Growth', 'exports_constant_price_growth'])),
            exports_current_price_growth: parseNumber(findColumnValue(row, ['Exports Current Price Growth', 'Exports_Current_Price_Growth', 'exports_current_price_growth'])),
            imports_constant_price_growth: parseNumber(findColumnValue(row, ['Imports Constant Price Growth', 'Imports_Constant_Price_Growth', 'imports_constant_price_growth'])),
            imports_current_price_growth: parseNumber(findColumnValue(row, ['Imports Current Price Growth', 'Imports_Current_Price_Growth', 'imports_current_price_growth'])),
            discrepancies_constant_price_growth: parseNumber(findColumnValue(row, ['Discrepancies Constant Price Growth', 'Discrepancies_Constant_Price_Growth', 'discrepancies_constant_price_growth'])),
            discrepancies_current_price_growth: parseNumber(findColumnValue(row, ['Discrepancies Current Price Growth', 'Discrepancies_Current_Price_Growth', 'discrepancies_current_price_growth'])),
            gdp_constant_price_growth: parseNumber(findColumnValue(row, ['GDP Constant Price Growth', 'GDP_Constant_Price_Growth', 'gdp_constant_price_growth'])),
            gdp_current_price_growth: parseNumber(findColumnValue(row, ['GDP Current Price Growth', 'GDP_Current_Price_Growth', 'gdp_current_price_growth']))
          };
          validRows.push(annualGrowthRow);
          break;
      }
      
      setUploadStatus(prev => ({ ...prev!, processed: i + 1 }));
    }
    
    // Upload to Supabase
    if (validRows.length > 0) {
      let tableName: string;
      let conflictColumns: string;
      
      switch (type) {
        case 'value':
          tableName = 'gdp_value';
          conflictColumns = 'year,quarter';
          break;
        case 'growth':
          tableName = 'gdp_growth';
          conflictColumns = 'year,quarter';
          break;
        case 'annual-value':
          tableName = 'gdp_annual';
          conflictColumns = 'year';
          break;
        case 'annual-growth':
          tableName = 'gdp_annual_growth';
          conflictColumns = 'year';
          break;
        default:
          throw new Error('Invalid type');
      }
      
      const { error } = await (supabase as any)
        .from(tableName)
        .upsert(validRows, { 
          onConflict: conflictColumns,
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Supabase upsert error:', error);
        throw error;
      }
      
      toast.success(`Successfully uploaded ${validRows.length} ${type} records`);
      await fetchGdpData();
    }
    
    if (errors.length > 0) {
      setUploadStatus(prev => ({ ...prev!, errors }));
      toast.error(`Upload completed with ${errors.length} errors`);
    } else {
      setUploadStatus(null);
    }
    
  } catch (error: any) {
    console.error('Error processing Excel file:', error);
    const errObj = error?.message ? error : { message: String(error) };
    toast.error(`Failed to process Excel file: ${errObj?.message || errObj}`);
    setUploadStatus(prev => ({
      ...prev!,
      errors: [...(prev?.errors || []), `Processing error: ${errObj?.message || errObj}`]
    }));
  } finally {
    setUploading(false);
  }
};
