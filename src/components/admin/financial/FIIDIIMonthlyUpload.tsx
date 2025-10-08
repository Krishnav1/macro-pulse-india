import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface MonthlyDataRow {
  Date: string;
  FII_Equity: number;
  FII_Debt: number;
  FII_Derivatives: number;
  FII_Total: number;
  DII_Equity: number;
  DII_Debt: number;
  DII_Derivatives: number;
  DII_Total: number;
}

export function FIIDIIMonthlyUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<MonthlyDataRow[]>([]);
  const { toast } = useToast();

  const getFinancialYear = (date: Date): string => {
    const month = date.getMonth();
    const year = date.getFullYear();
    if (month >= 3) {
      return `FY ${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `FY ${year - 1}-${year.toString().slice(-2)}`;
    }
  };

  const getMonthName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<MonthlyDataRow>(worksheet);
      setPreviewData(jsonData.slice(0, 5));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse file',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<MonthlyDataRow>(worksheet);

      const rows = jsonData.map((row) => {
        const date = new Date(row.Date);
        return {
          date: date.toISOString().split('T')[0],
          financial_year: getFinancialYear(date),
          month_name: getMonthName(date),
          fii_equity: parseFloat(row.FII_Equity?.toString() || '0'),
          fii_debt: parseFloat(row.FII_Debt?.toString() || '0'),
          fii_derivatives: parseFloat(row.FII_Derivatives?.toString() || '0'),
          fii_total: parseFloat(row.FII_Total?.toString() || '0'),
          dii_equity: parseFloat(row.DII_Equity?.toString() || '0'),
          dii_debt: parseFloat(row.DII_Debt?.toString() || '0'),
          dii_derivatives: parseFloat(row.DII_Derivatives?.toString() || '0'),
          dii_total: parseFloat(row.DII_Total?.toString() || '0'),
        };
      });

      // Insert in batches
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase
          .from('fii_dii_monthly_data')
          .upsert(batch, { onConflict: 'date,financial_year' });
        
        if (error) throw error;
      }

      // Track upload
      await supabase.from('fii_dii_uploads').insert({
        upload_type: 'monthly',
        file_name: file.name,
        records_count: rows.length,
        date_range_start: rows[0]?.date,
        date_range_end: rows[rows.length - 1]?.date,
        status: 'success',
      });

      toast({
        title: 'Success',
        description: `Successfully uploaded ${rows.length} monthly records`,
      });

      setFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Upload failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/templates/fii_dii_monthly_template.csv', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly FII/DII Data Upload</CardTitle>
        <CardDescription>
          Upload monthly aggregated FII and DII flows (Equity, Debt, Derivatives)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Download Template</p>
            <p className="text-sm text-muted-foreground">Get the CSV template for monthly data</p>
          </div>
          <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly-file">Upload CSV/Excel File</Label>
          <Input
            id="monthly-file"
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
                    <th className="p-2 border">FII Total</th>
                    <th className="p-2 border">DII Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{row.Date}</td>
                      <td className="p-2 border">{row.FII_Total}</td>
                      <td className="p-2 border">{row.DII_Total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
              Upload Monthly Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
