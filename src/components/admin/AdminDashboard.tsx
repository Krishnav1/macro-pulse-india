import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import DataManagement from './DataManagement';
import EventsManagement from './EventsManagement';
import InsightsManagement from './InsightsManagement';
import ComparisonsManagement from './ComparisonsManagement';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('data');

  const handleSignOut = async () => {
    await signOut();
  };

  // Mock data and handlers for the components
  const mockSeriesData = [];
  const mockEvents = [];
  const mockInsights = [];
  const mockComparisons = [];

  const handleAddEntry = (entry: any) => {
    console.log('Adding entry:', entry);
  };

  const handleDeleteEntry = (index: number) => {
    console.log('Deleting entry at index:', index);
  };

  const handleCsvUpload = (file: File) => {
    console.log('Uploading CSV:', file.name);
  };

  const handleAddEvent = (event: any) => {
    console.log('Adding event:', event);
  };

  const handleDeleteEvent = (index: number) => {
    console.log('Deleting event at index:', index);
  };

  const handleAddInsight = (insight: any) => {
    console.log('Adding insight:', insight);
  };

  const handleDeleteInsight = (index: number) => {
    console.log('Deleting insight at index:', index);
  };

  const handleAddComparison = (comparison: any) => {
    console.log('Adding comparison:', comparison);
  };

  const handleDeleteComparison = (index: number) => {
    console.log('Deleting comparison at index:', index);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Admin Dashboard
            </CardTitle>
            <CardDescription>
              Welcome back, {user?.email}
            </CardDescription>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'data' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('data')}
          className="flex-1"
        >
          Data Management
        </Button>
        <Button
          variant={activeTab === 'events' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('events')}
          className="flex-1"
        >
          Events
        </Button>
        <Button
          variant={activeTab === 'insights' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('insights')}
          className="flex-1"
        >
          Insights
        </Button>
        <Button
          variant={activeTab === 'comparisons' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('comparisons')}
          className="flex-1"
        >
          Comparisons
        </Button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'data' && (
          <DataManagement
            seriesData={mockSeriesData}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onCsvUpload={handleCsvUpload}
          />
        )}
        {activeTab === 'events' && (
          <EventsManagement
            events={mockEvents}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
        {activeTab === 'insights' && (
          <InsightsManagement
            insights={mockInsights}
            onAddInsight={handleAddInsight}
            onDeleteInsight={handleDeleteInsight}
          />
        )}
        {activeTab === 'comparisons' && (
          <ComparisonsManagement
            comparisons={mockComparisons}
            onAddComparison={handleAddComparison}
            onDeleteComparison={handleDeleteComparison}
          />
        )}
      </div>
    </div>
  );
};
