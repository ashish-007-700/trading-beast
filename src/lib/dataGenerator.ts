/**
 * Realistic Financial Time-Series Data Generator
 * Produces continuous candlestick (OHLC) data for charts.
 */

export type MockCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Timeframe = "1m" | "3m" | "5m" | "15m" | "1h" | "4h";

const SECONDS_PER_TF: Record<Timeframe, number> = {
  "1m": 60,
  "3m": 180,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
};

/**
 * Generates N realistic candles for a given symbol and timeframe.
 */
export function generateMockCandles(
  symbol: string,
  timeframe: Timeframe,
  n: number,
  startPrice = 70000
): MockCandle[] {
  const candles: MockCandle[] = [];
  const interval = SECONDS_PER_TF[timeframe];
  
  // Starting point (aligned to timeframe)
  let currentTime = Math.floor(Date.now() / 1000 / interval) * interval - (n * interval);
  let currentPrice = startPrice;
  
  // Random Walk Parameters
  let trend = (Math.random() - 0.5) * 0.002; // Initial trend bias
  const volatility = 0.0015; // Percent volatility per candle
  
  for (let i = 0; i < n; i++) {
    const open = currentPrice;
    
    // Shift trend occasionally (momentum/reversal)
    if (Math.random() < 0.1) {
      trend = (Math.random() - 0.5) * 0.004;
    }
    
    // Calculate logical close based on trend and volatility
    const changePercent = trend + (Math.random() - 0.5) * volatility;
    const close = open * (1 + changePercent);
    
    // Generate wicks relative to body
    const bodyHigh = Math.max(open, close);
    const bodyLow = Math.min(open, close);
    const wickRange = (bodyHigh - bodyLow) * (0.2 + Math.random() * 0.8);
    
    const high = bodyHigh + wickRange * Math.random();
    const low = bodyLow - wickRange * Math.random();
    
    candles.push({
      time: currentTime,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });
    
    // Update for next iteration
    currentPrice = close;
    currentTime += interval;
  }
  
  return candles;
}
