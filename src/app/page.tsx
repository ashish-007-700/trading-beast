import { TradingViewChart } from "@/components/TradingViewChart";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#D1D4DC" }}>
          Trading Beast
        </h1>
        <p className="text-sm mt-1" style={{ color: "#787B86" }}>
          Professional charting &amp; trading platform.
        </p>
      </header>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "#131722",
          border: "1px solid rgba(42,46,57,0.5)",
        }}
      >
        <TradingViewChart symbol="AAPL" height={550} />
      </div>
    </div>
  );
}
