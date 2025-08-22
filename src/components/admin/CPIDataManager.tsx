import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ExcelRow {
  month: string;
  commodityDescription: string;
  provisionalFinal: string;
  ruralIndex: number;
  ruralInflation: number;
  urbanIndex: number;
  urbanInflation: number;
  combinedIndex: number;
  combinedInflation: number;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const CPIDataManager = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ExcelRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with expected column mapping
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Skip header row and map columns
      const mappedData: ExcelRow[] = jsonData.slice(1).map((row, index) => ({
        month: row[0] || '',
        commodityDescription: row[1] || '',
        provisionalFinal: row[2] || '',
        ruralIndex: parseFloat(row[3]) || 0,
        ruralInflation: parseFloat(row[4]) || 0,
        urbanIndex: parseFloat(row[5]) || 0,
        urbanInflation: parseFloat(row[6]) || 0,
        combinedIndex: parseFloat(row[7]) || 0,
        combinedInflation: parseFloat(row[8]) || 0,
      }));

      setData(mappedData);
      validateData(mappedData);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setUploadStatus('error');
    }
  };

  const validateData = (data: ExcelRow[]) => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      // Validate month format (should be like "JUL-2025")
      if (!row.month || !/^[A-Z]{3}-\d{4}$/.test(row.month)) {
        errors.push({
          row: index + 1,
          field: 'month',
          message: 'Month should be in format MMM-YYYY (e.g., JUL-2025)'
        });
      }

      // Validate commodity description
      if (!row.commodityDescription) {
        errors.push({
          row: index + 1,
          field: 'commodityDescription',
          message: 'Commodity description is required'
        });
      }

      // Validate numeric values
      const numericFields = ['ruralIndex', 'ruralInflation', 'urbanIndex', 'urbanInflation', 'combinedIndex', 'combinedInflation'];
      numericFields.forEach(field => {
        if (isNaN(row[field as keyof ExcelRow] as number)) {
          errors.push({
            row: index + 1,
            field,
            message: `${field} must be a valid number`
          });
        }
      });
    });

    setValidationErrors(errors);
  };

  const parseMonthToDate = (monthStr: string): string => {
    // Convert "JUL-2025" to "2025-07-01"
    const [monthAbbr, year] = monthStr.split('-');
    const monthMap: { [key: string]: string } = {
      'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
      'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
      'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };
    return `${year}-${monthMap[monthAbbr]}-01`;
  };

  const categorizeComponent = (description: string) => {
    if (description.includes('A) General Index')) {
      return { type: 'series', code: 'headline' };
    }
    if (description.includes('B) Consumer Food Price Index')) {
      return { type: 'series', code: 'cfpi' };
    }
    if (description.match(/^A\.\d+/)) {
      const match = description.match(/^(A\.\d+(?:\.\d+)?)/);
      return { 
        type: 'component', 
        code: match ? match[1] : description.substring(0, 10),
        name: description
      };
    }
    return null;
  };

  const uploadToSupabase = async () => {
    if (validationErrors.length > 0) {
      alert('Please fix validation errors before uploading');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const seriesRows: any[] = [];
      const componentRows: any[] = [];

      data.forEach((row, index) => {
        const date = parseMonthToDate(row.month);
        const category = categorizeComponent(row.commodityDescription);

        if (!category) return;

        // Process each geography
        ['rural', 'urban', 'combined'].forEach(geography => {
          const indexKey = `${geography}Index` as keyof ExcelRow;
          const inflationKey = `${geography}Inflation` as keyof ExcelRow;
          
          const indexValue = row[indexKey] as number;
          const inflationValue = row[inflationKey] as number;

          if (category.type === 'series') {
            seriesRows.push({
              date,
              geography,
              series_code: category.code,
              index_value: indexValue,
              inflation_mom: inflationValue,
              base_year: '2012=100'
            });
          } else if (category.type === 'component') {
            componentRows.push({
              date,
              geography,
              component_code: category.code,
              component_name: category.name,
              index_value: indexValue,
              inflation_yoy: inflationValue
            });
          }
        });

        setUploadProgress(((index + 1) / data.length) * 50);
      });

      // Upload series data
      if (seriesRows.length > 0) {
        const { error: seriesError } = await supabase
          .from('cpi_series' as any)
          .upsert(seriesRows, { 
            onConflict: 'date,geography,series_code',
            ignoreDuplicates: false 
          });

        if (seriesError) {
          throw new Error(`Series upload error: ${seriesError.message}`);
        }
      }

      setUploadProgress(75);

      // Upload components data
      if (componentRows.length > 0) {
        const { error: componentsError } = await supabase
          .from('cpi_components' as any)
          .upsert(componentRows, { 
            onConflict: 'date,geography,component_code',
            ignoreDuplicates: false 
          });

        if (componentsError) {
          throw new Error(`Components upload error: ${componentsError.message}`);
        }
      }

      setUploadProgress(100);
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Month', 'Commodity Description', 'Provisional/Final', 'Rural Index', 'Rural Inflation (%)', 'Urban Index', 'Urban Inflation (%)', 'Combined Index', 'Combined Inflation (%)'],
      ['JUL-2025', 'A) General Index', 'Provisional', 197.6, 1.18, 194.2, 2.05, 196, 1.5],
      ['JUL-2025', 'A.1) Food and beverages', 'Provisional', 198.4, -1, 207, -0.52, 201.6, -0.84],
      ['JUL-2025', 'A.1.1) Cereals and products', 'Provisional', 197, 2.93, 197.3, 3.19, 197.1, 3.03]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CPI_Template');
    XLSX.writeFile(wb, 'CPI_Upload_Template.xlsx');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            CPI Data Upload
          </CardTitle>
          <CardDescription>
            Upload Excel file with CPI data for all components and geographies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <div className="flex-1">
              <Label htmlFor="file-upload">Select Excel File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>
          </div>

          {file && (
            <Alert>
              <FileSpreadsheet className="h-4 w-4" />
              <AlertDescription>
                File loaded: {file.name} ({data.length} rows)
              </AlertDescription>
            </Alert>
          )}

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validationErrors.length} validation errors found. Please fix them before uploading.
              </AlertDescription>
            </Alert>
          )}

          {data.length > 0 && (
            <div className="space-y-4">
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Month</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">Rural Index</th>
                      <th className="p-2 text-left">Urban Index</th>
                      <th className="p-2 text-left">Combined Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{row.month}</td>
                        <td className="p-2 truncate max-w-xs">{row.commodityDescription}</td>
                        <td className="p-2">{row.ruralIndex}</td>
                        <td className="p-2">{row.urbanIndex}</td>
                        <td className="p-2">{row.combinedIndex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-muted-foreground">
                    Uploading data... {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={uploadToSupabase} 
                  disabled={uploading || validationErrors.length > 0}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload to Database
                </Button>
              </div>

              {uploadStatus === 'success' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Data uploaded successfully!
                  </AlertDescription>
                </Alert>
              )}

              {uploadStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Upload failed. Please check the console for details.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
