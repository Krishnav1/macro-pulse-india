import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Upload, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EventsManagement from './EventsManagement';
import InsightsManagement from './InsightsManagement';
import * as XLSX from 'xlsx';

interface Indicator {
  slug: string;
  name: string;
  description: string | null;
  definition: string | null;
  category: string | null;
  unit: string | null;
  frequency: string | null;
}

interface ExchangeRateAdminProps {
  indicator: Indicator;
  onBack: () => void;
  onEditIndicator: () => void;
}

export const ExchangeRateAdmin: React.FC<ExchangeRateAdminProps> = ({
  indicator,
  onBack,
  onEditIndicator
}) => {
  const [seriesData, setSeriesData] = useState([]);
  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchIndicatorData();
  }, [indicator.slug]);

  const fetchIndicatorData = async () => {
    setLoading(true);
    try {
      // Fetch exchange rate series data
      const { data: exchangeData } = await supabase
        .from('indicator_series')
        .select('*')
        .eq('indicator_slug', indicator.slug)
        .order('period_date', { ascending: false })
        .limit(50);

      // Fetch events
      const { data: eventsData } = await supabase
        .from('indicator_events')
        .select('*')
        .eq('indicator_slug', indicator.slug)
        .order('date', { ascending: false });

      // Fetch insights
      const { data: insightsData } = await supabase
        .from('indicator_insights')
        .select('*')
        .eq('indicator_slug', indicator.slug)
        .order('order_index');

      setSeriesData(exchangeData || []);
      setEvents(eventsData || []);
      setInsights(insightsData || []);
    } catch (error) {
      console.error('Error fetching exchange rate data:', error);
      toast.error('Failed to load exchange rate data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Parse and validate data
          const parsedData = parseExchangeRateData(jsonData);
          setPreviewData(parsedData);
          setShowPreview(true);
        } catch (error) {
          console.error('Error parsing file:', error);
          toast.error('Failed to parse file. Please check the format.');
        } finally {
          setUploading(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
      setUploading(false);
    }
  };

  const parseExchangeRateData = (jsonData: any[]) => {
    const parsed: any[] = [];

    jsonData.forEach((row: any) => {
      const month = row['Month'] || row['month'];
      
      // Skip if month is not a string or is empty
      if (!month || typeof month !== 'string' || month.trim() === '') {
        return;
      }

      // Parse each currency
      ['EUR', 'GBP', 'JPY', 'USD'].forEach((currency) => {
        const value = row[currency];
        if (value !== undefined && value !== null && value !== '') {
          try {
            // Convert month format (Aug-25) to date (2025-08-01)
            const periodDate = convertMonthToDate(month);
            
            parsed.push({
              period_date: periodDate,
              period_label: month,
              series_code: currency,
              value: parseFloat(String(value).replace(/,/g, '')),
              currency: currency
            });
          } catch (error) {
            console.warn(`Skipping row with invalid month format: ${month}`);
          }
        }
      });
    });

    return parsed;
  };

  const convertMonthToDate = (monthStr: string): string => {
    // Convert "Aug-25" to "2025-08-01"
    if (!monthStr || typeof monthStr !== 'string') {
      throw new Error('Invalid month string');
    }
    
    const parts = monthStr.trim().split('-');
    if (parts.length !== 2) {
      throw new Error('Invalid month format');
    }
    
    const [monthAbbr, yearShort] = parts;
    const monthMap: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const month = monthMap[monthAbbr] || '01';
    const year = yearShort.length === 2 ? `20${yearShort}` : yearShort;
    
    return `${year}-${month}-01`;
  };

  const handleConfirmUpload = async () => {
    try {
      setUploading(true);

      // Delete existing data for the same indicator
      const { error: deleteError } = await supabase
        .from('indicator_series')
        .delete()
        .eq('indicator_slug', indicator.slug);

      if (deleteError) throw deleteError;

      // Upsert new data in batches (insert or update if exists)
      const batchSize = 1000;
      for (let i = 0; i < previewData.length; i += batchSize) {
        const batch = previewData.slice(i, i + batchSize).map(item => ({
          indicator_slug: indicator.slug,
          period_date: item.period_date,
          period_label: item.period_label,
          series_code: item.series_code,
          value: item.value
        }));

        const { error: upsertError } = await supabase
          .from('indicator_series')
          .upsert(batch, {
            onConflict: 'indicator_slug,period_date,series_code'
          });

        if (upsertError) throw upsertError;
      }

      toast.success(`Successfully uploaded ${previewData.length} exchange rate records`);
      setShowPreview(false);
      setPreviewData([]);
      fetchIndicatorData();
    } catch (error) {
      console.error('Error uploading data:', error);
      toast.error('Failed to upload data');
    } finally {
      setUploading(false);
    }
  };

  const handleAddEvent = async (event: any) => {
    try {
      const { error } = await supabase
        .from('indicator_events')
        .insert([{ ...event, indicator_slug: indicator.slug }]);

      if (error) throw error;
      toast.success('Event added successfully');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (index: number) => {
    try {
      const eventToDelete = events[index];
      if (!eventToDelete) return;

      const { error } = await supabase
        .from('indicator_events')
        .delete()
        .eq('id', (eventToDelete as any).id);

      if (error) throw error;
      toast.success('Event deleted successfully');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleAddInsight = async (insight: any) => {
    try {
      const { error } = await supabase
        .from('indicator_insights')
        .insert([{ ...insight, indicator_slug: indicator.slug }]);

      if (error) throw error;
      toast.success('Insight added successfully');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error adding insight:', error);
      toast.error('Failed to add insight');
    }
  };

  const handleDeleteInsight = async (index: number) => {
    try {
      const insightToDelete = insights[index];
      if (!insightToDelete) return;

      const { error } = await supabase
        .from('indicator_insights')
        .delete()
        .eq('id', (insightToDelete as any).id);

      if (error) throw error;
      toast.success('Insight deleted successfully');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast.error('Failed to delete insight');
    }
  };

  const downloadTemplate = () => {
    const template = [
      { Month: 'Aug-25', EUR: 101.7976, GBP: 117.5731, JPY: 0.5929, USD: 87.5184 },
      { Month: 'Jul-25', EUR: 100.6400, GBP: 116.3466, JPY: 0.5865, USD: 86.1146 },
      { Month: 'Jun-25', EUR: 98.9201, GBP: 116.4260, JPY: 0.5947, USD: 85.9034 }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Exchange Rates');
    XLSX.writeFile(wb, 'inr_exchange_rate_template.xlsx');
  };

  if (loading) {
    return <div className="text-center py-8">Loading exchange rate data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onEditIndicator}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Indicator
        </Button>
      </div>

      {/* Indicator Info */}
      <Card>
        <CardHeader>
          <CardTitle>{indicator.name}</CardTitle>
          <CardDescription>
            {indicator.slug} • {indicator.category || 'Uncategorized'}
            {indicator.unit && ` • ${indicator.unit}`}
            {indicator.frequency && ` • ${indicator.frequency}`}
          </CardDescription>
          {indicator.definition && (
            <p className="text-sm text-muted-foreground mt-2">
              {indicator.definition}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Exchange Rate Management Tabs */}
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data">Data ({seriesData.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({insights.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exchange Rate Data Upload</CardTitle>
              <CardDescription>
                Upload INR exchange rate data in Excel format. Template columns: Month, EUR, GBP, JPY, USD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Download Template Button */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="default" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Excel File
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Preview Section */}
              {showPreview && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Preview ({previewData.length} records)
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPreview(false);
                          setPreviewData([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleConfirmUpload}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Confirm Upload'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <div className="space-y-1 p-2">
                      {previewData.slice(0, 10).map((entry: any, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-muted-foreground">{entry.period_label}</span>
                            <span className="font-semibold">{entry.currency}</span>
                            <span className="text-sm">₹{entry.value.toFixed(4)}</span>
                          </div>
                        </div>
                      ))}
                      {previewData.length > 10 && (
                        <div className="text-center text-sm text-muted-foreground p-2">
                          ... and {previewData.length - 10} more records
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Current Data Display */}
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium">
                  Current Data ({Math.min(seriesData.length, 10)} of {seriesData.length} entries shown)
                </h4>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {seriesData.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No exchange rate data yet. Upload data using the button above.
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {seriesData.slice(0, 10).map((entry: any, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-muted-foreground">{entry.period_label}</span>
                            <span className="font-semibold">{entry.series_code}</span>
                            <span className="text-sm">₹{entry.value.toFixed(4)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <EventsManagement
            events={events}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <InsightsManagement
            insights={insights}
            onAddInsight={handleAddInsight}
            onDeleteInsight={handleDeleteInsight}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExchangeRateAdmin;
