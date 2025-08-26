import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface Indicator {
  slug: string;
  name: string;
  description: string | null;
  definition: string | null;
  category: string | null;
  unit: string | null;
  frequency: string | null;
}

interface GdpAdminProps {
  indicator: Indicator;
  onBack: () => void;
  onEditIndicator: () => void;
}

interface GdpValueRow {
  year: string;
  quarter: string;
  pfce_constant_price: number;
  pfce_current_price: number;
  gfce_constant_price: number;
  gfce_current_price: number;
  gfcf_constant_price: number;
  gfcf_current_price: number;
  changes_in_stocks_constant_price: number;
  changes_in_stocks_current_price: number;
  valuables_constant_price: number;
  valuables_current_price: number;
  exports_constant_price: number;
  exports_current_price: number;
  imports_constant_price: number;
  imports_current_price: number;
  discrepancies_constant_price: number;
  discrepancies_current_price: number;
  gdp_constant_price: number;
  gdp_current_price: number;
}

interface GdpGrowthRow {
  year: string;
  quarter: string;
  pfce_constant_price_growth: number;
  pfce_current_price_growth: number;
  gfce_constant_price_growth: number;
  gfce_current_price_growth: number;
  gfcf_constant_price_growth: number;
  gfcf_current_price_growth: number;
  changes_in_stocks_constant_price_growth: number;
  changes_in_stocks_current_price_growth: number;
  valuables_constant_price_growth: number;
  valuables_current_price_growth: number;
  exports_constant_price_growth: number;
  exports_current_price_growth: number;
  imports_constant_price_growth: number;
  imports_current_price_growth: number;
  discrepancies_constant_price_growth: number;
  discrepancies_current_price_growth: number;
  gdp_constant_price_growth: number;
  gdp_current_price_growth: number;
}

