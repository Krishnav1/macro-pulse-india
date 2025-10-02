// =====================================================
// QUARTERLY AUM UPLOAD COMPONENT
// Admin interface for uploading quarterly AUM data
// =====================================================

import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { QuarterlyAUMParser } from '@/services/quarterly-aum/ExcelParser';
import { QuarterlyAUMTransformer } from '@/services/quarterly-aum/DataTransformer';
import { ParsedAUMFile } from '@/services/quarterly-aum/types';
import { supabase } from '@/integrations/supabase/client';

export function QuarterlyAUMUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedAUMFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an Excel (.xlsx, .xls) or CSV file',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    setParsedData(null);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleParse = async () => {
    if (!file) return;

    setUploadStatus('parsing');
    setErrorMessage('');

    try {
      const parsed = await QuarterlyAUMParser.parseFile(file);
      
      // Validate parsed data
      if (!parsed.rows || parsed.rows.length === 0) {
        throw new Error(
          'No data rows found. Please ensure your file matches the template format:\n' +
          '1. Header with "Quarter Ended: DD-MMM-YYYY"\n' +
          '2. Column headers: "Category of the Scheme", "AUM (Rs. in Crore)", "AAUM (Rs. in Crore)"\n' +
          '3. Data rows with category names and numeric AUM/AAUM values'
        );
      }
      
      setParsedData(parsed);
      setUploadStatus('idle');
      
      toast({
        title: 'File Parsed Successfully',
        description: `Found ${parsed.rows.length} categories for ${parsed.quarter_label}`,
      });
    } catch (error: any) {
      console.error('Error parsing file:', error);
      setErrorMessage(error.message || 'Failed to parse file');
      setUploadStatus('error');
      
      toast({
        title: 'Parse Error',
        description: error.message || 'Failed to parse file. Please check the template format.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!parsedData) return;

    setIsProcessing(true);
    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      // Create upload record (using type assertion for new table)
      const { data: uploadRecord, error: uploadError } = await (supabase as any)
        .from('quarterly_aum_uploads')
        .insert({
          quarter_end_date: parsedData.quarter_end_date,
          quarter_label: parsedData.quarter_label,
          data_format_version: parsedData.data_format_version,
          file_name: file?.name,
          file_size_kb: file ? Math.round(file.size / 1024) : null,
          total_categories: parsedData.rows.length,
          total_aum_crore: parsedData.total_aum_crore,
          status: 'processing'
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      // Transform data using category mappings
      const transformer = new QuarterlyAUMTransformer();
      const records = await transformer.transform(parsedData);

      // Check if data already exists for this quarter
      const { data: existingData } = await (supabase as any)
        .from('quarterly_aum_data')
        .select('id')
        .eq('quarter_end_date', parsedData.quarter_end_date)
        .limit(1);

      if (existingData && existingData.length > 0) {
        // Delete existing data
        await (supabase as any)
          .from('quarterly_aum_data')
          .delete()
          .eq('quarter_end_date', parsedData.quarter_end_date);
      }

      // Insert new data in batches
      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error: insertError } = await (supabase as any)
          .from('quarterly_aum_data')
          .insert(batch);

        if (insertError) throw insertError;
      }

      // Calculate QoQ and YoY changes
      await transformer.calculateChanges(parsedData.quarter_end_date);

      // Update upload record
      await (supabase as any)
        .from('quarterly_aum_uploads')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', uploadRecord.id);

      setUploadStatus('success');
      
      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${records.length} categories for ${parsedData.quarter_label}`,
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setFile(null);
        setParsedData(null);
        setUploadStatus('idle');
      }, 3000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error.message || 'Failed to upload data');
      
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload data',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Quarterly AUM Data
        </CardTitle>
        <CardDescription>
          Upload Excel or CSV files containing quarterly AUM/AAUM data from 2011 onwards.
          <br />
          <strong>AUM</strong> = Assets Under Management <strong>AS OF quarter end date</strong> (current value on that date)
          <br />
          <strong>AAUM</strong> = Average AUM during the quarter (average of daily values)
          <br />
          The system will automatically detect the format (aggregated or detailed).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Need a template?</h4>
              <p className="text-sm text-blue-700 mb-3">
                Download the sample template to see the expected data format. The file should contain:
              </p>
              <ul className="text-xs text-blue-600 space-y-1 mb-3">
                <li>• Header with "Quarter Ended: DD-MMM-YYYY" (e.g., 30-Jun-2025)</li>
                <li>• Column headers: "Category of the Scheme", "AUM (Rs. in Crore)", "AAUM (Rs. in Crore)"</li>
                <li>• Category names (e.g., "Equity Scheme - Large Cap Fund")</li>
                <li>• <strong>AUM values</strong> = Total assets <strong>AS OF quarter end date</strong> (snapshot value)</li>
                <li>• <strong>AAUM values</strong> = Average assets during the quarter (optional)</li>
                <li>• Optional "TOTAL" row at the end</li>
              </ul>
            </div>
            <a
              href="/templates/quarterly_aum_template.csv"
              download="quarterly_aum_template.csv"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </a>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Select File</span>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-xs">({Math.round(file.size / 1024)} KB)</span>
              </div>
            )}
          </div>

          {file && !parsedData && uploadStatus === 'idle' && (
            <Button onClick={handleParse} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                'Parse File'
              )}
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {uploadStatus === 'parsing' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Parsing file and detecting format...
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'uploading' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Uploading data to database and calculating changes...
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'success' && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Data uploaded successfully! The page will reset in a moment.
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {parsedData && uploadStatus !== 'success' && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-semibold mb-3">Parsed Data Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-muted-foreground">Quarter:</span>
                  <span className="ml-2 font-medium">{parsedData.quarter_label}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2 font-medium">{parsedData.quarter_end_date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Format:</span>
                  <span className="ml-2 font-medium capitalize">{parsedData.data_format_version}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total AUM:</span>
                  <span className="ml-2 font-medium">₹{parsedData.total_aum_crore.toLocaleString('en-IN')} Cr</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Categories:</span>
                  <span className="ml-2 font-medium">{parsedData.rows.length}</span>
                </div>
              </div>

              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Category</th>
                      <th className="text-right p-2">AUM (Cr)</th>
                      <th className="text-right p-2">AAUM (Cr)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.rows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{row.category_name}</td>
                        <td className="text-right p-2">{row.aum_crore.toLocaleString('en-IN')}</td>
                        <td className="text-right p-2">{row.aaum_crore.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.rows.length > 10 && (
                  <div className="p-2 text-center text-xs text-muted-foreground bg-muted/50">
                    ... and {parsedData.rows.length - 10} more categories
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to Database
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
