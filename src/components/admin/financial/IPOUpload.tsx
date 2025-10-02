// IPO Data Upload Component - Simplified version

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export function IPOUpload() {
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
        company_name: row.Company_Name || row.company_name,
        issue_size: row.Issue_Size || row.issue_size,
        price_band: row.Price_Band || row.price_band,
        sector: row.Sector || row.sector,
        open_date: row.Open_Date || row.open_date,
        close_date: row.Close_Date || row.close_date,
        listing_date: row.Listing_Date || row.listing_date,
        qib_subscription: parseFloat(row.QIB_Subscription || row.qib_subscription || '0'),
        nii_subscription: parseFloat(row.NII_Subscription || row.nii_subscription || '0'),
        retail_subscription: parseFloat(row.Retail_Subscription || row.retail_subscription || '0'),
        total_subscription: parseFloat(row.Total_Subscription || row.total_subscription || '0'),
        listing_gain_percent: parseFloat(row.Listing_Gain_Percent || row.listing_gain_percent || '0'),
        current_price: parseFloat(row.Current_Price || row.current_price || '0'),
        status: row.Status || row.status || 'upcoming',
      }));

      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await (supabase as any).from('ipo_data').upsert(batch, { onConflict: 'company_name,open_date' });
        if (error) throw error;
      }

      setMessage({ type: 'success', text: `Successfully uploaded ${rows.length} IPOs` });
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
        <CardTitle>IPO Data Upload</CardTitle>
        <CardDescription>Upload IPO pipeline and performance data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Download Template</p>
            <p className="text-sm text-muted-foreground">Available in /public/templates/</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/templates/ipo_data_template.csv" download>
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
