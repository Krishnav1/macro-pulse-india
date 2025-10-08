import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface DerivativesDataRow {
  Date: string;
  Investor_Type: string;
  Instrument: string;
  Market_Type: string;
  Gross_Purchase: number;
  Gross_Sales: number;
  Net_Purchase_Sales: number;
}

export function FIIDIIDerivativesUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<DerivativesDataRow[]>([]);
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
      const jsonData = XLSX.utils.sheet_to_json<DerivativesDataRow>(worksheet);
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
      const jsonData = XLSX.utils.sheet_to_json<DerivativesDataRow>(worksheet);

      const rows = jsonData.map((row) => {
        const date = new Date(row.Date);
        return {
          date: date.toISOString().split('T')[0],
          financial_year: getFinancialYear(date),
          investor_type: row.Investor_Type,
          instrument: row.Instrument,
          market_type: row.Market_Type,
          gross_purchase: parseFloat(row.Gross_Purchase?.toString() || '0'),
          gross_sales: parseFloat(row.Gross_Sales?.toString() || '0'),
          net_purchase_sales: parseFloat(row.Net_Purchase_Sales?.toString() || '0'),
        };
      });

      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase
          .from('fii_dii_derivatives_data')
          .upsert(batch, { onConflict: 'date,investor_type,instrument,market_type' });
        
        if (error) throw error;
      }

      await supabase.from('fii_dii_uploads').insert({
        upload_type: 'derivatives',
        file_name: file.name,
        records_count: rows.length,
        date_range_start: rows[0]?.date,
        date_range_end: rows[rows.length - 1]?.date,
        status: 'success',
      });

      toast({
        title: 'Success',
        description: `Successfully uploaded ${rows.length} derivatives records`,
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
    window.open('/templates/fii_dii_derivatives_template.csv', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Derivatives FII/DII Data Upload</CardTitle>
        <CardDescription>
          Upload FII and DII derivatives flows (Futures & Options, Indices & Stocks)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Download Template</p>
            <p className="text-sm text-muted-foreground">Get the CSV template for derivatives data</p>
          </div>
          <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="derivatives-file">Upload CSV/Excel File</Label>
          <Input
            id="derivatives-file"
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
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Instrument</th>
                    <th className="p-2 border">Market</th>
                    <th className="p-2 border">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{row.Date}</td>
                      <td className="p-2 border">{row.Investor_Type}</td>
                      <td className="p-2 border">{row.Instrument}</td>
                      <td className="p-2 border">{row.Market_Type}</td>
                      <td className="p-2 border">{row.Net_Purchase_Sales}</td>
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
              Upload Derivatives Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
