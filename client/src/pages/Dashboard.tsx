import { TradingViewChart } from '../components/TradingViewChart';

const SYMBOLS = {
  "US Stocks": ["AAPL", "MSFT", "GOOGL", "TSLA", "AMZN", "META", "NVDA"],
  "Indian Indices": ["^NSEI", "^BSESN", "^NSEBANK"],
  "Crypto": ["BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "BNB-USD"],
  "Commodities": ["GC=F", "SI=F", "HG=F", "CL=F"],
};

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--foreground)" }}
      >
        Market Dashboard
      </h1>

      {Object.entries(SYMBOLS).map(([category, symbols]) => (
        <div key={category} className="mb-8">
          <h2 
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            {category}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {symbols.map((symbol) => (
              <div 
                key={symbol}
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                <TradingViewChart 
                  symbol={symbol} 
                  height={280} 
                  showToolbar={false}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
