import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface MessageDisplayProps {
  message: { type: 'success' | 'error'; text: string } | null;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
      {message.type === 'success' ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600" />
      )}
      <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
        {message.text}
      </AlertDescription>
    </Alert>
  );
};

export default MessageDisplay;
