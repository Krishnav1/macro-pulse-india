#!/usr/bin/env python3
"""
Setup script for Google Gemini API integration
This script helps configure the Gemini API for AI-generated interpretations
"""

import os
import json
from typing import Dict, Any

def setup_gemini_config():
    """Setup Gemini API configuration"""
    
    print("Setting up Google Gemini API for Forex Reserves Insights")
    print("=" * 60)
    
    # Check if .env file exists
    env_file = "../.env"
    env_local_file = "../.env.local"
    
    config = {
        "gemini_api_key": "",
        "model_name": "gemini-pro",
        "temperature": 0.7,
        "max_tokens": 1000,
        "safety_settings": {
            "harassment": "BLOCK_MEDIUM_AND_ABOVE",
            "hate_speech": "BLOCK_MEDIUM_AND_ABOVE",
            "sexually_explicit": "BLOCK_MEDIUM_AND_ABOVE",
            "dangerous_content": "BLOCK_MEDIUM_AND_ABOVE"
        }
    }
    
    print("\nConfiguration Template:")
    print(json.dumps(config, indent=2))
    
    print("\nTo integrate Google Gemini API:")
    print("1. Get your API key from: https://makersuite.google.com/app/apikey")
    print("2. Add to your .env.local file:")
    print("   VITE_GEMINI_API_KEY=your_api_key_here")
    print("3. Install the Google Generative AI package:")
    print("   npm install @google/generative-ai")
    
    print("\nExample integration in aiInterpretation.ts:")
    example_code = '''
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export const generateAIInterpretation = async (prompt: string): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'AI interpretation temporarily unavailable.';
  }
};
'''
    print(example_code)
    
    print("\nForex-specific prompts for better interpretations:")
    prompts = {
        "kpis": "Analyze forex reserves KPIs: latest value, weekly change %, yearly change %. Provide 3-4 line economic interpretation focusing on RBI policy and market conditions.",
        "composition": "Analyze forex reserves composition: FCA %, Gold %, SDRs %, IMF position %. Explain diversification strategy and economic implications in 3-4 lines.",
        "import_cover": "Analyze import cover ratio (months). Explain adequacy against IMF standards and economic resilience in 3-4 lines.",
        "volatility": "Analyze weekly volatility patterns in forex reserves. Explain RBI intervention strategy and market dynamics in 3-4 lines.",
        "comparison": "Analyze relationship between forex reserves and USD/INR exchange rate. Explain correlation and policy implications in 3-4 lines."
    }
    
    for key, prompt in prompts.items():
        print(f"\n{key.upper()}:")
        print(f"  {prompt}")
    
    print("\nSetup complete! Your forex reserves insights page will have:")
    print("  - Real-time KPI analysis with AI interpretations")
    print("  - Composition breakdown with economic context")
    print("  - Import cover adequacy assessment")
    print("  - Volatility pattern analysis")
    print("  - Currency relationship insights")
    print("  - Beautiful, responsive UI with consistent theming")
    
    return config

def create_sample_env():
    """Create a sample .env file with Gemini configuration"""
    
    sample_env_content = """# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Google Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: AI Configuration
VITE_AI_MODEL=gemini-pro
VITE_AI_TEMPERATURE=0.7
VITE_AI_MAX_TOKENS=1000
"""
    
    with open("../.env.example", "w") as f:
        f.write(sample_env_content)
    
    print("Created .env.example file with configuration template")

if __name__ == "__main__":
    config = setup_gemini_config()
    create_sample_env()
    
    print("\nForex Reserves Insights setup complete!")
    print("Navigate to /indicators/forex_reserves/insights to see your comprehensive dashboard.")
