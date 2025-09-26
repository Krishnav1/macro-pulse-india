export type ForexPromptType = 'kpis' | 'composition' | 'importCover' | 'volatility' | 'comparison';

export interface ForexPromptData {
  type: ForexPromptType;
  data: any;
  unit?: 'usd' | 'inr';
  additionalContext?: any;
}

/**
 * Creates a detailed, context-rich prompt for the Gemini API based on forex data.
 * @param promptData - The data and type of analysis required.
 * @returns A string prompt for the AI.
 */
export const createForexPrompt = (promptData: ForexPromptData): string => {
  const { type, data, unit, additionalContext } = promptData;

  const baseInstruction = `Analyze the following Indian forex reserves data. Provide a concise, 3-4 line economic interpretation suitable for a financial dashboard. Focus on clarity, insight, and the 'so what' for the user. Do not use markdown.`;

  switch (type) {
    case 'kpis':
      return `${baseInstruction}
      Data: Forex KPIs - Latest value: ${formatValue(data.latest, unit)}, Weekly Change: ${data.weeklyChangePercent.toFixed(2)}%, Yearly Change: ${data.yearlyChangePercent.toFixed(2)}%.
      Task: Interpret these KPIs. Explain what the weekly and yearly changes signify about RBI's policy, market sentiment, and overall economic stability.`;

    case 'composition':
      const fcaPercent = ((data[0]?.value / additionalContext.total) * 100).toFixed(1);
      const goldPercent = data[1] ? ((data[1].value / additionalContext.total) * 100).toFixed(1) : '0.0';
      return `${baseInstruction}
      Data: Reserve Composition - Foreign Currency Assets: ${fcaPercent}%, Gold: ${goldPercent}%.
      Task: Explain the significance of this composition. Why is FCA dominance important? What does the gold percentage indicate about the reserve strategy?`;

    case 'importCover':
      return `${baseInstruction}
      Data: Months of Import Cover - ${data.toFixed(1)} months.
      Task: Interpret this value. Is it healthy? Compare it to the standard IMF benchmark of 3-6 months and explain what it means for India's external sector resilience and ability to handle economic shocks.`;

    case 'volatility':
      const highVolatilityCount = data.filter((d: any) => Math.abs(d.change) > 1).length;
      const volatilityRatio = (highVolatilityCount / data.length) * 100;
      return `${baseInstruction}
      Data: Weekly Volatility - ${volatilityRatio.toFixed(1)}% of weeks in the last two years saw changes greater than 1%.
      Task: Interpret this volatility level. What does it suggest about global capital flows and the RBI's intervention frequency? Is the market stable or turbulent?`;

    case 'comparison':
      const lastRate = data[data.length - 1]?.usdInrRate;
      const firstRate = data[0]?.usdInrRate;
      const rateChange = lastRate - firstRate;
      const trend = rateChange > 0 ? 'depreciated' : 'appreciated';
      return `${baseInstruction}
      Data: Forex Reserves vs. USD/INR Exchange Rate. Over the last year, the Rupee has ${trend} while reserves have fluctuated.
      Task: Explain the potential relationship. How does the RBI likely use its reserves to manage the currency's value? What does this chart imply about intervention policy?`;

    default:
      return 'Provide a general overview of India\'s current economic standing based on its financial indicators.';
  }
};

const formatValue = (value: number, unit?: 'usd' | 'inr'): string => {
  if (unit === 'usd') {
    return `$${(value / 1000).toFixed(1)}B`;
  } else {
    return `₹${(value / 100000).toFixed(1)}L Cr`;
  }
};
