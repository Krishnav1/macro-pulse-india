import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Download, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EventsManagement from './EventsManagement';
import InsightsManagement from './InsightsManagement';
import ComparisonsManagement from './ComparisonsManagement';
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

interface IIPInflationAdminProps {
  indicator: Indicator;
  onBack: () => void;
  onEditIndicator: () => void;
}

export const IIPInflationAdmin: React.FC<IIPInflationAdminProps> = ({
  indicator,
  onBack,
  onEditIndicator
}) => {
  const [seriesData, setSeriesData] = useState([]);
  const [componentsData, setComponentsData] = useState([]);
  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIndicatorData();
  }, [indicator.slug]);

  const fetchIndicatorData = async () => {
    setLoading(true);
    console.log('Fetching IIP indicator data...');
    try {
      // Fetch IIP series data
      const { data: iipSeriesData, error: seriesError } = await supabase
        .from('iip_series' as any)
        .select('*')
        .order('date', { ascending: false })
        .limit(50);

      if (seriesError) {
        console.error('Error fetching IIP series:', seriesError);
      }

      // Fetch IIP components data
      const { data: iipComponentsData, error: componentsError } = await supabase
        .from('iip_components' as any)
        .select('*')
        .order('date', { ascending: false })
        .limit(50);

      if (componentsError) {
        console.error('Error fetching IIP components:', componentsError);
      }

      // Fetch IIP events (global for IIP)
      const { data: eventsData } = await supabase
        .from('iip_events' as any)
        .select('*')
        .order('date', { ascending: false });

      // Fetch IIP insights
      const { data: insightsData } = await supabase
        .from('iip_insights' as any)
        .select('*')
        .order('order_index');

      // Fetch comparisons
      const { data: comparisonsData } = await supabase
        .from('indicator_comparisons')
        .select('*')
        .eq('indicator_slug', indicator.slug);

      setSeriesData(iipSeriesData || []);
      setComponentsData(iipComponentsData || []);
      setEvents(eventsData || []);
      setInsights(insightsData || []);
      setComparisons(comparisonsData || []);
    } catch (error) {
      console.error('Error fetching IIP data:', error);
      toast.error('Failed to load IIP data');
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const headerMap: Record<string, { code: string; name: string; classification: 'sectoral' | 'use_based' } | null> = {
    'General Index': null, // handled separately for series
    '1.1 Mining': { code: 'mining', name: 'Mining', classification: 'sectoral' },
    '1.2 Manufacturing': { code: 'manufacturing', name: 'Manufacturing', classification: 'sectoral' },
    '1.3 Electricity': { code: 'electricity', name: 'Electricity', classification: 'sectoral' },
    '2.1 Primary Goods': { code: 'primary_goods', name: 'Primary Goods', classification: 'use_based' },
    '2.2 Capital Goods': { code: 'capital_goods', name: 'Capital Goods', classification: 'use_based' },
    '2.3 Intermediate Goods': { code: 'intermediate_goods', name: 'Intermediate Goods', classification: 'use_based' },
    '2.4 Infrastructure/Construction Goods': { code: 'infrastructure_construction', name: 'Infrastructure/Construction Goods', classification: 'use_based' },
    '2.5 Consumer Durables': { code: 'consumer_durables', name: 'Consumer Durables', classification: 'use_based' },
    '2.6 Consumer Non-Durables': { code: 'consumer_non_durables', name: 'Consumer Non-Durables', classification: 'use_based' },
  };

  const parseTemplateDate = (cell: string): string | null => {
    // Expected like "2025/06(JUN)" or "2024/12(DEC)"
    if (!cell) return null;
    const parts = cell.split('/')
    if (parts.length < 2) return null;
    const year = parts[0].trim();
    const monthPart = parts[1];
    const monthNum = monthPart.split('(')[0].trim();
    const m = monthNum.padStart(2, '0');
    const y = year;
    // Use first day of month
    return `${y}-${m}-01`;
  };

  const readFileAsSheet = (file: File): Promise<XLSX.WorkSheet> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const sheetName = wb.SheetNames[0];
          resolve(wb.Sheets[sheetName]);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const parseIipUpload = async (file: File, kind: 'growth' | 'index') => {
    const sheet = await readFileAsSheet(file);
    // Parse as rows (including blanks)
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, blankrows: false });
    if (!rows || rows.length < 3) throw new Error('Template must include header, weight row, and at least one data row');

    const headerRow = rows[0] as string[];
    const weightRow = rows[1] as (string | number)[];
    // Build column indices map
    const colIdx: Array<{ key: string; map: typeof headerMap[string] } | null> = headerRow.map((h) => {
      const key = String(h || '').trim();
      return { key, map: headerMap[key as keyof typeof headerMap] ?? null };
    });

    // Prepare upsert arrays
    const seriesUpserts: Array<{ date: string; index_value?: number | null; growth_yoy?: number | null }> = [];
    const componentsUpserts: Array<{ date: string; classification_type: 'sectoral' | 'use_based'; component_code: string; component_name: string; index_value?: number | null; growth_yoy?: number | null; weight?: number | null }> = [];

    // Build weights per component from weightRow
    const weightsByKey: Record<string, number> = {};
    for (let i = 1; i < headerRow.length; i++) {
      const key = String(headerRow[i] || '').trim();
      const w = Number(weightRow[i]);
      if (!isNaN(w)) weightsByKey[key] = w;
    }

    for (let r = 2; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;
      const dateCell = String(row[0] || '').trim();
      const date = parseTemplateDate(dateCell);
      if (!date) continue;

      // Series (General Index)
      const generalIdx = Number(row[1]);
      const seriesEntry: any = { date };
      if (!isNaN(generalIdx)) {
        if (kind === 'index') {
          seriesEntry.index_value = generalIdx;
          seriesEntry.growth_yoy = null; // Ensure growth_yoy is explicitly null for index uploads
        }
        if (kind === 'growth') {
          seriesEntry.growth_yoy = generalIdx;
          seriesEntry.index_value = 100; // Default base index value when uploading growth data
        }
      } else {
        // Skip rows with invalid general index
        continue;
      }
      seriesUpserts.push(seriesEntry);

      // Components
      for (let c = 2; c < headerRow.length; c++) {
        const headerKey = String(headerRow[c] || '').trim();
        const map = headerMap[headerKey as keyof typeof headerMap];
        if (!map) continue;
        const val = Number(row[c]);
        const weight = weightsByKey[headerKey];
        const comp: any = {
          date,
          classification_type: map.classification,
          component_code: map.code,
          component_name: map.name,
        };
        if (!isNaN(weight)) comp.weight = weight;
        if (!isNaN(val)) {
          if (kind === 'index') {
            comp.index_value = val;
            comp.growth_yoy = null;
          }
          if (kind === 'growth') {
            comp.growth_yoy = val;
            comp.index_value = 100; // Ensure NOT NULL for components during growth uploads
          }
        }
        componentsUpserts.push(comp);
      }
    }

    // Upsert to Supabase
    console.log('Attempting to upsert:', { seriesCount: seriesUpserts.length, componentsCount: componentsUpserts.length });
    
    if (seriesUpserts.length) {
      console.log('Series data sample:', seriesUpserts[0]);
      const { data: seriesResult, error: seriesError } = await supabase
        .from('iip_series' as any)
        .upsert(seriesUpserts, { onConflict: 'date' });
      
      if (seriesError) {
        console.error('Series upsert error:', seriesError);
        throw new Error(`Series insert failed: ${seriesError.message}`);
      }
      console.log('Series upsert successful:', seriesResult);
    }

    if (componentsUpserts.length) {
      console.log('Components data sample:', componentsUpserts[0]);
      const { data: componentsResult, error: componentsError } = await supabase
        .from('iip_components' as any)
        .upsert(componentsUpserts, { onConflict: 'date,classification_type,component_code' });
      
      if (componentsError) {
        console.error('Components upsert error:', componentsError);
        throw new Error(`Components insert failed: ${componentsError.message}`);
      }
      console.log('Components upsert successful:', componentsResult);
    }
  };

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'growth' | 'index') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setLoading(true);
      console.log(`Starting ${type} upload for file:`, file.name);
      toast.info(`Processing ${type} data upload...`);
      
      // Check authentication status
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.email || 'Not authenticated');
      
      if (!user) {
        toast.error('You must be logged in to upload data. Please authenticate first.');
        return;
      }
      
      await parseIipUpload(file, type);
      toast.success(`${type === 'index' ? 'Index' : 'Growth'} data uploaded successfully! Database updated.`);
      console.log('Upload completed, refreshing data...');
      await fetchIndicatorData();
    } catch (err: any) {
      console.error('IIP upload failed:', err);
      toast.error(`Failed to upload ${type} data: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      // reset input value so same file can be selected again
      if (event.target) event.target.value = '';
    }
  };

  // Events: UI props expect { date, description, impact } and delete by index
  const handleAddEvent = async (event: { date: string; description: string; impact: 'low' | 'medium' | 'high' }) => {
    try {
      const { error } = await supabase
        .from('iip_events' as any)
        .insert([{ date: event.date, description: event.description, impact: event.impact, title: 'Event' }]);

      if (error) throw error;
      toast.success('Event added successfully! Database updated.');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (index: number) => {
    try {
      const id = (events as any[])[index]?.id;
      if (!id) {
        // fallback: remove locally if id missing
        setEvents((prev) => prev.filter((_, i) => i !== index));
        toast.success('Event removed locally.');
        return;
      }
      const { error } = await supabase
        .from('iip_events' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Event deleted successfully! Database updated.');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  // Insights: UI expects { content, order_index } and delete by index
  const handleAddInsight = async (insight: { content: string; order_index: number }) => {
    try {
      const { error } = await supabase
        .from('iip_insights' as any)
        .insert([{ section: 'overview', title: 'Insight', text: insight.content, order_index: insight.order_index }]);

      if (error) throw error;
      toast.success('Insight added successfully! Database updated.');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error adding insight:', error);
      toast.error('Failed to add insight');
    }
  };

  const handleDeleteInsight = async (index: number) => {
    try {
      const id = (insights as any[])[index]?.id;
      if (!id) {
        setInsights((prev) => prev.filter((_, i) => i !== index));
        toast.success('Insight removed locally.');
        return;
      }
      const { error } = await supabase
        .from('iip_insights' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Insight deleted successfully! Database updated.');
      fetchIndicatorData();
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast.error('Failed to delete insight');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Indicators
              </Button>
              <div>
                <CardTitle>{indicator.name}</CardTitle>
                <CardDescription>{indicator.description}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEditIndicator}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Indicator
            </Button>
          </div>
          {indicator.definition && (
            <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted/50 rounded-lg">
              <strong>Definition:</strong> {indicator.definition}
            </p>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data">Data Upload</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Upload and manage IIP data files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Index Data Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="index-upload" className="text-base font-medium">
                      Index Data Upload
                    </Label>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/templates/iip_index_template.csv" download>
                        <Download className="h-4 w-4 mr-2" />
                        Template
                      </a>
                    </Button>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <Input
                      id="index-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => handleExcelUpload(e, 'index')}
                      className="hidden"
                      disabled={loading}
                    />
                    <Label htmlFor="index-upload" className="cursor-pointer">
                      <div className="text-sm text-gray-600">
                        Click to upload Index data or drag and drop
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        CSV, XLSX files supported
                      </div>
                    </Label>
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Recent data:</strong> {seriesData.length > 0 ? `${seriesData.length} records` : 'No data uploaded'}
                  </div>
                </div>

                {/* Growth Data Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="growth-upload" className="text-base font-medium">
                      Growth Data Upload
                    </Label>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/templates/iip_growth_template.csv" download>
                        <Download className="h-4 w-4 mr-2" />
                        Template
                      </a>
                    </Button>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <Input
                      id="growth-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => handleExcelUpload(e, 'growth')}
                      className="hidden"
                      disabled={loading}
                    />
                    <Label htmlFor="growth-upload" className="cursor-pointer">
                      <div className="text-sm text-gray-600">
                        Click to upload Growth data or drag and drop
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        CSV, XLSX files supported
                      </div>
                    </Label>
                  </div>
                  <div className="text-xs text-gray-500">
                    <strong>Recent data:</strong> {seriesData.length > 0 ? `${seriesData.length} records` : 'No data uploaded'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Recent 10 entries from Supabase to verify uploads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Series Data Preview */}
                <div>
                  <h4 className="font-medium mb-2">IIP Series Data</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                        <div>Date</div>
                        <div>Index Value</div>
                        <div>Growth YoY</div>
                        <div>Base Year</div>
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {seriesData.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          No series data found. Upload data to see entries here.
                        </div>
                      ) : (
                        seriesData.slice(0, 10).map((item: any, index) => (
                          <div key={index} className="px-4 py-2 border-b last:border-b-0">
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>{item.date}</div>
                              <div>{item.index_value || 'N/A'}</div>
                              <div>{item.growth_yoy ? `${item.growth_yoy}%` : 'N/A'}</div>
                              <div>{item.base_year || '2011-12=100'}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Components Data Preview */}
                <div>
                  <h4 className="font-medium mb-2">IIP Components Data (Sample)</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <div className="grid grid-cols-5 gap-4 text-sm font-medium">
                        <div>Date</div>
                        <div>Component</div>
                        <div>Classification</div>
                        <div>Index Value</div>
                        <div>Growth YoY</div>
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {componentsData.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          No components data found. Upload data to see entries here.
                        </div>
                      ) : (
                        componentsData.slice(0, 10).map((item: any, index) => (
                          <div key={index} className="px-4 py-2 border-b last:border-b-0">
                            <div className="grid grid-cols-5 gap-4 text-sm">
                              <div>{item.date}</div>
                              <div>{item.component_name}</div>
                              <div>{item.classification_type}</div>
                              <div>{item.index_value || 'N/A'}</div>
                              <div>{item.growth_yoy ? `${item.growth_yoy}%` : 'N/A'}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        <TabsContent value="events">
          <EventsManagement
            events={events as any}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsManagement
            insights={insights as any}
            onAddInsight={handleAddInsight}
            onDeleteInsight={handleDeleteInsight}
            isLoading={loading}
          />
        </TabsContent>

        <TabsContent value="comparisons">
          <ComparisonsManagement
            comparisons={comparisons as any}
            onAddComparison={async (c) => {
              try {
                const { error } = await supabase
                  .from('indicator_comparisons' as any)
                  .insert([{ indicator_slug: indicator.slug, compare_indicator_slug: c.compare_indicator_slug, display_name: c.display_name }]);
                if (error) throw error;
                toast.success('Comparison added');
                fetchIndicatorData();
              } catch (e) {
                console.error(e);
                toast.error('Failed to add comparison');
              }
            }}
            onDeleteComparison={async (index) => {
              try {
                const id = (comparisons as any[])[index]?.id;
                if (!id) {
                  setComparisons((prev) => prev.filter((_, i) => i !== index));
                  toast.success('Comparison removed locally');
                  return;
                }
                const { error } = await supabase
                  .from('indicator_comparisons' as any)
                  .delete()
                  .eq('id', id);
                if (error) throw error;
                toast.success('Comparison removed');
                fetchIndicatorData();
              } catch (e) {
                console.error(e);
                toast.error('Failed to remove comparison');
              }
            }}
            isLoading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
