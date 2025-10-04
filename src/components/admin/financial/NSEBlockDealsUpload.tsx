// NSE Block Deals Manual Upload Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';

export function NSEBlockDealsUpload() {
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
          console.log('Raw CSV data:', results.data);
          console.log('First row keys:', results.data[0] ? Object.keys(results.data[0]) : 'No data');
          
          // Parse and validate data
          const parsedData = results.data
            .filter((row: any) => {
              // Skip if row is empty object
              if (!row || Object.keys(row).length === 0) return false;
              
              // Get the actual column names (they might have spaces)
              const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('date')) || 'Date';
              const symbolKey = Object.keys(row).find(k => k.toLowerCase().includes('symbol')) || 'Symbol';
              
              const hasDate = row[dateKey] && row[dateKey].toString().trim() !== '';
              const hasSymbol = row[symbolKey] && row[symbolKey].toString().trim() !== '';
              
              console.log('Row check:', { dateKey, symbolKey, hasDate, hasSymbol, row });
              return hasDate && hasSymbol;
            })
            .map((row: any) => {
              // Find column names (case-insensitive, handle spaces)
              const dateKey = Object.keys(row).find(k => k.toLowerCase().includes('date')) || 'Date';
              const symbolKey = Object.keys(row).find(k => k.toLowerCase().includes('symbol')) || 'Symbol';
              const stockNameKey = Object.keys(row).find(k => k.toLowerCase().includes('stock')) || 'Stock Name';
              const clientNameKey = Object.keys(row).find(k => k.toLowerCase().includes('client')) || 'Client Name';
              const dealTypeKey = Object.keys(row).find(k => k.toLowerCase().includes('buy') || k.toLowerCase().includes('sell')) || 'buy / sell';
              const quantityKey = Object.keys(row).find(k => k.toLowerCase().includes('quantity')) || 'Quantity';
              const priceKey = Object.keys(row).find(k => k.toLowerCase().includes('price')) || 'Trade Price';
              const exchangeKey = Object.keys(row).find(k => k.toLowerCase().includes('exchange')) || 'Exchange';
              
              // Parse date (handle MM/DD/YYYY format)
              let dateStr = row[dateKey].toString().trim();
              if (dateStr.includes('/')) {
                const [month, day, year] = dateStr.split('/');
                dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              }
              
              return {
                date: dateStr,
                symbol: row[symbolKey].toString().trim(),
                stock_name: (row[stockNameKey] || '').toString().trim(),
                client_name: (row[clientNameKey] || '').toString().trim(),
                deal_type: (row[dealTypeKey] || 'buy').toString().toLowerCase().trim(),
                quantity: parseInt(row[quantityKey]) || 0,
                trade_price: parseFloat(row[priceKey]) || 0,
                exchange: (row[exchangeKey] || 'NSE').toString().trim(),
              };
            });

          console.log('Parsed data:', parsedData);
          
          // Remove TRUE duplicates - check ALL columns
          const uniqueData = parsedData.reduce((acc: any[], curr: any) => {
            const isDuplicate = acc.some((item: any) => 
              item.date === curr.date &&
              item.symbol === curr.symbol &&
              item.stock_name === curr.stock_name &&
              item.client_name === curr.client_name &&
              item.deal_type === curr.deal_type &&
              item.quantity === curr.quantity &&
              item.trade_price === curr.trade_price &&
              item.exchange === curr.exchange
            );
            if (!isDuplicate) {
              acc.push(curr);
            }
            return acc;
          }, []);
          
          console.log(`Removed ${parsedData.length - uniqueData.length} exact duplicates. Uploading ${uniqueData.length} unique records.`);
          const data = uniqueData;

          // Get unique dates in the upload
          const uniqueDates = [...new Set(data.map((d: any) => d.date))];
          console.log(`Deleting existing data for ${uniqueDates.length} dates...`);

          // Delete existing data for these dates
          const { error: deleteError } = await (supabase as any)
            .from('block_deals')
            .delete()
            .in('date', uniqueDates);

          if (deleteError) {
            console.warn('Delete error (might be no existing data):', deleteError);
          }

          // Wait a bit for deletion to complete
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Insert new data
          const { error } = await (supabase as any)
            .from('block_deals')
            .insert(data);

          if (error) throw error;

          toast({
            title: 'Upload Successful',
            description: `${data.length} block deals uploaded`,
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
            <Shield className="h-5 w-5 text-warning" />
            Upload Block Deals Data
          </CardTitle>
          <CardDescription>
            Upload CSV file with block deals data. Download template for correct format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <a
              href="/templates/nse_block_deals_template.csv"
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
            The 'buy / sell' column should contain either 'buy' or 'sell'. Block deals are large private transactions between parties.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
