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
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="indicators" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Data Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="indicators">
          <div className="space-y-6">
            {/* Indicator Management */}
            <IndicatorManagement />
            
            {/* CPI Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  CPI Data Management
                </CardTitle>
                <CardDescription>
                  Upload and manage CPI data for the platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <CPIDataManager />
                <CoreCPIUpload />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
