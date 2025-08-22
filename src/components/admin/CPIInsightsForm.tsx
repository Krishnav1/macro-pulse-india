import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, Plus, Edit, Trash2, CheckCircle, AlertCircle, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCpiInsights } from '@/hooks/useCpiInsights';

interface CpiInsight {
  id?: string;
  section: 'overview' | 'trend' | 'components' | 'compare';
  title: string;
  text: string;
  chart_key: string;
  order_index: number;
  is_active: boolean;
}

export const CPIInsightsForm: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingInsight, setEditingInsight] = useState<CpiInsight | null>(null);
  const [selectedSection, setSelectedSection] = useState<'overview' | 'trend' | 'components' | 'compare'>('overview');
  const [formData, setFormData] = useState<CpiInsight>({
    section: 'overview',
    title: '',
    text: '',
    chart_key: '',
    order_index: 0,
    is_active: true
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({
    type: 'idle',
    message: ''
  });

  const { data: insights, loading } = useCpiInsights({ section: selectedSection });

  const resetForm = () => {
    setFormData({
      section: selectedSection,
      title: '',
      text: '',
      chart_key: '',
      order_index: insights.length,
      is_active: true
    });
    setIsEditing(false);
    setEditingInsight(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && editingInsight?.id) {
        const { error } = await supabase
          .from('cpi_insights')
          .update({
            section: formData.section,
            title: formData.title,
            text: formData.text,
            chart_key: formData.chart_key || null,
            order_index: formData.order_index,
            is_active: formData.is_active
          })
          .eq('id', editingInsight.id);

        if (error) throw error;
        setStatus({ type: 'success', message: 'Insight updated successfully!' });
      } else {
        const { error } = await supabase
          .from('cpi_insights')
          .insert([{
            section: formData.section,
            title: formData.title,
            text: formData.text,
            chart_key: formData.chart_key || null,
            order_index: formData.order_index,
            is_active: formData.is_active
          }]);

        if (error) throw error;
        setStatus({ type: 'success', message: 'Insight created successfully!' });
      }

      resetForm();
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error) {
      console.error('Error saving insight:', error);
      setStatus({ 
        type: 'error', 
        message: `Failed to ${isEditing ? 'update' : 'create'} insight: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  const handleEdit = (insight: any) => {
    setFormData({
      section: insight.section,
      title: insight.title,
      text: insight.text,
      chart_key: insight.chart_key || '',
      order_index: insight.order_index,
      is_active: insight.is_active
    });
    setEditingInsight(insight);
    setIsEditing(true);
  };

  const handleDelete = async (insightId: string) => {
    if (!confirm('Are you sure you want to delete this insight?')) return;

    try {
      const { error } = await supabase
        .from('cpi_insights')
        .delete()
        .eq('id', insightId);

      if (error) throw error;
      setStatus({ type: 'success', message: 'Insight deleted successfully!' });
      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error) {
      console.error('Error deleting insight:', error);
      setStatus({ type: 'error', message: 'Failed to delete insight' });
    }
  };

  const handleReorder = async (insightId: string, direction: 'up' | 'down') => {
    const insight = insights.find(i => i.id === insightId);
    if (!insight) return;

    const newOrderIndex = direction === 'up' ? insight.order_index - 1 : insight.order_index + 1;
    
    try {
      const { error } = await supabase
        .from('cpi_insights')
        .update({ order_index: newOrderIndex })
        .eq('id', insightId);

      if (error) throw error;
    } catch (error) {
      console.error('Error reordering insight:', error);
    }
  };

  const getSectionColor = (section: string) => {
    const colors = {
      overview: "bg-blue/20 text-blue border-blue/30",
      trend: "bg-green/20 text-green border-green/30",
      components: "bg-purple/20 text-purple border-purple/30",
      compare: "bg-orange/20 text-orange border-orange/30"
    };
    return colors[section as keyof typeof colors] || colors.overview;
  };

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Section</CardTitle>
          <CardDescription>Choose which section to manage insights for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSection} onValueChange={(value: 'overview' | 'trend' | 'components' | 'compare') => {
            setSelectedSection(value);
            resetForm();
          }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview - Main CPI page insights</SelectItem>
              <SelectItem value="trend">Trend Analysis - Moving averages & patterns</SelectItem>
              <SelectItem value="components">Components - Category breakdowns</SelectItem>
              <SelectItem value="compare">Compare - Comparative analysis</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {isEditing ? 'Edit CPI Insight' : 'Add CPI Insight'}
          </CardTitle>
          <CardDescription>
            Create insights for the {selectedSection} section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Insight Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Rising Food Inflation Trend"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="chart_key">Chart Reference (Optional)</Label>
                <Input
                  id="chart_key"
                  value={formData.chart_key}
                  onChange={(e) => setFormData({ ...formData, chart_key: e.target.value })}
                  placeholder="e.g., combined_chart, inflation_chart"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="text">Insight Text</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Detailed analysis and interpretation..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_index">Display Order</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active (visible to users)</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Insight
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Insight
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

      {/* Insights List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Insights
          </CardTitle>
          <CardDescription>
            {loading ? 'Loading insights...' : `${insights.length} insights in this section`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading insights...</div>
          ) : insights.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No insights in this section yet</div>
          ) : (
            <div className="space-y-3">
              {insights
                .sort((a, b) => a.order_index - b.order_index)
                .map((insight, index) => (
                <div key={insight.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium">{insight.title}</div>
                      <Badge variant="outline" className={`text-xs ${getSectionColor(insight.section)}`}>
                        {insight.section}
                      </Badge>
                      {!insight.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                      {insight.chart_key && (
                        <Badge variant="outline" className="text-xs">
                          Chart: {insight.chart_key}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {insight.text}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Order: {insight.order_index}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(insight.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(insight.id, 'down')}
                        disabled={index === insights.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(insight)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(insight.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
