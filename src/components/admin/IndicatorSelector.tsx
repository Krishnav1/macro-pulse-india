import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { type Indicator } from '@/lib/supabase-admin';

interface IndicatorSelectorProps {
  indicators: Indicator[];
  selectedIndicator: string;
  currentIndicator: Indicator | null;
  onIndicatorChange: (slug: string) => void;
  onLogout: () => void;
  isLoading?: boolean;
}

export const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
  indicators,
  selectedIndicator,
  currentIndicator,
  onIndicatorChange,
  onLogout,
  isLoading = false
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Admin Panel - Indicator Management</CardTitle>
            <CardDescription>
              Select an indicator to manage its data, events, insights, and comparisons
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Indicator</label>
            <Select
              value={selectedIndicator}
              onValueChange={onIndicatorChange}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an indicator to manage" />
              </SelectTrigger>
              <SelectContent>
                {indicators.map((indicator) => (
                  <SelectItem key={indicator.slug} value={indicator.slug}>
                    <div className="flex items-center space-x-2">
                      <span>{indicator.name}</span>
                      {indicator.category && (
                        <Badge variant="secondary" className="text-xs">
                          {indicator.category}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentIndicator && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg">{currentIndicator.name}</h3>
              {currentIndicator.description && (
                <p className="text-gray-600 mt-1">{currentIndicator.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {currentIndicator.category && (
                  <span>Category: {currentIndicator.category}</span>
                )}
                {currentIndicator.unit && (
                  <span>Unit: {currentIndicator.unit}</span>
                )}
                {currentIndicator.frequency && (
                  <span>Frequency: {currentIndicator.frequency}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IndicatorSelector;
