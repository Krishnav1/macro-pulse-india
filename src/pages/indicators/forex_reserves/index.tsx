import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FRChart } from './components/FRChart';
import { FRMetrics } from './components/FRMetrics';
import { FRInsights } from './components/FRInsights';
import { FREvents } from './components/FREvents';

const ForexReservesPage = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('all');
  const [unit, setUnit] = useState<'usd' | 'inr'>('usd');
  const [selectedFY, setSelectedFY] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">

        {/* Main Layout - Chart on Left, Details on Right */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <FRChart 
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              unit={unit}
              setUnit={setUnit}
              selectedFY={selectedFY}
              setSelectedFY={setSelectedFY}
              selectedComponents={selectedComponents}
              setSelectedComponents={setSelectedComponents}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <FRMetrics 
              unit={unit} 
              selectedFY={selectedFY}
              timeframe={timeframe}
            />
            
            {/* View Full Insight Button */}
            <button 
              onClick={() => navigate('/indicators/forex_reserves/insights')}
              className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-sm font-medium transition-colors"
            >
              View Full Insight
            </button>
          </div>
        </div>

        {/* Economic Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FREvents timeframe={timeframe} />
          <FRInsights unit={unit} selectedFY={selectedFY} />
        </div>
      </div>
    </div>
  );
};

export default ForexReservesPage;
