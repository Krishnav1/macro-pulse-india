import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type IndicatorEventData } from '@/lib/supabase-admin';

interface EventsManagementProps {
  events: IndicatorEventData[];
  onAddEvent: (event: { date: string; description: string; impact: 'low' | 'medium' | 'high' }) => void;
  onDeleteEvent: (index: number) => void;
  isLoading?: boolean;
}

export const EventsManagement: React.FC<EventsManagementProps> = ({
  events,
  onAddEvent,
  onDeleteEvent,
  isLoading = false
}) => {
  const [newEvent, setNewEvent] = useState({
    date: '',
    description: '',
    impact: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleAddEvent = () => {
    if (newEvent.date && newEvent.description) {
      onAddEvent(newEvent);
      setNewEvent({ date: '', description: '', impact: 'medium' });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events Management</CardTitle>
        <CardDescription>
          Manage important events that affected the indicator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Event */}
        <div className="space-y-4">
          <Label>Add New Event</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="impact">Impact Level</Label>
              <Select
                value={newEvent.impact}
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setNewEvent({ ...newEvent, impact: value })
                }
                disabled={isLoading}
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
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Describe the event and its impact on the indicator"
              disabled={isLoading}
              rows={3}
            />
          </div>
          <Button 
            onClick={handleAddEvent} 
            disabled={isLoading || !newEvent.date || !newEvent.description}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Events List */}
        <div className="space-y-2">
          <Label>Events ({events.length})</Label>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {events.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No events recorded yet. Add some events above.
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {events.map((event, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{event.date}</Badge>
                          <Badge className={getImpactColor(event.impact)}>
                            {event.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{event.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteEvent(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventsManagement;
