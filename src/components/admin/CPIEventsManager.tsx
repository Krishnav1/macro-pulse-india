import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CPIEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  tag: string;
}

export const CPIEventsManager = () => {
  const [events, setEvents] = useState<CPIEvent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    date: '',
    title: '',
    description: '',
    impact: 'medium' as const,
    tag: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('cpi_events' as any)
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (event: Partial<CPIEvent>) => {
    setSaving(true);
    try {
      if (event.id) {
        // Update existing
        const { error } = await supabase
          .from('cpi_events' as any)
          .update(event)
          .eq('id', event.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('cpi_events' as any)
          .insert([newEvent]);
        if (error) throw error;
        setNewEvent({ date: '', title: '', description: '', impact: 'medium', tag: '' });
      }
      
      await fetchEvents();
      setEditingId(null);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const { error } = await supabase
        .from('cpi_events' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading events...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          CPI Economic Events Management
        </CardTitle>
        <CardDescription>
          Manage key economic events that impact CPI inflation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add New Event Form */}
        <div className="border rounded-lg p-4 mb-6 bg-muted/30">
          <h3 className="font-medium mb-4">Add New Event</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="new-date">Date</Label>
              <Input
                id="new-date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="new-impact">Impact Level</Label>
              <Select 
                value={newEvent.impact} 
                onValueChange={(value: 'low' | 'medium' | 'high') => setNewEvent({...newEvent, impact: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Impact</SelectItem>
                  <SelectItem value="medium">Medium Impact</SelectItem>
                  <SelectItem value="high">High Impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="new-title">Title</Label>
              <Input
                id="new-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Event title"
              />
            </div>
            <div>
              <Label htmlFor="new-tag">Tag</Label>
              <Input
                id="new-tag"
                value={newEvent.tag}
                onChange={(e) => setNewEvent({...newEvent, tag: e.target.value})}
                placeholder="e.g., policy, commodity, pandemic"
              />
            </div>
          </div>
          <div className="mb-4">
            <Label htmlFor="new-description">Description</Label>
            <Textarea
              id="new-description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              placeholder="Event description"
              rows={2}
            />
          </div>
          <Button 
            onClick={() => saveEvent(newEvent)}
            disabled={!newEvent.title || !newEvent.date || saving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Existing Events */}
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4">
              {editingId === event.id ? (
                <EditEventForm 
                  event={event}
                  onSave={saveEvent}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge className={getImpactColor(event.impact)}>
                        {event.impact} impact
                      </Badge>
                      {event.tag && (
                        <Badge variant="outline">{event.tag}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {new Date(event.date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                    <p className="text-sm">{event.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(event.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const EditEventForm = ({ 
  event, 
  onSave, 
  onCancel, 
  saving 
}: { 
  event: CPIEvent; 
  onSave: (event: CPIEvent) => void; 
  onCancel: () => void; 
  saving: boolean; 
}) => {
  const [editData, setEditData] = useState(event);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Input
            type="date"
            value={editData.date}
            onChange={(e) => setEditData({...editData, date: e.target.value})}
          />
        </div>
        <div>
          <Label>Impact Level</Label>
          <Select 
            value={editData.impact} 
            onValueChange={(value: 'low' | 'medium' | 'high') => setEditData({...editData, impact: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Impact</SelectItem>
              <SelectItem value="medium">Medium Impact</SelectItem>
              <SelectItem value="high">High Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
          />
        </div>
        <div>
          <Label>Tag</Label>
          <Input
            value={editData.tag}
            onChange={(e) => setEditData({...editData, tag: e.target.value})}
          />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={editData.description}
          onChange={(e) => setEditData({...editData, description: e.target.value})}
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSave(editData)} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
};
