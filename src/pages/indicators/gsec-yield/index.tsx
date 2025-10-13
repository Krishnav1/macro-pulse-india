import { useState } from 'react';
import { GSecChart } from './components/GSecChart';
import { GSecMetrics } from './components/GSecMetrics';
import { GSecEvents } from './components/GSecEvents';
import { GSecInsights } from './components/GSecInsights';

const GSecYieldPage = () => {
  const [timeframe, setTimeframe] = useState('all');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">

        {/* Main Layout - Chart on Left, Details on Right */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <GSecChart 
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <GSecMetrics />
          </div>
        </div>

        {/* Economic Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GSecEvents timeframe={timeframe} />
          <GSecInsights />
        </div>
      </div>
    </div>
  );
};

export default GSecYieldPage;
