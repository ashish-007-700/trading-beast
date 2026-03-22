export default function BacktestingPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#D1D4DC" }}>
          Backtesting
        </h1>
        <p className="text-sm mt-1" style={{ color: "#787B86" }}>
          Test strategies against historical data.
        </p>
      </header>

      <div
        className="flex flex-col items-center justify-center rounded-lg py-24"
        style={{
          background: "#131722",
          border: "1px solid rgba(42,46,57,0.5)",
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2962FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <p className="text-sm font-semibold mt-4" style={{ color: "#D1D4DC" }}>
          Backtesting Engine — Coming Soon
        </p>
        <p className="text-xs mt-1 max-w-sm text-center" style={{ color: "#787B86" }}>
          Apply trading strategies (SMA crossover, RSI, etc.) on historical price data and analyze P&L results.
        </p>
      </div>
    </div>
  );
}
