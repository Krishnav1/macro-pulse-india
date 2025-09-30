import React, { useState, useEffect } from 'react';
import { IndicatorSearch } from './IndicatorSearch';
import { IndicatorForm } from './IndicatorForm';
import { IndicatorDataManager } from './IndicatorDataManager';
import { HeatmapAdminNew as HeatmapAdmin } from './heatmap/HeatmapAdminNew';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, BarChart3, ArrowLeft } from 'lucide-react';
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

interface IndicatorManagementProps {
  initialIndicatorSlug?: string;
}

export const IndicatorManagement: React.FC<IndicatorManagementProps> = ({ initialIndicatorSlug }) => {
  const [currentView, setCurrentView] = useState<'search' | 'form' | 'data' | 'heatmap'>('search');
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);

  const handleSelectIndicator = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setCurrentView('data');
  };

  const handleAddNew = () => {
    setSelectedIndicator(null);
    setCurrentView('form');
  };

  const handleEditIndicator = () => {
    setCurrentView('form');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedIndicator(null);
  };

  const handleSaveIndicator = () => {
    setCurrentView('search');
    setSelectedIndicator(null);
  };

  const handleHeatmapView = () => {
    setCurrentView('heatmap');
    setSelectedIndicator(null);
  };

  // Auto-navigate to indicator if slug is provided
  useEffect(() => {
    if (initialIndicatorSlug) {
      fetchIndicatorBySlug(initialIndicatorSlug);
    }
  }, [initialIndicatorSlug]);

  const fetchIndicatorBySlug = async (slug: string) => {
    try {
      // Try both hyphen and underscore variants
      const underscore = slug.replace(/-/g, '_');
      const hyphen = slug.replace(/_/g, '-');
      const { data, error } = await supabase
        .from('indicators')
        .select('slug, name, description, category, unit, frequency')
        .or(`slug.eq.${slug},slug.eq.${underscore},slug.eq.${hyphen}`)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching indicator:', error);
        return;
      }

      if (data) {
        const indicator: Indicator = {
          ...data,
          definition: null // Add missing definition field
        };
        setSelectedIndicator(indicator);
        setCurrentView('data');
      }
    } catch (error) {
      console.error('Error fetching indicator:', error);
    }
  };

  return (
    <div>
      {currentView === 'search' && (
        <div className="space-y-6">
          {/* Data Management Options */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <BarChart3 className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Indicator Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Manage time-series indicator data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={handleHeatmapView}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Map className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-semibold">Heatmap Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Upload state-wise indicator data for heat maps
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Regular Indicator Search */}
          <IndicatorSearch
            onSelectIndicator={handleSelectIndicator}
            onAddNew={handleAddNew}
          />
        </div>
      )}
      
      {currentView === 'form' && (
        <IndicatorForm
          indicator={selectedIndicator}
          onBack={handleBackToSearch}
          onSave={handleSaveIndicator}
        />
      )}
      
      {currentView === 'data' && selectedIndicator && (
        <IndicatorDataManager
          indicator={selectedIndicator}
          onBack={handleBackToSearch}
          onEditIndicator={handleEditIndicator}
        />
      )}

      {currentView === 'heatmap' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button onClick={handleBackToSearch} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Data Management
            </Button>
            <h2 className="text-2xl font-bold">Heatmap Data Management</h2>
          </div>
          <HeatmapAdmin />
        </div>
      )}
    </div>
  );
};
