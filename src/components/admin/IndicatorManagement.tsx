import React, { useState } from 'react';
import { IndicatorSearch } from './IndicatorSearch';
import { IndicatorForm } from './IndicatorForm';
import { IndicatorDataManager } from './IndicatorDataManager';

interface Indicator {
  slug: string;
  name: string;
  description: string | null;
  definition: string | null;
  category: string | null;
  unit: string | null;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "irregular" | null;
}

export const IndicatorManagement: React.FC = () => {
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
