import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Alert, AlertDescription } from '../../ui/alert';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ParsedRow {
  year: string;
  stateName: string;
  indicators: { [indicatorName: string]: string };
}

interface IndicatorColumn {
  columnName: string;
  indicatorName: string;
  unit: string;
}

export const HeatmapAdminNew: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [indicatorColumns, setIndicatorColumns] = useState<IndicatorColumn[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [datasetNotes, setDatasetNotes] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvText = XLSX.utils.sheet_to_csv(worksheet);
      
      parseCSVData(csvText);
    } catch (err) {
      console.error('File parsing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const parseCSVData = (csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      
      // Expected format: Year, State Name, Indicator1 [Unit], Indicator2 [Unit], ...
      if (!headers[0].toLowerCase().includes('year')) {
        throw new Error('First column must be "Year"');
      }
      
      if (!headers[1].toLowerCase().includes('state')) {
        throw new Error('Second column must be "State Name" or similar');
      }

      // Find indicator columns (skip Year and State Name columns)
      const indicatorColumns: IndicatorColumn[] = [];
      for (let i = 2; i < headers.length; i++) {
        const header = headers[i];
        
        // Extract indicator name and unit from header like "GDP Growth Rate [%]"
        const match = header.match(/^(.+?)\s*\[([^\]]+)\]$/);
        if (match) {
          const [, indicatorName, unit] = match;
          indicatorColumns.push({
            columnName: header,
            indicatorName: indicatorName.trim(),
            unit: unit.trim()
          });
        } else {
          // If no unit specified, treat as text indicator
          indicatorColumns.push({
            columnName: header,
            indicatorName: header.trim(),
            unit: ''
          });
        }
      }

      if (indicatorColumns.length === 0) {
        throw new Error('No valid indicator columns found. Headers should be like "Indicator Name [Unit]"');
      }

      // Parse data rows
      const parsedRows: ParsedRow[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip empty lines
        if (!line || line.trim() === '') {
          continue;
        }
        
        const values = line.split(',').map(v => v.trim());
        if (values.length !== headers.length) {
          console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}`);
          continue;
        }

        const year = values[0];
        const stateName = values[1];
        
        if (!year || !stateName) {
          console.warn(`Row ${i + 1} has empty year or state name`);
          continue;
        }

        const indicators: { [key: string]: string } = {};
        
        // Store indicator values
        for (let j = 2; j < values.length; j++) {
          const indicatorName = indicatorColumns[j - 2].indicatorName;
          indicators[indicatorName] = values[j];
        }

        parsedRows.push({
          year,
          stateName,
          indicators
        });
      }

      if (parsedRows.length === 0) {
        throw new Error('No valid data rows found');
      }

      setParsedData(parsedRows);
      setIndicatorColumns(indicatorColumns);
      setShowPreview(true);
      setError(null);

    } catch (err) {
      console.error('CSV parsing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse CSV data');
      setParsedData([]);
      setIndicatorColumns([]);
      setShowPreview(false);
    }
  };

  const handleUpload = async () => {
    if (!parsedData.length || !datasetName.trim()) {
      setError('Please provide a dataset name and ensure data is parsed');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Delete existing data for indicators that will be updated
      const indicatorSlugs = indicatorColumns.map(col => 
        col.indicatorName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      );

      console.log('Clearing existing data for indicators:', indicatorSlugs);

      // Clear existing data for these indicators
      for (const slug of indicatorSlugs) {
        const { data: existingIndicator } = await (supabase as any)
          .from('heatmap_indicators')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existingIndicator) {
          console.log('Deleting existing data for indicator:', slug);
          // Delete existing values for this indicator
          const { error: deleteError } = await (supabase as any)
            .from('heatmap_values')
            .delete()
            .eq('indicator_id', (existingIndicator as any).id);
          
          if (deleteError) {
            console.error('Error deleting existing values:', deleteError);
          }

          // Also delete the indicator itself to recreate it fresh
          const { error: deleteIndicatorError } = await (supabase as any)
            .from('heatmap_indicators')
            .delete()
            .eq('id', (existingIndicator as any).id);
          
          if (deleteIndicatorError) {
            console.error('Error deleting existing indicator:', deleteIndicatorError);
          }
        }
      }

      // Create dataset record
      const { data: dataset, error: datasetError } = await (supabase as any)
        .from('heatmap_datasets')
        .insert({
          name: datasetName.trim(),
          notes: datasetNotes.trim() || null,
          uploaded_by: 'admin',
        })
        .select()
        .single();

      if (datasetError) throw datasetError;

      // Process indicators and values
      const indicatorMap = new Map<string, string>(); // indicatorName -> indicator_id

      // Create indicators
      for (const col of indicatorColumns) {
        const slug = col.indicatorName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        const { data: newIndicator, error: indicatorError } = await (supabase as any)
          .from('heatmap_indicators')
          .insert({
            slug,
            name: col.indicatorName,
            unit: col.unit,
            description: `Uploaded from dataset: ${datasetName}`,
          })
          .select('id')
          .single();

        if (indicatorError) throw indicatorError;
        indicatorMap.set(col.indicatorName, (newIndicator as any).id);
      }

      // Prepare values for bulk insert
      const valuesToInsert: any[] = [];
      parsedData.forEach(row => {
        Object.entries(row.indicators).forEach(([indicatorName, value]) => {
          const indicatorId = indicatorMap.get(indicatorName);
          if (indicatorId && value && value.trim() !== '') {
            // Clean and parse the value - remove commas and convert to number
            const cleanValue = value.replace(/,/g, '').trim();
            const numericValue = parseFloat(cleanValue);
            
            // Only insert if we have a valid number and it's not zero (skip empty cells)
            if (!isNaN(numericValue) && isFinite(numericValue) && numericValue !== 0) {
              valuesToInsert.push({
                indicator_id: indicatorId,
                state_name: row.stateName,
                year_label: row.year,
                value: numericValue,
                source: datasetName,
                dataset_id: (dataset as any).id,
              });
              console.log(`Inserting: ${row.stateName} ${row.year} ${indicatorName} = ${numericValue}`);
            } else {
              console.warn(`Skipping invalid value: ${row.stateName} ${row.year} ${indicatorName} = "${value}"`);
            }
          }
        });
      });

      // Insert values in batches
      const batchSize = 1000;
      for (let i = 0; i < valuesToInsert.length; i += batchSize) {
        const batch = valuesToInsert.slice(i, i + batchSize);
        const { error: valuesError } = await (supabase as any)
          .from('heatmap_values')
          .upsert(batch, {
            onConflict: 'indicator_id,state_name,year_label',
          });

        if (valuesError) throw valuesError;
      }

      setSuccess(`Successfully uploaded ${valuesToInsert.length} data points for ${indicatorColumns.length} indicators`);
      
      // Reset form
      setFile(null);
      setParsedData([]);
      setIndicatorColumns([]);
      setDatasetName('');
      setDatasetNotes('');
      setShowPreview(false);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error uploading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload data';
      
      if (errorMessage.includes('42P01') || errorMessage.includes('does not exist')) {
        setError('Database tables not found. Please set up the heatmap tables first.');
      } else if (errorMessage.includes('permission')) {
        setError('Permission denied. Please check database access permissions.');
      } else {
        setError(`Upload failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/heatmap_template.csv';
    link.download = 'heatmap_template.csv';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Heatmap Data Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700">
            📊 Upload your Excel/CSV files with state-wise data. The system will automatically replace existing data for the same indicators.
            <br />
            <strong>Format:</strong> Year, State Name, Indicator1 [Unit], Indicator2 [Unit], ...
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Data File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select Excel/CSV File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>

            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {showPreview && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="dataset-name">Dataset Name *</Label>
                <Input
                  id="dataset-name"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  placeholder="e.g., State Economic Indicators 2024-25"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dataset-notes">Notes (Optional)</Label>
                <Textarea
                  id="dataset-notes"
                  value={datasetNotes}
                  onChange={(e) => setDatasetNotes(e.target.value)}
                  placeholder="Additional notes about this dataset..."
                  className="mt-1"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Preview:</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Found {parsedData.length} rows with {indicatorColumns.length} indicators
                </p>
                <div className="text-xs space-y-1">
                  <div><strong>Indicators:</strong> {indicatorColumns.map(col => `${col.indicatorName} (${col.unit})`).join(', ')}</div>
                  <div><strong>Years:</strong> {Array.from(new Set(parsedData.map(row => row.year))).join(', ')}</div>
                  <div><strong>States:</strong> {Array.from(new Set(parsedData.map(row => row.stateName))).slice(0, 5).join(', ')}{parsedData.length > 5 ? '...' : ''}</div>
                </div>
              </div>

              <Button
                onClick={handleUpload}
                disabled={loading || !datasetName.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Data
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
