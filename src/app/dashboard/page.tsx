import { TradingViewWidget } from "@/components/TradingViewWidget";

const DEFAULT_SYMBOLS = [
  { label: "BTCUSD", symbol: "COINBASE:BTCUSD", interval: "60" },
  { label: "ETHUSD", symbol: "COINBASE:ETHUSD", interval: "60" },
  { label: "SPY", symbol: "AMEX:SPY", interval: "D" },
  { label: "AAPL", symbol: "NASDAQ:AAPL", interval: "D" },
] as const;

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 text-black dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Multi-chart overview powered by TradingView.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {DEFAULT_SYMBOLS.map((item) => (
            <div
              key={item.symbol}
              className="rounded-lg bg-white p-3 dark:bg-black"
            >
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {item.label}
                </h2>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {item.symbol}
                </span>
              </div>

              <TradingViewWidget
                symbol={item.symbol}
                interval={item.interval}
                height={420}
                theme="auto"
              />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
