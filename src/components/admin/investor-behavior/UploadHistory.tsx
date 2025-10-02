// =====================================================
// INVESTOR BEHAVIOR UPLOAD HISTORY
// Shows history of data uploads
// =====================================================

import { useEffect, useState } from 'react';
import { History, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { UploadStatus } from '@/services/investor-behavior/types';

export function UploadHistory() {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  const fetchUploadHistory = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('investor_behavior_uploads')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUploads(data || []);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'outline'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Upload History
        </CardTitle>
        <CardDescription>
          Recent uploads of investor behavior data (last 10)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No uploads yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">{getStatusIcon(upload.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{upload.quarter_label}</span>
                    {getStatusBadge(upload.status)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-4">
                      <span>📅 {new Date(upload.quarter_end_date).toLocaleDateString('en-IN')}</span>
                      <span>📄 {upload.file_name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>📊 {upload.total_records} records</span>
                      <span>💰 ₹{upload.total_aum_crore?.toLocaleString('en-IN')} Cr</span>
                    </div>
                    <div className="text-xs">
                      Uploaded: {new Date(upload.uploaded_at).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
