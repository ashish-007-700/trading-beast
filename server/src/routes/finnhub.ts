import { Router, Request, Response } from 'express';

const router = Router();

type FinnhubQuote = {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
};

type FinnhubCandles = {
  c: number[]; // close
  h: number[]; // high
  l: number[]; // low
  o: number[]; // open
  s: 'ok' | 'no_data';
  t: number[]; // timestamps (unix seconds)
  v: number[]; // volume
};

function getUnixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Finnhub quote endpoint
 * Query params:
 *   symbol – e.g. AAPL, MSFT
 */
router.get('/quote', async (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string)?.trim();

  if (!symbol) {
    res.status(400).json({ error: 'Missing required query param: symbol' });
    return;
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Missing FINNHUB_API_KEY. Add it to .env.local (do not commit secrets).',
    });
    return;
  }

  const upstreamUrl = new URL('https://finnhub.io/api/v1/quote');
  upstreamUrl.searchParams.set('symbol', symbol);
  upstreamUrl.searchParams.set('token', apiKey);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!upstreamResponse.ok) {
      const text = await upstreamResponse.text().catch(() => '');
      res.status(502).json({
        error: `Finnhub request failed (${upstreamResponse.status})`,
        details: text || undefined,
      });
      return;
    }

    const data = (await upstreamResponse.json()) as FinnhubQuote;

    res.set('Cache-Control', 'no-store');
    res.json({ symbol, quote: data });
  } catch (err: any) {
    res.status(502).json({
      error: 'Finnhub fetch failed',
      details: err.message,
    });
  }
});

// Map client interval/range to Finnhub resolution and days
function mapIntervalToResolution(interval: string): string {
  const map: Record<string, string> = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '60m': '60',
    '1h': '60',
    '1d': 'D',
    '1wk': 'W',
    '1mo': 'M',
  };
  return map[interval] || 'D';
}

function mapRangeToDays(range: string): number {
  const map: Record<string, number> = {
    '1d': 1,
    '5d': 5,
    '1mo': 30,
    '3mo': 90,
    '6mo': 180,
    '1y': 365,
    '5y': 365 * 5,
  };
  return map[range] || 30;
}

/**
 * Finnhub candles endpoint
 * Query params:
 *   symbol     – e.g. AAPL, BINANCE:BTCUSDT
 *   resolution – 1, 5, 15, 30, 60, D, W, M (default: D)
 *   interval   – 1m, 5m, 15m, 60m, 1d (alternative to resolution, for compatibility)
 *   range      – 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y (alternative to days, for compatibility)
 *   days       – number of days back (default: 30)
 *   from       – unix timestamp (optional)
 *   to         – unix timestamp (optional)
 */
router.get('/candles', async (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string)?.trim();
  
  // Support both Finnhub native params and Yahoo-style params for compatibility
  const interval = (req.query.interval as string)?.trim();
  const range = (req.query.range as string)?.trim();
  const resolution = interval ? mapIntervalToResolution(interval) : ((req.query.resolution as string)?.trim() || 'D');

  const now = new Date();
  const rangeDays = range ? mapRangeToDays(range) : null;
  const fromDays = Number(req.query.days || rangeDays || '30');
  const days = Number.isFinite(fromDays) && fromDays > 0 ? Math.min(fromDays, 365 * 5) : 30;

  const to = Number(req.query.to) || getUnixSeconds(now);
  const from =
    Number(req.query.from) ||
    getUnixSeconds(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));

  if (!symbol) {
    res.status(400).json({ error: 'Missing required query param: symbol' });
    return;
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Missing FINNHUB_API_KEY. Add it to .env.local (do not commit secrets).',
    });
    return;
  }

  const isCrypto = symbol.includes(':');
  const endpoint = isCrypto ? 'crypto/candle' : 'stock/candle';
  const upstreamUrl = new URL(`https://finnhub.io/api/v1/${endpoint}`);
  upstreamUrl.searchParams.set('symbol', symbol);
  upstreamUrl.searchParams.set('resolution', resolution);
  upstreamUrl.searchParams.set('from', String(from));
  upstreamUrl.searchParams.set('to', String(to));
  upstreamUrl.searchParams.set('token', apiKey);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!upstreamResponse.ok) {
      const text = await upstreamResponse.text().catch(() => '');
      res.status(502).json({
        error: `Finnhub request failed (${upstreamResponse.status})`,
        details: text || undefined,
      });
      return;
    }

    const data = (await upstreamResponse.json()) as FinnhubCandles;

    if (data.s !== 'ok' || !Array.isArray(data.t) || !Array.isArray(data.c)) {
      res.set('Cache-Control', 'no-store');
      res.status(404).json({ error: 'No candle data' });
      return;
    }

    const points = data.t.map((time, index) => ({
      t: time,
      c: data.c[index],
      o: data.o[index],
      h: data.h[index],
      l: data.l[index],
      v: data.v?.[index] ?? 0,
    }));

    res.set('Cache-Control', 'no-store');
    res.json({ symbol, resolution, from, to, points });
  } catch (err: any) {
    res.status(502).json({
      error: 'Finnhub fetch failed',
      details: err.message,
    });
  }
});

