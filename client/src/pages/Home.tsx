import { TradingViewChart } from '../components/TradingViewChart';

export default function Home() {
  return (
    <div className="p-6">
      <h1 
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--foreground)" }}
      >
        BTC-USD Live Chart
      </h1>
      <TradingViewChart symbol="BTC-USD" height={600} />
    </div>
  );
}
