import { TradingViewChart } from "@/components/TradingViewChart";

const CATEGORIES = [
  {
    title: "US Stocks",
    symbols: [
      { label: "Apple", symbol: "AAPL" },
      { label: "Microsoft", symbol: "MSFT" },
      { label: "Google", symbol: "GOOGL" },
      { label: "Tesla", symbol: "TSLA" },
      { label: "Amazon", symbol: "AMZN" },
      { label: "Meta", symbol: "META" },
      { label: "NVIDIA", symbol: "NVDA" },
    ],
  },
  {
    title: "Indian Indices",
    symbols: [
      { label: "NIFTY 50", symbol: "^NSEI" },
      { label: "SENSEX", symbol: "^BSESN" },
      { label: "Bank NIFTY", symbol: "^NSEBANK" },
    ],
  },
  {
    title: "Cryptocurrency",
    symbols: [
      { label: "Bitcoin", symbol: "BTC-USD" },
      { label: "Ethereum", symbol: "ETH-USD" },
      { label: "Solana", symbol: "SOL-USD" },
      { label: "XRP", symbol: "XRP-USD" },
      { label: "BNB", symbol: "BNB-USD" },
    ],
  },
  {
    title: "Commodities",
    symbols: [
      { label: "Gold", symbol: "GC=F" },
      { label: "Silver", symbol: "SI=F" },
      { label: "Copper", symbol: "HG=F" },
      { label: "US Oil (WTI)", symbol: "CL=F" },
    ],
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#D1D4DC" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "#787B86" }}>
          Real-time market overview — all major asset classes.
        </p>
      </header>

      {CATEGORIES.map((category) => (
        <section key={category.title} className="flex flex-col gap-4">
          <h2
            className="text-lg font-semibold pb-2 border-b"
            style={{ color: "#D1D4DC", borderColor: "rgba(42,46,57,0.5)" }}
          >
            {category.title}
          </h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {category.symbols.map((item) => (
              <div
                key={item.symbol}
                className="rounded-lg overflow-hidden"
                style={{
                  background: "#131722",
                  border: "1px solid rgba(42,46,57,0.5)",
                }}
              >
                <TradingViewChart
                  symbol={item.symbol}
                  height={320}
                  showToolbar={true}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
