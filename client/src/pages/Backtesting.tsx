export default function Backtesting() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(41,98,255,0.15)" }}
      >
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#2962FF" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <h1 
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--foreground)" }}
      >
        Strategy Backtesting
      </h1>
      <p 
        className="text-center max-w-md"
        style={{ color: "#787B86" }}
      >
        Test your trading strategies against historical data. This feature is coming soon.
      </p>
    </div>
  );
}
