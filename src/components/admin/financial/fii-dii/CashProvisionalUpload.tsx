import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFinancialYear, getMonthName, getQuarter, parseCSVValue, isValidDate } from '@/utils/fii-dii-utils';
import { filterNewRecords, batchInsert } from '@/utils/upload-helpers';

interface ParsedRow {
  date: string;
  fii_gross_purchase: number;
  fii_gross_sales: number;
  fii_net: number;
  dii_gross_purchase: number;
  dii_gross_sales: number;
  dii_net: number;
}

export function CashProvisionalUpload() {
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

    // Parse and preview
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      setErrors(['File must contain header and at least one data row']);
      return;
    }

    const header = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['Date', 'FII_Gross_Purchase', 'FII_Gross_Sales', 'FII_Net', 'DII_Gross_Purchase', 'DII_Gross_Sales', 'DII_Net'];
    
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
        fii_gross_purchase: parseCSVValue(values[1]),
        fii_gross_sales: parseCSVValue(values[2]),
        fii_net: parseCSVValue(values[3]),
        dii_gross_purchase: parseCSVValue(values[4]),
        dii_gross_sales: parseCSVValue(values[5]),
        dii_net: parseCSVValue(values[6]),
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
          fii_gross_purchase: parseCSVValue(values[1]),
          fii_gross_sales: parseCSVValue(values[2]),
          fii_net: parseCSVValue(values[3]),
          dii_gross_purchase: parseCSVValue(values[4]),
          dii_gross_sales: parseCSVValue(values[5]),
          dii_net: parseCSVValue(values[6]),
        };
      });

      // Check for existing dates and filter to only new dates
      const { newRecords, existingCount } = await filterNewRecords('fii_dii_cash_provisional', records);

      if (newRecords.length === 0) {
        toast({
          title: 'No new data',
          description: 'All dates in the file already exist in the database.',
          variant: 'default',
        });
        setUploading(false);
        return;
      }

      if (existingCount > 0) {
        toast({
          title: 'Skipping existing dates',
          description: `${existingCount} dates already exist. Uploading ${newRecords.length} new records.`,
          variant: 'default',
        });
      }

      // Insert only new records in batches
      await batchInsert('fii_dii_cash_provisional', newRecords);

      toast({
        title: 'Upload successful',
        description: `${newRecords.length} new records uploaded successfully`,
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
    link.href = '/templates/fii_dii_cash_provisional_template.csv';
    link.download = 'fii_dii_cash_provisional_template.csv';
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Provisional Data Upload</CardTitle>
        <CardDescription>
          Upload daily FII/DII cash provisional data (Summary of gross buy/sell/net)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Download Template */}
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

        {/* File Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {/* Errors */}
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

        {/* Preview */}
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
                    <th className="text-right p-2">FII Net</th>
                    <th className="text-right p-2">DII Net</th>
                    <th className="text-right p-2">Combined</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => {
                    const combined = row.fii_net + row.dii_net;
                    return (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{row.date}</td>
                        <td className={`text-right p-2 ${row.fii_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.fii_net.toFixed(2)}
                        </td>
                        <td className={`text-right p-2 ${row.dii_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.dii_net.toFixed(2)}
                        </td>
                        <td className={`text-right p-2 ${combined >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {combined.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload Button */}
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
