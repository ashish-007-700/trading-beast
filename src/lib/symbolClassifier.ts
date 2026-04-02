/**
 * Symbol Classifier - Detects asset type and routes to correct data provider
 */

export type DataSource = "binance" | "finnhub" | "yahoo";

export interface DataSourceInfo {
  source: DataSource;
  isRealtime: boolean;
  label: string;
}

/**
 * Detect the asset type based on symbol format
 */
export function detectAssetType(symbol: string): DataSource {
  const s = symbol.toUpperCase();

  // Crypto: ends with -USD (Yahoo format for crypto)
  // Examples: BTC-USD, ETH-USD, SOL-USD, DOGE-USD
  if (/^[A-Z0-9]+-USD$/.test(s)) {
    return "binance";
  }

  // US Stocks: 1-5 uppercase letters only, no special characters
  // Examples: AAPL, MSFT, GOOGL, NVDA, A, META
  // Must NOT match: Indian (.NS/.BO), Forex (=X), Futures (=F), Indices (^)
  if (/^[A-Z]{1,5}$/.test(s)) {
    return "finnhub";
  }

  // Everything else goes to Yahoo:
  // - Indian stocks: RELIANCE.NS, TCS.NS, INFY.BO
  // - Indices: ^GSPC, ^NSEI, ^DJI, ^NSEBANK
  // - Forex: EURUSD=X, GBPUSD=X, INR=X
  // - Commodities/Futures: GC=F, CL=F, SI=F
  // - Chinese stocks: 000001.SS
  return "yahoo";
}

/**
 * Get data source info for a symbol
 */
export function getDataSourceInfo(symbol: string): DataSourceInfo {
  const source = detectAssetType(symbol);

  switch (source) {
    case "binance":
      return {
        source: "binance",
        isRealtime: true,
        label: "LIVE",
      };
    case "finnhub":
      return {
        source: "finnhub",
        isRealtime: true,
        label: "LIVE",
      };
    case "yahoo":
      return {
        source: "yahoo",
        isRealtime: false,
        label: "30s DELAY",
      };
  }
}

/**
 * Get a human-readable source name
 */
export function getSourceName(source: DataSource): string {
  switch (source) {
    case "binance":
      return "Binance";
    case "finnhub":
      return "Finnhub";
    case "yahoo":
      return "Yahoo Finance";
  }
}
