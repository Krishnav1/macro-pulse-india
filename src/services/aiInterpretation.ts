import { createForexPrompt, ForexPromptData } from './promptGenerator';

/**
 * Calls the secure backend API to get an AI-generated interpretation.
 * @param promptData - The data required to generate the prompt.
 * @returns A promise that resolves to the AI-generated text.
 */
export const generateForexInterpretation = async (promptData: ForexPromptData): Promise<string> => {
  try {
    // 1. Generate the specific prompt using our generator
    const prompt = createForexPrompt(promptData);

    // 2. Call the secure Vercel API route
    const response = await fetch('/api/interpret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData.error);
      return `Error: ${errorData.error}`;
    }

    const { interpretation } = await response.json();
    return interpretation;

  } catch (error) {
    console.error('Failed to fetch AI interpretation:', error);
    return 'AI interpretation is currently unavailable due to a network error.';
  }
};







