export default function Trade() {
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
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      </div>
      <h1 
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--foreground)" }}
      >
        Paper Trading
      </h1>
      <p 
        className="text-center max-w-md"
        style={{ color: "#787B86" }}
      >
        Practice trading with virtual money. This feature is coming soon.
      </p>
    </div>
  );
}
