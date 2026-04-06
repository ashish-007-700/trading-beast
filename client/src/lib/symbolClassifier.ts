/**
 * Symbol Classifier - Detects asset type and routes to correct data provider
 */

export type DataSource = "binance" | "yahoo";

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

  // Everything else goes to Yahoo (free, reliable):
  // - US Stocks: AAPL, MSFT, GOOGL
  // - Indian stocks: RELIANCE.NS, TCS.BO
  // - Indices: ^GSPC, ^NSEI, ^DJI, ^NSEBANK
  // - Forex: EURUSD=X, GBPUSD=X
  // - Commodities/Futures: GC=F, CL=F
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
    case "yahoo":
      return {
        source: "yahoo",
        isRealtime: false,
        label: "DELAYED",
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
    case "yahoo":
      return "Yahoo Finance";
  }
}
