// NSE Bulk Deals Manual Upload Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

export function NSEBulkDealsUpload() {
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
        setPreview(results.data.slice(0, 5));
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
          const data = results.data
            .filter((row: any) => row['Date'] && row['Symbol']) // Filter out empty rows
            .map((row: any) => ({
              date: row['Date'],
              symbol: row['Symbol'],
              stock_name: row['Stock Name'] || '',
              client_name: row['Client Name'] || '',
              deal_type: (row['buy / sell'] || row['Deal Type'] || 'buy').toLowerCase().trim(),
              quantity: parseInt(row['Quantity']) || 0,
              avg_price: parseFloat(row['Trade Price'] || row['Avg Price']) || 0,
              exchange: row['Exchange'] || 'NSE',
            }));

          const { error } = await (supabase as any)
            .from('bulk_deals')
            .upsert(data, { onConflict: 'date,symbol,client_name,deal_type' });

          if (error) throw error;

          toast({
            title: 'Upload Successful',
            description: `${data.length} bulk deals uploaded`,
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Upload Bulk Deals Data
          </CardTitle>
          <CardDescription>
            Upload CSV file with bulk deals data. Download template for correct format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <a
              href="/templates/nse_bulk_deals_template.csv"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Template
            </a>
          </div>

          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

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

          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
            {uploading ? 'Uploading...' : 'Upload Data'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <p className="text-sm text-foreground">
            <strong>Note:</strong> CSV should contain: Date, Symbol, Stock Name, Client Name, buy / sell, Quantity, Trade Price, Exchange.
            The 'buy / sell' column should contain either 'buy' or 'sell'.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
