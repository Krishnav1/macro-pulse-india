// NSE Data Sync Admin Component

import { useState } from 'react';
import { RefreshCw, Database, CheckCircle, XCircle, Clock } from 'lucide-react';
import { NSESyncService } from '@/services/equity/nseSyncService';
import { useToast } from '@/hooks/use-toast';

export function NSEDataSyncAdmin() {
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFullSync = async () => {
    setSyncing(true);
    setSyncResults([]);
    
    try {
      const result = await NSESyncService.fullSync();
      setSyncResults(result.results);
      
      if (result.success) {
        toast({
          title: 'Sync Successful',
          description: `All data synced successfully`,
        });
      } else {
        toast({
          title: 'Partial Sync',
          description: 'Some sync operations failed. Check results below.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleIndicesSync = async () => {
    setSyncing(true);
    try {
      // Sync indices first
      const result = await NSESyncService.syncIndices();
      if (result.success) {
        toast({
          title: 'Indices Synced',
          description: `${result.count} indices updated. Syncing constituents for all indices...`,
        });
        
        // Auto-sync constituents for ALL major indices
        const allIndices = [
          'NIFTY 50', 'NIFTY BANK', 'NIFTY IT', 'NIFTY AUTO', 'NIFTY PHARMA',
          'NIFTY FMCG', 'NIFTY METAL', 'NIFTY ENERGY', 'NIFTY REALTY',
          'NIFTY FINANCIAL SERVICES', 'NIFTY MEDIA', 'NIFTY PSU BANK',
          'NIFTY MIDCAP 50', 'NIFTY SMALLCAP 50', 'NIFTY NEXT 50'
        ];
        
        let successCount = 0;
        for (const index of allIndices) {
          try {
            const constResult = await NSESyncService.syncIndexConstituents(index);
            if (constResult.success) {
              successCount++;
              console.log(`✅ ${index}: ${constResult.count} stocks synced`);
            }
          } catch (err) {
            console.error(`❌ Failed to sync ${index}:`, err);
          }
        }
        
        toast({
          title: 'Sync Complete',
          description: `${result.count} indices + constituents from ${successCount} indices synced`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkDealsSync = async () => {
    setSyncing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await NSESyncService.syncBulkDeals(today, today);
      if (result.success) {
        toast({
          title: 'Bulk Deals Synced',
          description: `${result.count} deals updated`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleBlockDealsSync = async () => {
    setSyncing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await NSESyncService.syncBlockDeals(today, today);
      if (result.success) {
        toast({
          title: 'Block Deals Synced',
          description: `${result.count} deals updated`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleFIIDIISync = async () => {
    setSyncing(true);
    try {
      const result = await NSESyncService.syncFIIDII();
      if (result.success) {
        toast({
          title: 'FII/DII Data Synced',
          description: `${result.count} records updated`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">NSE Data Sync</h2>
        <p className="text-muted-foreground">
          Sync market data from NSE. Data is fetched via Supabase Edge Function to bypass CORS.
        </p>
      </div>

      {/* Full Sync */}
      <div className="dashboard-card bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Full Sync</h3>
            <p className="text-sm text-muted-foreground">
              Sync all data types: indices, constituents, bulk deals, block deals, and FII/DII activity
            </p>
          </div>
          <button
            onClick={handleFullSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Full Sync'}
          </button>
        </div>

        {/* Sync Results */}
        {syncResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Sync Results:</h4>
            {syncResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.success ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="text-sm font-medium text-foreground">{result.type}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.success ? `${result.count} records` : result.error}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Sync Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Indices Sync */}
        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Indices</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sync all NSE indices (NIFTY 50, BANK NIFTY, etc.)
          </p>
          <button
            onClick={handleIndicesSync}
            disabled={syncing}
            className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50"
          >
            Sync Indices
          </button>
        </div>

        {/* Bulk Deals Sync */}
        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Database className="h-5 w-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Bulk Deals</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sync today's bulk deals (updated after 6 PM)
          </p>
          <button
            onClick={handleBulkDealsSync}
            disabled={syncing}
            className="w-full px-4 py-2 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-colors disabled:opacity-50"
          >
            Sync Bulk Deals
          </button>
        </div>

        {/* Block Deals Sync */}
        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Database className="h-5 w-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Block Deals</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sync today's block deals (updated after 6 PM)
          </p>
          <button
            onClick={handleBlockDealsSync}
            disabled={syncing}
            className="w-full px-4 py-2 bg-warning/10 hover:bg-warning/20 text-warning rounded-lg transition-colors disabled:opacity-50"
          >
            Sync Block Deals
          </button>
        </div>

        {/* FII/DII Sync */}
        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Database className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">FII/DII Activity</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Sync institutional flow data (updated after 6 PM)
          </p>
          <button
            onClick={handleFIIDIISync}
            disabled={syncing}
            className="w-full px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors disabled:opacity-50"
          >
            Sync FII/DII
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="dashboard-card bg-primary/10 border-primary/20">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-medium mb-2">Sync Schedule:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong>Indices:</strong> Every 15 minutes during market hours (9:15 AM - 3:30 PM)</li>
              <li><strong>Bulk/Block Deals:</strong> Daily after 6:00 PM (published by NSE)</li>
              <li><strong>FII/DII Data:</strong> Daily after 6:00 PM (published by NSE)</li>
              <li><strong>Full Sync:</strong> Run once daily at 6:30 PM for all data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
