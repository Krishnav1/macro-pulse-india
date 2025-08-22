import React, { useState, useEffect } from 'react';
import { IndicatorSearch } from './IndicatorSearch';
import { IndicatorForm } from './IndicatorForm';
import { IndicatorDataManager } from './IndicatorDataManager';
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
  const [currentView, setCurrentView] = useState<'search' | 'form' | 'data'>('search');
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
        <IndicatorSearch
          onSelectIndicator={handleSelectIndicator}
          onAddNew={handleAddNew}
        />
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
    </div>
  );
};
