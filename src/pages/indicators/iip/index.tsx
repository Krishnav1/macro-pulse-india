import { useState } from 'react';
import { IIPChart } from './components/IIPChart';
import { IIPMetrics } from './components/IIPMetrics';
import { IIPInsights } from './components/IIPInsights';
import { IIPEvents } from './components/IIPEvents';

const IIPPage = () => {
  const [timeframe, setTimeframe] = useState('all');
  const [compareWith, setCompareWith] = useState<'none' | 'sectoral' | 'use_based'>('none');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">

        {/* Main Layout - Chart on Left, Details on Right */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <IIPChart 
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              compareWith={compareWith}
              setCompareWith={setCompareWith}
            />
          </div>

          {/* Details Section */}
          <div className="xl:col-span-1 space-y-4">
            <IIPMetrics />
          </div>
        </div>

        {/* Economic Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IIPEvents timeframe={timeframe} />
          <IIPInsights />
        </div>
      </div>
    </div>
  );
};

export default IIPPage;
