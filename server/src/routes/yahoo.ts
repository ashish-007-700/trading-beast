import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Yahoo Finance chart API proxy.
 * Works without API key – free public endpoint.
 *
 * Query params:
 *   symbol   – e.g. AAPL, BTCUSD, EURUSD=X, GC=F
 *   interval – 1m, 5m, 15m, 60m, 1d  (default: 1d)
 *   range    – 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y  (default: 1y)
 */
router.get('/candles', async (req: Request, res: Response) => {
  const rawSymbol = (req.query.symbol as string)?.trim();
  const interval = (req.query.interval as string)?.trim() || '1d';
  const range = (req.query.range as string)?.trim() || '1y';

  if (!rawSymbol) {
    res.status(400).json({ error: 'Missing required query param: symbol' });
    return;
  }

  // Map common Finnhub-style symbols to Yahoo Finance tickers
  let yahooSymbol = rawSymbol;
  if (rawSymbol.startsWith('BINANCE:')) {
    // BINANCE:BTCUSDT -> BTC-USD
    const pair = rawSymbol.replace('BINANCE:', '');
    if (pair.endsWith('USDT')) {
      yahooSymbol = pair.replace('USDT', '-USD');
    } else {
      yahooSymbol = pair;
    }
  } else if (rawSymbol.startsWith('OANDA:')) {
    // OANDA:EUR_USD -> EURUSD=X
    const pair = rawSymbol.replace('OANDA:', '').replace('_', '');
    yahooSymbol = `${pair}=X`;
  }

  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=${interval}&range=${range}&includePrePost=false`;

  try {
    const resp = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      res.status(502).json({
        error: `Yahoo Finance request failed (${resp.status})`,
        details: text,
      });
      return;
    }

    const data = await resp.json();
    const result = data?.chart?.result?.[0];

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      res.status(404).json({ error: 'No chart data returned from Yahoo Finance' });
      return;
    }

    const timestamps = result.timestamp as number[];
    const quote = result.indicators.quote[0];
    const opens = quote.open as (number | null)[];
    const highs = quote.high as (number | null)[];
    const lows = quote.low as (number | null)[];
    const closes = quote.close as (number | null)[];
    const volumes = (quote.volume as (number | null)[]) || [];

    const points = [];
    for (let i = 0; i < timestamps.length; i++) {
      const o = opens[i];
      const h = highs[i];
      const l = lows[i];
      const c = closes[i];
      if (o != null && h != null && l != null && c != null) {
        points.push({
          t: timestamps[i],
          o,
          h,
          l,
          c,
          v: volumes[i] ?? 0,
        });
      }
    }

    res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.json({
      symbol: rawSymbol,
      yahooSymbol,
      interval,
      range,
      points,
    });
  } catch (err: any) {
    res.status(502).json({
      error: 'Yahoo Finance fetch failed',
      details: err.message,
    });
  }
});

/**
 * Batch quotes endpoint for bubble charts.
 * Fetches current price, change %, and volume for multiple symbols.
 *
 * Query params:
 *   symbols – comma-separated list of symbols (e.g., AAPL,MSFT,GOOGL)
 */
router.get('/quotes', async (req: Request, res: Response) => {
  const symbolsParam = (req.query.symbols as string)?.trim();

  if (!symbolsParam) {
    res.status(400).json({ error: 'Missing required query param: symbols' });
    return;
  }

  const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);

  if (symbols.length === 0) {
    res.status(400).json({ error: 'No valid symbols provided' });
    return;
  }

  try {
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d&includePrePost=false`;
          
          const resp = await fetch(yahooUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0',
              Accept: 'application/json',
            },
          });

          if (!resp.ok) {
            return { symbol, error: `Failed to fetch (${resp.status})` };
          }

          const data = await resp.json();
          const result = data?.chart?.result?.[0];
          const meta = result?.meta;
          const quote = result?.indicators?.quote?.[0];

          if (!meta || !quote) {
            return { symbol, error: 'No data available' };
          }

          // Get latest values
          const closes = (quote.close as (number | null)[]).filter((c): c is number => c != null);
          const volumes = (quote.volume as (number | null)[]).filter((v): v is number => v != null);
          
          const currentPrice = meta.regularMarketPrice || closes[closes.length - 1] || 0;
          const previousClose = meta.chartPreviousClose || meta.previousClose || closes[closes.length - 2] || currentPrice;
          const volume = volumes[volumes.length - 1] || 0;
          
          const changePercent = previousClose > 0 
            ? ((currentPrice - previousClose) / previousClose) * 100 
            : 0;

          return {
            symbol,
            name: meta.shortName || meta.longName || symbol,
            price: currentPrice,
            previousClose,
            changePercent: Number(changePercent.toFixed(2)),
            volume,
            currency: meta.currency || 'USD',
          };
        } catch (err: any) {
          return { symbol, error: err.message };
        }
      })
    );

    res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    res.json({ quotes });
  } catch (err: any) {
    res.status(502).json({
      error: 'Yahoo Finance batch fetch failed',
      details: err.message,
    });
  }
});

export default router;
