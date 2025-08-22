import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
  progress: number;
  seriesCount?: number;
  componentsCount?: number;
}

export const CPIDataUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: '',
    progress: 0
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus({ status: 'idle', message: '', progress: 0 });
    }
  };

  const validateSeriesData = (data: any[]): string[] => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      if (!row.Date) errors.push(`Row ${index + 1}: Date is required`);
      if (!row.Geography || !['rural', 'urban', 'combined'].includes(row.Geography)) {
        errors.push(`Row ${index + 1}: Geography must be rural, urban, or combined`);
      }
      if (!row.Index_Value || isNaN(parseFloat(row.Index_Value))) {
        errors.push(`Row ${index + 1}: Index_Value must be a valid number`);
      }
    });

    return errors;
  };

  const validateComponentsData = (data: any[]): string[] => {
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      if (!row.Date) errors.push(`Row ${index + 1}: Date is required`);
      if (!row.Geography || !['rural', 'urban', 'combined'].includes(row.Geography)) {
        errors.push(`Row ${index + 1}: Geography must be rural, urban, or combined`);
      }
      if (!row.Component_Code) errors.push(`Row ${index + 1}: Component_Code is required`);
      if (!row.Component_Name) errors.push(`Row ${index + 1}: Component_Name is required`);
      if (!row.Index_Value || isNaN(parseFloat(row.Index_Value))) {
        errors.push(`Row ${index + 1}: Index_Value must be a valid number`);
      }
    });

    return errors;
  };

  const processExcelFile = async (file: File) => {
    return new Promise<{ seriesData: any[], componentsData: any[] }>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Process CPI_Series sheet
          const seriesSheetName = workbook.SheetNames.find(name => 
            name.toLowerCase().includes('series') || name.toLowerCase().includes('cpi_series')
          ) || workbook.SheetNames[0];
          
          const seriesSheet = workbook.Sheets[seriesSheetName];
          const seriesData = XLSX.utils.sheet_to_json(seriesSheet);

          // Process CPI_Components sheet
          const componentsSheetName = workbook.SheetNames.find(name => 
            name.toLowerCase().includes('components') || name.toLowerCase().includes('cpi_components')
          );
          
          let componentsData: any[] = [];
          if (componentsSheetName) {
            const componentsSheet = workbook.Sheets[componentsSheetName];
            componentsData = XLSX.utils.sheet_to_json(componentsSheet);
          }

          resolve({ seriesData, componentsData });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadToSupabase = async (seriesData: any[], componentsData: any[]) => {
    let uploadedSeries = 0;
    let uploadedComponents = 0;

    // Upload series data in batches
    if (seriesData.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < seriesData.length; i += batchSize) {
        const batch = seriesData.slice(i, i + batchSize).map(row => ({
          date: new Date(row.Date).toISOString().split('T')[0],
          geography: row.Geography.toLowerCase(),
          index_value: parseFloat(row.Index_Value),
          inflation_yoy: row.Inflation_YoY ? parseFloat(row.Inflation_YoY) : null,
          inflation_mom: row.Inflation_MoM ? parseFloat(row.Inflation_MoM) : null,
          base_year: row.Base_Year || '2012=100'
        }));

        const { error } = await supabase
          .from('cpi_series')
          .upsert(batch, { onConflict: 'date,geography' });

        if (error) throw error;
        
        uploadedSeries += batch.length;
        setUploadStatus(prev => ({
          ...prev,
          progress: (uploadedSeries / (seriesData.length + componentsData.length)) * 100
        }));
      }
    }

    // Upload components data in batches
    if (componentsData.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < componentsData.length; i += batchSize) {
        const batch = componentsData.slice(i, i + batchSize).map(row => ({
          date: new Date(row.Date).toISOString().split('T')[0],
          geography: row.Geography.toLowerCase(),
          component_code: row.Component_Code,
          component_name: row.Component_Name,
          index_value: parseFloat(row.Index_Value),
          weight: row.Weight ? parseFloat(row.Weight) : null,
          inflation_yoy: row.Inflation_YoY ? parseFloat(row.Inflation_YoY) : null,
          contribution_to_inflation: row.Contribution_To_Inflation ? parseFloat(row.Contribution_To_Inflation) : null
        }));

        const { error } = await supabase
          .from('cpi_components')
          .upsert(batch, { onConflict: 'date,geography,component_code' });

        if (error) throw error;
        
        uploadedComponents += batch.length;
        setUploadStatus(prev => ({
          ...prev,
          progress: ((uploadedSeries + uploadedComponents) / (seriesData.length + componentsData.length)) * 100
        }));
      }
    }

    return { uploadedSeries, uploadedComponents };
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus({ status: 'uploading', message: 'Processing Excel file...', progress: 0 });

    try {
      // Process Excel file
      const { seriesData, componentsData } = await processExcelFile(file);

      // Validate data
      const seriesErrors = validateSeriesData(seriesData);
      const componentsErrors = validateComponentsData(componentsData);
      
      if (seriesErrors.length > 0 || componentsErrors.length > 0) {
        const allErrors = [...seriesErrors, ...componentsErrors];
        setUploadStatus({
          status: 'error',
          message: `Validation errors: ${allErrors.slice(0, 5).join(', ')}${allErrors.length > 5 ? '...' : ''}`,
          progress: 0
        });
        return;
      }

      setUploadStatus({ status: 'uploading', message: 'Uploading to database...', progress: 10 });

      // Upload to Supabase
      const { uploadedSeries, uploadedComponents } = await uploadToSupabase(seriesData, componentsData);

      setUploadStatus({
        status: 'success',
        message: 'Upload completed successfully!',
        progress: 100,
        seriesCount: uploadedSeries,
        componentsCount: uploadedComponents
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        status: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        progress: 0
      });
    }
  };

  const downloadTemplate = () => {
    // Create template data
    const seriesTemplate = [
      {
        Date: '2025-01-01',
        Geography: 'combined',
        Index_Value: 196.0,
        Inflation_YoY: 1.55,
        Inflation_MoM: 0.12,
        Base_Year: '2012=100'
      }
    ];

    const componentsTemplate = [
      {
        Date: '2025-01-01',
        Geography: 'combined',
        Component_Code: 'A.1',
        Component_Name: 'General Index',
        Index_Value: 196.0,
        Weight: 100.0,
        Inflation_YoY: 1.55,
        Contribution_To_Inflation: 1.55
      }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const seriesWs = XLSX.utils.json_to_sheet(seriesTemplate);
    const componentsWs = XLSX.utils.json_to_sheet(componentsTemplate);
    
    XLSX.utils.book_append_sheet(wb, seriesWs, 'CPI_Series');
    XLSX.utils.book_append_sheet(wb, componentsWs, 'CPI_Components');
    
    // Download file
    XLSX.writeFile(wb, 'CPI_Data_Template.xlsx');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          CPI Data Upload
        </CardTitle>
        <CardDescription>
          Upload CPI series and components data from Excel files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Download Template</div>
            <div className="text-sm text-muted-foreground">
              Get the Excel template with proper column structure
            </div>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <Label htmlFor="excel-file">Select Excel File</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            disabled={uploadStatus.status === 'uploading'}
          />
          
          {file && (
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span className="text-sm">{file.name}</span>
              <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button 
          onClick={handleUpload}
          disabled={!file || uploadStatus.status === 'uploading'}
          className="w-full"
        >
          {uploadStatus.status === 'uploading' ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload CPI Data
            </>
          )}
        </Button>

        {/* Progress */}
        {uploadStatus.status === 'uploading' && (
          <div className="space-y-2">
            <Progress value={uploadStatus.progress} />
            <div className="text-sm text-muted-foreground text-center">
              {uploadStatus.message}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {uploadStatus.status === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {uploadStatus.message}
              {uploadStatus.seriesCount && (
                <div className="mt-2 space-y-1">
                  <div>• Series records: {uploadStatus.seriesCount}</div>
                  <div>• Component records: {uploadStatus.componentsCount}</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus.status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadStatus.message}</AlertDescription>
          </Alert>
        )}

        {/* Format Guide */}
        <div className="space-y-4 pt-4 border-t">
          <div className="font-medium">Excel Format Requirements:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-primary mb-2">Sheet 1: CPI_Series</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Date (YYYY-MM-DD)</li>
                <li>• Geography (rural/urban/combined)</li>
                <li>• Index_Value (number)</li>
                <li>• Inflation_YoY (optional %)</li>
                <li>• Inflation_MoM (optional %)</li>
                <li>• Base_Year (optional, default: 2012=100)</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-primary mb-2">Sheet 2: CPI_Components</div>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Date (YYYY-MM-DD)</li>
                <li>• Geography (rural/urban/combined)</li>
                <li>• Component_Code (e.g., A.1)</li>
                <li>• Component_Name (e.g., General Index)</li>
                <li>• Index_Value (number)</li>
                <li>• Weight (optional %)</li>
                <li>• Inflation_YoY (optional %)</li>
                <li>• Contribution_To_Inflation (optional %)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
