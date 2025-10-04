// NSE Indices Manual Upload Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, CheckCircle, XCircle, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

export function NSEIndicesUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5)); // Show first 5 rows
      },
      error: (error) => {
        toast({
          title: 'Parse Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data.map((row: any) => ({
            symbol: row['Index Symbol'],
            name: row['Index Name'],
            last_price: parseFloat(row['Last Price']),
            change: parseFloat(row['Change']),
            change_percent: parseFloat(row['Change %']),
            open: parseFloat(row['Open']),
            high: parseFloat(row['High']),
            low: parseFloat(row['Low']),
            previous_close: parseFloat(row['Previous Close']),
            year_high: parseFloat(row['Year High']),
            year_low: parseFloat(row['Year Low']),
            volume: parseInt(row['Volume']),
            timestamp: new Date(row['Date']).toISOString(),
          }));

          const { error } = await (supabase as any)
            .from('market_indices')
            .upsert(data, { onConflict: 'symbol,timestamp' });

          if (error) throw error;

          toast({
            title: 'Upload Successful',
            description: `${data.length} indices uploaded`,
          });

          setFile(null);
          setPreview([]);
        },
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Upload NSE Indices Data
          </CardTitle>
          <CardDescription>
            Upload CSV file with market indices data. Download the template below for the correct format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Download Template */}
          <div>
            <a
              href="/templates/nse_indices_template.csv"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Template
            </a>
          </div>

          {/* File Upload */}
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="border border-border rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-2">Preview (First 5 rows)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="text-left p-2 text-muted-foreground">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-border">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="p-2 text-foreground">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> The CSV file should contain columns: Date, Index Symbol, Index Name, Last Price, Change, Change %, Open, High, Low, Previous Close, Year High, Year Low, Volume.
            Data will be upserted based on symbol and timestamp.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
