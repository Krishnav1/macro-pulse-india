import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft } from 'lucide-react';
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

interface IndicatorFormProps {
  indicator?: Indicator | null;
  onBack: () => void;
  onSave: () => void;
}

export const IndicatorForm: React.FC<IndicatorFormProps> = ({ indicator, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    definition: '',
    category: '',
    unit: '',
    frequency: 'monthly'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (indicator) {
      setFormData({
        slug: indicator.slug,
        name: indicator.name,
        description: indicator.description || '',
        definition: indicator.definition || '',
        category: indicator.category || '',
        unit: indicator.unit || '',
        frequency: indicator.frequency || 'monthly'
      });
    }
  }, [indicator]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name if creating new indicator
    if (field === 'name' && !indicator) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        slug: formData.slug,
        name: formData.name,
        description: formData.description || null,
        definition: formData.definition || null,
        category: formData.category || null,
        unit: formData.unit || null,
        frequency: formData.frequency as "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "irregular" | null
      };

      let error;
      if (indicator) {
        // Update existing indicator
        const { error: updateError } = await supabase
          .from('indicators')
          .update(dataToSave)
          .eq('slug', indicator.slug);
        error = updateError;
      } else {
        // Create new indicator
        const { error: insertError } = await supabase
          .from('indicators')
          .insert([dataToSave]);
        error = insertError;
      }

      if (error) {
        console.error('Error saving indicator:', error);
        toast.error('Failed to save indicator');
      } else {
        toast.success(`Indicator ${indicator ? 'updated' : 'created'} successfully`);
        onSave();
      }
    } catch (error) {
      console.error('Error saving indicator:', error);
      toast.error('Failed to save indicator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {indicator ? 'Edit Indicator' : 'Add New Indicator'}
          </CardTitle>
          <CardDescription>
            {indicator ? 'Update the indicator details below' : 'Fill in the details to create a new indicator'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Indicator Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Repo Rate"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="e.g., repo-rate"
                disabled={!!indicator}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">Definition (Hover Tooltip)</Label>
            <Textarea
              id="definition"
              value={formData.definition}
              onChange={(e) => handleInputChange('definition', e.target.value)}
              placeholder="Brief definition that will appear on hover..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the indicator..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="e.g., Monetary Policy"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                placeholder="e.g., %, ₹ Crores"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Indicator'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
