export default function JournalPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#D1D4DC" }}>
          Trade Journal
        </h1>
        <p className="text-sm mt-1" style={{ color: "#787B86" }}>
          Log and review your trades.
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
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
        <p className="text-sm font-semibold mt-4" style={{ color: "#D1D4DC" }}>
          Trade Journal — Coming Soon
        </p>
        <p className="text-xs mt-1 max-w-sm text-center" style={{ color: "#787B86" }}>
          Record your trades with notes, tags, and screenshots. Track your trading performance over time.
        </p>
      </div>
    </div>
  );
}
