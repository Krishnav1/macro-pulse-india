// Investor Master Data Upload Component
// Manual classification for FII/DII/HNI identification

import { useState } from 'react';
import { Upload, Download, RefreshCw, CheckCircle, AlertCircle, Users } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvestorData {
  client_name: string;
  investor_type: 'FII' | 'DII' | 'HNI' | 'Others';
  category: string | null;
  country: string | null;
  notes: string | null;
  classification_method: string;
}

export function InvestorMasterUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<InvestorData[]>([]);
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
        const parsedData: InvestorData[] = results.data.map((row: any) => {
          const investorType = row['Investor Type']?.toUpperCase().trim();
          
          // Validate investor type
          if (!['FII', 'DII', 'HNI', 'OTHERS'].includes(investorType)) {
            console.warn(`Invalid investor type: ${investorType}. Defaulting to Others.`);
          }

          return {
            client_name: row['Client Name']?.trim() || '',
            investor_type: (['FII', 'DII', 'HNI', 'OTHERS'].includes(investorType) 
              ? investorType 
              : 'OTHERS') as 'FII' | 'DII' | 'HNI' | 'Others',
            category: row['Category']?.trim() || null,
            country: row['Country']?.trim() || null,
            notes: row['Notes']?.trim() || null,
            classification_method: 'manual'
          };
        }).filter(item => item.client_name);

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
          const allData: InvestorData[] = results.data.map((row: any) => {
            const investorType = row['Investor Type']?.toUpperCase().trim();
            
            return {
              client_name: row['Client Name']?.trim() || '',
              investor_type: (['FII', 'DII', 'HNI', 'OTHERS'].includes(investorType) 
                ? investorType 
                : 'OTHERS') as 'FII' | 'DII' | 'HNI' | 'Others',
              category: row['Category']?.trim() || null,
              country: row['Country']?.trim() || null,
              notes: row['Notes']?.trim() || null,
              classification_method: 'manual'
            };
          }).filter(item => item.client_name);

          // Upsert data (insert or update on conflict)
          const { data, error } = await supabase
            .from('investor_master')
            .upsert(allData, { 
              onConflict: 'client_name',
              ignoreDuplicates: false 
            })
            .select();

          if (error) {
            throw error;
          }

          // Log upload
          await supabase.from('investor_master_uploads').insert({
            filename: file.name,
            records_uploaded: allData.length,
            upload_status: 'success'
          });

          setUploadStats({
            total: allData.length,
            new: data?.length || 0,
            updated: allData.length - (data?.length || 0)
          });

          toast.success(`Successfully uploaded ${allData.length} investor classifications!`);
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
    window.open('/templates/investor_master_template.csv', '_blank');
  };

  // Get count by investor type
  const getTypeCounts = () => {
    const counts = { FII: 0, DII: 0, HNI: 0, Others: 0 };
    preview.forEach(inv => {
      counts[inv.investor_type]++;
    });
    return counts;
  };

  const typeCounts = preview.length > 0 ? getTypeCounts() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Investor Classification</h3>
          <p className="text-sm text-muted-foreground">
            Upload investor classifications for FII/DII/HNI identification
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
              htmlFor="investor-file-upload"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Select CSV File
            </label>
            <input
              id="investor-file-upload"
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
            <div className="space-y-4">
              {/* Type Distribution */}
              {typeCounts && (
                <div className="grid grid-cols-4 gap-3">
                  <div className="dashboard-card p-3 bg-blue-500/10 border-l-4 border-blue-500">
                    <div className="text-xs text-muted-foreground">FII</div>
                    <div className="text-lg font-bold text-blue-500">{typeCounts.FII}</div>
                  </div>
                  <div className="dashboard-card p-3 bg-green-500/10 border-l-4 border-green-500">
                    <div className="text-xs text-muted-foreground">DII</div>
                    <div className="text-lg font-bold text-green-500">{typeCounts.DII}</div>
                  </div>
                  <div className="dashboard-card p-3 bg-purple-500/10 border-l-4 border-purple-500">
                    <div className="text-xs text-muted-foreground">HNI</div>
                    <div className="text-lg font-bold text-purple-500">{typeCounts.HNI}</div>
                  </div>
                  <div className="dashboard-card p-3 bg-gray-500/10 border-l-4 border-gray-500">
                    <div className="text-xs text-muted-foreground">Others</div>
                    <div className="text-lg font-bold text-gray-500">{typeCounts.Others}</div>
                  </div>
                </div>
              )}

              <h4 className="text-sm font-medium text-foreground">Preview (First 10 records)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Client Name</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((investor, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="px-3 py-2">{investor.client_name}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            investor.investor_type === 'FII' ? 'bg-blue-500/20 text-blue-500' :
                            investor.investor_type === 'DII' ? 'bg-green-500/20 text-green-500' :
                            investor.investor_type === 'HNI' ? 'bg-purple-500/20 text-purple-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {investor.investor_type}
                          </span>
                        </td>
                        <td className="px-3 py-2">{investor.category || 'N/A'}</td>
                        <td className="px-3 py-2">{investor.country || 'N/A'}</td>
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
                <Users className="h-4 w-4" />
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
                <p>• New Investors: <span className="font-medium text-success">{uploadStats.new}</span></p>
                <p>• Updated Investors: <span className="font-medium text-primary">{uploadStats.updated}</span></p>
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
              <li><strong>Client Name:</strong> Full name of the investor/client</li>
              <li><strong>Investor Type:</strong> Must be one of: FII, DII, HNI, Others</li>
              <li><strong>Category:</strong> Specific category (Mutual Fund, Foreign Bank, Insurance, Individual, etc.)</li>
              <li><strong>Country:</strong> Country of origin (India, USA, Singapore, etc.)</li>
              <li><strong>Notes:</strong> Additional information (optional)</li>
            </ul>
            <div className="mt-3 space-y-1">
              <p className="font-medium text-foreground">Investor Type Definitions:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>FII:</strong> Foreign Institutional Investors (banks, funds from abroad)</li>
                <li><strong>DII:</strong> Domestic Institutional Investors (mutual funds, insurance, Indian institutions)</li>
                <li><strong>HNI:</strong> High Net Worth Individuals (prominent investors, family offices)</li>
                <li><strong>Others:</strong> Unclassified or retail investors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
