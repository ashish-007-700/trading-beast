export default function NewsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#D1D4DC" }}>
          News
        </h1>
        <p className="text-sm mt-1" style={{ color: "#787B86" }}>
          Market news and headlines.
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
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
        <p className="text-sm font-semibold mt-4" style={{ color: "#D1D4DC" }}>
          Market News — Coming Soon
        </p>
        <p className="text-xs mt-1 max-w-sm text-center" style={{ color: "#787B86" }}>
          Aggregated financial news from top sources. Filter by asset, sector, or sentiment.
        </p>
      </div>
    </div>
  );
}
