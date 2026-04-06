/**
 * Financial Data Formatter
 * Combines raw OHLC arrays into sanitized, ordered candle objects.
 */

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

/**
 * Formats and sanitizes raw OHLC arrays into an ordered array of candle objects.
 * 
 * @param t Timestamps array
 * @param o Open prices array
 * @param h High prices array
 * @param l Low prices array
 * @param c Close prices array
 * @returns Sanitized and ordered candle objects
 */
export function formatOHLCData(
  t: (number | null | undefined)[],
  o: (number | null | undefined)[],
  h: (number | null | undefined)[],
  l: (number | null | undefined)[],
  c: (number | null | undefined)[]
): Candle[] {
  const candles: Candle[] = [];
  const length = Math.min(t.length, o.length, h.length, l.length, c.length);

  for (let i = 0; i < length; i++) {
    const time = t[i];
    const open = o[i];
    const high = h[i];
    const low = l[i];
    const close = c[i];

    // 1. Skip if any value is missing or invalid
    if (
      time === null || time === undefined || isNaN(time) ||
      open === null || open === undefined || isNaN(open) ||
      high === null || high === undefined || isNaN(high) ||
      low === null || low === undefined || isNaN(low) ||
      close === null || close === undefined || isNaN(close)
    ) {
      continue;
    }

    // 2. Sanitize High/Low: high >= max(o,c), low <= min(o,c)
    const sanitizedHigh = Math.max(high, open, close);
    const sanitizedLow = Math.min(low, open, close);

    candles.push({
      time,
      open,
      high: sanitizedHigh,
      low: sanitizedLow,
      close,
    });
  }

  // 3. Maintain chronological order
  candles.sort((a, b) => a.time - b.time);

  // 4. Remove duplicate entries based on time
  const uniqueCandles: Candle[] = [];
  const seenTimes = new Set<number>();

  for (const candle of candles) {
    if (!seenTimes.has(candle.time)) {
      uniqueCandles.push(candle);
      seenTimes.add(candle.time);
    }
  }

  return uniqueCandles;
}
