import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type IndicatorComparisonData } from '@/lib/supabase-admin';

interface ComparisonsManagementProps {
  comparisons: IndicatorComparisonData[];
  onAddComparison: (comparison: { compare_indicator_slug: string; display_name: string }) => void;
  onDeleteComparison: (index: number) => void;
  isLoading?: boolean;
}

export const ComparisonsManagement: React.FC<ComparisonsManagementProps> = ({
  comparisons,
  onAddComparison,
  onDeleteComparison,
  isLoading = false
}) => {
  const [newComparison, setNewComparison] = useState({
    compare_indicator_slug: '',
    display_name: ''
  });

  const handleAddComparison = () => {
    if (newComparison.compare_indicator_slug && newComparison.display_name) {
      onAddComparison(newComparison);
      setNewComparison({ compare_indicator_slug: '', display_name: '' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparisons Management</CardTitle>
        <CardDescription>
          Manage comparison indicators that will be shown alongside this indicator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Comparison */}
        <div className="space-y-4">
          <Label>Add New Comparison</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="compare_slug">Indicator Slug</Label>
              <Input
                id="compare_slug"
                value={newComparison.compare_indicator_slug}
                onChange={(e) => setNewComparison({ ...newComparison, compare_indicator_slug: e.target.value })}
                placeholder="e.g., cpi_inflation"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={newComparison.display_name}
                onChange={(e) => setNewComparison({ ...newComparison, display_name: e.target.value })}
                placeholder="e.g., CPI Inflation"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddComparison} 
                disabled={isLoading || !newComparison.compare_indicator_slug || !newComparison.display_name}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Comparison
              </Button>
            </div>
          </div>
        </div>

        {/* Comparisons List */}
        <div className="space-y-2">
          <Label>Comparison Indicators ({comparisons.length})</Label>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {comparisons.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No comparison indicators added yet. Add some above.
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {comparisons.map((comparison, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{comparison.compare_indicator_slug}</Badge>
                      <span className="font-medium">{comparison.display_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteComparison(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default ComparisonsManagement;
