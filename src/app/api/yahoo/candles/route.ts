import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Yahoo Finance chart API proxy.
 * Works without API key – free public endpoint.
 *
 * Query params:
 *   symbol   – e.g. AAPL, BTCUSD, EURUSD=X, GC=F
 *   interval – 1m, 5m, 15m, 60m, 1d  (default: 1d)
 *   range    – 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y  (default: 1y)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawSymbol = url.searchParams.get("symbol")?.trim();
  const interval = url.searchParams.get("interval")?.trim() || "1d";
  const range = url.searchParams.get("range")?.trim() || "1y";

  if (!rawSymbol) {
    return NextResponse.json(
      { error: "Missing required query param: symbol" },
      { status: 400 }
    );
  }

  // Map common Finnhub-style symbols to Yahoo Finance tickers
  let yahooSymbol = rawSymbol;
  if (rawSymbol.startsWith("BINANCE:")) {
    // BINANCE:BTCUSDT -> BTC-USD
    const pair = rawSymbol.replace("BINANCE:", "");
    if (pair.endsWith("USDT")) {
      yahooSymbol = pair.replace("USDT", "-USD");
    } else {
      yahooSymbol = pair;
    }
  } else if (rawSymbol.startsWith("OANDA:")) {
    // OANDA:EUR_USD -> EURUSD=X
    const pair = rawSymbol.replace("OANDA:", "").replace("_", "");
    yahooSymbol = `${pair}=X`;
  }

  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=${interval}&range=${range}&includePrePost=false`;

  try {
    const resp = await fetch(yahooUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return NextResponse.json(
        { error: `Yahoo Finance request failed (${resp.status})`, details: text },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const result = data?.chart?.result?.[0];

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      return NextResponse.json(
        { error: "No chart data returned from Yahoo Finance" },
        { status: 404 }
      );
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

    return NextResponse.json(
      {
        symbol: rawSymbol,
        yahooSymbol,
        interval,
        range,
        points,
      },
      {
        headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Yahoo Finance fetch failed", details: err.message },
      { status: 502 }
    );
  }
}
