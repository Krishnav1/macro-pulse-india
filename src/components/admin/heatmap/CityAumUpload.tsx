import { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCityCoordinates } from '@/data/cityCoordinates';

interface ParsedCityData {
  quarterEndDate: string;
  cities: Array<{
    cityName: string;
    aumPercentage: number;
    latitude?: number;
    longitude?: number;
  }>;
}

export function CityAumUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCityData | null>(null);
  const { toast } = useToast();

  const parseCSV = async (file: File): Promise<ParsedCityData> => {
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row');
    }

    // First line should be "Quarter End Date: YYYY-MM-DD"
    const dateMatch = lines[0].match(/Quarter End Date:\s*(\d{4}-\d{2}-\d{2})/i);
    if (!dateMatch) {
      throw new Error('First line must be "Quarter End Date: YYYY-MM-DD"');
    }
    const quarterEndDate = dateMatch[1];

    // Second line should be headers: City Name,AUM Percentage
    const headers = lines[1].split(',').map(h => h.trim());
    if (headers.length !== 2 || !headers[0].toLowerCase().includes('city') || !headers[1].toLowerCase().includes('aum')) {
      throw new Error('Second line must be headers: "City Name,AUM Percentage"');
    }

    // Parse data rows
    const cities = [];
    for (let i = 2; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== 2) continue;

      const cityName = values[0];
      const aumPercentage = parseFloat(values[1]);

      if (isNaN(aumPercentage)) {
        throw new Error(`Invalid AUM percentage for city ${cityName}: ${values[1]}`);
      }

      // Get coordinates for the city
      const coords = getCityCoordinates(cityName);
      
      cities.push({
        cityName,
        aumPercentage,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
    }

    if (cities.length === 0) {
      throw new Error('No valid city data found in file');
    }

    return { quarterEndDate, cities };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsedData(null);

    try {
      const data = await parseCSV(selectedFile);
      setParsedData(data);
      toast({
        title: 'File parsed successfully',
        description: `Found ${data.cities.length} cities for quarter ending ${data.quarterEndDate}`,
      });
    } catch (error) {
      toast({
        title: 'Parse error',
        description: error instanceof Error ? error.message : 'Failed to parse file',
        variant: 'destructive',
      });
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!parsedData) return;

    setUploading(true);

    try {
      // Check if data exists for this quarter
      const { data: existingData } = await supabase
        .from('city_aum_allocation' as any)
        .select('id')
        .eq('quarter_end_date', parsedData.quarterEndDate)
        .limit(1);

      // Delete existing data for this quarter
      if (existingData && existingData.length > 0) {
        const { error: deleteError } = await supabase
          .from('city_aum_allocation' as any)
          .delete()
          .eq('quarter_end_date', parsedData.quarterEndDate);

        if (deleteError) throw deleteError;

        toast({
          title: 'Existing data replaced',
          description: `Deleted existing data for quarter ${parsedData.quarterEndDate}`,
        });

        // Wait 1 second for deletion to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Insert new data
      const records = parsedData.cities.map(city => ({
        quarter_end_date: parsedData.quarterEndDate,
        city_name: city.cityName,
        aum_percentage: city.aumPercentage,
        latitude: city.latitude,
        longitude: city.longitude,
      }));

      const { error: insertError } = await supabase
        .from('city_aum_allocation' as any)
        .insert(records);

      if (insertError) throw insertError;

      // Log upload
      await supabase.from('city_aum_uploads' as any).insert({
        quarter_end_date: parsedData.quarterEndDate,
        total_cities: parsedData.cities.length,
      });

      toast({
        title: 'Upload successful',
        description: `Uploaded ${parsedData.cities.length} cities for quarter ${parsedData.quarterEndDate}`,
      });

      // Reset
      setFile(null);
      setParsedData(null);
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

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/city_aum_template.csv';
    link.download = 'city_aum_template.csv';
    link.click();
  };

  const citiesWithoutCoords = parsedData?.cities.filter(c => !c.latitude || !c.longitude).length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>City-wise AUM Allocation Upload</CardTitle>
        <CardDescription>
          Upload quarterly city-wise AUM allocation data. First row should specify quarter end date.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <h3 className="font-medium">Download Template</h3>
            <p className="text-sm text-muted-foreground">
              Get the CSV template with correct format
            </p>
          </div>
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label htmlFor="city-aum-file" className="text-sm font-medium">
            Upload CSV File
          </label>
          <input
            id="city-aum-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {/* Preview */}
        {parsedData && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <strong>Quarter End Date:</strong> {parsedData.quarterEndDate}
                </div>
                <div>
                  <strong>Total Cities:</strong> {parsedData.cities.length}
                </div>
                {citiesWithoutCoords > 0 && (
                  <div className="text-warning">
                    <strong>Warning:</strong> {citiesWithoutCoords} cities don't have coordinates and won't appear on map
                  </div>
                )}
                <div className="mt-2">
                  <strong>Preview (first 5 cities):</strong>
                  <ul className="mt-1 text-sm space-y-1">
                    {parsedData.cities.slice(0, 5).map((city, idx) => (
                      <li key={idx}>
                        {city.cityName}: {city.aumPercentage}%
                        {!city.latitude && <span className="text-warning ml-2">(no coords)</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!parsedData || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Data
            </>
          )}
        </Button>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>File Format:</strong>
            <ul className="mt-2 text-sm space-y-1 list-disc list-inside">
              <li>First row: "Quarter End Date: YYYY-MM-DD"</li>
              <li>Second row: Headers "City Name,AUM Percentage"</li>
              <li>Data rows: City name and AUM percentage (e.g., "Mumbai,28.50")</li>
              <li>Uploading data for an existing quarter will replace it</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
