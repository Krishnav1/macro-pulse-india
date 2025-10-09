// Helper functions for FII/DII data processing

export const QUARTER_MONTHS = {
  'Q1': ['April', 'May', 'June'],
  'Q2': ['July', 'August', 'September'],
  'Q3': ['October', 'November', 'December'],
  'Q4': ['January', 'February', 'March']
};

export const getQuarterFromMonth = (monthName: string): string => {
  const month = monthName.split(' ')[0];
  for (const [quarter, months] of Object.entries(QUARTER_MONTHS)) {
    if (months.includes(month)) return quarter;
  }
  return '';
};

export const aggregateToMonthly = (dailyData: any[]) => {
  const monthlyMap = new Map();
  
  dailyData.forEach(item => {
    const monthYear = item.month_name; // "April 2025"
    const monthShort = monthYear.split(' ')[0].substring(0, 3); // "Apr"
    
    if (!monthlyMap.has(monthYear)) {
      monthlyMap.set(monthYear, {
        month: monthShort,
        monthFull: monthYear,
        fii_net: 0,
        dii_net: 0,
        fii_gross_purchase: 0,
        fii_gross_sales: 0,
        dii_gross_purchase: 0,
        dii_gross_sales: 0,
        count: 0,
        dates: []
      });
    }
    
    const monthData = monthlyMap.get(monthYear);
    monthData.fii_net += Number(item.fii_net) || 0;
    monthData.dii_net += Number(item.dii_net) || 0;
    monthData.fii_gross_purchase += Number(item.fii_gross_purchase) || 0;
    monthData.fii_gross_sales += Number(item.fii_gross_sales) || 0;
    monthData.dii_gross_purchase += Number(item.dii_gross_purchase) || 0;
    monthData.dii_gross_sales += Number(item.dii_gross_sales) || 0;
    monthData.count++;
    monthData.dates.push(item.date);
  });
  
  return Array.from(monthlyMap.values());
};

export const getChartDescription = (
  selectedDate: string,
  selectedMonth: string,
  selectedQuarter: string,
  selectedFY: string
): string => {
  if (selectedDate) {
    const date = new Date(selectedDate);
    return `Single day analysis for ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }
  if (selectedMonth) {
    const quarter = getQuarterFromMonth(selectedMonth);
    return `${selectedMonth} (${quarter}) - Daily data`;
  }
  if (selectedQuarter) {
    const months = QUARTER_MONTHS[selectedQuarter as keyof typeof QUARTER_MONTHS];
    return `${selectedQuarter} ${selectedFY} (${months.join(', ')}) - Monthly aggregates`;
  }
  return `${selectedFY} - Monthly aggregates`;
};

export const getKPILabels = (
  selectedDate: string,
  selectedMonth: string,
  selectedQuarter: string
) => {
  if (selectedDate) {
    return {
      label1: 'FII Net',
      label2: 'DII Net',
      label3: 'Total Flow',
      label4: 'FII-DII Gap'
    };
  }
  if (selectedMonth) {
    return {
      label1: 'Month Total',
      label2: 'Daily Avg',
      label3: 'FII Month',
      label4: 'DII Month'
    };
  }
  if (selectedQuarter) {
    return {
      label1: 'Quarter Total',
      label2: 'Monthly Avg',
      label3: 'FII Quarter',
      label4: 'DII Quarter'
    };
  }
  return {
    label1: 'FY Total',
    label2: 'Monthly Avg',
    label3: 'FII Year',
    label4: 'DII Year'
  };
};
