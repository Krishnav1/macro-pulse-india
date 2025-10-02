// Sector Metrics Upload Component - Simplified version

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export function SectorMetricsUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const rows = jsonData.map((row) => ({
        date: row.Date || row.date,
        sector_name: row.Sector_Name || row.sector_name,
        sector_slug: row.Sector_Slug || row.sector_slug,
        nse_symbol: row.NSE_Symbol || row.nse_symbol,
        bse_symbol: row.BSE_Symbol || row.bse_symbol,
        price: parseFloat(row.Price || row.price || '0'),
        change_percent: parseFloat(row.Change_Percent || row.change_percent || '0'),
        pe_ratio: parseFloat(row.PE_Ratio || row.pe_ratio || '0'),
        pb_ratio: parseFloat(row.PB_Ratio || row.pb_ratio || '0'),
        market_cap: parseFloat(row.Market_Cap || row.market_cap || '0'),
      }));

      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await (supabase as any).from('sector_data').upsert(batch, { onConflict: 'date,sector_slug' });
        if (error) throw error;
      }

      setMessage({ type: 'success', text: `Successfully uploaded ${rows.length} sector records` });
      setFile(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sector Metrics Upload</CardTitle>
        <CardDescription>Upload sector PE/PB ratios and market cap data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Download Template</p>
            <p className="text-sm text-muted-foreground">Available in /public/templates/</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/templates/sector_metrics_template.csv" download>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Upload Excel/CSV File</Label>
          <Input
            id="file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
          />
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
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
