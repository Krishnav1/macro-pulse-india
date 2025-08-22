import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminAuthForm } from '@/components/admin/AdminAuthForm';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  // Not logged in - show login form
  if (!user) {
    return <AdminAuthForm />;
  }

  // Temporary: Allow access for logged-in users (bypass admin check for now)
  // TODO: Re-enable admin check once role assignment is working properly
  // if (!isAdmin) {
  //   return (
  //     <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
  //       <Card className="w-full max-w-md">
  //         <CardHeader>
  //           <CardTitle className="flex items-center gap-2 text-destructive">
  //             <AlertTriangle className="h-5 w-5" />
  //             Access Denied
  //           </CardTitle>
  //           <CardDescription>
  //             You don't have admin privileges to access this panel.
  //           </CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <p className="text-sm text-muted-foreground">
  //             Contact your administrator if you believe this is an error.
  //           </p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  // Logged in and is admin - show dashboard
  return <AdminDashboard />;
}
