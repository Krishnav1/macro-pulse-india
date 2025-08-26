import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GdpChart } from './components/GdpChart';
import { GdpMetrics } from './components/GdpMetrics';
import { DataType, PriceType, CurrencyType } from '@/hooks/useGdpData';

export const RealGdpGrowthPage = () => {
  const [timeframe, setTimeframe] = useState('5Y');
  const [dataType, setDataType] = useState<DataType>('growth');
  const [priceType, setPriceType] = useState<PriceType>('constant');
  const [currency, setCurrency] = useState<CurrencyType>('inr');
  const [selectedFY, setSelectedFY] = useState<string | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['gdp']);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with inline toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Real GDP Growth</h1>
            
            {/* Growth/Value Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={dataType === 'growth' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDataType('growth')}
                className="h-8 px-3"
              >
                Growth
              </Button>
              <Button
                variant={dataType === 'value' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDataType('value')}
                className="h-8 px-3"
              >
                Value
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Track India's economic growth through Gross Domestic Product metrics and component analysis
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section - Takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <GdpChart
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            dataType={dataType}
            setDataType={setDataType}
            priceType={priceType}
            setPriceType={setPriceType}
            currency={currency}
            setCurrency={setCurrency}
            selectedFY={selectedFY}
            setSelectedFY={setSelectedFY}
            selectedComponents={selectedComponents}
            setSelectedComponents={setSelectedComponents}
          />
        </div>

        {/* Metrics Section - Takes 1/3 width on large screens */}
        <div className="lg:col-span-1">
          <GdpMetrics
            dataType={dataType}
            priceType={priceType}
            currency={currency}
            selectedFY={selectedFY}
            timeframe={timeframe}
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GDP Components Explanation */}
        <div className="p-6 bg-muted/50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">GDP Components</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong>PFCE (C):</strong> Private Final Consumption Expenditure - household spending
            </div>
            <div>
              <strong>GFCE (G):</strong> Government Final Consumption Expenditure - government spending
            </div>
            <div>
              <strong>GFCF (I):</strong> Gross Fixed Capital Formation - business investment
            </div>
            <div>
              <strong>ΔS:</strong> Changes in Stocks - inventory changes
            </div>
            <div>
              <strong>X:</strong> Exports of Goods & Services
            </div>
            <div>
              <strong>M:</strong> Imports of Goods & Services (subtracted)
            </div>
          </div>
        </div>

        {/* Price Types Explanation */}
        <div className="p-6 bg-muted/50 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Price Types</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Constant Prices:</strong> GDP adjusted for inflation, shows real economic growth by removing price changes
            </div>
            <div>
              <strong>Current Prices:</strong> GDP at market prices, includes the effect of inflation and price changes
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border-l-4 border-blue-500">
              <strong>Note:</strong> Constant prices are typically used to measure real economic growth as they eliminate the impact of inflation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
