// Mutual Fund Data Upload Component

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export function MutualFundUpload() {
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

      // First, insert/update AMCs
      const amcs = new Map();
      jsonData.forEach((row) => {
        if (!amcs.has(row.AMC_Code || row.amc_code)) {
          amcs.set(row.AMC_Code || row.amc_code, {
            amc_code: row.AMC_Code || row.amc_code,
            amc_name: row.AMC_Name || row.amc_name,
            total_aum: 0,
            num_schemes: 0,
          });
        }
      });

      const amcArray = Array.from(amcs.values());
      const { data: insertedAMCs, error: amcError } = await (supabase as any)
        .from('mutual_fund_amcs')
        .upsert(amcArray, { onConflict: 'amc_code' })
        .select();

      if (amcError) throw amcError;

      // Create AMC code to ID mapping
      const amcMap = new Map(insertedAMCs?.map((amc: any) => [amc.amc_code, amc.id]));

      // Then insert schemes
      const schemes = jsonData.map((row) => ({
        scheme_code: row.Scheme_Code || row.scheme_code,
        amc_id: amcMap.get(row.AMC_Code || row.amc_code),
        scheme_name: row.Scheme_Name || row.scheme_name,
        category: row.Category || row.category,
        sub_category: row.Sub_Category || row.sub_category,
        aum: parseFloat(row.AUM_Crores || row.aum_crores || '0'),
        nav: parseFloat(row.NAV || row.nav || '0'),
        returns_1y: parseFloat(row.Returns_1Y || row.returns_1y || '0'),
        returns_3y: parseFloat(row.Returns_3Y || row.returns_3y || '0'),
        returns_5y: parseFloat(row.Returns_5Y || row.returns_5y || '0'),
        expense_ratio: parseFloat(row.Expense_Ratio || row.expense_ratio || '0'),
        fund_manager: row.Fund_Manager || row.fund_manager,
        risk_grade: row.Risk_Grade || row.risk_grade,
      }));

      for (let i = 0; i < schemes.length; i += 100) {
        const batch = schemes.slice(i, i + 100);
        const { error } = await (supabase as any).from('mutual_fund_schemes').upsert(batch, {
          onConflict: 'scheme_code',
        });
        if (error) throw error;
      }

      setMessage({ type: 'success', text: `Successfully uploaded ${schemes.length} schemes` });
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
        AMC_Code: '1',
        AMC_Name: 'HDFC Mutual Fund',
        Scheme_Code: '101',
        Scheme_Name: 'HDFC Equity Fund',
        Category: 'Equity',
        Sub_Category: 'Large Cap',
        AUM_Crores: 25000,
        NAV: 450.23,
        Returns_1Y: 15.5,
        Returns_3Y: 12.3,
        Returns_5Y: 14.2,
        Expense_Ratio: 1.5,
        Fund_Manager: 'John Doe',
        Risk_Grade: 'Moderately High',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mutual Funds');
    XLSX.writeFile(wb, 'mutual_fund_template.xlsx');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mutual Fund Data Upload</CardTitle>
        <CardDescription>
          Upload AMC and mutual fund scheme data including NAV, returns, and fund manager information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                    <th className="p-2 border">AMC</th>
                    <th className="p-2 border">Scheme Name</th>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">NAV</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border">{row.AMC_Name || row.amc_name}</td>
                      <td className="p-2 border">{row.Scheme_Name || row.scheme_name}</td>
                      <td className="p-2 border">{row.Category || row.category}</td>
                      <td className="p-2 border">{row.NAV || row.nav}</td>
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
