// FII/DII Flows Upload Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export function FIIDIIUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

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
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setPreviewData(jsonData.slice(0, 5));
    } catch (error) {
      setMessage({ type: 'error', text: 'Error parsing file' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const rows = jsonData.map((row) => ({
        date: row.Date || row.date,
        fii_equity_buy: parseFloat(row.FII_Equity_Buy || row.fii_equity_buy || '0'),
        fii_equity_sell: parseFloat(row.FII_Equity_Sell || row.fii_equity_sell || '0'),
        fii_equity_net: parseFloat(row.FII_Equity_Net || row.fii_equity_net || '0'),
        dii_equity_buy: parseFloat(row.DII_Equity_Buy || row.dii_equity_buy || '0'),
        dii_equity_sell: parseFloat(row.DII_Equity_Sell || row.dii_equity_sell || '0'),
        dii_equity_net: parseFloat(row.DII_Equity_Net || row.dii_equity_net || '0'),
        fii_debt_buy: parseFloat(row.FII_Debt_Buy || row.fii_debt_buy || '0'),
        fii_debt_sell: parseFloat(row.FII_Debt_Sell || row.fii_debt_sell || '0'),
        fii_debt_net: parseFloat(row.FII_Debt_Net || row.fii_debt_net || '0'),
      }));

      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await (supabase as any).from('fii_dii_flows').upsert(batch, { onConflict: 'date' });
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
        FII_Equity_Buy: 5000.5,
        FII_Equity_Sell: 4500.25,
        FII_Equity_Net: 500.25,
        DII_Equity_Buy: 3000.75,
        DII_Equity_Sell: 2800.5,
        DII_Equity_Net: 200.25,
        FII_Debt_Buy: 1200,
        FII_Debt_Sell: 1100,
        FII_Debt_Net: 100,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FII DII');
    XLSX.writeFile(wb, 'fii_dii_template.xlsx');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>FII/DII Flows Upload</CardTitle>
        <CardDescription>
          Upload daily FII and DII investment flows (equity and debt)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Download Template</p>
            <p className="text-sm text-muted-foreground">Get the Excel template</p>
          </div>
          <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

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

        {previewData.length > 0 && (
          <div className="space-y-2">
            <Label>Preview (First 5 rows)</Label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">FII Equity Net</th>
                    <th className="p-2 border">DII Equity Net</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{row.Date || row.date}</td>
                      <td className="p-2 border">{row.FII_Equity_Net || row.fii_equity_net}</td>
                      <td className="p-2 border">{row.DII_Equity_Net || row.dii_equity_net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