export const GdpAdmin: React.FC<GdpAdminProps> = ({
  indicator,
  onBack,
  onEditIndicator
}) => {
  const [valueData, setValueData] = useState<GdpValueRow[]>([]);
  const [growthData, setGrowthData] = useState<GdpGrowthRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    total: number;
    processed: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    fetchGdpData();
  }, []);

  const fetchGdpData = async () => {
    setLoading(true);
    try {
      const [valueResult, growthResult] = await Promise.all([
        (supabase as any).from('gdp_value').select('*').order('year', { ascending: false }).order('quarter', { ascending: false }).limit(20),
        (supabase as any).from('gdp_growth').select('*').order('year', { ascending: false }).order('quarter', { ascending: false }).limit(20)
      ]);

      if (valueResult.error) throw valueResult.error;
      if (growthResult.error) throw growthResult.error;

      setValueData((valueResult.data || []) as GdpValueRow[]);
      setGrowthData((growthResult.data || []) as GdpGrowthRow[]);
    } catch (error) {
      console.error('Error fetching GDP data:', error);
      toast.error('Failed to load GDP data');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = (type: 'value' | 'growth') => {
    const templateUrl = `/templates/gdp_${type}_template.csv`;
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = `gdp_${type}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${type} template downloaded successfully`);
  };

  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/,/g, '').trim();
      if (cleaned === '' || cleaned.toLowerCase() === 'na' || cleaned === '-') return 0;
      const num = Number(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const validateValueRow = (row: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!row['Year']) errors.push('Missing Year');
    if (!row['Quarter']) errors.push('Missing Quarter');
    
    const requiredFields = [
      'PFCE Constant Price', 'PFCE Current Price',
      'GFCE Constant Price', 'GFCE Current Price',
      'GFCF Constant Price', 'GFCF Current Price',
      'GDP Constant Price', 'GDP Current Price'
    ];
    
    requiredFields.forEach(field => {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        errors.push(`Missing value for ${field}`);
      }
    });
    
    return { isValid: errors.length === 0, errors };
  };

  const validateGrowthRow = (row: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!row['Year']) errors.push('Missing Year');
    if (!row['Quarter']) errors.push('Missing Quarter');
    
    const requiredFields = [
      'PFCE Constant Price Growth', 'PFCE Current Price Growth',
      'GFCE Constant Price Growth', 'GFCE Current Price Growth',
      'GFCF Constant Price Growth', 'GFCF Current Price Growth',
      'GDP Constant Price Growth', 'GDP Current Price Growth'
    ];
    
    requiredFields.forEach(field => {
      if (row[field] === undefined || row[field] === null || row[field] === '') {
        errors.push(`Missing value for ${field}`);
      }
    });
    
    return { isValid: errors.length === 0, errors };
  };

  const processExcelFile = async (file: File, type: 'value' | 'growth') => {
    setUploading(true);
    setUploadStatus({ total: 0, processed: 0, errors: [] });
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setUploadStatus(prev => ({ ...prev!, total: jsonData.length }));
      
      const validRows: any[] = [];
      const errors: string[] = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        const { isValid, errors: rowErrors } = type === 'value' ? validateValueRow(row) : validateGrowthRow(row);
        
        if (!isValid) {
          errors.push(`Row ${i + 2}: ${rowErrors.join(', ')}`);
          continue;
        }
        
        if (type === 'value') {
          const valueRow: GdpValueRow = {
            year: row['Year'],
            quarter: row['Quarter'],
            pfce_constant_price: parseNumber(row['PFCE Constant Price']),
            pfce_current_price: parseNumber(row['PFCE Current Price']),
            gfce_constant_price: parseNumber(row['GFCE Constant Price']),
            gfce_current_price: parseNumber(row['GFCE Current Price']),
            gfcf_constant_price: parseNumber(row['GFCF Constant Price']),
            gfcf_current_price: parseNumber(row['GFCF Current Price']),
            changes_in_stocks_constant_price: parseNumber(row['Changes in Stocks Constant Price']),
            changes_in_stocks_current_price: parseNumber(row['Changes in Stocks Current Price']),
            valuables_constant_price: parseNumber(row['Valuables Constant Price']),
            valuables_current_price: parseNumber(row['Valuables Current Price']),
            exports_constant_price: parseNumber(row['Exports Constant Price']),
            exports_current_price: parseNumber(row['Exports Current Price']),
            imports_constant_price: parseNumber(row['Imports Constant Price']),
            imports_current_price: parseNumber(row['Imports Current Price']),
            discrepancies_constant_price: parseNumber(row['Discrepancies Constant Price']),
            discrepancies_current_price: parseNumber(row['Discrepancies Current Price']),
            gdp_constant_price: parseNumber(row['GDP Constant Price']),
            gdp_current_price: parseNumber(row['GDP Current Price'])
          };
          validRows.push(valueRow);
        } else {
          const growthRow: GdpGrowthRow = {
            year: row['Year'],
            quarter: row['Quarter'],
            pfce_constant_price_growth: parseNumber(row['PFCE Constant Price Growth']),
            pfce_current_price_growth: parseNumber(row['PFCE Current Price Growth']),
            gfce_constant_price_growth: parseNumber(row['GFCE Constant Price Growth']),
            gfce_current_price_growth: parseNumber(row['GFCE Current Price Growth']),
            gfcf_constant_price_growth: parseNumber(row['GFCF Constant Price Growth']),
            gfcf_current_price_growth: parseNumber(row['GFCF Current Price Growth']),
            changes_in_stocks_constant_price_growth: parseNumber(row['Changes in Stocks Constant Price Growth']),
            changes_in_stocks_current_price_growth: parseNumber(row['Changes in Stocks Current Price Growth']),
            valuables_constant_price_growth: parseNumber(row['Valuables Constant Price Growth']),
            valuables_current_price_growth: parseNumber(row['Valuables Current Price Growth']),
            exports_constant_price_growth: parseNumber(row['Exports Constant Price Growth']),
            exports_current_price_growth: parseNumber(row['Exports Current Price Growth']),
            imports_constant_price_growth: parseNumber(row['Imports Constant Price Growth']),
            imports_current_price_growth: parseNumber(row['Imports Current Price Growth']),
            discrepancies_constant_price_growth: parseNumber(row['Discrepancies Constant Price Growth']),
            discrepancies_current_price_growth: parseNumber(row['Discrepancies Current Price Growth']),
            gdp_constant_price_growth: parseNumber(row['GDP Constant Price Growth']),
            gdp_current_price_growth: parseNumber(row['GDP Current Price Growth'])
          };
          validRows.push(growthRow);
        }
      }
      
      // Upload to Supabase
      if (validRows.length > 0) {
        const tableName = type === 'value' ? 'gdp_value' : 'gdp_growth';
        const { error } = await (supabase as any)
          .from(tableName)
          .upsert(validRows, { 
            onConflict: 'year,quarter',
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.error('Supabase upsert error:', error);
          throw error;
        }
        
        toast.success(`Successfully uploaded ${validRows.length} ${type} records`);
        await fetchGdpData();
      }
      
      setUploadStatus({
        total: jsonData.length,
        processed: validRows.length,
        errors
      });
      
    } catch (error) {
      const errObj = error as any;
      console.error('Error processing Excel file:', errObj);
      toast.error(`Failed to process Excel file: ${errObj?.message || errObj}`);
      setUploadStatus(prev => ({
        ...prev!,
        errors: [...(prev?.errors || []), `Processing error: ${errObj?.message || errObj}`]
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'value' | 'growth') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    processExcelFile(file, type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onEditIndicator}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Indicator
        </Button>
      </div>

      {/* Indicator Info */}
      <Card>
        <CardHeader>
          <CardTitle>{indicator.name}</CardTitle>
          <CardDescription>
            {indicator.slug} • Quarterly GDP data from Ministry of Statistics and Programme Implementation
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Upload Tabs */}
      <Tabs defaultValue="value" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="value">GDP Value Data</TabsTrigger>
          <TabsTrigger value="growth">GDP Growth Data</TabsTrigger>
        </TabsList>

        <TabsContent value="value" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                GDP Value Data Upload
              </CardTitle>
              <CardDescription>
                Upload Excel file with GDP value data in INR crores (absolute values)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate('value')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Value Template
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'value')}
                    disabled={uploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                GDP Growth Data Upload
              </CardTitle>
              <CardDescription>
                Upload Excel file with GDP growth data in percentages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate('growth')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Growth Template
                </Button>
                
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'growth')}
                    disabled={uploading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Status */}
      {uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              Processing Excel file...
            </div>
          </CardContent>
        </Card>
      )}
      
      {uploadStatus && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Processed {uploadStatus.processed} of {uploadStatus.total} rows
              </span>
            </div>
            
            {uploadStatus.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Issues found:</span>
                </div>
                <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
                  {uploadStatus.errors.slice(0, 10).map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                  {uploadStatus.errors.length > 10 && (
                    <div>... and {uploadStatus.errors.length - 10} more</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      <Tabs defaultValue="value-preview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="value-preview">Value Data Preview</TabsTrigger>
          <TabsTrigger value="growth-preview">Growth Data Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="value-preview">
          <Card>
            <CardHeader>
              <CardTitle>Recent Value Data ({valueData.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading data...</div>
              ) : valueData.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No value data available. Upload an Excel file to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Year</th>
                        <th className="text-left p-2">Quarter</th>
                        <th className="text-right p-2">GDP (Constant)</th>
                        <th className="text-right p-2">GDP (Current)</th>
                        <th className="text-right p-2">PFCE (Constant)</th>
                        <th className="text-right p-2">GFCE (Constant)</th>
                        <th className="text-right p-2">GFCF (Constant)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valueData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{row.year}</td>
                          <td className="p-2">{row.quarter}</td>
                          <td className="text-right p-2">
                            ₹{(row.gdp_constant_price / 10000000).toFixed(1)}L Cr
                          </td>
                          <td className="text-right p-2">
                            ₹{(row.gdp_current_price / 10000000).toFixed(1)}L Cr
                          </td>
                          <td className="text-right p-2">
                            ₹{(row.pfce_constant_price / 10000000).toFixed(1)}L Cr
                          </td>
                          <td className="text-right p-2">
                            ₹{(row.gfce_constant_price / 10000000).toFixed(1)}L Cr
                          </td>
                          <td className="text-right p-2">
                            ₹{(row.gfcf_constant_price / 10000000).toFixed(1)}L Cr
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth-preview">
          <Card>
            <CardHeader>
              <CardTitle>Recent Growth Data ({growthData.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading data...</div>
              ) : growthData.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No growth data available. Upload an Excel file to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Year</th>
                        <th className="text-left p-2">Quarter</th>
                        <th className="text-right p-2">GDP Growth (Constant)</th>
                        <th className="text-right p-2">GDP Growth (Current)</th>
                        <th className="text-right p-2">PFCE Growth (Constant)</th>
                        <th className="text-right p-2">GFCE Growth (Constant)</th>
                        <th className="text-right p-2">GFCF Growth (Constant)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {growthData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{row.year}</td>
                          <td className="p-2">{row.quarter}</td>
                          <td className="text-right p-2">
                            {row.gdp_constant_price_growth.toFixed(1)}%
                          </td>
                          <td className="text-right p-2">
                            {row.gdp_current_price_growth.toFixed(1)}%
                          </td>
                          <td className="text-right p-2">
                            {row.pfce_constant_price_growth.toFixed(1)}%
                          </td>
                          <td className="text-right p-2">
                            {row.gfce_constant_price_growth.toFixed(1)}%
                          </td>
                          <td className="text-right p-2">
                            {row.gfcf_constant_price_growth.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