type FinnhubNewsItem = {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
};

/**
 * Finnhub company news endpoint
 * Query params:
 *   symbol – stock ticker (e.g. AAPL, MSFT)
 *   from   – start date YYYY-MM-DD (optional, defaults to 7 days ago)
 *   to     – end date YYYY-MM-DD (optional, defaults to today)
 */
router.get('/news', async (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string)?.trim().toUpperCase();

  if (!symbol) {
    res.status(400).json({ error: 'Missing required query param: symbol' });
    return;
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Missing FINNHUB_API_KEY. Add it to .env.local (do not commit secrets).',
    });
    return;
  }

  // Default date range: last 7 days
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const toDate = (req.query.to as string) || now.toISOString().split('T')[0];
  const fromDate = (req.query.from as string) || weekAgo.toISOString().split('T')[0];

  const upstreamUrl = new URL('https://finnhub.io/api/v1/company-news');
  upstreamUrl.searchParams.set('symbol', symbol);
  upstreamUrl.searchParams.set('from', fromDate);
  upstreamUrl.searchParams.set('to', toDate);
  upstreamUrl.searchParams.set('token', apiKey);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!upstreamResponse.ok) {
      const text = await upstreamResponse.text().catch(() => '');
      res.status(502).json({
        error: `Finnhub request failed (${upstreamResponse.status})`,
        details: text || undefined,
      });
      return;
    }

    const data = (await upstreamResponse.json()) as FinnhubNewsItem[];

    res.set('Cache-Control', 'no-store');
    res.json({ symbol, from: fromDate, to: toDate, news: data });
  } catch (err: any) {
    res.status(502).json({
      error: 'Finnhub fetch failed',
      details: err.message,
    });
  }
});

/**
 * Finnhub general market news endpoint
 * Query params:
 *   category – general, forex, crypto, merger (default: general)
 */
router.get('/market-news', async (req: Request, res: Response) => {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Missing FINNHUB_API_KEY. Add it to .env.local (do not commit secrets).',
    });
    return;
  }

  const category = (req.query.category as string)?.trim() || 'general';
  const validCategories = ['general', 'forex', 'crypto', 'merger'];
  
  if (!validCategories.includes(category)) {
    res.status(400).json({ 
      error: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
    });
    return;
  }

  const upstreamUrl = new URL('https://finnhub.io/api/v1/news');
  upstreamUrl.searchParams.set('category', category);
  upstreamUrl.searchParams.set('token', apiKey);

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json' },
    });

    if (!upstreamResponse.ok) {
      const text = await upstreamResponse.text().catch(() => '');
      res.status(502).json({
        error: `Finnhub request failed (${upstreamResponse.status})`,
        details: text || undefined,
      });
      return;
    }

    const data = (await upstreamResponse.json()) as FinnhubNewsItem[];

    res.set('Cache-Control', 'no-store');
    res.json({ category, news: data });
  } catch (err: any) {
    res.status(502).json({
      error: 'Finnhub fetch failed',
      details: err.message,
    });
  }
});

export default router;
