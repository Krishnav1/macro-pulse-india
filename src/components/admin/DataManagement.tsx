import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type IndicatorSeriesData } from '@/lib/supabase-admin';

interface DataManagementProps {
  seriesData: IndicatorSeriesData[];
  onAddEntry: (entry: { period_date: string; value: string; period_label: string }) => void;
  onDeleteEntry: (index: number) => void;
  onCsvUpload: (file: File) => void;
  isLoading?: boolean;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  seriesData,
  onAddEntry,
  onDeleteEntry,
  onCsvUpload,
  isLoading = false
}) => {
  const [newEntry, setNewEntry] = useState({ period_date: '', value: '', period_label: '' });

  const handleAddEntry = () => {
    if (newEntry.period_date && newEntry.value) {
      onAddEntry(newEntry);
      setNewEntry({ period_date: '', value: '', period_label: '' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCsvUpload(file);
      e.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Manage time series data for the selected indicator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSV Upload */}
        <div className="space-y-2">
          <Label>CSV Upload</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="flex-1"
            />
            <Button variant="outline" size="sm" disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            CSV format: period_date, value, period_label (optional)
          </p>
        </div>

        {/* Manual Entry */}
        <div className="space-y-4">
          <Label>Add New Entry</Label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_date">Date</Label>
              <Input
                id="period_date"
                type="date"
                value={newEntry.period_date}
                onChange={(e) => setNewEntry({ ...newEntry, period_date: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={newEntry.value}
                onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                placeholder="Enter value"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_label">Label (Optional)</Label>
              <Input
                id="period_label"
                value={newEntry.period_label}
                onChange={(e) => setNewEntry({ ...newEntry, period_label: e.target.value })}
                placeholder="Period label"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddEntry} disabled={isLoading || !newEntry.period_date || !newEntry.value}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </div>

        {/* Data List */}
        <div className="space-y-2">
          <Label>Current Data ({seriesData.length} entries)</Label>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {seriesData.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No data entries yet. Add some data above.
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {seriesData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{entry.period_date}</Badge>
                      <span className="font-semibold">{entry.value}</span>
                      {entry.period_label && entry.period_label !== entry.period_date && (
                        <span className="text-sm text-gray-600">({entry.period_label})</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEntry(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataManagement;
