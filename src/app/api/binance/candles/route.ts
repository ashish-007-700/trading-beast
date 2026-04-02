import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BINANCE_API_BASE = "https://api.binance.com/api/v3";

// Map Yahoo-style interval to Binance intervals
const INTERVAL_MAP: Record<string, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "60m": "1h",
  "1h": "1h",
  "1d": "1d",
  "1w": "1w",
  "1mo": "1M",
};

// Map Yahoo-style range to days
const RANGE_TO_DAYS: Record<string, number> = {
  "1d": 1,
  "5d": 5,
  "1mo": 30,
  "3mo": 90,
  "6mo": 180,
  "1y": 365,
  "2y": 730,
  "5y": 1825,
};

/**
 * Convert Yahoo-style symbol (BTC-USD) to Binance format (BTCUSDT)
 * Also handles Finnhub-style (BINANCE:BTCUSDT)
 */
function toBinanceSymbol(symbol: string): string {
  // Handle Finnhub format: BINANCE:BTCUSDT -> BTCUSDT
  if (symbol.includes(":")) {
    return symbol.split(":")[1].toUpperCase();
  }
  // Handle Yahoo format: BTC-USD -> BTCUSDT
  if (symbol.endsWith("-USD")) {
    return symbol.replace("-USD", "USDT").toUpperCase();
  }
  // Already in Binance format
  return symbol.toUpperCase();
}

/**
 * Binance candles API endpoint
 * Query params:
 *   symbol   – e.g. BTC-USD, ETH-USD (Yahoo format)
 *   interval – 1m, 5m, 15m, 60m, 1d (default: 1d)
 *   range    – 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y (default: 1mo)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawSymbol = url.searchParams.get("symbol")?.trim();
    const interval = url.searchParams.get("interval")?.trim() || "1d";
    const range = url.searchParams.get("range")?.trim() || "1mo";

    if (!rawSymbol) {
      return NextResponse.json(
        { error: "Missing required query param: symbol" },
        { status: 400 }
      );
    }

    // Convert parameters
    const binanceSymbol = toBinanceSymbol(rawSymbol);
    const binanceInterval = INTERVAL_MAP[interval] || "1d";
    const rangeDays = RANGE_TO_DAYS[range] || 30;

    const now = Date.now();
    const startTime = now - rangeDays * 24 * 60 * 60 * 1000;
    const endTime = now;

    // Build Binance API URL
    const binanceUrl = new URL(`${BINANCE_API_BASE}/klines`);
    binanceUrl.searchParams.set("symbol", binanceSymbol);
    binanceUrl.searchParams.set("interval", binanceInterval);
    binanceUrl.searchParams.set("startTime", String(startTime));
    binanceUrl.searchParams.set("endTime", String(endTime));
    binanceUrl.searchParams.set("limit", "1000");

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    // Add API key if available (increases rate limits)
    const apiKey = process.env.BINANCE_API_KEY;
    if (apiKey) {
      headers["X-MBX-APIKEY"] = apiKey;
    }

    const upstreamResponse = await fetch(binanceUrl, {
      headers,
      cache: "no-store",
    });

    if (!upstreamResponse.ok) {
      const text = await upstreamResponse.text().catch(() => "");
      console.error(`[Binance] Request failed: ${upstreamResponse.status}`, text);
      return NextResponse.json(
        {
          error: `Binance request failed (${upstreamResponse.status})`,
          details: text || undefined,
        },
        { status: 502 }
      );
    }

    const data = await upstreamResponse.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "No candle data" },
        { status: 404 }
      );
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

    return NextResponse.json(
      {
        symbol: rawSymbol,
        binanceSymbol,
        interval,
        range,
        from: Math.floor(startTime / 1000),
        to: Math.floor(endTime / 1000),
        points,
      },
      {
        headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
      }
    );
  } catch (err: any) {
    console.error("[Binance] Unexpected error:", err);
    return NextResponse.json(
      { error: "Binance fetch failed", details: err.message },
      { status: 500 }
    );
  }
}
