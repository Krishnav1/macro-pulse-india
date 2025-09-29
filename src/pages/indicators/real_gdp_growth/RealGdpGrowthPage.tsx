import { useState } from 'react';
import { GdpChart } from './components/GdpChart';
import { GdpMetrics } from './components/GdpMetrics';
import { GDPEvents } from './components/GDPEvents';
import { GDPInsights } from './components/GDPInsights';
import { DataType, PriceType, CurrencyType, ViewType } from '@/hooks/useGdpData';

export const RealGdpGrowthPage = () => {
  const [timeframe, setTimeframe] = useState('5Y');
  const [dataType, setDataType] = useState<DataType>('growth');
  const [priceType, setPriceType] = useState<PriceType>('constant');
  const [currency, setCurrency] = useState<CurrencyType>('inr');
  const [viewType, setViewType] = useState<ViewType>('quarterly');
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
            <GdpMetrics
              dataType={dataType}
              priceType={priceType}
              currency={currency}
              viewType={viewType}
              selectedFY={selectedFY}
              timeframe={timeframe}
            />
          </div>
        </div>

        {/* Economic Events & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GDPEvents timeframe={timeframe} />
          <GDPInsights dataType={dataType} priceType={priceType} />
        </div>
      </div>
    </div>
  );
};
