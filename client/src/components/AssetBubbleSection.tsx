import { useState, useEffect, useCallback } from "react";
import BubbleChart, { BubbleData } from "./BubbleChart";

interface AssetConfig {
  title: string;
  icon: string;
  symbols: string[];
  description: string;
}

export const ASSET_CLASSES: Record<string, AssetConfig> = {
  indian: {
    title: "Indian Stock Market",
    icon: "🇮🇳",
    description: "Top Banks & Leading Non-Banking Companies",
    symbols: [
      // Major Banks
      "HDFCBANK.NS",    // HDFC Bank
      "ICICIBANK.NS",   // ICICI Bank
      "SBIN.NS",        // State Bank of India
      "KOTAKBANK.NS",   // Kotak Mahindra Bank
      "AXISBANK.NS",    // Axis Bank
      // Leading Non-Banking Companies
      "RELIANCE.NS",    // Reliance Industries
      "TCS.NS",         // Tata Consultancy Services
      "INFY.NS",        // Infosys
      "HINDUNILVR.NS",  // Hindustan Unilever
      "ITC.NS",         // ITC Limited
      "BHARTIARTL.NS",  // Bharti Airtel
      "LT.NS",          // Larsen & Toubro
    ],
  },
  us: {
    title: "US Stock Market",
    icon: "🇺🇸",
    description: "Top Companies by Market Capitalization",
    symbols: [
      // Mega Cap Tech
      "AAPL",           // Apple
      "MSFT",           // Microsoft
      "GOOGL",          // Alphabet
      "AMZN",           // Amazon
      "NVDA",           // NVIDIA
      "META",           // Meta Platforms
      "TSLA",           // Tesla
      // Other Large Cap Leaders
      "BRK-B",          // Berkshire Hathaway
      "JPM",            // JPMorgan Chase
      "V",              // Visa
      "JNJ",            // Johnson & Johnson
      "WMT",            // Walmart
      "XOM",            // Exxon Mobil
      "UNH",            // UnitedHealth
      "MA",             // Mastercard
    ],
  },
  commodities: {
    title: "Commodity Market",
    icon: "🪙",
    description: "Energy, Metals & Agriculture",
    symbols: [
      // Precious Metals
      "GC=F",           // Gold
      "SI=F",           // Silver
      "PL=F",           // Platinum
      "PA=F",           // Palladium
      // Energy
      "CL=F",           // Crude Oil (WTI)
      "BZ=F",           // Brent Crude
      "NG=F",           // Natural Gas
      "RB=F",           // Gasoline
      "HO=F",           // Heating Oil
      // Industrial Metals
      "HG=F",           // Copper
      "ALI=F",          // Aluminum
      // Agriculture
      "ZC=F",           // Corn
      "ZW=F",           // Wheat
      "ZS=F",           // Soybeans
      "KC=F",           // Coffee
      "SB=F",           // Sugar
      "CT=F",           // Cotton
    ],
  },
  crypto: {
    title: "Crypto Market",
    icon: "💰",
    description: "Top Cryptocurrencies by Market Cap",
    symbols: [
      // Layer 1 Leaders
      "BTC-USD",        // Bitcoin
      "ETH-USD",        // Ethereum
      "SOL-USD",        // Solana
      "ADA-USD",        // Cardano
      "AVAX-USD",       // Avalanche
      "DOT-USD",        // Polkadot
      "MATIC-USD",      // Polygon
      "ATOM-USD",       // Cosmos
      // Exchange & DeFi
      "BNB-USD",        // Binance Coin
      "XRP-USD",        // Ripple
      "LINK-USD",       // Chainlink
      "UNI-USD",        // Uniswap
      // Other Major
      "DOGE-USD",       // Dogecoin
      "LTC-USD",        // Litecoin
      "SHIB-USD",       // Shiba Inu
    ],
  },
};

interface AssetBubbleSectionProps {
  assetClass: keyof typeof ASSET_CLASSES;
}

const API_URL = "http://localhost:5000/api/yahoo/quotes";

export default function AssetBubbleSection({ assetClass }: AssetBubbleSectionProps) {
  const [data, setData] = useState<BubbleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = ASSET_CLASSES[assetClass];

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const symbolsParam = config.symbols.join(",");
      const response = await fetch(`${API_URL}?symbols=${encodeURIComponent(symbolsParam)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quotes: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.quotes) {
        throw new Error("Invalid response format");
      }

      const bubbleData: BubbleData[] = result.quotes
        .filter((q: any) => !q.error && q.price > 0)
        .map((q: any) => ({
          symbol: q.symbol,
          name: q.name || q.symbol,
          price: q.price,
          changePercent: q.changePercent || 0,
          volume: q.volume || 1000000,
          currency: q.currency,
        }));

      setData(bubbleData);
    } catch (err: any) {
      setError(err.message);
      console.error(`Error fetching ${assetClass} quotes:`, err);
    } finally {
      setLoading(false);
    }
  }, [config.symbols, assetClass]);

  useEffect(() => {
    fetchQuotes();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  return (
    <BubbleChart
      data={data}
      title={config.title}
      icon={config.icon}
      description={config.description}
      loading={loading}
      error={error}
    />
  );
}
