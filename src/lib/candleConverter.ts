/**
 * Financial Data Processing Engine
 * Converts raw 1-minute OHLC data into higher timeframe candlestick data.
 */

export type Candle = {
  timestamp: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Timeframe = "1m" | "3m" | "5m" | "10m" | "15m" | "1h" | "4h";

const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  "1m": 60,
  "3m": 180,
  "5": 300,
  "10m": 600,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
};

/**
 * Aggregates lower-timeframe candles into higher-timeframe candles.
 * 
 * @param candles Array of candles in chronological order
 * @param timeframe Target timeframe to group by
 * @returns Array of aggregated candles aligned to timeframe boundaries
 */
export function convertToTimeframe(candles: Candle[], timeframe: Timeframe): Candle[] {
  if (candles.length === 0) return [];
  
  const interval = TIMEFRAME_SECONDS[timeframe];
  const groups = new Map<number, Candle[]>();

  // 1. Group candles by timeframe boundaries
  for (const candle of candles) {
    const boundary = Math.floor(candle.timestamp / interval) * interval;
    if (!groups.has(boundary)) {
      groups.set(boundary, []);
    }
    groups.get(boundary)!.push(candle);
  }

  const result: Candle[] = [];
  const boundaries = Array.from(groups.keys()).sort((a, b) => a - b);

  // 2. Aggregate each group
  for (const boundary of boundaries) {
    const group = groups.get(boundary)!;
    
    // Rule 1: Groups should ideally be complete (e.g., 5 candles for 5m)
    // Rule 4: Ignore incomplete last candle unless specified
    const isLast = boundary === boundaries[boundaries.length - 1];
    const expectedLength = interval / 60; // Assuming input is 1m candles
    
    if (isLast && group.length < expectedLength) {
      continue; 
    }

    const aggregated: Candle = {
      timestamp: boundary,
      open: group[0].open, // Rule 2: Open of first candle
      close: group[group.length - 1].close, // Rule 2: Close of last candle
      high: Math.max(...group.map(c => c.high)), // Rule 2: Max high
      low: Math.min(...group.map(c => c.low)), // Rule 2: Min low
      volume: group.reduce((sum, c) => sum + c.volume, 0), // Rule 2: Sum volumes
    };

    result.push(aggregated);
  }

  return result;
}
