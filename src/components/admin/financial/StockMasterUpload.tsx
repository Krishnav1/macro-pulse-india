// Stock Master Data Upload Component
// Supports both manual upload and auto-fetch from NSE/Moneycontrol

import { useState } from 'react';
import { Upload, Download, RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface StockData {
  symbol: string;
  company_name: string;
  sector: string | null;
  industry: string | null;
  market_cap: number | null;
  market_cap_display: string | null;
  isin: string | null;
  series: string | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  data_source: string;
}

export function StockMasterUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<StockData[]>([]);
  const [uploadStats, setUploadStats] = useState<{ total: number; new: number; updated: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData: StockData[] = results.data.map((row: any) => {
          // Parse market cap (remove commas, multiply by crore)
          let marketCap = null;
          let marketCapDisplay = null;
          
          if (row['Market Cap (INR Cr)']) {
            const cleanValue = String(row['Market Cap (INR Cr)']).replace(/,/g, '');
            const valueInCr = parseFloat(cleanValue);
            if (!isNaN(valueInCr)) {
              marketCap = valueInCr * 10000000; // Convert crores to actual value
              marketCapDisplay = `₹${valueInCr.toFixed(2)} Cr`;
            }
          }

          return {
            symbol: row['Symbol']?.toUpperCase().trim() || '',
            company_name: row['Company Name']?.trim() || '',
            sector: row['Sector']?.trim() || null,
            industry: row['Industry']?.trim() || null,
            market_cap: marketCap,
            market_cap_display: marketCapDisplay,
            isin: row['ISIN']?.trim() || null,
            series: row['Series']?.toUpperCase().trim() || 'EQ',
            pe_ratio: row['PE Ratio'] ? parseFloat(row['PE Ratio']) : null,
            pb_ratio: row['PB Ratio'] ? parseFloat(row['PB Ratio']) : null,
            data_source: row['Data Source']?.toLowerCase().trim() || 'manual'
          };
        });

        setPreview(parsedData.slice(0, 10)); // Show first 10 for preview
        toast.success(`Parsed ${parsedData.length} records. Preview shows first 10.`);
      },
      error: (error) => {
        toast.error(`Error parsing file: ${error.message}`);
      }
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    setUploadStats(null);

    try {
      // Parse the complete file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const allData: StockData[] = results.data.map((row: any) => {
            let marketCap = null;
            let marketCapDisplay = null;
            
            if (row['Market Cap (INR Cr)']) {
              const cleanValue = String(row['Market Cap (INR Cr)']).replace(/,/g, '');
              const valueInCr = parseFloat(cleanValue);
              if (!isNaN(valueInCr)) {
                marketCap = valueInCr * 10000000;
                marketCapDisplay = `₹${valueInCr.toFixed(2)} Cr`;
              }
            }

            return {
              symbol: row['Symbol']?.toUpperCase().trim() || '',
              company_name: row['Company Name']?.trim() || '',
              sector: row['Sector']?.trim() || null,
              industry: row['Industry']?.trim() || null,
              market_cap: marketCap,
              market_cap_display: marketCapDisplay,
              isin: row['ISIN']?.trim() || null,
              series: row['Series']?.toUpperCase().trim() || 'EQ',
              pe_ratio: row['PE Ratio'] ? parseFloat(row['PE Ratio']) : null,
              pb_ratio: row['PB Ratio'] ? parseFloat(row['PB Ratio']) : null,
              data_source: row['Data Source']?.toLowerCase().trim() || 'manual'
            };
          }).filter(item => item.symbol && item.company_name);

          // Upsert data (insert or update on conflict)
          const { data, error } = await supabase
            .from('stock_master')
            .upsert(allData, { 
              onConflict: 'symbol',
              ignoreDuplicates: false 
            })
            .select();

          if (error) {
            throw error;
          }

          // Log upload
          await supabase.from('stock_master_uploads').insert({
            filename: file.name,
            records_uploaded: allData.length,
            data_source: 'csv_upload',
            upload_status: 'success'
          });

          setUploadStats({
            total: allData.length,
            new: data?.length || 0,
            updated: allData.length - (data?.length || 0)
          });

          toast.success(`Successfully uploaded ${allData.length} stocks!`);
          setLoading(false);
        },
        error: (error) => {
          toast.error(`Upload failed: ${error.message}`);
          setLoading(false);
        }
      });
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    window.open('/templates/stock_master_template.csv', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Stock Master Data</h3>
          <p className="text-sm text-muted-foreground">
            Upload stock information for sector classification and analysis
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="dashboard-card">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="stock-file-upload"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Select CSV File
            </label>
            <input
              id="stock-file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file && (
              <span className="text-sm text-muted-foreground">
                {file.name}
              </span>
            )}
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Preview (First 10 records)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Symbol</th>
                      <th className="px-3 py-2 text-left">Company</th>
                      <th className="px-3 py-2 text-left">Sector</th>
                      <th className="px-3 py-2 text-left">Market Cap</th>
                      <th className="px-3 py-2 text-left">ISIN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((stock, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="px-3 py-2 font-medium">{stock.symbol}</td>
                        <td className="px-3 py-2">{stock.company_name}</td>
                        <td className="px-3 py-2">{stock.sector || 'N/A'}</td>
                        <td className="px-3 py-2">{stock.market_cap_display || 'N/A'}</td>
                        <td className="px-3 py-2 text-xs">{stock.isin || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex items-center gap-2 px-6 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Upload to Database
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Stats */}
      {uploadStats && (
        <div className="dashboard-card bg-success/10 border-success/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Upload Successful!</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• Total Records: <span className="font-medium text-foreground">{uploadStats.total}</span></p>
                <p>• New Stocks: <span className="font-medium text-success">{uploadStats.new}</span></p>
                <p>• Updated Stocks: <span className="font-medium text-primary">{uploadStats.updated}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="dashboard-card bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">CSV Format Requirements:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Symbol:</strong> Stock ticker symbol (e.g., RELIANCE, TCS)</li>
              <li><strong>Company Name:</strong> Full legal name of the company</li>
              <li><strong>Sector:</strong> Business sector (e.g., IT, Banking, Pharma)</li>
              <li><strong>Industry:</strong> Specific industry classification</li>
              <li><strong>Market Cap (INR Cr):</strong> Market capitalization in crores</li>
              <li><strong>ISIN:</strong> International Securities Identification Number</li>
              <li><strong>Series:</strong> Trading series (usually EQ for equity)</li>
              <li><strong>PE Ratio:</strong> Price-to-Earnings ratio (optional)</li>
              <li><strong>PB Ratio:</strong> Price-to-Book ratio (optional)</li>
              <li><strong>Data Source:</strong> Source of data (nse/moneycontrol/manual)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
