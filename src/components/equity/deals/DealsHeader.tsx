// Header component with period selector for Bulk & Block Deals

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  TimePeriodType, 
  DateRange,
  getMonthOptions,
  getQuarterOptions,
  getFinancialYearOptions
} from '@/utils/financialYearUtils';

interface DealsHeaderProps {
  periodType: TimePeriodType;
  periodValue: string;
  dateRange: DateRange;
  onPeriodChange: (type: TimePeriodType, value?: string) => void;
}

export function DealsHeader({ 
  periodType, 
  periodValue, 
  dateRange, 
  onPeriodChange 
}: DealsHeaderProps) {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const periodOptions = [
    { type: 'today' as TimePeriodType, label: 'Today' },
    { type: 'month' as TimePeriodType, label: 'Month' },
    { type: 'quarter' as TimePeriodType, label: 'Quarter' },
    { type: 'year' as TimePeriodType, label: 'Year' },
    { type: 'all' as TimePeriodType, label: 'All Time' },
  ];

  const getDropdownOptions = (type: TimePeriodType) => {
    switch (type) {
      case 'month':
        return getMonthOptions();
      case 'quarter':
        return getQuarterOptions();
      case 'year':
        return getFinancialYearOptions();
      default:
        return [];
    }
  };

  const handlePeriodTypeChange = (type: TimePeriodType) => {
    if (type === 'today' || type === 'all') {
      onPeriodChange(type);
    } else {
      // For month/quarter/year, set to first option if no value selected
      const options = getDropdownOptions(type);
      const defaultValue = options[0]?.value || '';
      onPeriodChange(type, periodValue || defaultValue);
    }
  };

  const handleDropdownSelect = (type: TimePeriodType, value: string) => {
    onPeriodChange(type, value);
    setShowDropdown(null);
  };

  const getCurrentLabel = () => {
    if (periodType === 'today' || periodType === 'all') {
      return dateRange.label;
    }
    
    const options = getDropdownOptions(periodType);
    const selected = options.find(opt => opt.value === periodValue);
    return selected?.label || dateRange.label;
  };

  return (
    <div className="mb-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Bulk & Block Deals
          </h1>
          <p className="text-sm text-muted-foreground">
            Smart money movements & institutional activity
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Type Buttons */}
          <div className="flex bg-muted rounded-lg p-1">
            {periodOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => handlePeriodTypeChange(option.type)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  periodType === option.type
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Dropdown for Month/Quarter/Year */}
          {(periodType === 'month' || periodType === 'quarter' || periodType === 'year') && (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(showDropdown === periodType ? null : periodType)}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors min-w-[200px] justify-between"
              >
                <span className="truncate">{getCurrentLabel()}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  showDropdown === periodType ? 'rotate-180' : ''
                }`} />
              </button>

              {showDropdown === periodType && (
                <div className="absolute top-full left-0 mt-1 w-full max-w-[300px] bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {getDropdownOptions(periodType).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleDropdownSelect(periodType, option.value)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                        periodValue === option.value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current Selection Info */}
      <div className="text-xs text-muted-foreground">
        Showing data for: <span className="font-medium text-foreground">{getCurrentLabel()}</span>
        {dateRange.startDate !== dateRange.endDate && (
          <span className="ml-2">
            ({dateRange.startDate} to {dateRange.endDate})
          </span>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
}
