// Mainboard IPO Upload Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { IPOUploadData } from '@/types/ipo';
import { transformIPOData, detectYears, validateIPORow } from '@/utils/ipoParser';
import { useToast } from '@/hooks/use-toast';

export function MainboardIPOUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteExisting, setDeleteExisting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [detectedYears, setDetectedYears] = useState<number[]>([]);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      setPreviewData([]);
      setDetectedYears([]);
      return;
    }

    setFile(selectedFile);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as IPOUploadData[];

      // Detect years
      const years = detectYears(jsonData);
      setDetectedYears(years);

      // Show preview (first 5 rows)
      const preview = jsonData.slice(0, 5).map(row => ({
        company: row['Company Name'],
        listingDate: row['Listing Date'],
        issuePrice: row['Issue Price'],
        ltp: row['LTP (Rs)'],
        currentGain: row['Current Gain %']
      }));
      setPreviewData(preview);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse file. Please check the format.',
        variant: 'destructive'
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      // Parse file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as IPOUploadData[];

      // Validate data
      const validationErrors: string[] = [];
      jsonData.forEach((row, index) => {
        const validation = validateIPORow(row);
        if (!validation.valid) {
          validationErrors.push(`Row ${index + 2}: ${validation.errors.join(', ')}`);
        }
      });

      if (validationErrors.length > 0) {
        toast({
          title: 'Validation Error',
          description: `Found ${validationErrors.length} errors. Please fix and try again.`,
          variant: 'destructive'
        });
        setUploading(false);
        return;
      }

      // Transform data
      const transformedData = transformIPOData(jsonData, 'mainboard');

      // Delete existing data if checkbox is selected
      if (deleteExisting && detectedYears.length > 0) {
        for (const year of detectedYears) {
          const { error: deleteError } = await (supabase as any)
            .from('ipo_listings')
            .delete()
            .eq('ipo_type', 'mainboard')
            .eq('year', year);

          if (deleteError) throw deleteError;
        }

        // Wait 1 second for deletion to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Insert data in batches of 100
      let insertedCount = 0;
      for (let i = 0; i < transformedData.length; i += 100) {
        const batch = transformedData.slice(i, i + 100);
        const { error: insertError } = await (supabase as any)
          .from('ipo_listings')
          .upsert(batch, { 
            onConflict: 'company_name,listing_date,ipo_type',
            ignoreDuplicates: false 
          });

        if (insertError) throw insertError;
        insertedCount += batch.length;
      }

      // Log upload
      await (supabase as any).from('ipo_uploads').insert({
        ipo_type: 'mainboard',
        year: detectedYears[0] || new Date().getFullYear(),
        records_count: insertedCount
      });

      toast({
        title: 'Success',
        description: `Successfully uploaded ${insertedCount} Mainboard IPOs for year(s): ${detectedYears.join(', ')}`,
      });

      // Reset form
      setFile(null);
      setPreviewData([]);
      setDetectedYears([]);
      setDeleteExisting(false);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'An error occurred during upload',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          Mainboard IPO Upload
        </CardTitle>
        <CardDescription>
          Upload Mainboard IPO data with listing and current performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">Download Template</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Mainboard IPO data format</p>
          </div>
          <Button variant="outline" size="sm" asChild className="border-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900">
            <a href="/templates/mainboard_ipo_template.csv" download>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="mainboard-file">Upload Excel/CSV File</Label>
          <Input
            id="mainboard-file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            disabled={uploading}
          />
        </div>

        {/* Preview */}
        {previewData.length > 0 && (
          <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Detected {previewData.length}+ IPOs for year(s): {detectedYears.join(', ')}
                </p>
                <div className="text-xs space-y-1 text-blue-800 dark:text-blue-200">
                  {previewData.map((row, idx) => (
                    <div key={idx} className="font-mono">
                      {row.company} | {row.listingDate} | Gain: {row.currentGain}
                    </div>
                  ))}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Delete Existing Option */}
        {detectedYears.length > 0 && (
          <div className="flex items-center space-x-2 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <Checkbox
              id="delete-mainboard"
              checked={deleteExisting}
              onCheckedChange={(checked) => setDeleteExisting(checked as boolean)}
              disabled={uploading}
            />
            <Label
              htmlFor="delete-mainboard"
              className="text-sm font-medium text-orange-900 dark:text-orange-100 cursor-pointer"
            >
              Delete existing Mainboard IPO data for year(s): {detectedYears.join(', ')} before upload
            </Label>
          </div>
        )}

        {/* Upload Button */}
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading} 
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Mainboard IPOs
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
