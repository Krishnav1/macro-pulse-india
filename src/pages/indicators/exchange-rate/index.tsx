import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExchangeRateChart } from './components/ExchangeRateChart';
import { ExchangeRateMetrics } from './components/ExchangeRateMetrics';
import { ExchangeRateInsights } from './components/ExchangeRateInsights';
import { ExchangeRateEvents } from './components/ExchangeRateEvents';

const ExchangeRatePage = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">

        {/* Main Layout - Chart on Left, Details on Right */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <ExchangeRateChart 
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <ExchangeRateMetrics currency={selectedCurrency} />
            
            {/* View Full Insight Button */}
            <button 
              onClick={() => navigate('/indicators/exchange-rate/insights')}
              className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-sm font-medium transition-colors"
            >
              View Full Insight
            </button>
          </div>
        </div>

        {/* Economic Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExchangeRateEvents timeframe={timeframe} />
          <ExchangeRateInsights />
        </div>
      </div>
    </div>
  );
};

export default ExchangeRatePage;
