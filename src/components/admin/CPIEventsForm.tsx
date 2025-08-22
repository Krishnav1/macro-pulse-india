import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCpiEvents } from '@/hooks/useCpiEvents';

interface CpiEvent {
  id?: string;
  date: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  tag: string;
}

export const CPIEventsForm: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CpiEvent | null>(null);
  const [formData, setFormData] = useState<CpiEvent>({
    date: '',
    title: '',
    description: '',
    impact: 'medium',
    tag: ''
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({
    type: 'idle',
    message: ''
  });

  const { data: events, loading } = useCpiEvents();

  const resetForm = () => {
    setFormData({
      date: '',
      title: '',
      description: '',
      impact: 'medium',
      tag: ''
    });
    setIsEditing(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && editingEvent?.id) {
        const { error } = await supabase
          .from('cpi_events')
          .update({
            date: formData.date,
            title: formData.title,
            description: formData.description,
            impact: formData.impact,
            tag: formData.tag
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        setStatus({ type: 'success', message: 'Event updated successfully!' });
      } else {
        const { error } = await supabase
          .from('cpi_events')
          .insert([{
            date: formData.date,
            title: formData.title,
            description: formData.description,
            impact: formData.impact,
            tag: formData.tag
          }]);

        if (error) throw error;
        setStatus({ type: 'success', message: 'Event created successfully!' });
      }

      resetForm();
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error) {
      console.error('Error saving event:', error);
      setStatus({ 
        type: 'error', 
        message: `Failed to ${isEditing ? 'update' : 'create'} event: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  const handleEdit = (event: any) => {
    setFormData({
      date: event.date,
      title: event.title,
      description: event.description || '',
      impact: event.impact,
      tag: event.tag || ''
    });
    setEditingEvent(event);
    setIsEditing(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('cpi_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      setStatus({ type: 'success', message: 'Event deleted successfully!' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error) {
      console.error('Error deleting event:', error);
      setStatus({ type: 'error', message: 'Failed to delete event' });
    }
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "bg-destructive/20 text-destructive border-destructive/30",
      medium: "bg-warning/20 text-warning border-warning/30", 
      low: "bg-success/20 text-success border-success/30"
    };
    return colors[impact as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isEditing ? 'Edit CPI Event' : 'Add CPI Event'}
          </CardTitle>
          <CardDescription>
            Manage economic events that impact CPI trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="impact">Impact Level</Label>
                <Select value={formData.impact} onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData({ ...formData, impact: value })
                }>
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

            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Oil Price Surge, Budget Announcement"
                required
              />
            </div>

            <div>
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g., policy, commodity, pandemic"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the event and its impact..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Event
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </>
                )}
              </Button>
              
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>

          {/* Status Messages */}
          {status.type !== 'idle' && (
            <Alert className="mt-4" variant={status.type === 'error' ? 'destructive' : 'default'}>
              {status.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Events</CardTitle>
          <CardDescription>
            {loading ? 'Loading events...' : `${events.length} events recorded`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No events recorded yet</div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium">{event.title}</div>
                      <Badge variant="outline" className={`text-xs ${getImpactColor(event.impact)}`}>
                        {event.impact} impact
                      </Badge>
                      {event.tag && (
                        <Badge variant="secondary" className="text-xs">
                          {event.tag}
                        </Badge>
                      )}
                    </div>
                    {event.description && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
