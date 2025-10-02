// =====================================================
// UPLOAD HISTORY COMPONENT
// Shows history of quarterly AUM data uploads
// =====================================================

import { useEffect, useState } from 'react';
import { History, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { UploadHistory as UploadHistoryType } from '@/services/quarterly-aum/types';

export function UploadHistory() {
  const [history, setHistory] = useState<UploadHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('quarterly_aum_uploads')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setHistory((data || []) as UploadHistoryType[]);
    } catch (error) {
      console.error('Error fetching upload history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Upload History
        </CardTitle>
        <CardDescription>
          Recent uploads of quarterly AUM data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upload history yet
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    <div>
                      <div className="font-semibold">{record.quarter_label}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(record.quarter_end_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                  <div>
                    <div className="text-muted-foreground text-xs">Format</div>
                    <div className="font-medium capitalize">{record.data_format_version}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Categories</div>
                    <div className="font-medium">{record.total_categories || '-'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Total AUM</div>
                    <div className="font-medium">
                      {record.total_aum_crore 
                        ? `₹${record.total_aum_crore.toLocaleString('en-IN')} Cr`
                        : '-'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Uploaded</div>
                    <div className="font-medium">
                      {new Date(record.uploaded_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  </div>
                </div>

                {record.file_name && (
                  <div className="text-xs text-muted-foreground mt-2">
                    File: {record.file_name} ({record.file_size_kb} KB)
                  </div>
                )}

                {record.error_message && (
                  <div className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                    Error: {record.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
