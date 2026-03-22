export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#D1D4DC" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "#787B86" }}>
          Customize your Trading Beast experience.
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
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <p className="text-sm font-semibold mt-4" style={{ color: "#D1D4DC" }}>
          Settings — Coming Soon
        </p>
        <p className="text-xs mt-1 max-w-sm text-center" style={{ color: "#787B86" }}>
          Configure themes, default watchlists, notification preferences, and API keys.
        </p>
      </div>
    </div>
  );
}
