// Risk Calculator Service
// Calculates risk metrics like volatility, beta, Sharpe ratio, drawdown

export interface RiskMetrics {
  volatility: number | null;
  beta: number | null;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
}

export class RiskCalculator {
  /**
   * Calculate volatility (standard deviation of returns)
   */
  calculateVolatility(returns: number[]): number | null {
    if (returns.length < 2) return null;

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Annualize (assuming daily returns)
    return stdDev * Math.sqrt(252);
  }

  /**
   * Calculate beta (relative to benchmark)
   */
  calculateBeta(schemeReturns: number[], benchmarkReturns: number[]): number | null {
    if (schemeReturns.length !== benchmarkReturns.length || schemeReturns.length < 2) {
      return null;
    }

    const n = schemeReturns.length;
    const meanScheme = schemeReturns.reduce((sum, r) => sum + r, 0) / n;
    const meanBenchmark = benchmarkReturns.reduce((sum, r) => sum + r, 0) / n;

    let covariance = 0;
    let benchmarkVariance = 0;

    for (let i = 0; i < n; i++) {
      const schemeDiff = schemeReturns[i] - meanScheme;
      const benchmarkDiff = benchmarkReturns[i] - meanBenchmark;
      
      covariance += schemeDiff * benchmarkDiff;
      benchmarkVariance += benchmarkDiff * benchmarkDiff;
    }

    covariance /= n;
    benchmarkVariance /= n;

    if (benchmarkVariance === 0) return null;

    return covariance / benchmarkVariance;
  }

  /**
   * Calculate Sharpe ratio
   */
  calculateSharpeRatio(returns: number[], riskFreeRate: number = 6.5): number | null {
    if (returns.length < 2) return null;

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);

    if (!volatility || volatility === 0) return null;

    // Annualize mean return (assuming daily returns)
    const annualizedReturn = meanReturn * 252;
    
    return (annualizedReturn - riskFreeRate) / volatility;
  }

  /**
   * Calculate maximum drawdown
   */
  calculateMaxDrawdown(navHistory: { date: string; nav: number }[]): number | null {
    if (navHistory.length < 2) return null;

    const sorted = [...navHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let maxDrawdown = 0;
    let peak = sorted[0].nav;

    for (const record of sorted) {
      if (record.nav > peak) {
        peak = record.nav;
      }

      const drawdown = ((peak - record.nav) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown;
  }

  /**
   * Calculate daily returns from NAV history
   */
  calculateDailyReturns(navHistory: { date: string; nav: number }[]): number[] {
    if (navHistory.length < 2) return [];

    const sorted = [...navHistory].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const returns: number[] = [];

    for (let i = 1; i < sorted.length; i++) {
      const prevNAV = sorted[i - 1].nav;
      const currNAV = sorted[i].nav;
      const dailyReturn = ((currNAV - prevNAV) / prevNAV) * 100;
      returns.push(dailyReturn);
    }

    return returns;
  }

  /**
   * Calculate all risk metrics at once
   */
  calculateAllMetrics(
    navHistory: { date: string; nav: number }[],
    benchmarkReturns?: number[]
  ): RiskMetrics {
    const dailyReturns = this.calculateDailyReturns(navHistory);

    return {
      volatility: this.calculateVolatility(dailyReturns),
      beta: benchmarkReturns ? this.calculateBeta(dailyReturns, benchmarkReturns) : null,
      sharpe_ratio: this.calculateSharpeRatio(dailyReturns),
      max_drawdown: this.calculateMaxDrawdown(navHistory),
    };
  }

  /**
   * Calculate downside deviation (for Sortino ratio)
   */
  calculateDownsideDeviation(returns: number[], targetReturn: number = 0): number | null {
    if (returns.length < 2) return null;

    const downsideReturns = returns.filter(r => r < targetReturn);
    if (downsideReturns.length === 0) return 0;

    const squaredDiffs = downsideReturns.map(r => Math.pow(r - targetReturn, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length;
    const downsideDev = Math.sqrt(variance);

    // Annualize
    return downsideDev * Math.sqrt(252);
  }

  /**
   * Calculate Sortino ratio
   */
  calculateSortinoRatio(returns: number[], riskFreeRate: number = 6.5): number | null {
    if (returns.length < 2) return null;

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const downsideDev = this.calculateDownsideDeviation(returns);

    if (!downsideDev || downsideDev === 0) return null;

    const annualizedReturn = meanReturn * 252;
    
    return (annualizedReturn - riskFreeRate) / downsideDev;
  }

  /**
   * Calculate upside/downside capture ratios
   */
  calculateCaptureRatios(
    schemeReturns: number[],
    benchmarkReturns: number[]
  ): { upsideCapture: number | null; downsideCapture: number | null } {
    if (schemeReturns.length !== benchmarkReturns.length || schemeReturns.length < 2) {
      return { upsideCapture: null, downsideCapture: null };
    }

    const upsidePeriods = benchmarkReturns
      .map((r, i) => ({ scheme: schemeReturns[i], benchmark: r }))
      .filter(p => p.benchmark > 0);

    const downsidePeriods = benchmarkReturns
      .map((r, i) => ({ scheme: schemeReturns[i], benchmark: r }))
      .filter(p => p.benchmark < 0);

    const upsideCapture = upsidePeriods.length > 0
      ? (upsidePeriods.reduce((sum, p) => sum + p.scheme, 0) / upsidePeriods.length) /
        (upsidePeriods.reduce((sum, p) => sum + p.benchmark, 0) / upsidePeriods.length) * 100
      : null;

    const downsideCapture = downsidePeriods.length > 0
      ? (downsidePeriods.reduce((sum, p) => sum + p.scheme, 0) / downsidePeriods.length) /
        (downsidePeriods.reduce((sum, p) => sum + p.benchmark, 0) / downsidePeriods.length) * 100
      : null;

    return { upsideCapture, downsideCapture };
  }
}

export const riskCalculator = new RiskCalculator();
