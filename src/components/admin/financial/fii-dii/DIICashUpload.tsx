import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getFinancialYear, getMonthName, getQuarter, parseCSVValue, isValidDate } from '@/utils/fii-dii-utils';

interface ParsedRow {
  date: string;
  equity_gross_purchase: number;
  equity_gross_sales: number;
  equity_net: number;
  debt_gross_purchase: number;
  debt_gross_sales: number;
  debt_net: number;
}

export function DIICashUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setPreview([]);

    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      setErrors(['File must contain header and at least one data row']);
      return;
    }

    const header = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['Date', 'DII_EQUITY_Gross_Purchase', 'DII_EQUITY_Gross_Sales', 'DII_EQUITY_Net', 'DII_DEBT_Gross_Purchase', 'DII_DEBT_Gross_Sales', 'DII_DEBT_Net'];
    
    const headerMatch = expectedHeaders.every(h => header.includes(h));
    if (!headerMatch) {
      setErrors([`Invalid headers. Expected: ${expectedHeaders.join(', ')}`]);
      return;
    }

    const parsed: ParsedRow[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < Math.min(lines.length, 11); i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < 7) {
        parseErrors.push(`Row ${i}: Insufficient columns`);
        continue;
      }

      const date = values[0];
      if (!isValidDate(date)) {
        parseErrors.push(`Row ${i}: Invalid date format (use YYYY-MM-DD)`);
        continue;
      }

      parsed.push({
        date,
        equity_gross_purchase: parseCSVValue(values[1]),
        equity_gross_sales: parseCSVValue(values[2]),
        equity_net: parseCSVValue(values[3]),
        debt_gross_purchase: parseCSVValue(values[4]),
        debt_gross_sales: parseCSVValue(values[5]),
        debt_net: parseCSVValue(values[6]),
      });
    }

    setPreview(parsed);
    setErrors(parseErrors);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const dataRows = lines.slice(1);

      const records = dataRows.map(line => {
        const values = line.split(',').map(v => v.trim());
        const date = values[0];
        const dateObj = new Date(date);

        return {
          date,
          financial_year: getFinancialYear(dateObj),
          month_name: getMonthName(dateObj),
          quarter: getQuarter(dateObj),
          equity_gross_purchase: parseCSVValue(values[1]),
          equity_gross_sales: parseCSVValue(values[2]),
          equity_net: parseCSVValue(values[3]),
          debt_gross_purchase: parseCSVValue(values[4]),
          debt_gross_sales: parseCSVValue(values[5]),
          debt_net: parseCSVValue(values[6]),
        };
      });

      const dates = records.map(r => r.date);
      const { data: existing } = await (supabase as any)
        .from('dii_cash_data')
        .select('date')
        .in('date', dates);

      if (existing && existing.length > 0) {
        const existingDates = existing.map((e: any) => e.date);
        await (supabase as any)
          .from('dii_cash_data')
          .delete()
          .in('date', existingDates);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const batchSize = 100;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error } = await (supabase as any)
          .from('dii_cash_data')
          .insert(batch);
        if (error) throw error;
      }

      await (supabase as any)
        .from('fii_dii_uploads')
        .insert({
          upload_type: 'dii_cash',
          file_name: file.name,
          records_count: records.length,
          date_range_start: records[0].date,
          date_range_end: records[records.length - 1].date,
        });

      toast({
        title: 'Upload successful',
        description: `${records.length} records uploaded successfully`,
      });

      setFile(null);
      setPreview([]);
      setErrors([]);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/dii_cash_template.csv';
    link.download = 'dii_cash_template.csv';
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>DII Cash Data Upload (MF Cash)</CardTitle>
        <CardDescription>
          Upload daily DII/Mutual Fund cash market data (Equity and Debt breakdown)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Download Template</p>
            <p className="text-sm text-muted-foreground">
              Get the CSV template with correct column format
            </p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {errors.length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="h-4 w-4" />
              Validation Errors
            </div>
            {errors.map((error, idx) => (
              <p key={idx} className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            ))}
          </div>
        )}

        {preview.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Preview (first 10 rows)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-right p-2">Equity Net</th>
                    <th className="text-right p-2">Debt Net</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => {
                    const total = row.equity_net + row.debt_net;
                    return (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{row.date}</td>
                        <td className={`text-right p-2 ${row.equity_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.equity_net.toFixed(2)}
                        </td>
                        <td className={`text-right p-2 ${row.debt_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.debt_net.toFixed(2)}
                        </td>
                        <td className={`text-right p-2 ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || errors.length > 0 || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Data'}
        </Button>
      </CardContent>
    </Card>
  );
}
