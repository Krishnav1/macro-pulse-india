import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Upload, Download, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Indicator {
  slug: string;
  name: string;
  description: string | null;
  definition: string | null;
  category: string | null;
  unit: string | null;
  frequency: string | null;
}

interface IIPDataManagementProps {
  indicator: Indicator;
  onBack: () => void;
  onEditIndicator: () => void;
}

export const IIPDataManagement: React.FC<IIPDataManagementProps> = ({
  indicator,
  onBack,
  onEditIndicator
}) => {
  const [seriesData, setSeriesData] = useState([]);
  const [componentsData, setComponentsData] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [newSeriesEntry, setNewSeriesEntry] = useState({
    date: '',
    index_value: '',
    growth_yoy: '',
    growth_mom: ''
  });
  
  const [newComponentEntry, setNewComponentEntry] = useState({
    date: '',
    classification_type: 'sectoral',
    component_code: '',
    component_name: '',
    index_value: '',
    weight: '',
    growth_yoy: '',
    growth_mom: ''
  });
  
  const [newEvent, setNewEvent] = useState({
    date: '',
    title: '',
    description: '',
    impact: 'medium',
    tag: ''
  });

  useEffect(() => {
    fetchIIPData();
  }, []);

  const fetchIIPData = async () => {
    setLoading(true);
    try {
      // Fetch series data
      const { data: seriesData } = await supabase
        .from('iip_series' as any)
        .select('*')
        .order('date', { ascending: false });

      // Fetch components data
      const { data: componentsData } = await supabase
        .from('iip_components' as any)
        .select('*')
        .order('date', { ascending: false });

      // Fetch events
      const { data: eventsData } = await supabase
        .from('iip_events' as any)
        .select('*')
        .order('date', { ascending: false });

      setSeriesData(seriesData || []);
      setComponentsData(componentsData || []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching IIP data:', error);
      toast.error('Failed to load IIP data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeriesEntry = async () => {
    try {
      const entry = {
        date: newSeriesEntry.date,
        index_value: parseFloat(newSeriesEntry.index_value),
        growth_yoy: newSeriesEntry.growth_yoy ? parseFloat(newSeriesEntry.growth_yoy) : null,
        growth_mom: newSeriesEntry.growth_mom ? parseFloat(newSeriesEntry.growth_mom) : null
      };

      const { error } = await supabase
        .from('iip_series' as any)
        .insert([entry]);

      if (error) throw error;
      
      toast.success('Series entry added successfully');
      setNewSeriesEntry({ date: '', index_value: '', growth_yoy: '', growth_mom: '' });
      fetchIIPData();
    } catch (error) {
      console.error('Error adding series entry:', error);
      toast.error('Failed to add series entry');
    }
  };

  const handleAddComponentEntry = async () => {
    try {
      const entry = {
        date: newComponentEntry.date,
        classification_type: newComponentEntry.classification_type,
        component_code: newComponentEntry.component_code,
        component_name: newComponentEntry.component_name,
        index_value: parseFloat(newComponentEntry.index_value),
        weight: newComponentEntry.weight ? parseFloat(newComponentEntry.weight) : null,
        growth_yoy: newComponentEntry.growth_yoy ? parseFloat(newComponentEntry.growth_yoy) : null,
        growth_mom: newComponentEntry.growth_mom ? parseFloat(newComponentEntry.growth_mom) : null
      };

      const { error } = await supabase
        .from('iip_components' as any)
        .insert([entry]);

      if (error) throw error;
      
      toast.success('Component entry added successfully');
      setNewComponentEntry({
        date: '',
        classification_type: 'sectoral',
        component_code: '',
        component_name: '',
        index_value: '',
        weight: '',
        growth_yoy: '',
        growth_mom: ''
      });
      fetchIIPData();
    } catch (error) {
      console.error('Error adding component entry:', error);
      toast.error('Failed to add component entry');
    }
  };

  const handleAddEvent = async () => {
    try {
      const event = {
        date: newEvent.date,
        title: newEvent.title,
        description: newEvent.description || null,
        impact: newEvent.impact,
        tag: newEvent.tag || null
      };

      const { error } = await supabase
        .from('iip_events' as any)
        .insert([event]);

      if (error) throw error;
      
      toast.success('Event added successfully');
      setNewEvent({ date: '', title: '', description: '', impact: 'medium', tag: '' });
      fetchIIPData();
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  const handleDeleteSeriesEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('iip_series' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Series entry deleted successfully');
      fetchIIPData();
    } catch (error) {
      console.error('Error deleting series entry:', error);
      toast.error('Failed to delete series entry');
    }
  };

  const handleDeleteComponentEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('iip_components' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Component entry deleted successfully');
      fetchIIPData();
    } catch (error) {
      console.error('Error deleting component entry:', error);
      toast.error('Failed to delete component entry');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('iip_events' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Event deleted successfully');
      fetchIIPData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'series' | 'components') => {
    const file = event.target.files?.[0];
    if (file) {
      toast.info(`Excel upload for ${type} will be implemented`);
      // TODO: Implement Excel parsing and upload
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading IIP data...</div>;
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
            {indicator.slug} • {indicator.category || 'Industrial Production'}
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

      {/* Excel Upload Templates */}
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
              <Label>IIP Series Data (Index & Growth)</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleExcelUpload(e, 'series')}
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
              <Label>IIP Components Data (Sectoral & Use-based)</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleExcelUpload(e, 'components')}
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

      {/* Data Management Tabs */}
      <Tabs defaultValue="series" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="series">Series Data ({seriesData.length})</TabsTrigger>
          <TabsTrigger value="components">Components ({componentsData.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="series" className="space-y-4">
          {/* Add Series Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Series Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newSeriesEntry.date}
                    onChange={(e) => setNewSeriesEntry({...newSeriesEntry, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Index Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSeriesEntry.index_value}
                    onChange={(e) => setNewSeriesEntry({...newSeriesEntry, index_value: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Growth YoY (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSeriesEntry.growth_yoy}
                    onChange={(e) => setNewSeriesEntry({...newSeriesEntry, growth_yoy: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Growth MoM (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newSeriesEntry.growth_mom}
                    onChange={(e) => setNewSeriesEntry({...newSeriesEntry, growth_mom: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddSeriesEntry}>Add Entry</Button>
            </CardContent>
          </Card>

          {/* Series Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Series Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Date</th>
                      <th className="border border-border p-2 text-left">Index Value</th>
                      <th className="border border-border p-2 text-left">Growth YoY (%)</th>
                      <th className="border border-border p-2 text-left">Growth MoM (%)</th>
                      <th className="border border-border p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seriesData.slice(0, 10).map((entry: any) => (
                      <tr key={entry.id}>
                        <td className="border border-border p-2">{entry.date}</td>
                        <td className="border border-border p-2">{entry.index_value}</td>
                        <td className="border border-border p-2">{entry.growth_yoy || 'N/A'}</td>
                        <td className="border border-border p-2">{entry.growth_mom || 'N/A'}</td>
                        <td className="border border-border p-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSeriesEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          {/* Add Component Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Component Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newComponentEntry.date}
                    onChange={(e) => setNewComponentEntry({...newComponentEntry, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Classification Type</Label>
                  <Select
                    value={newComponentEntry.classification_type}
                    onValueChange={(value) => setNewComponentEntry({...newComponentEntry, classification_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sectoral">Sectoral</SelectItem>
                      <SelectItem value="use_based">Use-based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Component Code</Label>
                  <Input
                    value={newComponentEntry.component_code}
                    onChange={(e) => setNewComponentEntry({...newComponentEntry, component_code: e.target.value})}
                    placeholder="e.g., S1, U1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Component Name</Label>
                  <Input
                    value={newComponentEntry.component_name}
                    onChange={(e) => setNewComponentEntry({...newComponentEntry, component_name: e.target.value})}
                    placeholder="e.g., Mining, Primary Goods"
                  />
                </div>
                <div>
                  <Label>Index Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newComponentEntry.index_value}
                    onChange={(e) => setNewComponentEntry({...newComponentEntry, index_value: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Weight (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newComponentEntry.weight}
                    onChange={(e) => setNewComponentEntry({...newComponentEntry, weight: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Growth YoY (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newComponentEntry.growth_yoy}
                    onChange={(e) => setNewComponentEntry({...newComponentEntry, growth_yoy: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddComponentEntry}>Add Component Entry</Button>
            </CardContent>
          </Card>

          {/* Components Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Components Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Date</th>
                      <th className="border border-border p-2 text-left">Type</th>
                      <th className="border border-border p-2 text-left">Code</th>
                      <th className="border border-border p-2 text-left">Name</th>
                      <th className="border border-border p-2 text-left">Index</th>
                      <th className="border border-border p-2 text-left">Weight</th>
                      <th className="border border-border p-2 text-left">Growth YoY</th>
                      <th className="border border-border p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentsData.slice(0, 10).map((entry: any) => (
                      <tr key={entry.id}>
                        <td className="border border-border p-2">{entry.date}</td>
                        <td className="border border-border p-2">{entry.classification_type}</td>
                        <td className="border border-border p-2">{entry.component_code}</td>
                        <td className="border border-border p-2">{entry.component_name}</td>
                        <td className="border border-border p-2">{entry.index_value}</td>
                        <td className="border border-border p-2">{entry.weight || 'N/A'}</td>
                        <td className="border border-border p-2">{entry.growth_yoy || 'N/A'}</td>
                        <td className="border border-border p-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteComponentEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {/* Add Event Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Impact</Label>
                  <Select
                    value={newEvent.impact}
                    onValueChange={(value) => setNewEvent({...newEvent, impact: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Event title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Event description"
                />
              </div>
              <div>
                <Label>Tag</Label>
                <Input
                  value={newEvent.tag}
                  onChange={(e) => setNewEvent({...newEvent, tag: e.target.value})}
                  placeholder="e.g., policy, manufacturing, mining"
                />
              </div>
              <Button onClick={handleAddEvent}>Add Event</Button>
            </CardContent>
          </Card>

          {/* Events Table */}
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Date</th>
                      <th className="border border-border p-2 text-left">Title</th>
                      <th className="border border-border p-2 text-left">Impact</th>
                      <th className="border border-border p-2 text-left">Tag</th>
                      <th className="border border-border p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 10).map((event: any) => (
                      <tr key={event.id}>
                        <td className="border border-border p-2">{event.date}</td>
                        <td className="border border-border p-2">{event.title}</td>
                        <td className="border border-border p-2">{event.impact}</td>
                        <td className="border border-border p-2">{event.tag || 'N/A'}</td>
                        <td className="border border-border p-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
};
