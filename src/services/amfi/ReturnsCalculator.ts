// Returns Calculator Service
// Calculates various return metrics from NAV history

export interface NAVRecord {
  date: string;
  nav: number;
}

export interface ReturnsResult {
  return_1m: number | null;
  return_3m: number | null;
  return_6m: number | null;
  return_1y: number | null;
  return_3y: number | null;
  return_5y: number | null;
  return_since_inception: number | null;
}

export class ReturnsCalculator {
  /**
   * Calculate returns for various time periods
   */
  calculateReturns(navHistory: NAVRecord[], inceptionDate?: string): ReturnsResult {
    if (navHistory.length === 0) {
      return {
        return_1m: null,
        return_3m: null,
        return_6m: null,
        return_1y: null,
        return_3y: null,
        return_5y: null,
        return_since_inception: null,
      };
    }

    // Sort by date ascending
    const sorted = [...navHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const latestNAV = sorted[sorted.length - 1];
    const latestDate = new Date(latestNAV.date);

    return {
      return_1m: this.calculatePeriodReturn(sorted, latestDate, 30),
      return_3m: this.calculatePeriodReturn(sorted, latestDate, 90),
      return_6m: this.calculatePeriodReturn(sorted, latestDate, 180),
      return_1y: this.calculatePeriodReturn(sorted, latestDate, 365),
      return_3y: this.calculateCAGR(sorted, latestDate, 3),
      return_5y: this.calculateCAGR(sorted, latestDate, 5),
      return_since_inception: inceptionDate 
        ? this.calculateCAGRFromDate(sorted, new Date(inceptionDate), latestDate)
        : null,
    };
  }

  /**
   * Calculate simple return for a period (in days)
   */
  private calculatePeriodReturn(
    navHistory: NAVRecord[],
    endDate: Date,
    days: number
  ): number | null {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const endNAV = this.findClosestNAV(navHistory, endDate);
    const startNAV = this.findClosestNAV(navHistory, startDate);

    if (!endNAV || !startNAV) return null;

    return ((endNAV.nav - startNAV.nav) / startNAV.nav) * 100;
  }

  /**
   * Calculate CAGR (Compound Annual Growth Rate) for a period in years
   */
  private calculateCAGR(
    navHistory: NAVRecord[],
    endDate: Date,
    years: number
  ): number | null {
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - years);

    return this.calculateCAGRFromDate(navHistory, startDate, endDate);
  }

  /**
   * Calculate CAGR between two dates
   */
  private calculateCAGRFromDate(
    navHistory: NAVRecord[],
    startDate: Date,
    endDate: Date
  ): number | null {
    const endNAV = this.findClosestNAV(navHistory, endDate);
    const startNAV = this.findClosestNAV(navHistory, startDate);

    if (!endNAV || !startNAV) return null;

    const years = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    if (years <= 0) return null;

    const cagr = (Math.pow(endNAV.nav / startNAV.nav, 1 / years) - 1) * 100;
    return cagr;
  }

  /**
   * Find NAV closest to a given date
   */
  private findClosestNAV(navHistory: NAVRecord[], targetDate: Date): NAVRecord | null {
    if (navHistory.length === 0) return null;

    let closest = navHistory[0];
    let minDiff = Math.abs(new Date(navHistory[0].date).getTime() - targetDate.getTime());

    for (const record of navHistory) {
      const diff = Math.abs(new Date(record.date).getTime() - targetDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = record;
      }
    }

    // Only return if within 7 days
    if (minDiff > 7 * 24 * 60 * 60 * 1000) return null;

    return closest;
  }

  /**
   * Calculate SIP returns
   */
  calculateSIPReturns(
    navHistory: NAVRecord[],
    monthlyInvestment: number,
    years: number
  ): { totalInvested: number; currentValue: number; returns: number; returnsPercent: number } | null {
    if (navHistory.length === 0) return null;

    const sorted = [...navHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const endDate = new Date(sorted[sorted.length - 1].date);
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - years);

    let totalUnits = 0;
    let totalInvested = 0;
    const months = years * 12;

    for (let i = 0; i < months; i++) {
      const sipDate = new Date(startDate);
      sipDate.setMonth(sipDate.getMonth() + i);

      const nav = this.findClosestNAV(sorted, sipDate);
      if (nav) {
        const units = monthlyInvestment / nav.nav;
        totalUnits += units;
        totalInvested += monthlyInvestment;
      }
    }

    const latestNAV = sorted[sorted.length - 1].nav;
    const currentValue = totalUnits * latestNAV;
    const returns = currentValue - totalInvested;
    const returnsPercent = (returns / totalInvested) * 100;

    return {
      totalInvested,
      currentValue,
      returns,
      returnsPercent,
    };
  }

  /**
   * Calculate rolling returns
   */
  calculateRollingReturns(navHistory: NAVRecord[], windowDays: number): number[] {
    if (navHistory.length < windowDays) return [];

    const sorted = [...navHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const rollingReturns: number[] = [];

    for (let i = windowDays; i < sorted.length; i++) {
      const endNAV = sorted[i].nav;
      const startNAV = sorted[i - windowDays].nav;
      const returnPct = ((endNAV - startNAV) / startNAV) * 100;
      rollingReturns.push(returnPct);
    }

    return rollingReturns;
  }
}

export const returnsCalculator = new ReturnsCalculator();
