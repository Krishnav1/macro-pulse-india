import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface CoreCPIRow {
  month: string;
  ruralIndex: number;
  ruralInflation: number;
  urbanIndex: number;
  urbanInflation: number;
  combinedIndex: number;
  combinedInflation: number;
}

export const CoreCPIUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<CoreCPIRow[]>([]);
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
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      // Skip header row and map columns for Core CPI
      const mappedData: CoreCPIRow[] = jsonData.slice(1).map((row) => ({
        month: row[0] || '',
        ruralIndex: parseFloat(row[1]) || 0,
        ruralInflation: parseFloat(row[2]) || 0,
        urbanIndex: parseFloat(row[3]) || 0,
        urbanInflation: parseFloat(row[4]) || 0,
        combinedIndex: parseFloat(row[5]) || 0,
        combinedInflation: parseFloat(row[6]) || 0,
      }));

      setData(mappedData);
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      setUploadStatus('error');
    }
  };

  const parseMonthToDate = (monthStr: string): string => {
    const [monthAbbr, year] = monthStr.split('-');
    const monthMap: { [key: string]: string } = {
      'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
      'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
      'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };
    return `${year}-${monthMap[monthAbbr]}-01`;
  };

  const uploadToSupabase = async () => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const seriesRows: any[] = [];

      data.forEach((row, index) => {
        const date = parseMonthToDate(row.month);

        // Process each geography for Core CPI
        ['rural', 'urban', 'combined'].forEach(geography => {
          const indexKey = `${geography}Index` as keyof CoreCPIRow;
          const inflationKey = `${geography}Inflation` as keyof CoreCPIRow;
          
          const indexValue = row[indexKey] as number;
          const inflationValue = row[inflationKey] as number;

          seriesRows.push({
            date,
            geography,
            series_code: 'core',
            index_value: indexValue,
            inflation_mom: inflationValue,
            base_year: '2012=100'
          });
        });

        setUploadProgress(((index + 1) / data.length) * 100);
      });

      // Upload Core CPI series data
      const { error } = await supabase
        .from('cpi_series' as any)
        .upsert(seriesRows, { 
          onConflict: 'date,geography,series_code',
          ignoreDuplicates: false 
        });

      if (error) {
        throw new Error(`Core CPI upload error: ${error.message}`);
      }

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
      ['Month', 'Rural Index', 'Rural Inflation (%)', 'Urban Index', 'Urban Inflation (%)', 'Combined Index', 'Combined Inflation (%)'],
      ['JUL-2025', 195.2, 1.8, 192.8, 2.3, 194.1, 2.0],
      ['JUN-2025', 194.5, 1.5, 191.9, 2.1, 193.3, 1.8],
      ['MAY-2025', 193.8, 1.2, 191.2, 1.9, 192.6, 1.5]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Core_CPI_Template');
    XLSX.writeFile(wb, 'Core_CPI_Upload_Template.xlsx');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Core CPI Data Upload
        </CardTitle>
        <CardDescription>
          Upload Core CPI data separately (excluding food & fuel components)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <div className="flex-1">
            <Label htmlFor="core-file-upload">Select Core CPI Excel File</Label>
            <Input
              id="core-file-upload"
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
              Core CPI file loaded: {file.name} ({data.length} rows)
            </AlertDescription>
          </Alert>
        )}

        {data.length > 0 && (
          <div className="space-y-4">
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Month</th>
                    <th className="p-2 text-left">Rural Index</th>
                    <th className="p-2 text-left">Urban Index</th>
                    <th className="p-2 text-left">Combined Index</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{row.month}</td>
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
                  Uploading Core CPI data... {uploadProgress}%
                </p>
              </div>
            )}

            <Button 
              onClick={uploadToSupabase} 
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Core CPI Data
            </Button>

            {uploadStatus === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Core CPI data uploaded successfully!
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Core CPI upload failed. Please check the console for details.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
