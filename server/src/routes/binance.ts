import { Router, Request, Response } from 'express';

const router = Router();

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const BINANCE_MAX_LIMIT = 1000; // Binance API max candles per request

// Map Yahoo-style interval to Binance intervals
const INTERVAL_MAP: Record<string, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '60m': '1h',
  '1h': '1h',
  '1d': '1d',
  '1w': '1w',
  '1mo': '1M',
};

// Interval to milliseconds mapping for pagination
const INTERVAL_TO_MS: Record<string, number> = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
};

// Map Yahoo-style range to days
const RANGE_TO_DAYS: Record<string, number> = {
  '1d': 1,
  '5d': 5,
  '1mo': 30,
  '3mo': 90,
  '6mo': 180,
  '1y': 365,
  '2y': 730,
  '5y': 1825,
};

/**
 * Convert Yahoo-style symbol (BTC-USD) to Binance format (BTCUSDT)
 * Also handles Finnhub-style (BINANCE:BTCUSDT)
 */
function toBinanceSymbol(symbol: string): string {
  // Handle Finnhub format: BINANCE:BTCUSDT -> BTCUSDT
  if (symbol.includes(':')) {
    return symbol.split(':')[1].toUpperCase();
  }
  // Handle Yahoo format: BTC-USD -> BTCUSDT
  if (symbol.endsWith('-USD')) {
    return symbol.replace('-USD', 'USDT').toUpperCase();
  }
  // Already in Binance format
  return symbol.toUpperCase();
}

/**
 * Fetch all candles with pagination (Binance limits to 1000 per request)
 */
async function fetchAllCandles(
  binanceSymbol: string,
  binanceInterval: string,
  startTime: number,
  endTime: number,
  headers: Record<string, string>
): Promise<any[]> {
  const allCandles: any[] = [];
  let currentStart = startTime;
  const intervalMs = INTERVAL_TO_MS[binanceInterval] || 60 * 60 * 1000;
  
  // Calculate expected candles to set a reasonable max iterations
  const expectedCandles = Math.ceil((endTime - startTime) / intervalMs);
  const maxIterations = Math.ceil(expectedCandles / BINANCE_MAX_LIMIT) + 1;
  let iterations = 0;

  while (currentStart < endTime && iterations < maxIterations) {
    iterations++;
    
    const binanceUrl = new URL(`${BINANCE_API_BASE}/klines`);
    binanceUrl.searchParams.set('symbol', binanceSymbol);
    binanceUrl.searchParams.set('interval', binanceInterval);
    binanceUrl.searchParams.set('startTime', String(currentStart));
    binanceUrl.searchParams.set('endTime', String(endTime));
    binanceUrl.searchParams.set('limit', String(BINANCE_MAX_LIMIT));

    const response = await fetch(binanceUrl, { headers });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Binance request failed (${response.status}): ${text}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    allCandles.push(...data);

    // Move start to after the last candle's close time
    const lastCandle = data[data.length - 1];
    const lastCloseTime = lastCandle[6]; // closeTime is at index 6
    currentStart = lastCloseTime + 1;

    // If we got fewer than the limit, we've reached the end
    if (data.length < BINANCE_MAX_LIMIT) {
      break;
    }
  }

  return allCandles;
}

/**
 * Binance candles API endpoint
 * Query params:
 *   symbol   – e.g. BTC-USD, ETH-USD (Yahoo format)
 *   interval – 1m, 5m, 15m, 60m, 1d (default: 1d)
 *   range    – 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y (default: 1mo)
 */
router.get('/candles', async (req: Request, res: Response) => {
  try {
    const rawSymbol = (req.query.symbol as string)?.trim();
    const interval = (req.query.interval as string)?.trim() || '1d';
    const range = (req.query.range as string)?.trim() || '1mo';

    if (!rawSymbol) {
      res.status(400).json({ error: 'Missing required query param: symbol' });
      return;
    }

    // Convert parameters
    const binanceSymbol = toBinanceSymbol(rawSymbol);
    const binanceInterval = INTERVAL_MAP[interval] || '1d';
    const rangeDays = RANGE_TO_DAYS[range] || 30;

    const now = Date.now();
    const startTime = now - rangeDays * 24 * 60 * 60 * 1000;
    const endTime = now;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // Add API key if available (increases rate limits)
    const apiKey = process.env.BINANCE_API_KEY;
    if (apiKey) {
      headers['X-MBX-APIKEY'] = apiKey;
    }

    // Fetch all candles with pagination
    const data = await fetchAllCandles(
      binanceSymbol,
      binanceInterval,
      startTime,
      endTime,
      headers
    );

    if (data.length === 0) {
      res.status(404).json({ error: 'No candle data' });
      return;
    }

    // Binance kline format: [openTime, open, high, low, close, volume, closeTime, ...]
    const points = data.map((k: any[]) => ({
      t: Math.floor(k[0] / 1000), // Convert ms to seconds
      o: parseFloat(k[1]),
      h: parseFloat(k[2]),
      l: parseFloat(k[3]),
      c: parseFloat(k[4]),
      v: parseFloat(k[5]),
    }));

    res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.json({
      symbol: rawSymbol,
      binanceSymbol,
      interval,
      range,
      from: Math.floor(startTime / 1000),
      to: Math.floor(endTime / 1000),
      points,
    });
  } catch (err: any) {
    console.error('[Binance] Unexpected error:', err);
    res.status(500).json({
      error: 'Binance fetch failed',
      details: err.message,
    });
  }
});

export default router;
