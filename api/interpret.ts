import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

// A simple in-memory cache to avoid redundant API calls for the same data
const cache = new Map<string, { text: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Use direct REST API call to avoid library compatibility issues
async function callGeminiAPI(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 256,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response format from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt provided' });
    }

    // Use a hash of the prompt as the cache key
    const cacheKey = Buffer.from(prompt).toString('base64');
    const cached = cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return res.status(200).json({ interpretation: cached.text });
    }

    const interpretation = await callGeminiAPI(prompt);

    // Store the result in the cache
    cache.set(cacheKey, { text: interpretation, timestamp: Date.now() });

    return res.status(200).json({ interpretation });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ error: 'Failed to generate AI interpretation' });
  }
}
