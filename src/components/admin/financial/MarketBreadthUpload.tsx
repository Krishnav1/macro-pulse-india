// Market Breadth Data Upload Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface MarketBreadthRow {
  date: string;
  exchange: string;
  advances: number;
  declines: number;
  unchanged: number;
  high_52w: number;
  low_52w: number;
  above_50dma: number;
  above_200dma: number;
  total_stocks: number;
}

export function MarketBreadthUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewData, setPreviewData] = useState<MarketBreadthRow[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const parsed: MarketBreadthRow[] = jsonData.map((row) => ({
        date: row.Date || row.date,
        exchange: row.Exchange || row.exchange,
        advances: parseInt(row.Advances || row.advances || '0'),
        declines: parseInt(row.Declines || row.declines || '0'),
        unchanged: parseInt(row.Unchanged || row.unchanged || '0'),
        high_52w: parseInt(row.High_52W || row.high_52w || '0'),
        low_52w: parseInt(row.Low_52W || row.low_52w || '0'),
        above_50dma: parseInt(row.Above_50DMA || row.above_50dma || '0'),
        above_200dma: parseInt(row.Above_200DMA || row.above_200dma || '0'),
        total_stocks: parseInt(row.Total_Stocks || row.total_stocks || '0'),
      }));

      setPreviewData(parsed.slice(0, 5));
    } catch (error) {
      console.error('Error parsing file:', error);
      setMessage({ type: 'error', text: 'Error parsing file. Please check the format.' });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const rows: MarketBreadthRow[] = jsonData.map((row) => ({
        date: row.Date || row.date,
        exchange: row.Exchange || row.exchange,
        advances: parseInt(row.Advances || row.advances || '0'),
        declines: parseInt(row.Declines || row.declines || '0'),
        unchanged: parseInt(row.Unchanged || row.unchanged || '0'),
        high_52w: parseInt(row.High_52W || row.high_52w || '0'),
        low_52w: parseInt(row.Low_52W || row.low_52w || '0'),
        above_50dma: parseInt(row.Above_50DMA || row.above_50dma || '0'),
        above_200dma: parseInt(row.Above_200DMA || row.above_200dma || '0'),
        total_stocks: parseInt(row.Total_Stocks || row.total_stocks || '0'),
      }));

      // Upload in batches
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await (supabase as any).from('market_breadth').upsert(batch, {
          onConflict: 'date,exchange',
        });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: `Successfully uploaded ${rows.length} records` });
      setFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        Date: '2024-01-15',
        Exchange: 'NSE',
        Advances: 1245,
        Declines: 856,
        Unchanged: 123,
        High_52W: 87,
        Low_52W: 34,
        Above_50DMA: 945,
        Above_200DMA: 723,
        Total_Stocks: 2224,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Market Breadth');
    XLSX.writeFile(wb, 'market_breadth_template.xlsx');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Breadth Data Upload</CardTitle>
        <CardDescription>
          Upload daily market breadth data including advances, declines, and market statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Download Template</p>
            <p className="text-sm text-muted-foreground">Get the Excel template with correct format</p>
          </div>
          <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file">Upload Excel/CSV File</Label>
          <Input
            id="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {/* Preview */}
        {previewData.length > 0 && (
          <div className="space-y-2">
            <Label>Preview (First 5 rows)</Label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Exchange</th>
                    <th className="p-2 border">Advances</th>
                    <th className="p-2 border">Declines</th>
                    <th className="p-2 border">Unchanged</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{row.date}</td>
                      <td className="p-2 border">{row.exchange}</td>
                      <td className="p-2 border">{row.advances}</td>
                      <td className="p-2 border">{row.declines}</td>
                      <td className="p-2 border">{row.unchanged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
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
      </CardContent>
    </Card>
  );
}
