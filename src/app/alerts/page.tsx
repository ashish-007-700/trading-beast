export default function AlertsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#D1D4DC" }}>
          Alerts
        </h1>
        <p className="text-sm mt-1" style={{ color: "#787B86" }}>
          Set price alerts and get notified.
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <p className="text-sm font-semibold mt-4" style={{ color: "#D1D4DC" }}>
          Price Alerts — Coming Soon
        </p>
        <p className="text-xs mt-1 max-w-sm text-center" style={{ color: "#787B86" }}>
          Set custom price alerts for any asset. Get browser push notifications when your target is hit.
        </p>
      </div>
    </div>
  );
}
