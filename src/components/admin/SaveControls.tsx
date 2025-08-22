import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Loader2 } from 'lucide-react';

interface SaveControlsProps {
  onSave: () => void;
  isSaving: boolean;
  disabled?: boolean;
}

export const SaveControls: React.FC<SaveControlsProps> = ({
  onSave,
  isSaving,
  disabled = false
}) => {
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Save all changes to the database. This will update the Supabase backend and sync to localStorage.
          </div>
          <Button 
            onClick={onSave} 
            disabled={disabled || isSaving}
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Data
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaveControls;
