import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Save, X, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CPIInsight {
  id: string;
  section: string;
  title: string;
  text: string;
  order_index: number;
  is_active: boolean;
}

export const CPIInsightsManager = () => {
  const [insights, setInsights] = useState<CPIInsight[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newInsight, setNewInsight] = useState({
    section: 'overview',
    title: '',
    text: '',
    order_index: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('cpi_insights' as any)
        .select('*')
        .order('section', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveInsight = async (insight: Partial<CPIInsight>) => {
    setSaving(true);
    try {
      if (insight.id) {
        // Update existing
        const { error } = await supabase
          .from('cpi_insights' as any)
          .update(insight)
          .eq('id', insight.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('cpi_insights' as any)
          .insert([{ ...newInsight, is_active: true }]);
        if (error) throw error;
        setNewInsight({ section: 'overview', title: '', text: '', order_index: 0 });
      }
      
      await fetchInsights();
      setEditingId(null);
    } catch (error) {
      console.error('Error saving insight:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteInsight = async (id: string) => {
    if (!confirm('Are you sure you want to delete this insight?')) return;
    
    try {
      const { error } = await supabase
        .from('cpi_insights' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchInsights();
    } catch (error) {
      console.error('Error deleting insight:', error);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('cpi_insights' as any)
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      await fetchInsights();
    } catch (error) {
      console.error('Error toggling insight:', error);
    }
  };

  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.section]) acc[insight.section] = [];
    acc[insight.section].push(insight);
    return acc;
  }, {} as Record<string, CPIInsight[]>);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading insights...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            CPI Key Insights Management
          </CardTitle>
          <CardDescription>
            Manage key insights that appear on the CPI pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add New Insight Form */}
          <div className="border rounded-lg p-4 mb-6 bg-muted/30">
            <h3 className="font-medium mb-4">Add New Insight</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="new-section">Section</Label>
                <Select 
                  value={newInsight.section} 
                  onValueChange={(value) => setNewInsight({...newInsight, section: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="trend">Trend Analysis</SelectItem>
                    <SelectItem value="components">Components</SelectItem>
                    <SelectItem value="compare">Comparative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-order">Order</Label>
                <Input
                  id="new-order"
                  type="number"
                  value={newInsight.order_index}
                  onChange={(e) => setNewInsight({...newInsight, order_index: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="new-title">Title</Label>
              <Input
                id="new-title"
                value={newInsight.title}
                onChange={(e) => setNewInsight({...newInsight, title: e.target.value})}
                placeholder="Enter insight title"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="new-text">Content</Label>
              <Textarea
                id="new-text"
                value={newInsight.text}
                onChange={(e) => setNewInsight({...newInsight, text: e.target.value})}
                placeholder="Enter insight content"
                rows={3}
              />
            </div>
            <Button 
              onClick={() => saveInsight(newInsight)}
              disabled={!newInsight.title || !newInsight.text || saving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Insight
            </Button>
          </div>

          {/* Existing Insights by Section */}
          {Object.entries(groupedInsights).map(([section, sectionInsights]) => (
            <div key={section} className="mb-6">
              <h3 className="font-medium mb-3 capitalize">{section} Insights</h3>
              <div className="space-y-3">
                {sectionInsights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    {editingId === insight.id ? (
                      <EditInsightForm 
                        insight={insight}
                        onSave={saveInsight}
                        onCancel={() => setEditingId(null)}
                        saving={saving}
                      />
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded ${
                              insight.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {insight.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.text}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActive(insight.id, insight.is_active)}
                          >
                            {insight.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(insight.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteInsight(insight.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const EditInsightForm = ({ 
  insight, 
  onSave, 
  onCancel, 
  saving 
}: { 
  insight: CPIInsight; 
  onSave: (insight: CPIInsight) => void; 
  onCancel: () => void; 
  saving: boolean; 
}) => {
  const [editData, setEditData] = useState(insight);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Section</Label>
          <Select 
            value={editData.section} 
            onValueChange={(value) => setEditData({...editData, section: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="trend">Trend Analysis</SelectItem>
              <SelectItem value="components">Components</SelectItem>
              <SelectItem value="compare">Comparative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Order</Label>
          <Input
            type="number"
            value={editData.order_index}
            onChange={(e) => setEditData({...editData, order_index: parseInt(e.target.value) || 0})}
          />
        </div>
      </div>
      <div>
        <Label>Title</Label>
        <Input
          value={editData.title}
          onChange={(e) => setEditData({...editData, title: e.target.value})}
        />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          value={editData.text}
          onChange={(e) => setEditData({...editData, text: e.target.value})}
          rows={3}
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
