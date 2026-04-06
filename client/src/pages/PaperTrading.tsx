import { useState } from "react";
import CryptoTrading from "../components/paper-trading/CryptoTrading";
import USStocksTrading from "../components/paper-trading/USStocksTrading";

type MarketTab = "crypto" | "us-stocks" | "indian-stocks" | "commodities";

const TABS: { id: MarketTab; label: string; available: boolean }[] = [
  { id: "crypto", label: "Crypto", available: true },
  { id: "us-stocks", label: "US Stocks", available: true },
  { id: "indian-stocks", label: "Indian Stocks", available: false },
  { id: "commodities", label: "Commodities", available: false },
];

export default function PaperTrading() {
  const [activeTab, setActiveTab] = useState<MarketTab>("crypto");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Paper Trading</h1>
          <p className="text-sm text-gray-400 mt-1">
            Practice trading with virtual money across different markets
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.available && setActiveTab(tab.id)}
            disabled={!tab.available}
            className={`
              px-4 py-2 rounded-t-lg text-sm font-medium transition-all
              ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : tab.available
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 cursor-not-allowed"
              }
            `}
          >
            {tab.label}
            {!tab.available && (
              <span className="ml-2 text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "crypto" && <CryptoTrading />}
        {activeTab === "us-stocks" && <USStocksTrading />}
        {activeTab === "indian-stocks" && <ComingSoon market="Indian Stocks" />}
        {activeTab === "commodities" && <ComingSoon market="Commodities" />}
      </div>
    </div>
  );
}

function ComingSoon({ market }: { market: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-gray-500">
      <svg
        className="w-16 h-16 mb-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-xl font-semibold text-gray-400">{market}</h3>
      <p className="text-sm mt-2">Coming Soon</p>
    </div>
  );
}
