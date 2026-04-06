export default function Alerts() {
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <h1 
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--foreground)" }}
      >
        Price Alerts
      </h1>
      <p 
        className="text-center max-w-md"
        style={{ color: "#787B86" }}
      >
        Set up alerts for price movements and market conditions. This feature is coming soon.
      </p>
    </div>
  );
}
