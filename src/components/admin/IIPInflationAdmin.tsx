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
  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIndicatorData();
  }, [indicator.slug]);

  const fetchIndicatorData = async () => {
    setLoading(true);
    try {
      // Fetch IIP series data
      const { data: iipSeriesData } = await supabase
        .from('iip_series' as any)
        .select('*')
        .order('date', { ascending: false })
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

      // Fetch comparisons
      const { data: comparisonsData } = await supabase
        .from('indicator_comparisons')
        .select('*')
        .eq('indicator_slug', indicator.slug);

      setSeriesData(iipSeriesData || []);
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

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'growth' | 'index') => {
    const file = event.target.files?.[0];
    if (file) {
      toast.info(`Excel upload for ${type} data will be implemented`);
      // TODO: Implement Excel parsing and upload
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

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Data Upload</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Excel Upload Templates</CardTitle>
              <CardDescription>
                Download templates and upload your IIP data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>IIP Growth Data</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open('/templates/iip_growth_template.csv', '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => handleExcelUpload(e, 'growth')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Data
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>IIP Index Data</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open('/templates/iip_index_template.csv', '_blank')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={(e) => handleExcelUpload(e, 'index')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <EventsManagement
            indicatorSlug={indicator.slug}
            events={events}
            onEventsChange={fetchIndicatorData}
          />
        </TabsContent>

        <TabsContent value="insights">
          <InsightsManagement
            indicatorSlug={indicator.slug}
            insights={insights}
            onInsightsChange={fetchIndicatorData}
          />
        </TabsContent>

        <TabsContent value="comparisons">
          <ComparisonsManagement
            indicatorSlug={indicator.slug}
            comparisons={comparisons}
            onComparisonsChange={fetchIndicatorData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
