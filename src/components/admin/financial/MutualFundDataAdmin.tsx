// Mutual Fund Data Admin Component
// Manages AMFI data sync and manual uploads

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Download, Upload, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { amfiSyncService } from '@/services/amfi/AMFISyncService';
import { toast } from 'sonner';

export default function MutualFundDataAdmin() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<any>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      setLoading(true);
      const status = await amfiSyncService.getLatestSyncStatus();
      const history = await amfiSyncService.getSyncHistory(10);
      
      setLastSync(status);
      setSyncHistory(history);
    } catch (error) {
      console.error('Error loading sync status:', error);
      toast.error('Failed to load sync status');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      toast.info('Starting AMFI data sync...');

      const result = await amfiSyncService.syncAMFIData();

      if (result.success) {
        toast.success(`Sync completed! Processed ${result.schemesProcessed} schemes from ${result.amcsProcessed} AMCs`);
      } else {
        toast.error(`Sync completed with errors: ${result.errors.join(', ')}`);
      }

      // Reload status
      await loadSyncStatus();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const downloadTemplate = (type: string) => {
    const templates: { [key: string]: string } = {
      'scheme_master': 'Scheme Code,AMC Name,Fund Manager,Launch Date,Expense Ratio,Min Investment,Min SIP,Benchmark,Risk Grade,Exit Load\n103176,SBI Mutual Fund,R. Srinivasan,2006-02-15,1.45,5000,500,Nifty 50 TRI,Moderately High,1% if redeemed within 1 year',
      'monthly_aum': 'Scheme Code,Date,AUM (Cr),Total Folios,SIP Accounts\n103176,2025-09-30,32450,1250000,820000',
      'portfolio': 'Scheme Code,Date,Stock Name,ISIN,Sector,Holding %,Quantity,Market Value (Cr)\n103176,2025-09-30,Reliance Industries,INE002A01018,Energy,8.5,12500000,2756.25',
    };

    const content = templates[type] || '';
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded ${type} template`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
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
        <h2 className="text-2xl font-bold text-foreground">Mutual Fund Data Management</h2>
        <p className="text-muted-foreground mt-1">
          Sync daily NAV data from AMFI India and manage mutual fund information
        </p>
      </div>

      <Tabs defaultValue="amfi-sync" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="amfi-sync">AMFI Daily Sync</TabsTrigger>
          <TabsTrigger value="manual-upload">Manual Upload</TabsTrigger>
          <TabsTrigger value="sync-history">Sync History</TabsTrigger>
        </TabsList>

        {/* AMFI Daily Sync Tab */}
        <TabsContent value="amfi-sync" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                AMFI Daily NAV Synchronization
              </CardTitle>
              <CardDescription>
                Automatically fetch and update NAV data from AMFI India's official source
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Source Info */}
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">📊 Data Source</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Official Source:</strong> AMFI India (Association of Mutual Funds in India)
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>URL:</strong>{' '}
                  <a 
                    href="https://portal.amfiindia.com/spages/NAVAll.txt" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    portal.amfiindia.com/spages/NAVAll.txt
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Update Frequency:</strong> Daily (Updated by AMFI after market close)
                </p>
              </div>

              {/* Last Sync Status */}
              {lastSync && (
                <div className="p-4 bg-card border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Last Sync Status</h4>
                    {getStatusIcon(lastSync.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Date & Time</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(lastSync.started_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium text-foreground capitalize">{lastSync.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Records Processed</p>
                      <p className="text-sm font-medium text-foreground">
                        {lastSync.records_processed.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium text-foreground">
                        {lastSync.completed_at 
                          ? `${((new Date(lastSync.completed_at).getTime() - new Date(lastSync.started_at).getTime()) / 1000).toFixed(1)}s`
                          : 'In progress...'}
                      </p>
                    </div>
                  </div>

                  {lastSync.error_message && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{lastSync.error_message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Sync Actions */}
              <div className="flex gap-4">
                <Button 
                  onClick={handleSync} 
                  disabled={syncing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>

                <Button variant="outline" disabled>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Daily (6:30 PM)
                </Button>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">ℹ️ What gets synced?</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ All mutual fund schemes (~10,000+)</li>
                  <li>✓ AMC (Asset Management Company) details</li>
                  <li>✓ Daily NAV (Net Asset Value) for all schemes</li>
                  <li>✓ Scheme categorization (Equity, Debt, Hybrid, etc.)</li>
                  <li>✓ ISIN codes for tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Upload Tab */}
        <TabsContent value="manual-upload" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scheme Master Data */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-base">Scheme Master Data</CardTitle>
                <CardDescription className="text-xs">
                  Fund manager, expense ratio, benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadTemplate('scheme_master')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <p className="text-xs text-muted-foreground">
                  Update frequency: As needed
                </p>
              </CardContent>
            </Card>

            {/* Monthly AUM Data */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-base">Monthly AUM Data</CardTitle>
                <CardDescription className="text-xs">
                  Assets under management, folios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadTemplate('monthly_aum')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <p className="text-xs text-muted-foreground">
                  Update frequency: Monthly
                </p>
              </CardContent>
            </Card>

            {/* Portfolio Holdings */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-base">Portfolio Holdings</CardTitle>
                <CardDescription className="text-xs">
                  Stock holdings, sector allocation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => downloadTemplate('portfolio')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <p className="text-xs text-muted-foreground">
                  Update frequency: Monthly
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upload Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Upload Instructions:</strong> Download the template, fill in your data, and upload the completed file. 
              Supported formats: CSV, Excel (.xlsx). Manual upload functionality coming soon!
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Sync History Tab */}
        <TabsContent value="sync-history" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Recent Sync History</CardTitle>
              <CardDescription>Last 10 synchronization attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Date & Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Records</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-muted-foreground">Duration</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-muted-foreground">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncHistory.map((sync) => (
                      <tr key={sync.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-foreground">
                          {new Date(sync.started_at).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(sync.status)}
                            <span className="text-sm capitalize">{sync.status}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-medium">
                          {sync.records_processed.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                          {sync.completed_at 
                            ? `${((new Date(sync.completed_at).getTime() - new Date(sync.started_at).getTime()) / 1000).toFixed(1)}s`
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {sync.error_message || 'Success'}
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
