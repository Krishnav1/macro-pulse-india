import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CPIDataManager } from './CPIDataManager';
import { CoreCPIUpload } from './CoreCPIUpload';
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

interface CPIInflationAdminProps {
  indicator: Indicator;
  onBack: () => void;
  onEditIndicator: () => void;
}

export const CPIInflationAdmin: React.FC<CPIInflationAdminProps> = ({
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
      // Fetch CPI series data from indicator_series for CPI
      const { data: cpiSeriesData } = await supabase
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

      // Fetch comparisons
      const { data: comparisonsData } = await supabase
        .from('indicator_comparisons')
        .select('*')
        .eq('indicator_slug', indicator.slug);

      setSeriesData(cpiSeriesData || []);
      setEvents(eventsData || []);
      setInsights(insightsData || []);
      setComparisons(comparisonsData || []);
    } catch (error) {
      console.error('Error fetching CPI data:', error);
      toast.error('Failed to load CPI data');
    } finally {
      setLoading(false);
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
    return <div className="text-center py-8">Loading CPI data...</div>;
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

      {/* CPI Management Tabs */}
      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data">Data ({seriesData.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({insights.length})</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons ({comparisons.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-4">
          {/* CPI Data Upload Options */}
          <Card>
            <CardHeader>
              <CardTitle>CPI Data Management</CardTitle>
              <CardDescription>
                Upload and manage CPI data using Excel files for comprehensive inflation analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cpi-data" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cpi-data">CPI Data Upload</TabsTrigger>
                  <TabsTrigger value="core-cpi">Core CPI Upload</TabsTrigger>
                </TabsList>

                <TabsContent value="cpi-data" className="mt-6">
                  <CPIDataManager onUploadComplete={fetchIndicatorData} />
                </TabsContent>

                <TabsContent value="core-cpi" className="mt-6">
                  <CoreCPIUpload />
                </TabsContent>
              </Tabs>

              {/* Current Data Display */}
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium">Current Data ({Math.min(seriesData.length, 10)} of {seriesData.length} entries shown)</h4>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {seriesData.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No CPI data entries yet. Upload data using the tabs above.
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {seriesData.slice(0, 10).map((entry: any, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-muted-foreground">{entry.period_date}</span>
                            <span className="font-semibold">{entry.value}</span>
                            {entry.period_label && (
                              <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                                {entry.period_label}
                              </span>
                            )}
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

export default CPIInflationAdmin;
