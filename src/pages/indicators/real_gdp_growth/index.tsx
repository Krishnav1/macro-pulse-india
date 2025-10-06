import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GdpChart } from './components/GdpChart';
import { GdpMetrics } from './components/GdpMetrics';
import { GDPInsights } from './components/GDPInsights';
import { GDPEvents } from './components/GDPEvents';

const RealGDPGrowthPage = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('all');
  const [dataType, setDataType] = useState<'growth' | 'value'>('growth');
  const [priceType, setPriceType] = useState<'constant' | 'current'>('constant');
  const [currency, setCurrency] = useState<'inr' | 'usd'>('inr');
  const [viewType, setViewType] = useState<'annual' | 'quarterly'>('annual');
  const [selectedFY, setSelectedFY] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['gdp']);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="max-w-[1600px] mx-auto px-6 py-6">

        {/* Main Layout - Chart on Left, Details on Right */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Chart Section */}
          <div className="xl:col-span-2">
            <GdpChart 
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              dataType={dataType}
              setDataType={setDataType}
              priceType={priceType}
              setPriceType={setPriceType}
              currency={currency}
              setCurrency={setCurrency}
              viewType={viewType}
              setViewType={setViewType}
              selectedFY={selectedFY}
              setSelectedFY={setSelectedFY}
              selectedComponents={selectedComponents}
              setSelectedComponents={setSelectedComponents}
            />
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <GdpMetrics dataType={dataType} priceType={priceType} currency={currency} viewType={viewType} selectedFY={selectedFY} timeframe={timeframe} />
          </div>
        </div>

        {/* Economic Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GDPEvents timeframe={timeframe} />
          <GDPInsights />
        </div>
      </div>
    </div>
  );
};

export default RealGDPGrowthPage;
