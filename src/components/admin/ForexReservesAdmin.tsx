import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import EventsManagement from './EventsManagement';
import InsightsManagement from './InsightsManagement';
import ComparisonsManagement from './ComparisonsManagement';

interface Indicator {
  slug: string;
  name: string;
  description: string | null;
  definition: string | null;
  category: string | null;
  unit: string | null;
  frequency: string | null;
}

interface ForexReservesAdminProps {
  indicator: Indicator;
  onBack: () => void;
  onEditIndicator: () => void;
}

interface ForexReservesRow {
  week_ended: string;
  total_reserves_inr_crore: number;
  total_reserves_usd_mn: number;
  foreign_currency_assets_inr_crore: number;
  foreign_currency_assets_usd_mn: number;
  gold_inr_crore: number;
  gold_usd_mn: number;
  sdrs_inr_crore: number;
  sdrs_usd_mn: number;
  reserve_position_imf_inr_crore: number;
  reserve_position_imf_usd_mn: number;
}

export const ForexReservesAdmin: React.FC<ForexReservesAdminProps> = ({
  indicator,
  onBack,
  onEditIndicator
}) => {
  const [data, setData] = useState<ForexReservesRow[]>([]);
  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    total: number;
    processed: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    fetchIndicatorData();
  }, [indicator.slug]);

  const fetchIndicatorData = async () => {
    setLoading(true);
    try {
      // Fetch forex reserves data
      const { data: forexData, error: forexError } = await (supabase as any)
        .from('forex_reserves_weekly')
        .select('*')
        .order('week_ended', { ascending: false })
        .limit(100);

      if (forexError) throw forexError;
      setData((forexData || []) as ForexReservesRow[]);

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

      // Fetch comparisons
      const { data: comparisonsData } = await supabase
        .from('indicator_comparisons')
        .select('*')
        .eq('indicator_slug', indicator.slug);

      setEvents(eventsData || []);
      setInsights(insightsData || []);
      setComparisons(comparisonsData || []);
    } catch (error) {
      console.error('Error fetching forex data:', error);
      toast.error('Failed to load forex reserves data');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateUrl = '/templates/forex_reserves_template.csv';
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'forex_reserves_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Template downloaded successfully');
  };

  const parseExcelDate = (dateValue: any): string | null => {
    if (!dateValue) return null;
    
    // If it's already a string in DD-MMM-YYYY format
    if (typeof dateValue === 'string') {
      const dateRegex = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/;
      const match = dateValue.match(dateRegex);
      if (match) {
        const [, day, monthStr, year] = match;
        const monthMap: { [key: string]: string } = {
          'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
          'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
          'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
        };
        const month = monthMap[monthStr.toLowerCase()];
        if (month) {
          return `${year}-${month}-${day}`;
        }
      }
    }
    
    // If it's an Excel date number
    if (typeof dateValue === 'number') {
      const date = new Date((dateValue - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // Try to parse as regular date
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    return null;
  };

  // Parse numbers robustly from Excel values (handles commas, strings, numbers)
  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const cleaned = value.replace(/,/g, '').trim();
      if (cleaned === '' || cleaned.toLowerCase() === 'na' || cleaned === '-') return NaN;
      const num = Number(cleaned);
      return num;
    }
    return Number(value);
  };

  const validateRow = (row: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check if this is a FY-only row (ignore these)
    const weekEnded = row['Year / Week Ended'];
    if (typeof weekEnded === 'string' && weekEnded.match(/^\d{4}-\d{2}$/)) {
      return { isValid: false, errors: ['FY-only row - skipped'] };
    }
    
    // Validate date
    const parsedDate = parseExcelDate(weekEnded);
    if (!parsedDate) {
      errors.push('Invalid or missing date');
    }
    
    // Validate required numeric fields (ensure they can be parsed to numbers)
    const requiredFields = [
      'Total Reserves (INR Crore)',
      'Total Reserves (USD Million)',
      'Foreign Currency Assets (INR Crore)',
      'Foreign Currency Assets (USD Million)',
      'Gold (INR Crore)',
      'Gold (USD Million)',
      'SDRs (INR Crore)',
      'SDRs (USD Million)',
      'Reserve Position in the IMF (INR Crore)',
      'Reserve Position in the IMF (USD Million)'
    ];
    
    requiredFields.forEach(field => {
      const value = row[field];
      if (value === undefined || value === null || value === '') {
        errors.push(`Missing value for ${field}`);
      } else {
        const num = parseNumber(value);
        if (isNaN(num)) {
          errors.push(`Invalid numeric value for ${field}: ${value}`);
        }
      }
    });
    
    return { isValid: errors.length === 0, errors };
  };

  const processExcelFile = async (file: File) => {
    setUploading(true);
    setUploadStatus({ total: 0, processed: 0, errors: [] });
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setUploadStatus(prev => ({ ...prev!, total: jsonData.length }));
      
      const validRows: ForexReservesRow[] = [];
      const errors: string[] = [];
      
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        const { isValid, errors: rowErrors } = validateRow(row);
        
        if (!isValid) {
          if (!rowErrors.includes('FY-only row - skipped')) {
            errors.push(`Row ${i + 2}: ${rowErrors.join(', ')}`);
          }
          continue;
        }
        
        const parsedDate = parseExcelDate(row['Year / Week Ended']);
        if (!parsedDate) continue;
        
        const toNullable = (n: number) => (isNaN(n) ? null : n);
        const forexRow: ForexReservesRow = {
          week_ended: parsedDate,
          total_reserves_inr_crore: toNullable(parseNumber(row['Total Reserves (INR Crore)'])) as any,
          total_reserves_usd_mn: toNullable(parseNumber(row['Total Reserves (USD Million)'])) as any,
          foreign_currency_assets_inr_crore: toNullable(parseNumber(row['Foreign Currency Assets (INR Crore)'])) as any,
          foreign_currency_assets_usd_mn: toNullable(parseNumber(row['Foreign Currency Assets (USD Million)'])) as any,
          gold_inr_crore: toNullable(parseNumber(row['Gold (INR Crore)'])) as any,
          gold_usd_mn: toNullable(parseNumber(row['Gold (USD Million)'])) as any,
          sdrs_inr_crore: toNullable(parseNumber(row['SDRs (INR Crore)'])) as any,
          sdrs_usd_mn: toNullable(parseNumber(row['SDRs (USD Million)'])) as any,
          reserve_position_imf_inr_crore: toNullable(parseNumber(row['Reserve Position in the IMF (INR Crore)'])) as any,
          reserve_position_imf_usd_mn: toNullable(parseNumber(row['Reserve Position in the IMF (USD Million)'])) as any
        };
        
        validRows.push(forexRow);
      }
      
      // Upload to Supabase
      if (validRows.length > 0) {
        const { error } = await (supabase as any)
          .from('forex_reserves_weekly')
          .upsert(validRows, { 
            onConflict: 'week_ended',
            ignoreDuplicates: false 
          });
        
        if (error) {
          console.error('Supabase upsert error:', {
            message: (error as any).message,
            details: (error as any).details,
            hint: (error as any).hint,
            code: (error as any).code
          });
          throw error;
        }
        
        toast.success(`Successfully uploaded ${validRows.length} records`);
        await fetchIndicatorData();
      }
      
      setUploadStatus({
        total: jsonData.length,
        processed: validRows.length,
        errors
      });
      
    } catch (error) {
      const errObj = error as any;
      console.error('Error processing Excel file:', errObj?.message || errObj, errObj);
      toast.error(`Failed to process Excel file${errObj?.message ? `: ${errObj.message}` : ''}`);
      setUploadStatus(prev => ({
        ...prev!,
        errors: [...(prev?.errors || []), `Processing error: ${errObj?.message || errObj}`]
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    processExcelFile(file);
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

  const handleAddComparison = async (comparison: any) => {
    try {
      const { error } = await supabase
        .from('indicator_comparisons')
        .insert([{ ...comparison, indicator_slug: indicator.slug }]);

      if (error) throw error;
      toast.success('Comparison added successfully');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error adding comparison:', error);
      toast.error('Failed to add comparison');
    }
  };

  const handleDeleteComparison = async (index: number) => {
    try {
      const comparisonToDelete = comparisons[index];
      if (!comparisonToDelete) return;

      const { error } = await supabase
        .from('indicator_comparisons')
        .delete()
        .eq('id', (comparisonToDelete as any).id);

      if (error) throw error;
      toast.success('Comparison deleted successfully');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error deleting comparison:', error);
      toast.error('Failed to delete comparison');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading forex reserves data...</div>;
  };

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

      {/* Forex Reserves Management Tabs */}
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data">Data ({data.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({insights.length})</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons ({comparisons.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Data Upload
              </CardTitle>
              <CardDescription>
                Upload Excel file with forex reserves data. FY-only rows will be automatically ignored.
              </CardDescription>
            </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            
            <div className="flex-1">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          </div>
          
          {uploading && (
            <div className="text-sm text-muted-foreground">
              Processing Excel file...
            </div>
          )}
          
          {uploadStatus && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">
                  Processed {uploadStatus.processed} of {uploadStatus.total} rows
                </span>
              </div>
              
              {uploadStatus.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Issues found:</span>
                  </div>
                  <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
                    {uploadStatus.errors.slice(0, 10).map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                    {uploadStatus.errors.length > 10 && (
                      <div>... and {uploadStatus.errors.length - 10} more</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
            </CardContent>
          </Card>

          {/* Data Preview */}
          <Card>
        <CardHeader>
          <CardTitle>Recent Data ({data.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading data...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No data available. Upload an Excel file to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Week Ended</th>
                    <th className="text-right p-2">Total (USD Million)</th>
                    <th className="text-right p-2">FCA (USD Million)</th>
                    <th className="text-right p-2">Gold (USD Million)</th>
                    <th className="text-right p-2">SDRs (USD Million)</th>
                    <th className="text-right p-2">IMF (USD Million)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        {new Date(row.week_ended).toLocaleDateString()}
                      </td>
                      <td className="text-right p-2">
                        {row.total_reserves_usd_mn.toLocaleString()}
                      </td>
                      <td className="text-right p-2">
                        {row.foreign_currency_assets_usd_mn.toLocaleString()}
                      </td>
                      <td className="text-right p-2">
                        {row.gold_usd_mn.toLocaleString()}
                      </td>
                      <td className="text-right p-2">
                        {row.sdrs_usd_mn.toLocaleString()}
                      </td>
                      <td className="text-right p-2">
                        {row.reserve_position_imf_usd_mn.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Showing 10 of {data.length} records
                </div>
              )}
            </div>
          )}
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

        <TabsContent value="comparisons" className="space-y-4">
          <ComparisonsManagement
            comparisons={comparisons}
            onAddComparison={handleAddComparison}
            onDeleteComparison={handleDeleteComparison}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
