import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Alert, AlertDescription } from '../../ui/alert';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import * as XLSX from 'xlsx';

interface ParsedData {
  year: string;
  stateName: string;
  indicators: { [key: string]: number | null };
}

interface IndicatorColumn {
  columnName: string;
  indicatorName: string;
  unit: string;
}

export const HeatmapAdmin: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [indicatorColumns, setIndicatorColumns] = useState<IndicatorColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [datasetName, setDatasetName] = useState('');
  const [datasetNotes, setDatasetNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      parseFile(uploadedFile);
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
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1);

      // Validate required columns
      const yearIndex = headers.findIndex(h => h.toLowerCase().includes('year'));
      const stateIndex = headers.findIndex(h => h.toLowerCase().includes('state'));

      if (yearIndex === -1 || stateIndex === -1) {
        throw new Error('File must contain "Year" and "State Name" columns');
      }

      // Identify indicator columns (exclude Year and State Name)
      const indicatorCols: IndicatorColumn[] = [];
      headers.forEach((header, index) => {
        if (index !== yearIndex && index !== stateIndex && header.trim()) {
          // Extract unit from header if present (e.g., "GDP Growth [%]" -> unit: "%")
          const unitMatch = header.match(/\[([^\]]+)\]/);
          const unit = unitMatch ? unitMatch[1] : '';
          const indicatorName = header.replace(/\s*\[([^\]]+)\]/, '').trim();

          indicatorCols.push({
            columnName: header,
            indicatorName,
            unit,
          });
        }
      });

      setIndicatorColumns(indicatorCols);

      // Parse data rows
      const parsed: ParsedData[] = [];
      rows.forEach((row, rowIndex) => {
        if (row.length < headers.length) return;

        const year = row[yearIndex]?.toString().trim();
        const stateName = row[stateIndex]?.toString().trim();

        if (!year || !stateName) {
          console.warn(`Skipping row ${rowIndex + 2}: missing year or state name`);
          return;
        }

        const indicators: { [key: string]: number | null } = {};
        indicatorCols.forEach((col, colIndex) => {
          const headerIndex = headers.indexOf(col.columnName);
          const value = row[headerIndex];
          indicators[col.columnName] = value !== undefined && value !== null && value !== '' 
            ? parseFloat(value.toString()) 
            : null;
        });

        parsed.push({
          year,
          stateName,
          indicators,
        });
      });

      setParsedData(parsed);
      setShowPreview(true);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setLoading(false);
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

      // Create dataset record
      const { data: dataset, error: datasetError } = await supabase
        .from('heatmap_datasets')
        .insert({
          name: datasetName.trim(),
          notes: datasetNotes.trim() || null,
          uploaded_by: 'admin', // You can get this from auth context
        })
        .select()
        .single();

      if (datasetError) throw datasetError;

      // Process indicators and values
      const indicatorMap = new Map<string, string>(); // columnName -> indicator_id

      // Create or get indicators
      for (const col of indicatorColumns) {
        const slug = col.indicatorName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        const { data: existingIndicator } = await supabase
          .from('heatmap_indicators')
          .select('id')
          .eq('slug', slug)
          .single();

        let indicatorId: string;

        if (existingIndicator) {
          indicatorId = existingIndicator.id;
        } else {
          const { data: newIndicator, error: indicatorError } = await supabase
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
          indicatorId = newIndicator.id;
        }

        indicatorMap.set(col.columnName, indicatorId);
      }

      // Prepare values for bulk insert
      const valuesToInsert: any[] = [];
      parsedData.forEach(row => {
        Object.entries(row.indicators).forEach(([columnName, value]) => {
          const indicatorId = indicatorMap.get(columnName);
          if (indicatorId && value !== null) {
            valuesToInsert.push({
              indicator_id: indicatorId,
              state_name: row.stateName,
              year_label: row.year,
              value,
              dataset_id: dataset.id,
              source: datasetName,
            });
          }
        });
      });

      // Insert values in batches
      const batchSize = 1000;
      for (let i = 0; i < valuesToInsert.length; i += batchSize) {
        const batch = valuesToInsert.slice(i, i + batchSize);
        const { error: valuesError } = await supabase
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

    } catch (err) {
      console.error('Error uploading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload data');
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Heatmap Data Upload
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

          <div className="flex gap-4">
            <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="dataset-name">Dataset Name *</Label>
              <Input
                id="dataset-name"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="e.g., State Economic Indicators 2023-24"
              />
            </div>

            <div>
              <Label htmlFor="dataset-notes">Notes (Optional)</Label>
              <Textarea
                id="dataset-notes"
                value={datasetNotes}
                onChange={(e) => setDatasetNotes(e.target.value)}
                placeholder="Additional information about this dataset..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="file-upload">Upload Excel/CSV File *</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {showPreview && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Preview</h3>
              
              <div>
                <h4 className="font-medium mb-2">Detected Indicators ({indicatorColumns.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {indicatorColumns.map((col, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{col.indicatorName}</div>
                      {col.unit && <div className="text-gray-600">Unit: {col.unit}</div>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Data Summary</h4>
                <div className="text-sm text-gray-600">
                  <div>Total rows: {parsedData.length}</div>
                  <div>Years: {Array.from(new Set(parsedData.map(d => d.year))).sort().join(', ')}</div>
                  <div>States: {Array.from(new Set(parsedData.map(d => d.stateName))).length}</div>
                </div>
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={loading || !datasetName.trim()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {loading ? 'Uploading...' : 'Upload Data'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
