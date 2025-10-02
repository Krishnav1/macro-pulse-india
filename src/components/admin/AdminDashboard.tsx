import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, BarChart3, LineChart } from 'lucide-react';
import { IndicatorManagement } from './IndicatorManagement';
import { FinancialMarketsAdmin } from './financial/FinancialMarketsAdmin';

interface AdminDashboardProps {
  initialIndicatorSlug?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialIndicatorSlug }) => {
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="indicators" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Indicators & Heatmap
          </TabsTrigger>
          <TabsTrigger value="financial-markets" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Financial Markets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="indicators">
          <IndicatorManagement initialIndicatorSlug={initialIndicatorSlug} />
        </TabsContent>

        <TabsContent value="financial-markets">
          <FinancialMarketsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
};
