import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EventsManagement from '../EventsManagement';
import InsightsManagement from '../InsightsManagement';
import {
  GdpAdminProps,
  GdpValueRow,
  GdpGrowthRow,
  GdpAnnualValueRow,
  GdpAnnualGrowthRow,
  UploadStatus
} from './GdpAdminTypes';
import { GdpUploadTabs } from './GdpUploadTabs';
import { GdpDataPreview } from './GdpDataPreview';

export const GdpAdmin: React.FC<GdpAdminProps> = ({
  indicator,
  onBack,
  onEditIndicator
}) => {
  const [valueData, setValueData] = useState<GdpValueRow[]>([]);
  const [growthData, setGrowthData] = useState<GdpGrowthRow[]>([]);
  const [annualValueData, setAnnualValueData] = useState<GdpAnnualValueRow[]>([]);
  const [annualGrowthData, setAnnualGrowthData] = useState<GdpAnnualGrowthRow[]>([]);
  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);

  useEffect(() => {
    fetchGdpData();
  }, []);

  const fetchGdpData = async () => {
    setLoading(true);
    try {
      const [valueResult, growthResult, annualValueResult, annualGrowthResult, eventsResult, insightsResult] = await Promise.all([
        (supabase as any).from('gdp_value').select('*').order('year', { ascending: false }).order('quarter', { ascending: false }).limit(20),
        (supabase as any).from('gdp_growth').select('*').order('year', { ascending: false }).order('quarter', { ascending: false }).limit(20),
        (supabase as any).from('gdp_annual').select('*').order('year', { ascending: false }).limit(20),
        (supabase as any).from('gdp_annual_growth').select('*').order('year', { ascending: false }).limit(20),
        (supabase as any).from('indicator_events').select('*').eq('indicator_slug', 'real_gdp_growth').order('date', { ascending: false }),
        (supabase as any).from('indicator_insights').select('*').eq('indicator_slug', 'real_gdp_growth').order('order_index')
      ]);

      if (valueResult.error) throw valueResult.error;
      if (growthResult.error) throw growthResult.error;
      if (annualValueResult.error) throw annualValueResult.error;
      if (annualGrowthResult.error) throw annualGrowthResult.error;
      if (eventsResult.error) throw eventsResult.error;
      if (insightsResult.error) throw insightsResult.error;

      setValueData((valueResult.data || []) as GdpValueRow[]);
      setGrowthData((growthResult.data || []) as GdpGrowthRow[]);
      setAnnualValueData((annualValueResult.data || []) as GdpAnnualValueRow[]);
      setAnnualGrowthData((annualGrowthResult.data || []) as GdpAnnualGrowthRow[]);
      setEvents(eventsResult.data || []);
      setInsights(insightsResult.data || []);
    } catch (error) {
      console.error('Error fetching GDP data:', error);
      toast.error('Failed to load GDP data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (event: any) => {
    try {
      const { error } = await supabase
        .from('indicator_events')
        .insert([{ ...event, indicator_slug: 'real_gdp_growth' }]);

      if (error) throw error;
      toast.success('Event added successfully');
      fetchGdpData();
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
      fetchGdpData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleAddInsight = async (insight: any) => {
    try {
      const { error } = await supabase
        .from('indicator_insights')
        .insert([{ ...insight, indicator_slug: 'real_gdp_growth' }]);

      if (error) throw error;
      toast.success('Insight added successfully');
      fetchGdpData();
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
      fetchGdpData();
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast.error('Failed to delete insight');
    }
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
            {indicator.slug} • Quarterly GDP data from Ministry of Statistics and Programme Implementation
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="data" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="insights">Insights ({insights.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="data" className="space-y-6">
          <GdpUploadTabs
            uploading={uploading}
            uploadStatus={uploadStatus}
            setUploading={setUploading}
            setUploadStatus={setUploadStatus}
            fetchGdpData={fetchGdpData}
          />

          <GdpDataPreview
            valueData={valueData}
            growthData={growthData}
            annualValueData={annualValueData}
            annualGrowthData={annualGrowthData}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="events">
          <EventsManagement
            events={events}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </TabsContent>

        <TabsContent value="insights">
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
