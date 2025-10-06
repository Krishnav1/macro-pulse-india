import { useState, useEffect, useRef, useCallback } from 'react';

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  lastUpdated: Date;
}

interface WebSocketMessage {
  id: string;
  price?: number;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
}

const YAHOO_WS_URL = 'wss://streamer.finance.yahoo.com/';

// Major indices to track
const SYMBOLS = [
  '^NSEI',      // NIFTY 50
  '^BSESN',     // SENSEX
  '^NSEBANK',   // BANK NIFTY
  'USDINR=X',   // USD/INR
  '^CNXIT',     // NIFTY IT
  '^CNXAUTO',   // NIFTY AUTO
  '^CNXPHARMA', // NIFTY PHARMA
  '^CNXFMCG',   // NIFTY FMCG
];

export function useWebSocketMarketData() {
  const [quotes, setQuotes] = useState<Map<string, MarketQuote>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Check if market is open (9:15 AM - 3:30 PM IST)
  const checkMarketHours = useCallback(() => {
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTime = hours * 60 + minutes;
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    const day = istTime.getDay();
    
    // Market is open Monday-Friday, 9:15 AM - 3:30 PM IST
    return day >= 1 && day <= 5 && currentTime >= marketOpen && currentTime <= marketClose;
  }, []);

  // Fetch initial data via Edge Function (bypasses CORS)
  const fetchInitialData = useCallback(async () => {
    try {
      const response = await fetch(
        'https://fhcddkfgqhwwfvqymqow.supabase.co/functions/v1/fetch-yahoo-finance',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symbols: SYMBOLS }),
        }
      );
      const data = await response.json();
      
      if (data.quoteResponse?.result) {
        const newQuotes = new Map<string, MarketQuote>();
        data.quoteResponse.result.forEach((quote: any) => {
          newQuotes.set(quote.symbol, {
            symbol: quote.symbol,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume,
            lastUpdated: new Date(),
          });
        });
        setQuotes(newQuotes);
      }
    } catch (error) {
      console.error('Error fetching initial market data:', error);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // Note: Yahoo Finance WebSocket requires authentication
      // For now, we'll use polling as fallback
      // In production, you'd use a proper WebSocket service or Yahoo Finance API with credentials
      
      // Fallback to polling every 5 seconds during market hours
      const pollInterval = setInterval(() => {
        if (checkMarketHours()) {
          fetchInitialData();
          setIsLive(true);
        } else {
          setIsLive(false);
        }
      }, 5000);

      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      return () => clearInterval(pollInterval);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      
      // Attempt reconnection
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000 * reconnectAttemptsRef.current); // Exponential backoff
      }
    }
  }, [checkMarketHours, fetchInitialData]);

  // Initialize connection
  useEffect(() => {
    fetchInitialData();
    const cleanup = connect();
    setIsLive(checkMarketHours());

    // Check market hours every minute
    const marketCheckInterval = setInterval(() => {
      setIsLive(checkMarketHours());
    }, 60000);

    return () => {
      if (cleanup) cleanup();
      clearInterval(marketCheckInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, fetchInitialData, checkMarketHours]);

  return {
    quotes,
    isConnected,
    isLive,
    lastUpdated: quotes.size > 0 ? new Date() : null,
  };
}
