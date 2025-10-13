// Mutual Funds & AMC Page - Under Development

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, ArrowRight } from 'lucide-react';

export default function MutualFundsPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/financial-markets/industry-trends');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Construction className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-center text-3xl">
            Page Under Development
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">
              The Mutual Funds page is currently under development.
            </p>
            <p className="text-md text-muted-foreground">
              You will be redirected to the Industry Trends page in <span className="text-2xl font-bold text-primary">{countdown}</span> seconds.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/financial-markets/industry-trends')}
              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Go to Industry Trends Now
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => navigate('/financial-markets')}
              className="w-full px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-semibold transition-colors"
            >
              Back to Financial Markets
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
