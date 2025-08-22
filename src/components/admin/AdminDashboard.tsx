import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, BarChart3, Upload, Calendar, Lightbulb } from 'lucide-react';
import { IndicatorManagement } from './IndicatorManagement';
import { CPIDataUpload } from './CPIDataUpload';
import { CPIEventsForm } from './CPIEventsForm';
import { CPIInsightsForm } from './CPIInsightsForm';

export const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
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

      {/* Admin Tabs */}
      <Tabs defaultValue="indicators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indicators" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Indicators
          </TabsTrigger>
          <TabsTrigger value="cpi-data" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CPI Data
          </TabsTrigger>
          <TabsTrigger value="cpi-events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            CPI Events
          </TabsTrigger>
          <TabsTrigger value="cpi-insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            CPI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="indicators">
          <IndicatorManagement />
        </TabsContent>

        <TabsContent value="cpi-data">
          <CPIDataUpload />
        </TabsContent>

        <TabsContent value="cpi-events">
          <CPIEventsForm />
        </TabsContent>

        <TabsContent value="cpi-insights">
          <CPIInsightsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};
