import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterBreadcrumbProps {
  selectedFY: string;
  selectedQuarter: string;
  selectedMonth: string;
  selectedDate: string;
  onClearFY: () => void;
  onClearQuarter: () => void;
  onClearMonth: () => void;
  onClearDate: () => void;
}

export function FilterBreadcrumb({
  selectedFY,
  selectedQuarter,
  selectedMonth,
  selectedDate,
  onClearFY,
  onClearQuarter,
  onClearMonth,
  onClearDate,
}: FilterBreadcrumbProps) {
  const breadcrumbs = [];

  if (selectedFY) {
    breadcrumbs.push({
      label: selectedFY,
      onClear: onClearFY,
      level: 'fy'
    });
  }

  if (selectedQuarter) {
    breadcrumbs.push({
      label: selectedQuarter,
      onClear: onClearQuarter,
      level: 'quarter'
    });
  }

  if (selectedMonth) {
    breadcrumbs.push({
      label: selectedMonth,
      onClear: onClearMonth,
      level: 'month'
    });
  }

  if (selectedDate) {
    const dateObj = new Date(selectedDate);
    const day = dateObj.getDate();
    breadcrumbs.push({
      label: `Day ${day}`,
      onClear: onClearDate,
      level: 'date'
    });
  }

  if (breadcrumbs.length === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Filter:</span>
      {breadcrumbs.map((crumb, idx) => (
        <div key={crumb.level} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md">
            <span className="font-medium">{crumb.label}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-primary/20"
              onClick={crumb.onClear}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
