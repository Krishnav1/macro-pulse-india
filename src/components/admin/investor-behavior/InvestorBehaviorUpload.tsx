// =====================================================
// INVESTOR BEHAVIOR UPLOAD COMPONENT
// Admin interface for uploading investor behavior data
// =====================================================

import { useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { InvestorBehaviorParser } from '@/services/investor-behavior/ExcelParser';
import { InvestorBehaviorTransformer } from '@/services/investor-behavior/DataTransformer';
import { ParsedInvestorBehaviorFile } from '@/services/investor-behavior/types';
import { supabase } from '@/integrations/supabase/client';

export function InvestorBehaviorUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedInvestorBehaviorFile | null>(null);
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
    setIsProcessing(true);

    try {
      const parsed = await InvestorBehaviorParser.parseFile(file);
      
      // Validate parsed data
      if (!parsed.rows || parsed.rows.length === 0) {
        throw new Error(
          'No data rows found. Please ensure your file matches the template format:\n' +
          '1. Header with "Quarter Ended: DD-MMM-YYYY"\n' +
          '2. Column headers: "Age Group", "Asset Type", "0-1 Month", "1-3 Months", etc.\n' +
          '3. Data rows with age groups and numeric AUM values'
        );
      }
      
      setParsedData(parsed);
      setUploadStatus('idle');
      
      toast({
        title: 'File Parsed Successfully',
        description: `Found ${parsed.rows.length} records for ${parsed.quarter_label}`,
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
      // Create upload record
      const { data: uploadRecord, error: uploadError } = await (supabase as any)
        .from('investor_behavior_uploads')
        .insert({
          quarter_end_date: parsedData.quarter_end_date,
          quarter_label: parsedData.quarter_label,
          file_name: file?.name,
          file_size_kb: file ? Math.round(file.size / 1024) : null,
          total_records: parsedData.rows.length,
          total_aum_crore: parsedData.total_aum_crore,
          status: 'processing'
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      // Transform data with calculated metrics
      const transformer = new InvestorBehaviorTransformer();
      const records = transformer.transform(parsedData);

      // Check if data already exists for this quarter
      const { data: existingData, error: checkError } = await (supabase as any)
        .from('investor_behavior_data')
        .select('id')
        .eq('quarter_end_date', parsedData.quarter_end_date)
        .limit(1);

      if (checkError) {
        console.error('Error checking existing data:', checkError);
      }

      if (existingData && existingData.length > 0) {
        // Delete existing data for this quarter
        const { error: deleteError } = await (supabase as any)
          .from('investor_behavior_data')
          .delete()
          .eq('quarter_end_date', parsedData.quarter_end_date);

        if (deleteError) {
          console.error('Error deleting existing data:', deleteError);
          throw new Error(`Failed to delete existing data: ${deleteError.message}`);
        }

        // Wait a moment to ensure deletion is complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Insert new data in batches
      const batchSize = 50;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error: insertError } = await (supabase as any)
          .from('investor_behavior_data')
          .insert(batch);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`Failed to insert batch ${Math.floor(i/batchSize) + 1}: ${insertError.message}`);
        }
      }

      // Update upload record
      await (supabase as any)
        .from('investor_behavior_uploads')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', uploadRecord.id);

      setUploadStatus('success');
      
      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${records.length} records for ${parsedData.quarter_label}`,
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
          Upload Investor Behavior Data
        </CardTitle>
        <CardDescription>
          Upload Excel or CSV files containing age group + holding period AUM distribution data.
          <br />
          Data shows how different investor types (Corporates, Banks/FIs, HNI, Retail, NRI) hold investments across different time periods.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">📥 Download Template</h4>
              <p className="text-sm text-blue-700 mb-3">
                Download the sample template to see the expected data format:
              </p>
              <ul className="text-xs text-blue-600 space-y-1 mb-3">
                <li>• Header with "Quarter Ended: DD-MMM-YYYY" (e.g., 30-Jun-2024)</li>
                <li>• Columns: Age Group, Asset Type, 0-1 Month, 1-3 Months, 3-6 Months, 6-12 Months, 12-24 Months, &gt; 24 Months</li>
                <li>• Age Groups: Corporates, Banks/FIs, HNI, Retail, NRI</li>
                <li>• Asset Types: EQUITY, NON-EQUITY</li>
                <li>• All AUM values in Rs. Crore</li>
              </ul>
            </div>
            <a
              href="/templates/investor_behavior_template.csv"
              download="investor_behavior_template.csv"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap shadow-md hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </a>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md">
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
              </div>
            )}
          </div>

          {file && !parsedData && uploadStatus === 'idle' && (
            <Button onClick={handleParse} disabled={isProcessing} className="shadow-sm">
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
          <Alert className="border-blue-200 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800">
              Parsing file and validating data format...
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === 'uploading' && (
          <Alert className="border-blue-200 bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800">
              Uploading data to database and calculating metrics...
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
            <div className="border rounded-lg p-4 bg-gradient-to-br from-muted/30 to-muted/50">
              <h3 className="font-semibold mb-3 text-lg">📊 Parsed Data Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                <div className="bg-card p-3 rounded-md shadow-sm">
                  <span className="text-muted-foreground block mb-1">Quarter:</span>
                  <span className="font-medium text-lg">{parsedData.quarter_label}</span>
                </div>
                <div className="bg-card p-3 rounded-md shadow-sm">
                  <span className="text-muted-foreground block mb-1">Date:</span>
                  <span className="font-medium text-lg">{new Date(parsedData.quarter_end_date).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="bg-card p-3 rounded-md shadow-sm">
                  <span className="text-muted-foreground block mb-1">Total AUM:</span>
                  <span className="font-medium text-lg text-green-600">₹{parsedData.total_aum_crore.toLocaleString('en-IN')} Cr</span>
                </div>
                <div className="bg-card p-3 rounded-md shadow-sm">
                  <span className="text-muted-foreground block mb-1">Records:</span>
                  <span className="font-medium text-lg">{parsedData.rows.length}</span>
                </div>
                <div className="bg-card p-3 rounded-md shadow-sm">
                  <span className="text-muted-foreground block mb-1">Equity:</span>
                  <span className="font-medium text-lg text-blue-600">₹{parsedData.metadata.equity_total.toLocaleString('en-IN')} Cr</span>
                </div>
                <div className="bg-card p-3 rounded-md shadow-sm">
                  <span className="text-muted-foreground block mb-1">Non-Equity:</span>
                  <span className="font-medium text-lg text-purple-600">₹{parsedData.metadata.non_equity_total.toLocaleString('en-IN')} Cr</span>
                </div>
              </div>

              <div className="border rounded overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2 font-semibold">Age Group</th>
                      <th className="text-left p-2 font-semibold">Asset Type</th>
                      <th className="text-right p-2 font-semibold">0-1M</th>
                      <th className="text-right p-2 font-semibold">1-3M</th>
                      <th className="text-right p-2 font-semibold">3-6M</th>
                      <th className="text-right p-2 font-semibold">6-12M</th>
                      <th className="text-right p-2 font-semibold">12-24M</th>
                      <th className="text-right p-2 font-semibold">&gt;24M</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.rows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-t hover:bg-muted/50">
                        <td className="p-2">{row.age_group}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            row.asset_type === 'EQUITY' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {row.asset_type}
                          </span>
                        </td>
                        <td className="text-right p-2">{row.aum_0_1_month.toLocaleString('en-IN')}</td>
                        <td className="text-right p-2">{row.aum_1_3_months.toLocaleString('en-IN')}</td>
                        <td className="text-right p-2">{row.aum_3_6_months.toLocaleString('en-IN')}</td>
                        <td className="text-right p-2">{row.aum_6_12_months.toLocaleString('en-IN')}</td>
                        <td className="text-right p-2">{row.aum_12_24_months.toLocaleString('en-IN')}</td>
                        <td className="text-right p-2">{row.aum_above_24_months.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.rows.length > 10 && (
                  <div className="p-2 text-center text-xs text-muted-foreground bg-muted/50">
                    ... and {parsedData.rows.length - 10} more records
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={isProcessing}
              className="w-full shadow-md hover:shadow-lg"
              size="lg"
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
