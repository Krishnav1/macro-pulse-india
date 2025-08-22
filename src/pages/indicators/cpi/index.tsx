import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CPIChart } from './components/CPIChart';
import { CPIMetrics } from './components/CPIMetrics';
import { CPIInsights } from './components/CPIInsights';
import { CPIEvents } from './components/CPIEvents';

const CPIPage = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('all');
  const [geography, setGeography] = useState<'rural' | 'urban' | 'combined'>('combined');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">

        {/* Main Layout - Chart on Left, Details on Right */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <CPIChart 
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              geography={geography}
              setGeography={setGeography}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <CPIMetrics geography={geography} />
            
            {/* View Full Insight Button */}
            <button 
              onClick={() => navigate('/indicators/cpi/insights')}
              className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-sm font-medium transition-colors"
            >
              View Full Insight
            </button>
          </div>
        </div>

        {/* Economic Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CPIEvents timeframe={timeframe} />
          <CPIInsights />
        </div>
      </div>
    </div>
  );
};

export default CPIPage;
