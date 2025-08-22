import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type IndicatorInsightData } from '@/lib/supabase-admin';

interface InsightsManagementProps {
  insights: IndicatorInsightData[];
  onAddInsight: (insight: { content: string; order_index: number }) => void;
  onDeleteInsight: (index: number) => void;
  isLoading?: boolean;
}

export const InsightsManagement: React.FC<InsightsManagementProps> = ({
  insights,
  onAddInsight,
  onDeleteInsight,
  isLoading = false
}) => {
  const [newInsight, setNewInsight] = useState({
    content: '',
    order_index: 0
  });

  const handleAddInsight = () => {
    if (newInsight.content.trim()) {
      onAddInsight({
        content: newInsight.content.trim(),
        order_index: newInsight.order_index || insights.length
      });
      setNewInsight({ content: '', order_index: 0 });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights Management</CardTitle>
        <CardDescription>
          Manage key insights and analysis for the indicator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Insight */}
        <div className="space-y-4">
          <Label>Add New Insight</Label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="insight_content">Content</Label>
              <Textarea
                id="insight_content"
                value={newInsight.content}
                onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })}
                placeholder="Enter key insight or analysis about the indicator"
                disabled={isLoading}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_index">Order</Label>
              <Input
                id="order_index"
                type="number"
                value={newInsight.order_index}
                onChange={(e) => setNewInsight({ ...newInsight, order_index: parseInt(e.target.value) || 0 })}
                placeholder="Display order"
                disabled={isLoading}
              />
              <Button 
                onClick={handleAddInsight} 
                disabled={isLoading || !newInsight.content.trim()}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Insight
              </Button>
            </div>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-2">
          <Label>Insights ({insights.length})</Label>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {insights.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No insights added yet. Add some insights above.
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {insights
                  .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                  .map((insight, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">Order: {insight.order_index || 0}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{insight.content}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteInsight(index)}
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

export default InsightsManagement;
