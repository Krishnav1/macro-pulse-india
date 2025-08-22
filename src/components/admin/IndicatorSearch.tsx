import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Indicator {
  slug: string;
  name: string;
  description: string | null;
  definition: string | null;
  category: string | null;
  unit: string | null;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "irregular" | null;
}

interface IndicatorSearchProps {
  onSelectIndicator: (indicator: Indicator) => void;
  onAddNew: () => void;
}

export const IndicatorSearch: React.FC<IndicatorSearchProps> = ({ onSelectIndicator, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [filteredIndicators, setFilteredIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIndicators();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = indicators.filter(indicator =>
        indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        indicator.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (indicator.category && indicator.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredIndicators(filtered);
    } else {
      setFilteredIndicators(indicators);
    }
  }, [searchTerm, indicators]);

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('indicators')
        .select('slug, name, description, definition, category, unit, frequency')
        .order('name');

      if (error) {
        console.error('Error fetching indicators:', error);
        setIndicators([]);
        setFilteredIndicators([]);
      } else {
        const indicators = (data as unknown as Indicator[]) || [];
        setIndicators(indicators);
        setFilteredIndicators(indicators);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search indicators by name, slug, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Indicator
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading indicators...</div>
      ) : (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {filteredIndicators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No indicators found matching your search.' : 'No indicators available.'}
            </div>
          ) : (
            filteredIndicators.map((indicator) => (
              <Card key={indicator.slug} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{indicator.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectIndicator(indicator)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    {indicator.slug} • {indicator.category || 'Uncategorized'}
                    {indicator.unit && ` • ${indicator.unit}`}
                    {indicator.frequency && ` • ${indicator.frequency}`}
                  </CardDescription>
                </CardHeader>
                {(indicator.description || indicator.definition) && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {indicator.definition || indicator.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
