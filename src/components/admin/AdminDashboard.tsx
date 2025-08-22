import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, BarChart3, Upload, Calendar, Lightbulb } from 'lucide-react';
import { IndicatorManagement } from './IndicatorManagement';
import { CPIDataManager } from './CPIDataManager';
import { CoreCPIUpload } from './CoreCPIUpload';
import { CPIEventsManager } from './CPIEventsManager';
import { CPIInsightsManager } from './CPIInsightsManager';

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="indicators" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Indicators
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
          {/* CPI Uploads within Indicators tab (no separate tab) */}
          <div className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  CPI Data Uploads
                </CardTitle>
                <CardDescription>
                  Upload headline and components, or Core CPI, directly from here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <CPIDataManager />
                <CoreCPIUpload />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cpi-events">
          <CPIEventsManager />
        </TabsContent>

        <TabsContent value="cpi-insights">
          <CPIInsightsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
