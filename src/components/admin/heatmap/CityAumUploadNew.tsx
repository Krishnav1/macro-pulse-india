import { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2, FileSpreadsheet, Info, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { parseCityAumExcel, validateParsedData, type ExcelParseResult } from '@/utils/cityAumExcelParser';

export function CityAumUploadNew() {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ExcelParseResult | null>(null);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an Excel file (.xlsx or .xls)',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setParsedData(null);
    setValidation(null);
    setParsing(true);

    try {
      const result = await parseCityAumExcel(selectedFile);
      setParsedData(result);
      
      const validationResult = validateParsedData(result);
      setValidation(validationResult);

      if (validationResult.valid) {
        toast({
          title: 'File parsed successfully',
          description: `Found ${result.totalQuarters} quarters with ${result.totalCities} total cities`,
        });
      } else {
        toast({
          title: 'Validation errors found',
          description: `${validationResult.errors.length} errors detected. Please review.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Parse error',
        description: error instanceof Error ? error.message : 'Failed to parse file',
        variant: 'destructive',
      });
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  const handleUpload = async () => {
    if (!parsedData || !validation?.valid) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalSteps = parsedData.worksheets.length * 2 + 2; // Delete + Insert per worksheet + metadata + log
      let currentStep = 0;

      // Step 1: Delete existing data for all quarters in the file
      const quarterDates = parsedData.worksheets.map(ws => ws.quarterEndDate);
      
      const { error: deleteError } = await supabase
        .from('city_aum_allocation' as any)
        .delete()
        .in('quarter_end_date', quarterDates);

      if (deleteError) throw deleteError;

      const { error: deleteMetaError } = await supabase
        .from('city_aum_metadata' as any)
        .delete()
        .in('quarter_end_date', quarterDates);

      if (deleteMetaError) throw deleteMetaError;

      currentStep += 1;
      setUploadProgress((currentStep / totalSteps) * 100);

      toast({
        title: 'Existing data cleared',
        description: `Removed data for ${quarterDates.length} quarters`,
      });

      // Wait 1 second for deletion to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Insert city data for each worksheet
      for (const worksheet of parsedData.worksheets) {
        const cityRecords = worksheet.cities.map(city => ({
          quarter_end_date: worksheet.quarterEndDate,
          financial_year: worksheet.financialYear,
          quarter_number: worksheet.quarter,
          city_name: city.cityName,
          aum_percentage: city.aumPercentage,
          latitude: city.latitude,
          longitude: city.longitude,
        }));

        const { error: insertError } = await supabase
          .from('city_aum_allocation' as any)
          .insert(cityRecords);

        if (insertError) throw insertError;

        currentStep += 1;
        setUploadProgress((currentStep / totalSteps) * 100);
      }

      // Step 3: Insert metadata for each worksheet
      for (const worksheet of parsedData.worksheets) {
        const { error: metaError } = await supabase
          .from('city_aum_metadata' as any)
          .insert({
            quarter_end_date: worksheet.quarterEndDate,
            financial_year: worksheet.financialYear,
            quarter_number: worksheet.quarter,
            other_cities_percentage: worksheet.metadata.otherCities,
            nris_overseas_percentage: worksheet.metadata.nrisOverseas,
            total_percentage: worksheet.metadata.total,
          });

        if (metaError) throw metaError;

        currentStep += 1;
        setUploadProgress((currentStep / totalSteps) * 100);
      }

      // Step 4: Log upload
      const uniqueFYs = [...new Set(parsedData.worksheets.map(ws => ws.financialYear))];
      
      await supabase.from('city_aum_uploads' as any).insert({
        quarter_end_date: parsedData.worksheets[parsedData.worksheets.length - 1].quarterEndDate,
        total_cities: parsedData.totalCities,
        financial_year: uniqueFYs.join(', '),
        quarters_count: parsedData.totalQuarters,
      });

      currentStep += 1;
      setUploadProgress(100);

      toast({
        title: 'Upload successful',
        description: `Uploaded ${parsedData.totalQuarters} quarters with ${parsedData.totalCities} total cities`,
      });

      // Reset
      setFile(null);
      setParsedData(null);
      setValidation(null);
      setUploadProgress(0);
      const fileInput = document.getElementById('city-aum-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload data',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          City-wise AUM Data Upload (Multi-Quarter Excel)
        </CardTitle>
        <CardDescription>
          Upload an Excel file with multiple worksheets, each containing quarterly city-wise AUM data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <h3 className="font-medium">Download Template</h3>
            <p className="text-sm text-muted-foreground">
              Excel template with sample data for multiple quarters
            </p>
          </div>
          <Button
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/templates/city_aum_template.csv';
              link.download = 'city_aum_template.csv';
              link.click();
            }}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label htmlFor="city-aum-file" className="text-sm font-medium">
            Upload Excel File (.xlsx or .xls)
          </label>
          <input
            id="city-aum-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={parsing || uploading}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
          />
        </div>

        {/* Parsing Indicator */}
        {parsing && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Parsing Excel file... Please wait.
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Errors */}
        {validation && !validation.valid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Validation Errors:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validation.errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Warnings */}
        {validation && validation.warnings.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Warnings:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validation.warnings.slice(0, 5).map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
                {validation.warnings.length > 5 && (
                  <li className="text-muted-foreground">... and {validation.warnings.length - 5} more</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {parsedData && validation?.valid && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong>File:</strong> {file?.name}
                </div>
                <div>
                  <strong>Total Quarters:</strong> {parsedData.totalQuarters}
                </div>
                <div>
                  <strong>Total Cities:</strong> {parsedData.totalCities}
                </div>
                <div>
                  <strong>Date Range:</strong> {parsedData.worksheets[0]?.financialYear} Q{parsedData.worksheets[0]?.quarter} to{' '}
                  {parsedData.worksheets[parsedData.worksheets.length - 1]?.financialYear} Q{parsedData.worksheets[parsedData.worksheets.length - 1]?.quarter}
                </div>
                
                <div className="mt-3">
                  <strong className="block mb-2">Quarters Preview:</strong>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {parsedData.worksheets.map((ws, idx) => (
                      <div key={idx} className="p-2 bg-muted/50 rounded text-sm">
                        <div className="font-semibold">
                          {ws.financialYear} Q{ws.quarter} ({ws.quarterEndDate})
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          • {ws.cities.length} cities ({ws.cities.filter(c => c.latitude && c.longitude).length} mapped)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          • Other Cities: {ws.metadata.otherCities}% | NRIs: {ws.metadata.nrisOverseas}% | Total: {ws.metadata.total}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!parsedData || !validation?.valid || uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading {Math.round(uploadProgress)}%...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload All Quarters
            </>
          )}
        </Button>

        {/* Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Excel File Format:</strong>
            <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
              <li>Each worksheet should be named like "Q1 2020-21", "Q2 2020-21", etc.</li>
              <li>Row 1: Quarter End Date (e.g., "Quarter End Date: 2020-06-30")</li>
              <li>Row 2: Headers ("City Name", "AUM Percentage")</li>
              <li>Rows 3-N: City data</li>
              <li>Last 3 rows: "Other Cities", "NRIs & Overseas", "Total"</li>
              <li>Uploading will replace existing data for all quarters in the file</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
