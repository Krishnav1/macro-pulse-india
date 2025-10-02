// AMC Data Admin Component
// Manages AMC-specific data scraping and manual uploads

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, Download, Upload, CheckCircle, XCircle, Clock, 
  AlertCircle, Building2, TrendingUp, PieChart 
} from 'lucide-react';
import { adityaBirlaScraper } from '@/services/amc-scrapers/AdityaBirlaScraper';
import { toast } from 'sonner';

export default function AMCDataAdmin() {
  const [scraping, setScraping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scrapingHistory, setScrapingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadScrapingHistory();
  }, []);

  const loadScrapingHistory = async () => {
    try {
      setLoading(true);
      const history = await adityaBirlaScraper.getScrapingHistory(10);
      setScrapingHistory(history);
    } catch (error) {
      console.error('Error loading scraping history:', error);
      toast.error('Failed to load scraping history');
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    try {
      setScraping(true);
      toast.info('Starting Aditya Birla data scraping...');

      const result = await adityaBirlaScraper.scrapeAllData();

      if (result.success) {
        toast.success(`Scraping completed! Processed ${result.schemesProcessed} schemes`);
      } else {
        toast.error(`Scraping completed with errors: ${result.errors.join(', ')}`);
      }

      // Reload history
      await loadScrapingHistory();
    } catch (error: any) {
      console.error('Scraping error:', error);
      toast.error(`Scraping failed: ${error.message}`);
    } finally {
      setScraping(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, dataType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      toast.info('Reading file...');

      const text = await file.text();
      const lines = text.split('\n');
      const preview = lines.slice(0, 10).join('\n');
      setUploadPreview(preview);

      toast.success('File loaded successfully! Click "Process Upload" to continue.');
      
    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error(`Failed to read file: ${error.message}`);
      setUploadPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (type: string) => {
    const templates: { [key: string]: string } = {
      'portfolio': 'Scheme Code,As Of Date,Stock Name,ISIN,Sector,Holding %,Quantity,Market Value\n119551,2025-10-01,Reliance Industries,INE002A01018,Energy,8.5,12500000,2756.25',
      'performance': 'Scheme Code,As Of Date,1M Return,3M Return,6M Return,1Y Return,3Y Return,5Y Return,Alpha,Beta,Sharpe\n119551,2025-10-01,2.5,5.8,12.3,18.5,45.2,85.3,2.1,0.95,1.8',
      'fund_manager': 'Name,Qualification,Experience Years,Joined Date,Specialization\nMahesh Patil,MBA Finance,15,2010-01-15,Equity Funds',
    };

    const content = templates[type] || '';
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aditya_birla_${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${type} template`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          AMC Data Management
        </h2>
        <p className="text-muted-foreground mt-1">
          Scrape or manually upload AMC-specific data (portfolio, performance, fund managers)
        </p>
      </div>

      <Tabs defaultValue="aditya-birla" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="aditya-birla">Aditya Birla</TabsTrigger>
          <TabsTrigger value="icici" disabled>ICICI (Coming Soon)</TabsTrigger>
          <TabsTrigger value="hdfc" disabled>HDFC (Coming Soon)</TabsTrigger>
        </TabsList>

        {/* Aditya Birla Tab */}
        <TabsContent value="aditya-birla" className="space-y-6">
          {/* Scraping Section */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Automated Scraping
              </CardTitle>
              <CardDescription>
                Automatically scrape portfolio holdings, performance data, and fund manager details from Aditya Birla website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info Box */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">📊 What Will Be Scraped</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Portfolio holdings (top 10 stocks per scheme)</li>
                  <li>✓ Performance metrics (returns, alpha, beta, Sharpe ratio)</li>
                  <li>✓ Sector allocation</li>
                  <li>✓ Asset allocation</li>
                  <li>✓ Fund manager details</li>
                </ul>
              </div>

              {/* Scrape Button */}
              <div className="flex gap-4">
                <Button
                  onClick={handleScrape}
                  disabled={scraping}
                  className="flex items-center gap-2"
                >
                  {scraping ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Start Scraping
                    </>
                  )}
                </Button>
              </div>

              {/* Last Scrape Status */}
              {scrapingHistory.length > 0 && (
                <div className="p-4 bg-muted border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Last Scrape Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`ml-2 font-medium ${
                        scrapingHistory[0].status === 'success' ? 'text-success' : 'text-destructive'
                      }`}>
                        {scrapingHistory[0].status}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Records:</span>
                      <span className="ml-2 font-medium text-foreground">
                        {scrapingHistory[0].records_processed}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="ml-2 font-medium text-foreground">
                        {new Date(scrapingHistory[0].started_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Upload Section */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Manual Upload
              </CardTitle>
              <CardDescription>
                Upload CSV files with portfolio, performance, or fund manager data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Portfolio Upload */}
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    Portfolio Holdings
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Top holdings, sector allocation
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => downloadTemplate('portfolio')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Template
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'portfolio')}
                      className="hidden"
                      id="portfolio-upload"
                    />
                    <label htmlFor="portfolio-upload" className="w-full">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        disabled={uploading}
                        onClick={() => document.getElementById('portfolio-upload')?.click()}
                        type="button"
                      >
                        <Upload className="h-3 w-3 mr-2" />
                        Upload
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Performance Upload */}
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Performance Data
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Returns, alpha, beta, ratios
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => downloadTemplate('performance')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Template
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'performance')}
                      className="hidden"
                      id="performance-upload"
                    />
                    <label htmlFor="performance-upload" className="w-full">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        disabled={uploading}
                        onClick={() => document.getElementById('performance-upload')?.click()}
                        type="button"
                      >
                        <Upload className="h-3 w-3 mr-2" />
                        Upload
                      </Button>
                    </label>
                  </div>
                </div>

                {/* Fund Manager Upload */}
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Fund Managers
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Manager details, experience
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => downloadTemplate('fund_manager')}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Template
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'fund_manager')}
                      className="hidden"
                      id="manager-upload"
                    />
                    <label htmlFor="manager-upload" className="w-full">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        disabled={uploading}
                        onClick={() => document.getElementById('manager-upload')?.click()}
                        type="button"
                      >
                        <Upload className="h-3 w-3 mr-2" />
                        Upload
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {uploadPreview && (
                <div className="p-4 bg-muted border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">File Preview</h4>
                  <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                    {uploadPreview}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scraping History */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Scraping History
              </CardTitle>
              <CardDescription>
                Last 10 scraping attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Records</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrapingHistory.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                            log.status === 'success' ? 'text-success' : 
                            log.status === 'failed' ? 'text-destructive' : 
                            'text-muted-foreground'
                          }`}>
                            {log.status === 'success' ? <CheckCircle className="h-4 w-4" /> :
                             log.status === 'failed' ? <XCircle className="h-4 w-4" /> :
                             <Clock className="h-4 w-4" />}
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">{log.records_processed}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(log.started_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-destructive">
                          {log.error_message || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
